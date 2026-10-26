# **Overview : Edge-Director.00**

[https://gemini.google.com/app/ff5314f4ec1761f9](https://gemini.google.com/app/ff5314f4ec1761f9)

*User prompt: ok it is time to start building the \[edge-director\] can you provide me with an overview of this important part of the tech stack*

Response: The **edge-director** is the edge-native control plane, stateful traffic controller, and concurrency mutex of the generative production pipeline. Canonically classified as **POD-12: System Middleware** (under Macro-Node 04: Supply Chain), it functions as an automated **Digital Assistant Director / Line Producer**.

It does not generate pixels, author prose, or evaluate creative quality. Its mandate is purely operational: safely coordinating distributed, lightweight client workstations (**Rig 1 / The Conductor**) with shared, high-capacity GPU foundry hardware (**Rig 2 / media-broker** or cloud burst nodes) without compute collisions, out-of-memory crashes, or unauthorized spend.

### **Architectural Position in the Stack**

The edge-director forms the middle link in the studio's tripartite execution model:

`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: THE CONDUCTOR (worker-sower-engine / Astro Cockpit)                            │`  
`│ • Pure CPU/RAM: Compiles dialogue AST, locks ffprobe audio frames, composes Remotion   │`  
`└───────────────────────────────────┬────────────────────────────────────────────────────┘`  
                                    `│ HTTPS (Signed JWT + Idempotency Key) / WSS`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE: edge-director (POD-12)                                                │`  
`│                                                                                        │`  
`│  ├── Ingress EdgeGateway (src/index.ts via Hono)                                       │`  
`│  │   • Validates JWTs, artist service tokens, and Zod execution schemas                │`  
`│  │   • Queries Cloudflare D1 (CANON_DB): Verifies scene is clean (is_dirty == 0)       │`  
`│  │   • Upgrades HTTP to persistent WebSockets                                          │`  
`│  │                                                                                     │`  
`│  └── ShotCoordinatorDO (src/ShotCoordinator.ts - Durable Object)                       │`  
`│      • WebSocket Hibernation API: Maintains duplex socket streams at $0 idle cost      │`  
`│      • Hardware Mutex: Serializes GPU access via strict single-threaded FIFO queue     │`  
`│      • Lease Engine: Issues 30s heartbeat-renewed leases with fencing tokens           │`  
`│      • Watchdog & Dead-Man's Switch: Hard timeout with Dead-Letter Queue (DLQ) routing │`  
`│      • Telemetry Bus: Relays live progress percentages and signed R2 asset URLs        │`  
`└───────────────────────────────────┬────────────────────────────────────────────────────┘`  
                                    `│ Persistent WSS / Outbound cloudflared Tunnel`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: THE FOUNDRY (media-broker + Headless ComfyUI :8188)                             │`  
`│ • Local GPU Spoke: Leases one job, flushes VRAM (/free), executes Wan 2.2, syncs to R2 │`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

### **Core Responsibilities & Technical Mechanics**

> * **Pre-Flight Relational Gate (Cloudflare D1):** Before enqueueing a render job, the ingress worker executes a sub-millisecond query (SELECT COUNT(\*) FROM scene\_fact\_dependencies WHERE scene\_id \= ? AND is\_dirty \= 1). If upstream narrative lore or somatic character facts have mutated, the job fails immediately with HTTP 412 Precondition Failed, blocking wasted GPU allocation on invalid story state.  
> * **Single-Threaded Hardware Mutex (ShotCoordinatorDO):** Consumer and workstation GPUs cannot handle concurrent heavy diffusion runs without CUDA Out-of-Memory faults. The Durable Object maintains a strict FIFO queue that serializes incoming shot jobs across multiple distributed artists, ensuring Rig 2 processes exactly one plate at a time.  
> * **Zero Idle-Cost WebSocket Hibernation:** Rather than running expensive, persistent container processes to monitor renders, ShotCoordinatorDO implements Cloudflare's WebSocket Hibernation API (ctx.acceptWebSocket()). While Rig 2 spends 60–120 seconds generating latents, edge memory drops to zero while keeping the TCP socket open, charging only for active CPU telemetry ticks.  
> * **Heartbeat Leases & Fencing Tokens:** To solve network partitions and "zombie runner" overwrite issues, the coordinator grants execution leases with 30-second expiry windows. Rig 2 must ping every 10 seconds with BROKER\_HEARTBEAT. Every lease increments a monotonic fencing\_token; if an orphaned runner reconnects late after a timeout, its asset write is rejected.  
> * **Reconnection Replay & Idempotency:** Artist laptops regularly drop Wi-Fi or close their lids mid-render. The DO tracks progress in its transactional key-value store (ctx.storage). If a client disconnects and reconnects, the DO replays the state snapshot and streams the finalized Cloudflare R2 asset link without duplicate GPU execution.  
> * **Graceful Degradation (SIMULATION\_ONLY):** If Rig 2 loses power or goes offline, the edge-director can transition to simulation-only execution. Narrative state changes and somatic ledger transitions commit directly to D1, leaving unrendered shot ASTs in an append-only backlog queue to batch-render when the foundry reconnects.

### **Concrete Service Identity**

| Property | Value | Architectural Meaning |
| :---- | :---- | :---- |
| **Package Name** | edge-director | Repository and package descriptor. |
| **Subsystem Class** | POD-12: System Middleware | Sits under Macro-Node 04 (Supply Chain / Infrastructure). |
| **Worker Entrypoint** | EdgeGateway (src/index.ts) | Hono-based router handling auth, D1 validation, and WebSocket upgrades. |
| **Durable Object Binding** | SHOT\_COORDINATOR | Instantiates ShotCoordinatorDO for the queue, mutex, leases, and sockets. |
| **Upstream Neighbor** | Rig 1 (worker-sower-engine) | Compiles dialogue ASTs, locks frame budgets via ffprobe, and requests renders. |
| **Downstream Neighbor** | Rig 2 (media-broker) | Local Node.js spoke managing headless ComfyUI on 127.0.0.1:8188. |

Are you ready to scaffold the repository and configure wrangler.jsonc, or would you like to define the Zod execution schema contracts first?

---

*User prompt: {{FOCUS:  Core Responsibilities & Technical Mechanics) }} /extreme-details*

Response: The **edge-director** operates as the concurrency governor, temporal arbiter, and stateful traffic controller for the production pipeline. It mediates between client orchestration workstations (**Rig 1 / The Conductor**) and the shared GPU hardware foundry (**Rig 2 / media-broker** running headless ComfyUI on 127.0.0.1:8188).

### **1\. Ingress Gatekeeping & Dirty-State Invalidation (Cloudflare D1)**

The ingress boundary (src/index.ts via Hono) evaluates narrative and somatic prerequisites before jobs touch memory or hardware queues:

> * **Cryptographic & Schema Pre-Flight:** Authenticates remote artist sessions and machine service tokens via signed JWTs or Cloudflare Access. Payload bodies are strictly validated against the SpokeExecutionPayload Zod schema, rejecting path-traversal attempts, malformed graph nodes, or unvetted parameters before compute initialization.  
> * **The Relational Truth Gate:** Rather than relying on semantic LLM checks, the edge gateway enforces strict relational integrity against Cloudflare D1:  
>   `SELECT COUNT(*) AS dirty_count`  
>   `FROM scene_fact_dependencies`  
>   `WHERE scene_id = ? AND is_dirty = 1;`

> * **Sub-5ms Short-Circuiting:** If upstream narrative state mutated (e.g., an entity's somatic injury or inventory changed without re-compiling the scene's AST), dirty\_count \> 0\. The ingress worker immediately halts dispatch with HTTP 412 Precondition Failed:  
>   `{`  
>     `"error": "DIRTY_SCENE_REJECTED",`  
>     `"sceneId": "EP101_SC02",`  
>     `"dirtyDependencies": 1,`  
>     `"message": "Upstream canon changed. Re-lint and re-compile scene AST before queuing render."`  
>   `}`

This eliminates wasted GPU compute on invalid scenes at zero compute cost.

### **2\. Single-Threaded Mutex & Queue Management (ShotCoordinatorDO)**

To prevent consumer GPU saturation (e.g., RTX 3090/4090/5070 running 20GB+ diffusion models like Wan 2.2) from triggering fatal CUDA Out-of-Memory (OOM) exceptions, execution is strictly serialized:

> * **Actor Model Concurrency Lock:** Implemented inside a Cloudflare Durable Object (ShotCoordinatorDO), which provides a single-threaded execution context per instance. Race conditions (such as two concurrent requests bypassing an if (\!isRendering) check) are structurally impossible.  
> * **Strict FIFO & Hardware Protection:** Rig 2 is dispatched a new plate only when the active job completes cleanly (BROKER\_COMPLETE), fails via terminal circuit breaker, or is explicitly aborted.  
> * **Fair Round-Robin Scheduling:** Prevents multi-shot animatics from starving revisions by interleaving jobs across distinct tenant/artist IDs:  
>   `private getNextFairJob(): ExecutionJob | undefined {`  
>     `if (this.queue.length === 0) return undefined;`  
>     `const lastArtistId = this.activeJob?.artistId;`  
>     `const alternateIndex = this.queue.findIndex(j => j.artistId !== lastArtistId);`  
>     `if (alternateIndex !== -1) {`  
>       `return this.queue.splice(alternateIndex, 1)[0];`  
>     `}`  
>     `return this.queue.shift();`  
>   `}`

> * **Transactional Idempotency Enforcement:** Every dispatch requires a client-generated UUIDv7 idempotency\_key bound to a payload fingerprint. The DO inspects its transactional key-value store (ctx.storage). If a matching key is pending or active, duplicate queue insertions are ignored, and current progress is returned immediately.

### **3\. WebSocket Hibernation Multiplexing & Reconnection Protocols**

Standard long-lived servers charge continuously for open WebSockets. The edge-director decouples connection management from memory retention:

> * **WebSocket Hibernation API:** Calls this.ctx.acceptWebSocket(ws, \[role\]) to partition connections into "artist" or "broker". The V8 JavaScript isolate is evicted from edge RAM while Cloudflare's Anycast proxy holds the TCP keep-alive. Duration compute charges drop to \$0.00 while Rig 2 spends 60–120 seconds sampling diffusion latents.  
> * **Sub-2ms Telemetry Waking:** Inbound progress packets or heartbeats from Rig 2 wake the isolate in under 2 milliseconds, executing webSocketMessage() to relay normalized progress (BROKER\_PROGRESS) to artist cockpits before returning to hibernation.  
> * **Reconnection Replay Protocol:** When an artist closes their laptop mid-render, the lease remains owned by the edge DO. Upon reconnection with their artistId and sequence ID, the DO checks transactional storage and streams the cached completion payload (SHOT\_READY) along with the signed Cloudflare R2 asset link without duplicate rendering.

### **4\. Distributed Leases, Monotonic Epochs, and Watchdog Circuit Breakers**

To resolve the **Split-Brain Zombie Runner Hazard** (where a partitioned machine recovers late and overwrites canonical work), the system implements strict distributed safety mechanisms:

> * **Heartbeat-Renewed Dynamic Leases:** Rather than brittle static timeouts (e.g., hard-coded 180s limits), leases are granted for 30-second windows and extended by \+30 seconds on each valid BROKER\_HEARTBEAT dispatched every 10 seconds.  
> * **Thread-Isolated Heartbeats:** On Rig 2, media-broker runs its heartbeat timer inside a dedicated Web Worker or decoupled background process. Synchronous operations (such as large JSON parsing or SHA-256 hashing of multi-gigabyte .mp4 plates) cannot block the Node.js event loop or cause false expirations.  
> * **Monotonic Epoch Fencing Tokens:** Every lease grant increments an integer currentEpoch (fencing token) in ctx.storage. Rig 2 must include this token in its completion calls. If a network partition causes the DO's 30-second watchdog alarm (ctx.storage.setAlarm(Date.now() \+ 30000)) to fire and increment the epoch, any late completion payload carrying the old epoch is rejected with HTTP 409 Conflict.  
> * **Content-Addressed Promotion Gate:** Because R2 lacks native conditional PUT assertions on custom application tokens, workers upload artifacts to staging keys: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4. The DO validates the epoch in a single transactional block before promoting the key to canonical manifests; orphaned zombie artifacts are purged by automated R2 lifecycle rules.  
> * **Dead-Letter Queue (DLQ):** Jobs track an attempts counter. If a job fails or starves heartbeats past maxAttempts (default: 2), it is quarantined to dlq:\${jobId} for manual review via the Showrunner dashboard, preventing infinite crash loops.

### **5\. Lock Management, Local Sovereignty, and Graceful Degradation**

> * **Inverted Hardware Mutex (flock Sovereignty):** The local rendering daemon on Rig 2 holds an unconditional OS-level file lock (flock) on the GPU hardware interface. The edge DO serves as a passive request queue; media-broker pulls jobs from the DO only when its local lock is free. If the network drops completely, media-broker falls back to pulling render manifests from a local disk queue (/var/spool/renders) using the identical execution code path.  
> * **SIMULATION\_ONLY Fallback Mode:** If Rig 2 is powered down or disconnected, the edge gateway switches to simulation degradation:  
>   `if (brokerSockets.length === 0 && payload.allowSimulationFallback) {`  
>     `const result = await executeNarrativeStateMutation(c.env.DB, payload.sceneAst);`  
>     `return c.json({`  
>       `status: "COMMITTED_WITHOUT_MEDIA",`  
>       `sceneId: payload.sceneId,`  
>       `stateDelta: result.delta,`  
>       `message: "Narrative state advanced in D1. Rendering queued for batch processing when Rig 2 resumes."`  
>     `});`  
>   `}`

Writers continue mutating world state, burning inventory, and committing narrative deltas in D1, while unrendered scene ASTs queue in an append-only backlog for batch generation once the foundry reconnects.

---

*User prompt: {{FOCUS:  1. Ingress Gatekeeping & Dirty-State Invalidation (Cloudflare D1)) }} /extreme-details*

Response: The edge-director ingress layer operates as the zero-trust perimeter and epistemological gatekeeper of the generative production pipeline. Before any execution payload enters the physical GPU queue, the edge gateway intercepts the request to evaluate cryptographic authentication, schema integrity, and relational narrative state.

### **1\. Cryptographic Handshake & Schema Compilation**

The ingress boundary refuses to evaluate raw prose or untyped data. All inbound requests undergo strict syntactic sanitization before hitting the relational database:

> * **Zero-Trust Authentication:** The worker intercepts dispatch payloads, validating the machine authentication token (e.g., Clerk session or Service Token) via signed JSON Web Tokens (JWTs) in under 5 milliseconds.  
> * **Two-Pass Zod Validation:** Payloads must adhere to the SpokeExecutionPayload Zod schema. The engine runs a Two-Pass Zod Compiler: Pass 1 enforces semantic roughing (validating scalar ranges and type safety), while Pass 2 executes Relational DAG Verification to mathematically ensure zero orphaned pointers across all active entities.  
> * **Zero Command Ingestion:** Users and automated agents submit *Intents*, never committed events. The gateway immediately rejects any client payload attempting to declare state changes directly (e.g., ACTOR\_MOVED) with an HTTP 403 Forbidden response.

### **2\. The Relational Truth Gate (Cloudflare D1)**

Rather than relying on probabilistic LLMs to evaluate scene validity, the edge-director executes deterministic boolean algebra against Cloudflare D1, the serverless SQLite ledger holding the show's canonical state.

> * **The Directed Acyclic Graph (DAG):** Every scene is bound to explicit, versioned canonical facts (character physical states, environmental parameters) stored as a dependency graph.  
> * **The Pre-Flight Query:** The worker executes a sub-millisecond read against the junction table linking scenes to their required facts:  
>   `SELECT COUNT(*) AS dirty_count`  
>   `FROM scene_fact_dependencies`  
>   `WHERE scene_id = ? AND is_dirty = 1;`

> * **Execution Denial:** If dirty\_count \> 0, an upstream narrative fact was altered without the scene's Abstract Syntax Tree (AST) being re-compiled. The worker physically blocks the RunPod GPU from booting, terminating the request with an HTTP 412 Precondition Failed error:  
>   `{`  
>     `"error": "DIRTY_SCENE_REJECTED",`  
>     `"sceneId": "EP101_SC02",`  
>     `"dirtyDependencies": 1,`  
>     `"message": "Upstream canon changed. Re-lint and re-compile scene AST before queuing render."`  
>   `}`

> * **Zero-Cost Failure:** By enforcing this gate at the edge, mathematically invalid renders are aborted in under 5 milliseconds, spending \$0.00 in cloud GPU fees on scenes that would otherwise contain continuity errors.

### **3\. Dirty-State Propagation Mechanics**

The ingress gate relies on a strict internal invalidation engine that continuously flags obsolete scenes.

> * **Monotonic Versioning:** Every fact in the database possesses a monotonic integer version. When an author mutates a fact (e.g., updating an entity's injury status), the fact's version increments.  
> * **Edge Invalidation Trigger:** An automated SQL trigger (propagate\_fact\_mutation()) or a query sweep identifies any downstream scene where the pinned\_version of a dependency is less than the latest\_version of that fact.  
> * **Status Degradation:** The trigger marks the affected scenes with is\_dirty \= 1, appending a human-readable diff string explaining the collision, and forces the scene's status back to DRAFT or PENDING\_REVALIDATION.

### **4\. Blast Radius & Transitive Dependency Hashing**

To correctly identify exactly which scenes must be blocked at the ingress gate, the system computes the downstream impact of any state mutation.

> * **Recursive Topological Traversal:** The compiler evaluates the "True Economic Blast Radius" using a recursive Common Table Expression (CTE) in SQLite. The CTE traverses the graph from the mutated entity through all intermediate scenes to locate every downstream artifact rendered invalid by the upstream change.  
> * **Dependency Hashing (*Hdep*​):** To prevent unrelated edits from locking writers out of their sessions, an entity's dependency hash (*Hdep*​) combines its own hash with the sorted hashes of its direct foreign keys.  
> * **Multi-Hop vs 1-Hop Checks:** The edge gateway performs a fast 1-hop direct foreign-key check to provide immediate advisory feedback to writers, while the local compiler executes the authoritative multi-hop transitive closure check during formal ingestion.

---

*User prompt: {{FOCUS: 2\. Single-Threaded Mutex & Queue Management (ShotCoordinatorDO) }} /extreme-details*

Response: The **ShotCoordinatorDO** (Durable Object) serves as the centralized, stateful hardware mutex and asynchronous dispatch queue for the production pipeline. By physically isolating multiple distributed artists (Rig 1\) from the shared GPU foundry (Rig 2), it prevents the catastrophic hardware collisions that occur when concurrent tensor allocations hit consumer graphics cards.

Here is the extreme-detail breakdown of its mechanical implementation and queue architecture.

### **1\. The Single-Threaded Actor Model (The Hardware Mutex)**

Direct unmediated access from multiple locations to Rig 2's ComfyUI instance triggers immediate CUDA Out-Of-Memory (OOM) crashes, corrupted graphs, and dropped connections. The architecture resolves this by casting the Durable Object as an implementation of the **Actor Model**.

> * **Structural Mutex Guarantee:** Cloudflare Durable Objects are strictly single-threaded per named instance (e.g., idFromName("global-render-queue")). All incoming execution requests, cancellations, and telemetry webhooks are serialized through a single V8 event loop.  
> * **Race Condition Elimination:** Standard microservice race conditions—such as two simultaneous HTTP requests bypassing an if (\!isRendering) check—are mathematically impossible. The DO guarantees that ComfyUI operates with 100% dedicated access to GPU VRAM.  
> * **Strict Gate Progression:** The active lock is released, and Rig 2 is dispatched a new job, *only* when one of three conditions is met:  
  1. The active job completes cleanly and returns a valid BROKER\_COMPLETE sentinel.  
  2. The watchdog timer trips a dead-man's switch, marking the job as failed and quarantining it to the Dead-Letter Queue (DLQ).  
  3. An explicit artist cancellation command frees the lock.

### **2\. Fair Scheduling and Tenant Round-Robin**

A naive First-In, First-Out (FIFO) queue introduces a massive hardware starvation hazard in a multi-artist studio. If Artist A queues an entire 50-shot episode animatic, and Artist B submits a single one-shot revision, a pure FIFO queue would lock Artist B out of the foundry for over 40 minutes.

> * **Weighted Interleaving:** The ShotCoordinatorDO organizes pending tasks via a per-artist round-robin interleaving algorithm.  
> * **Array Re-ordering:** When evaluating the next job to dispatch, the DO scans the queue to alternate artistId execution. A queue heavily saturated by one user (\[A, A, A, B\]) is dynamically reordered (\[A, B, A, A\]) before dispatch. This prevents high-volume batch renders from starving interactive collaborative revisions.

### **3\. Client Idempotency Keys and Retry Mitigation**

Artists operating on laptop Wi-Fi will inevitably experience packet loss or closed lids, triggering aggressive client-side UI retry loops. To prevent duplicate jobs from burning compute budgets or corrupting the queue, the DO enforces strict transport idempotency.

> * **Deterministic Binding:** Every dispatch payload must include a client-generated UUID (idempotency\_key) that is cryptographically bound to a server-computed payload fingerprint (e.g., UUIDv5(task\_id \+ base\_sha)) and the attempt number.  
> * **Transactional Rejection:** The DO intercepts the payload and inspects its internal transactional key-value store (ctx.storage).  
> * **Active Job Drops:** If the idempotency key exists and is marked as PENDING or RUNNING, the DO safely ignores the duplicate queue insertion and returns the active job status, preventing a redundant GPU run.  
> * **Reconnection Replay:** If the key is marked as COMPLETED, the DO bypasses ComfyUI entirely and immediately streams the cached, signed Cloudflare R2 asset URL back to the artist's local Remotion timeline.

### **4\. Transactional NVMe State and The Choke Point**

Standard in-memory WebSocket brokers lose all queue state if the edge isolate crashes or migrates across data centers.

> * **Atomic Persistence:** ShotCoordinatorDO commits every queue addition, status shift, and lease grant into Cloudflare's NVMe-backed storage using atomic transactions (txn.transaction(...) or await this.persistState()). If a migration occurs, the DO blocks concurrency upon boot until the entire queue and sequence counters are fully restored from disk.  
> * **The Unified leaveStateChokePoint:** To prevent fragmented error handlers from skipping cleanup steps, every exit from the RUNNING state routes through a single strictly typed choke point. This choke point atomically manages FSM transitions, clears in-flight watchdog timers, and enqueues asynchronous outbox actions (like budget reconciliation or D1 relational updates).

### **5\. Immediate Abort & Interrupt Paths**

When a human operator detects a flawed prompt or incorrect AST parameter mid-render, they require an instant circuit breaker.

> * The artist issues a POST /jobs/:id/cancel command to the edge DO.  
> * The ShotCoordinatorDO immediately transitions the state to release the mutex and forwards an interrupt signal down the tunnel to Rig 2's media-broker.  
> * The local broker calls ComfyUI's native interruption endpoint (POST \[http://127.0.0.1:8188/interrupt\](http://127.0.0.1:8188/interrupt)), which instantaneously halts the active KSampler, discards the intermediate latents, and completely flushes the VRAM for the next queued task.

---

*User prompt: {{FOCUS: 3\. WebSocket Hibernation Multiplexing & Reconnection Protocols) }} /extreme-details*

Response: The WebSocket multiplexing architecture of the edge-director solves the central economic and physical constraint of serverless generative video: standard edge servers cannot afford to hold open WebSockets for 90–180 second diffusion passes without accruing massive duration billing, but mobile clients demand real-time telemetry.

Here is the extreme-detail breakdown of how the ShotCoordinatorDO manages persistent sockets, zero-idle-cost hibernation, and resilient reconnection protocols.

### **1\. The Zero-Duration Hibernation Mechanics**

Standard WebSocket servers (e.g., Node.js with ws or Socket.io) maintain a continuous process in RAM to keep the TCP connection alive. Cloudflare's **WebSocket Hibernation API** structurally decouples the TCP socket from the active JavaScript engine.

> * **The Ingress Handshake:** An artist running Rig 1 (or the local broker on Rig 2\) initiates a connection. The stateless edge Worker validates the signed JWT in \<5 ms and forwards the HTTP Upgrade request to the specific ShotCoordinatorDO instance.  
> * **The Freeze (ctx.acceptWebSocket):** The DO accepts the connection using this.ctx.acceptWebSocket(server, \[role\]). It then serializes any required session metadata (e.g., artistId, current epoch).  
> * **Isolate Eviction (The Coma):** Immediately after accepting the socket, Cloudflare's edge hypervisor pauses the DO. The V8 JavaScript isolate is serialized and entirely evicted from the edge server's RAM. Cloudflare's global Anycast proxy network holds the bare TCP keep-alive.  
> * **\$0.00 Idle Burn:** While the local GPU on Rig 2 spends 60–120 seconds grinding through tensor calculations, the edge ShotCoordinatorDO incurs exactly zero billable duration compute.  
> * **Sub-2ms Telemetry Waking:** When Rig 2 sends a BROKER\_PROGRESS JSON packet over the wire, the Anycast proxy detects the incoming bytes, wakes the DO, rehydrates its V8 memory in under 2 milliseconds, and fires the webSocketMessage() handler to route the telemetry to connected artists before immediately hibernating again.

### **2\. The Persistent Outbound Tunnel Topology**

Rig 2 never exposes an open inbound port (like :8188 or :3000) to the public internet, which would invite catastrophic remote code execution vulnerabilities.

> * **Inside-Out Connections:** The local daemon on Rig 2 (media-broker) initiates an outbound encrypted tunnel via cloudflared upward to the edge-director.  
> * **Role-Based Socket Tagging:** When connections hit the ShotCoordinatorDO, they are tagged by role via the query string (e.g., ?role=broker or ?role=artist).  
> * **The Split-Brain Zombie Defense (Fencing Tokens):** If Rig 2 loses network connectivity for \>30 seconds (missing 3 sequential 10-second heartbeats), the DO's watchdog timer fires and revokes the active lease, incrementing a monotonic epoch counter (e.g., *N*→*N*\+1). If the disconnected worker "wakes up" later and attempts to upload its finished .mp4 plate claiming the old epoch (*N*), the DO rejects the write with HTTP 409 Conflict, preventing late-arriving artifacts from corrupting the canonical state.

### **3\. Reconnection Replay & The Monotonic Log**

Artists operating on hotel Wi-Fi or closing their laptop lids mid-render will inherently drop their WebSocket connections. The DO must ensure they miss nothing when they return.

> * **The Stateless Client Fallacy:** The client UI cannot rely on a continuous stream. It must assume it will lose the socket.  
> * **Transactional NVMe Persistence:** The DO records every state transition (e.g., QUEUED → PROCESSING → COMPLETED) into Cloudflare's atomic ctx.storage.  
> * **The Resync Handshake:** When an artist's client reconnects, it sends a handshake carrying its artistId and last known state sequence.  
> * **Delta Snapshots (The Fast-Forward):** The DO queries ctx.storage. If the job finished while the artist was in the "tunnel," the DO does not attempt to replay raw progression percentages. It immediately delivers the final SHOT\_READY payload containing the signed Cloudflare R2 asset link, allowing the artist's Remotion viewport to snap instantly to the present state.

### **4\. Telemetry Multiplexing & Translation**

The media-broker on Rig 2 is responsible for reading low-level execution signals and normalizing them for the edge.

> * **Local Tapping:** media-broker holds a local connection to ws://127.0.0.1:8188/ws. It watches for ComfyUI's native, granular events (execution\_start, executing, progress).  
> * **Normalization:** It translates these granular engine-specific events into a generic BROKER\_PROGRESS schema.  
> * **Edge Relay:** The DO receives the BROKER\_PROGRESS packet. It iterates through its map of connected artist sockets via this.ctx.getWebSockets("artist") and broadcasts the update. Because the DO is single-threaded, these broadcasts are guaranteed to be linearly ordered, preventing race conditions in the UI's progress bar.

---

*User prompt: {{FOCUS: 4\. Distributed Leases, Monotonic Epochs, and Watchdog Circuit Breakers) }} /extreme-details*

Response: The management of distributed execution leases via monotonic epochs, heartbeats, and time-authoritative Durable Objects represents the foundational concurrency control mechanism within the pipeline. This pattern prevents the catastrophic "split-brain" execution hazard, mitigates hardware locking conflicts, and ensures storage integrity across local GPUs and serverless edge runners.

Here is the extreme-detail breakdown of the mechanical implementation, edge failure handling, and structural fencing architecture.

### **1\. The Hazard: The Split-Brain Zombie Runner**

The primary distributed systems hazard when orchestrating remote rendering across volatile network tunnels is the **Split-Brain Zombie Problem**.

> * If Rig 2 (running media-broker) initiates a heavy render and the network tunnel connecting it to the edge encounters a partition (e.g., dropping packets for 35 seconds), the edge queue must not hang indefinitely waiting for the partitioned worker.  
> * The edge queue must time out and reassign the job to a new lease.  
> * When the network recovers, the original worker (Worker A, now a "zombie") finishes its render and uploads its media plate.  
> * Without strict concurrency controls, Worker A will silently overwrite the newer, canonical asset generated by the replacement worker.

### **2\. Time Authority and The Heartbeat-Renewed Lease**

To solve this, the pipeline explicitly rejects static timeout windows (e.g., a hard 180-second Time-To-Live), which would inevitably kill legitimate, long-running video diffusion jobs mid-render. Instead, the system utilizes short, heartbeat-renewed leases governed exclusively by the Cloudflare Durable Object (ShotCoordinatorDO).

> * **The Sole Time Authority:** The ShotCoordinatorDO is the absolute arbiter of time; wall-clock timestamps are ignored in favor of the DO's internal timer state.  
> * **The 30-Second Window:** When a job is dispatched, the DO grants an exclusive execution lease valid for a strict 30 seconds.  
> * **The 10-Second Pulse:** The media-broker running on Rig 2 must dispatch an HTTP POST /heartbeat every 10 seconds. Each successful heartbeat pushes the DO's internal expiration window back by \+30 seconds.  
> * **Thread Isolation Requirement:** Crucially, the heartbeat loop on Rig 2 runs inside an independent Web Worker or background thread, completely decoupled from the primary GPU processing loop. If the Node.js event loop blocks while executing heavy I/O or SHA-256 hashing a 2 GB video plate, the heartbeat does not stall, preventing the edge DO from falsely declaring the worker dead.  
> * **Absolute Execution Ceiling:** To catch processes that stay alive but enter an infinite internal loop, the DO enforces a hard maximum job duration cap (e.g., 15 minutes). If this ceiling is hit, the lease is revoked regardless of active heartbeats.

### **3\. Proactive Watchdog Alarms**

Relying on incoming HTTP requests to detect a dead worker is a reactive pattern.

> * **Hardware Alarms:** The ShotCoordinatorDO utilizes Cloudflare's ctx.storage.setAlarm() API to set a proactive watchdog alarm exactly 30 seconds into the future.  
> * **Autonomous Triggering:** Every valid heartbeat resets this alarm (ctx.storage.setAlarm(Date.now() \+ 30000)). If a worker drops offline and misses three heartbeats, the hardware alarm fires autonomously inside the edge isolate.  
> * **The Revocation Choke Point:** The DO evaluates the state transition, immediately revokes the lease, and safely requeues the job.

### **4\. Monotonic Epochs and Fencing Tokens**

To physically prevent a zombie worker from committing a late write, the system issues monotonic fencing tokens.

> * **Epoch Generation:** Every time a lease is granted or revoked, the ShotCoordinatorDO increments its internal epoch counter (e.g., *N*→*N*\+1).  
> * **Token Issuance:** The remote worker receives this epoch as its fencing token and must include it in every subsequent heartbeat and final artifact submission.  
> * **Atomic Rejection:** If a zombie worker (holding Epoch *N*) awakens after a partition and attempts to commit an artifact via POST /tasks/complete, the single-threaded DO compares the incoming token against its active lease record within a synchronous, atomic block in ctx.storage. Because *N*\<*N*\+1, the DO rejects the write with an HTTP 409 Conflict.

### **5\. Structural Fencing via Content-Addressed Promotion**

Cloudflare R2 and AWS S3 object storage APIs do not natively evaluate custom application fencing tokens on raw PUT requests. A zombie worker can, therefore, physically write bytes to a storage bucket. Fencing is instead enforced structurally at the **promotion boundary**.

> 1. **Staging Keys:** Workers upload rendered artifacts to an epoch-scoped, content-addressed staging key (e.g., staging/renders/\${task\_id}/epoch\_\${epoch}\_\${sha256}.mp4). Because the file is content-addressed, a new render will never overwrite an old file.  
> 2. **The RPC Completion Gate:** The worker issues an idempotent completion RPC to the DO containing the staging key.  
> 3. **Atomic Promotion:** The DO validates the epoch. Only upon successful validation does the DO write the staging key into the canonical episode manifest via a single transactional write in ctx.storage.  
> 4. **Garbage Collection:** A zombie worker's staged files are never promoted to the canonical manifest. They remain unindexed and are automatically reaped by a 7-day R2 lifecycle retention policy. This ensures that while a stale worker might push inert bytes to a bucket, it is structurally incapable of promoting that work into canonical truth.

### **6\. The Dead-Letter Queue (DLQ) and Triage**

If a job lease expires, the system does not blindly requeue it indefinitely, nor does it route it immediately to a failure state, as this conflates transient infrastructure faults with deterministic poison jobs.

> * **Transient Infrastructure Fault (Worker Crash):** If a worker is killed by an Out-Of-Memory (OOM) error or power drop, the DO increments the attempt\_count. If attempt\_count \< max\_attempts (default: 2 or 3), the job is re-queued with a fresh lease epoch.  
> * **Deterministic Poison Task:** If a job fails repeatedly (e.g., a malformed prompt consistently crashing the diffusion model) and exceeds max\_attempts, it transitions to the Dead-Letter Queue (DLQ). The edge-director freezes the lease to prevent infinite retry loops and dispatches a diagnostic failure trace directly to the Showrunner's Astro Cockpit for human adjudication.

---

*User prompt: {{FOCUS: 5\. Lock Management, Local Sovereignty, and Graceful Degradation) }} /extreme-details /\\*

Response: The architecture of the edge-director deliberately inverts standard cloud-control paradigms. Instead of the cloud edge holding an authoritative lock over a local physical machine, the local machine maintains absolute sovereignty over its own hardware, treating the edge strictly as a passive, disposable request queue.

This guarantees that local production can continue uninterrupted if the internet connection or Cloudflare tunnel drops.

Here is an extreme-detail breakdown of how this inverted locking mechanism works and how graceful degradation is handled.

### **1\. Inverting the Hardware Mutex (Local flock Sovereignty)**

An early design iteration allowed the edge Durable Object (DO) to dictate hardware state, effectively saying "you own the GPU now" to Rig 2\. This was identified as a critical distributed-systems failure point: if the Cloudflare tunnel dropped, the local GPU could be left in an ambiguous or contested state.

The corrected design enforces permanent, unconditional local sovereignty:

> * **The OS-Level flock:** The local execution daemon on Rig 2 (media-broker) permanently holds an OS-level file lock (flock) on the GPU hardware interface.  
> * **The Passive Edge Queue:** The ShotCoordinatorDO on the Cloudflare edge possesses absolutely zero authority to command the hardware. It serves exclusively as a passive, logical FIFO request queue.  
> * **The Pull-Only Execution Loop:** The local media-broker polls the edge DO for leased jobs *only* when its local hardware lock is free and available.

The operational flow is explicitly linear: Remote DO → logical request queue → local media-broker → OS flock → GPU.

### **2\. Eliminating the "Two-Queue" Failure Mode**

This strict inversion eliminates a subtle but catastrophic failure mode: the two-queue collision.

> * If the local broker only enforced a lock during offline fallbacks (treating the edge feed as the primary lock), a slight network delay could cause the DO to revoke a lease and assign the job to a new epoch (Worker B) while the local broker was still rendering the original job.  
> * This would create two simultaneous claimants on one GPU, immediately triggering a CUDA Out-of-Memory (OOM) crash.  
> * By making the local lock permanent and unconditional, the edge DO is reduced to an optional source of *requests* rather than *commands*, eliminating this race condition by physical construction.

### **3\. Graceful Degradation: The Local Offline Fallback**

To uphold the studio's "Deletion Principle" (ensuring production survives cloud provider outages), the edge-director cannot be a single point of failure.

> * **Zero Code-Path Divergence:** If the internet tunnel drops, the media-broker on Rig 2 does not switch to a separate, fragile "fallback mode". It uses the exact same code path, simply polling a different source.  
> * **The Local Disk Spool:** When the edge DO is unreachable, the broker seamlessly falls back to reading render requests from a local disk queue (/var/spool/renders).  
> * **Uninterrupted Production:** Generation proceeds uninterrupted, using local frame allocations. The resulting plates are hashed, written to a local content-addressed archive, and referenced in the local manifest.

### **4\. SIMULATION\_ONLY Mode (When the GPU is Dead)**

While the local fallback handles *network* outages, the system must also handle physical *hardware* outages (e.g., Rig 2 loses power). The edge-director supports a specialized SIMULATION\_ONLY degradation mode.

If the Edge Gateway detects that no media-broker sockets are connected (the GPU foundry is offline), it evaluates the execution payload:

> * **State Commit Without Pixels:** If the payload permits simulation fallback, the edge worker executes the narrative state transition directly against the Cloudflare D1 relational database (e.g., advancing character conditions, expending inventory) without generating any media.  
> * **The Append-Only Backlog:** The unrendered scene Abstract Syntax Trees (ASTs) are placed into a persistent backlog queue. Writers can continue drafting episodes seamlessly.  
> * **Batch Catch-Up:** When Rig 2 reconnects and its local lock opens, it pulls from this backlog, rendering the visual plates in an automated batch to catch up to the current canonical state.

---

*User prompt: {{FOCUS:1. The Single-Threaded Actor Model (The Hardware Mutex)) }} /extreme-details*

Response: The **Single-Threaded Actor Model**, implemented via Cloudflare Durable Objects, is the structural foundation of the edge-director's hardware mutex. Standard serverless functions (like AWS Lambda or bare Cloudflare Workers) are stateless and process requests concurrently, meaning they must rely on external databases and complex locking mechanisms to manage shared state, which frequently leads to race conditions (the "Billing Hammer").

To physically prevent distributed artists from crashing a shared GPU with concurrent diffusion tasks, the system abandons stateless microservices in favor of the Actor Model.

Here is an extreme-detail breakdown of the physical, logical, and failure-state mechanics of this single-threaded mutex.

### **1\. The Physical Reality: V8 Isolates and "ACID in RAM"**

A Durable Object (DO) is not a generic cloud container; it is a single, stateful V8 JavaScript Isolate running on a specific metal rack within a specific Cloudflare data center (e.g., London).

> * **Unique Instantiation:** The queue is instantiated globally via a deterministic ID, such as idFromName("global-render-queue").  
> * **The Law of Serialization:** Cloudflare's hypervisor guarantees that all inbound HTTP requests, webhooks, cancellations, and timeouts destined for that ID are routed to that exact physical compute thread.  
> * **Race Condition Eradication:** Memory access inside the DO is strictly single-threaded. If Artist A (London) submits an attack scene and Artist B (Montreal) submits a movement scene 0.1 milliseconds later, the requests do not execute simultaneously. The runtime places them on the event loop in strict arrival sequence. Request A executes to completion, and only then does Request B execute, sharing the same this.state memory heap.  
> * This provides "ACID compliance in RAM," making standard microservice race conditions—such as two concurrent requests bypassing an if (\!isRendering) check—structurally impossible.

### **2\. Strict Gate Progression**

Because the queue is perfectly serialized, the ShotCoordinatorDO can enforce a foolproof, stateful FIFO (First-In, First-Out) or round-robin queue. The active lock on the GPU is released, and Rig 2 is dispatched a new task, *only* when one of three absolute conditions is met:

> 1. **Clean Completion:** The active job finishes and emits a valid BROKER\_COMPLETE sentinel to the edge.  
> 2. **Circuit Breaker / Watchdog Trip:** The job fails or misses three consecutive heartbeats, prompting the DO's internal watchdog alarm to revoke the lease, mark the job as failed, and quarantine it to the Dead-Letter Queue (DLQ).  
> 3. **Human Interruption:** An artist manually issues an explicit cancellation command (POST /jobs/:id/cancel), freeing the lock and instructing Rig 2 to dump its VRAM. Until one of these occurs, subsequent execution requests are safely held in the DO's transactional memory, guaranteeing ComfyUI on Rig 2 operates with 100% dedicated access to GPU VRAM without concurrent tensor collisions.

### **3\. The Single-Threaded Trap: The 10-Second Execution Wall**

While the single-threaded nature of the DO provides perfect concurrency safety, it introduces a severe architectural hazard: the execution deadlock.

> * **The Ingress Bottleneck:** Because the DO processes one request at a time, if the isolate initiates an outbound fetch or blocks its thread waiting for an external promise that hangs, its event loop is entirely occupied. Any new inbound calls are forced into a waiting queue.  
> * **The Platform Watchdog:** Cloudflare enforces a strict 10-second wall-clock limit for any single request. If the DO sits deadlocked (waiting for itself or an external service to stop waiting) for 10 seconds, it does not gracefully error out. The Cloudflare platform watchdog "murders the isolate" to prevent infinite hangs.

### **4\. Hot Journals and Rehydration Recovery**

When the platform watchdog kills a deadlocked isolate, it does so instantaneously, with profound implications for the DO's underlying storage.

> * **The Hot Journal State:** If the isolate is murdered mid-transaction, its attached SQLite database (ctx.storage.sql) is left in a "Hot Journal" state. This means the database was interrupted in the middle of writing to its Write-Ahead Log (WAL) when the virtual power was cut.  
> * **The Recovery Cycle:** The next time a client connects, the DO must boot up and "Rehydrate". The SQLite engine detects the Hot Journal and is forced to run a Recovery Cycle before it can process new requests.  
> * **The Reset Loop Hazard:** If a system's "Z-Index of Failure" is too high (meaning the system is heavily degraded and producing continuous errors), this recovery cycle might take too long, hitting Cloudflare's 50ms CPU limit, causing the DO to crash again before it ever wakes up.

To survive this, the ShotCoordinatorDO treats its in-memory working state purely as a disposable projection. If the isolate is evicted or murdered by the watchdog, it safely rebuilds its queue deterministically upon waking by replaying committed events using atomic blocks (this.ctx.blockConcurrencyWhile(...)) against ctx.storage.

---

*User prompt: {{FOCUS : 2\. Fair Scheduling and Tenant Round-Robin)) /extreme-details*

Response: The ShotCoordinatorDO utilizes a dynamic, per-artist round-robin interleaving algorithm to prevent any single creator from monopolizing the shared GPU hardware foundry.

Here is the mechanical breakdown of how the pipeline enforces fair compute distribution across the multi-tenant architecture:

> * **The Hardware Starvation Hazard:** A pure First-In, First-Out (FIFO) queue presents a severe operational risk in a distributed studio. If Artist A queues an entire 50-shot batch or a complete 24-shot episode animatic, a naive FIFO system will lock the consumer GPU for upwards of 40 minutes. This forces Artist B, who may only be submitting a single one-shot revision, to wait nearly an hour for a 60-second render.  
> * **Dynamic Queue Re-ordering:** To maintain collaboration balance and prevent this single-tenant hardware starvation, the queue Abandons strict chronological execution in favor of weighted fair queuing based on active tenant IDs.  
> * **The State-Aware Interleaving Algorithm:** When the hardware mutex unlocks, the Durable Object invokes its getNextFairJob() method to determine the next dispatch. The DO first inspects the artistId of the most recently executed activeJob.  
> * **Array Scanning and Extraction:** It then scans the pending queue array using a standard findIndex operation to locate the first job belonging to a *different* artistId. If the queue is heavily saturated by one user (e.g., structured chronologically as \[A, A, A, B\]), the algorithm extracts Artist B's job using this.queue.splice(alternateIndex, 1)\[0\].  
> * **Execution Re-mapping:** This operation dynamically reorders the execution sequence to \[A, B, A, A\], pulling the minority tenant to the front of the line to ensure their interactive revision is processed immediately.  
> * **Fallback to Sequential FIFO:** If the findIndex scan returns \-1—meaning every pending job in the queue belongs to the identical artistId—the algorithm gracefully falls back to a standard this.queue.shift(). The single user's batch is processed sequentially until another artist introduces a new job into the queue.  
> * **Studio Velocity Preservation:** By structurally enforcing this round-robin tenant partitioning at the edge, the system guarantees that massive background batch renders from one Scene Pod can never starve the interactive, real-time creative revisions of another Scene Pod operating on the same infrastructure.

---

*User prompt: {{FOCUS:3. Reconnection Replay & The Monotonic Log }} /extreme-details*

Response: The WebSocket architecture of the edge-director decouples the physical TCP connection from active compute memory, solving the central economic hazard of generative video infrastructure: standard long-lived cloud servers charge continuously for open sockets while remote GPUs render. By multiplexing multiplexing roles and enforcing deterministic sequence replays, the system guarantees that mobile clients can safely drop offline without losing render plates.

### **1\. The Zero-Duration Hibernation API**

The ShotCoordinatorDO Durable Object maintains persistent connections at zero idle cost using Cloudflare's WebSocket Hibernation API.

> * **The Ingress Tagging:** When an HTTP Upgrade request hits the DO, it accepts the socket using this.ctx.acceptWebSocket(server, \[tag\]). The incoming connection is tagged by its query string role, assigning it either "artist" or "broker".  
> * **Isolate Eviction:** Immediately after the connection is accepted, the JavaScript V8 isolate is serialized and evicted entirely from the edge server's RAM. Cloudflare's global Anycast proxy network takes over, holding the bare TCP keep-alives.  
> * **\$0.00 Idle Burn:** While the local ComfyUI GPU on Rig 2 spends 60 seconds rendering latents, the Durable Object incurs zero billable CPU duration charges.  
> * **Sub-2ms Telemetry Waking:** When Rig 2 emits a progress payload over the wire, the edge proxy detects the incoming bytes and wakes the Durable Object in under 2 milliseconds. The DO executes the webSocketMessage() handler to route the telemetry to connected artists before immediately hibernating again.

### **2\. The Coma State and Application-Layer Pings**

Standard TCP keepalives are too slow to detect dropped mobile connections reliably. The architecture enforces its own heartbeat protocol at the application layer.

> * **The 2-Second Pulse:** The protocol demands an explicit PING / PONG exchange every 2 seconds. Application-level heartbeats (system.ping) substitute for unavailable browser ping frames.  
> * **The Coma Trigger:** If three consecutive pings are missed, the connection is considered dead. The client UI does not spin indefinitely; it freezes, greys out the viewport, and enters a "Reconnecting..." Coma State.  
> * **Custom Close Codes:** The system utilizes custom WebSocket close codes in the 4000–4999 range to distinguish transient network drops from deliberate, expired authentication sessions.

### **3\. The Reconnect Storm and Deterministic Jitter**

If an edge data center drops thousands of sockets, a simultaneous mass-reconnection attempt would overwhelm the ingress gateway.

> * **Client-Side Jitter:** The client SDK is hard-coded to execute an exponential backoff routine augmented with deterministic jitter.  
> * **Staggered Windows:** Upon disconnection, clients wait a randomized interval between 100ms and 5000ms before attempting to reopen the socket.

### **4\. The Monotonic Sequence and Reconnection Replay**

Standard in-memory WebSocket brokers lose all queue state if the process crashes or migrates across data centers. The DO physically backs all channel states to transactional NVMe storage (ctx.storage).

> * **Sequence Auditing:** Every server envelope broadcast to a client carries an incrementing seq integer. If the client detects any gap in the sequence (e.g., jumping from 41 to 44), it automatically triggers a system.resyncRequest.  
> * **The Handshake:** When an artist re-opens their laptop, the client initiates a handshake carrying their artistId and the last known sequence ID.  
> * **The Delta Snapshot:** The ShotCoordinatorDO searches its completed state ledgers. If the job finished while the artist was offline, the DO bypasses standard telemetry and instantly delivers a Delta Snapshot containing the final SHOT\_READY payload and the signed Cloudflare R2 asset link.  
> * **Zero-Intervention Compositing:** The artist's local Remotion timeline automatically ingests the signed URL and updates the viewport, fast-forwarding the client to the present state without human intervention.

### **5\. Clock Synchronization for Optical Playback**

To ensure that distributed artists viewing the same active render or playback timeline see the exact same frame, the client continually calculates clock drift against the edge.

> * The client evaluates the network offset to derive serverTime.  
> * Local video playback seeking is calculated mathematically using: elapsedMs=(Date.now()+clockOffsetMs)−sceneStartTime.

---

*User prompt: {{FOCUS:3. ShotCoordinatorDO }} /extreme-details*

Response: The **ShotCoordinatorDO** is a specialized Cloudflare Durable Object that serves as the single-threaded hardware mutex, temporal authority, and stateful orchestration actor for the generative video pipeline. It guarantees that concurrent generative requests never crash the shared remote GPU (Rig 2\) while ensuring that network partitions do not result in corrupted timeline state or runaway compute budgets.

### **1\. The Single-Threaded Actor Model (The Hardware Mutex)**

Direct, unmediated access to a shared GPU by multiple remote artists triggers fatal CUDA Out-Of-Memory (OOM) crashes, corrupted graphs, and dropped connections. The ShotCoordinatorDO resolves this by implementing the Actor Model.

> * **Unique Instantiation:** Each active shot or global render queue is represented by a specific, isolated Durable Object instance (e.g., instantiated via idFromName(shot\_id) or "global-render-queue").  
> * **Race Condition Eradication:** Cloudflare guarantees that all inbound HTTP requests, WebSocket messages, cancellations, and webhooks destined for that ID are serialized through a single V8 event loop.  
> * **FIFO & Fair Scheduling:** The DO serializes incoming render jobs into a strict, single-threaded execution queue. To prevent single-tenant hardware starvation (e.g., one artist queueing a 50-shot batch), it utilizes a round-robin algorithm that dynamically interleaves pending jobs across distinct artistId tenants before dispatching them to the hardware.  
> * **Idempotency Enforcement:** Every dispatch carries a client-generated UUID idempotency\_key. The DO inspects its transactional key-value store (ctx.storage), and if the key already exists as processed or active, it immediately rejects the duplicate payload with an HTTP 409 Conflict, preventing duplicate cloud GPU charges and redundant renders.

### **2\. Time Authority, Heartbeats, and Proactive Watchdogs**

Standard static timeouts (e.g., a hard 180-second Time-To-Live) are fundamentally flawed for generative video, as legitimate renders can easily exceed arbitrary limits, causing valid jobs to be killed mid-render.

> * **The Sole Time Authority:** The ShotCoordinatorDO is the absolute arbiter of time; wall-clock timestamps are ignored in favor of the DO's internal timer state.  
> * **Heartbeat-Renewed Leases:** The DO grants an exclusive execution lease valid for a strict 30 seconds.  
> * **The 10-Second Pulse:** The remote compute worker (media-broker on Rig 2\) must dispatch an HTTP POST /heartbeat every 10 seconds. Every successful heartbeat pushes the DO's internal expiration window back by \+30 seconds, allowing the job to run indefinitely up to a global safety ceiling (e.g., 15 minutes).  
> * **Thread Isolation:** The heartbeat loop on the remote worker runs inside an independent background thread. This ensures that if the Node.js event loop blocks while executing heavy I/O or SHA-256 hashing a large video file, the heartbeat does not stall.  
> * **Proactive Watchdog Alarms:** Relying on incoming HTTP requests to detect a dead worker is a reactive pattern. The DO sets a proactive hardware alarm 30 seconds into the future using ctx.storage.setAlarm(). If a worker drops offline and misses three consecutive heartbeats, the alarm fires autonomously at the edge, transitioning the job state to EXPIRED and revoking the lease.

### **3\. Monotonic Epoch Fencing & Structural Promotion**

To solve the **Split-Brain Zombie Problem**—where a partitioned worker recovers late and silently overwrites a newer canonical asset—the ShotCoordinatorDO employs mathematical epoch fencing.

> * **Epoch Generation:** Every time a lease is granted or revoked, the DO increments an internal epoch counter (*N*→*N*\+1) and passes this integer to the remote worker as a fencing\_token.  
> * **Atomic Rejection:** If a zombie worker awakens after a network partition and attempts to commit an artifact using a stale token (Epoch *N*), the DO compares the incoming token against its active lease record. Because *N*\<*N*\+1, the write is rejected with an HTTP 409 Conflict.  
> * **Content-Addressed Staging:** Cloudflare R2 does not natively evaluate custom fencing tokens on PUT requests. Workers must upload rendered artifacts to an epoch-scoped, content-addressed staging key (e.g., staging/renders/\${task\_id}/epoch\_\${epoch}\_\${sha256}.mp4).  
> * **The RPC Promotion Gate:** The worker issues a completion RPC to the DO containing the staging key. Only upon successful epoch validation does the DO atomically write the staging key into the canonical episode manifest. Zombie files are never promoted and are automatically reaped by a 7-day R2 lifecycle policy.

### **4\. WebSocket Hibernation (\$0.00 Idle Cost)**

Maintaining an open TCP connection during a 90-second diffusion pass on standard edge servers accrues massive duration billing.

> * **The Hibernation API:** When an artist or broker connects, the DO tags the socket via ctx.acceptWebSocket(ws, \[role\]).  
> * **Scale-to-Zero Memory:** The DO's V8 JavaScript isolate is serialized and entirely evicted from edge server RAM while the Cloudflare Anycast proxy holds the bare TCP keep-alive, dropping idle compute costs to \$0.00.  
> * **Telemetry Waking:** When media-broker dispatches a progress packet, the proxy wakes the DO isolate in under 2 milliseconds, executing webSocketMessage() to broadcast the payload to connected artist cockpits before immediately hibernating again.  
> * **Reconnection Replay:** If an artist's laptop disconnects mid-render, the lease remains owned by the edge DO. Upon reconnection, the DO searches its completed state ledgers and immediately streams the final SHOT\_READY payload and signed R2 asset link, allowing the UI to fast-forward without human intervention.

### **5\. The Unified State Choke Point & Multi-Lane Outbox**

To prevent side-effect failures from corrupting state or skipping cleanup steps, all state transitions inside the DO route through a single, strictly typed transaction method (e.g., leaveStateChokePoint or applyTransition).

> * **Atomic Storage Transactions:** The transition opens a single-turn atomic block via ctx.storage.transaction(). It evaluates FSM guards, applies selective epoch fencing (retaining the epoch for valid promotions, bumping it for timeouts/rejections), and reconciles timers using the TimerScheduler.  
> * **Multi-Lane Enqueue:** Compensating actions are pushed into an asynchronous outbox separated by prefix-keyed lanes to prevent head-of-line blocking:  
  * **Lane 1 (outbox:PROJECTION:):** Updates read-only execution tracking rows in Cloudflare D1.  
  * **Lane 2 (outbox:BUDGET:):** Signals the GlobalCoordinator DO to settle or release reserved compute funds.  
  * **Lane 3 (outbox:GITHUB:):** Executes external Git operations, such as closing pull requests or deleting tracking branches.  
> * **4-Stage Saga Rollback:** If a task enters a terminal failure state, the DO triggers an idempotent compensating saga that revokes write authority, closes the GitHub PR, obliterates the remote tracking branch, and reconciles the WAL ledger, alerting human operators via Slack.

---

*User prompt: {{FOCUS 1\. Inverting the Hardware Mutex (Local flock Sovereignty) }} /extreme-details*

Response: The architectural strategy of inverting the hardware mutex is a fundamental distributed systems correction designed to ensure that local production survives cloud network partitions. Instead of the remote Cloudflare edge holding authority over the physical workstation GPU, the local machine maintains absolute sovereignty.

### **The Danger of Edge-Dictated Locks**

Early architectural iterations granted the edge Durable Object (DO) an exclusive lease over the local GPU, effectively treating the cloud as the hardware authority. This was recognized as a critical architectural mistake.

> * If the outbound Cloudflare tunnel dropped, the network partition could leave the local GPU in an ambiguous or contested state, despite the hardware being physically idle on the workstation.  
> * It introduced the risk of a "two-queue" collision. If the network dropped briefly, the DO might reassign a delayed job while the local broker was still rendering it.  
> * When connectivity returned, the GPU would face two simultaneous claimants for memory allocation, immediately triggering a fatal CUDA Out-of-Memory (OOM) crash.

### **The Unconditional Local Lock (OS flock)**

To eliminate this failure mode by construction rather than careful sequencing, the locking relationship was completely inverted.

> * **Permanent OS-Level Lock:** The local rendering daemon (media-broker running on Rig 2\) permanently holds an unconditional, OS-level file lock (flock) directly on the GPU hardware interface.  
> * **Zero Edge Authority:** The edge Durable Object possesses absolutely zero authority to command or lock the hardware.  
> * **The Pull-Only Queue:** The edge DO functions exclusively as a passive, single-threaded FIFO request queue. The local media-broker polls the DO for leased jobs *only* when its own local hardware lock is free and available.

### **The Linear Execution Path**

The operational pipeline enforces a strictly linear chain of command: Remote DO → logical request queue → local media-broker → OS flock → GPU

It explicitly rejects the fragile distributed pattern where the DO declares "you own the GPU now" while blindly hoping the network tunnel remains active.

### **Graceful Degradation & Zero Code-Path Divergence**

If internet connectivity fails entirely, local production must not halt. By ensuring the local broker always owns the hardware lock, the system achieves seamless offline degradation.

> * When the edge DO is unreachable, the media-broker automatically falls back to reading render manifests from a local disk queue (/var/spool/renders).  
> * Crucially, this executes using the exact same code path. It is not a separate "fallback mode" that would inevitably rot from disuse.  
> * Local GPU generation proceeds uninterrupted without any internet dependencies, maintaining the studio's capacity to produce episodes entirely offline.

---

*User prompt: {{FOCUS:3. 4\. The Monotonic Sequence and Reconnection Replay }} /extreme-details*

Response: The WebSocket multiplexing architecture of the edge-director fundamentally assumes that all mobile connections are volatile and untrustworthy. To survive dropped Wi-Fi, tunnels, or closed laptop lids without losing generative rendering progress, the pipeline implements a rigorous monotonic sequence auditing system paired with deterministic state replays.

Here is the extreme-detail breakdown of how the client and edge negotiate network failures, temporal synchronization, and state recovery.

### **1\. The Stateless Client Fallacy & Application-Layer Heartbeats**

Because standard web browsers do not expose low-level WebSocket protocol ping frames to the JavaScript runtime, standard TCP keepalives are insufficient to quickly detect a dead connection.

> * **The 2-Second Pulse:** The architecture enforces a custom application-layer heartbeat, requiring the Durable Object (DO) to broadcast system.ping messages. A strict PING / PONG exchange occurs every 2 seconds.  
> * **The Coma State:** The client's ChannelSocket class maintains a lastMessageAt timestamp. A background staleness watch timer runs every 5,000 milliseconds. If 3 pings are missed and Date.now() \- this.lastMessageAt exceeds 20,000 milliseconds, the client stops trusting the connection. The UI does not spin indefinitely; it explicitly enters an idle fallback routine (the "Coma State") where the viewport freezes, greys out, and displays "Reconnecting...".  
> * **Custom Close Codes:** The edge worker utilizes custom WebSocket close codes in the 4000–4999 range to distinguish between routine transient network drops and hard security revocations. For example, if the socket closes with code 4001, the client detects an expired Clerk authentication session and triggers a forced handleReauth() sequence rather than attempting a blind, infinite reconnect loop.

### **2\. Deterministic Jitter & Reconnection Storm Mitigation**

If a Cloudflare edge data center experiences a fault and drops thousands of active artist sockets, an immediate, simultaneous mass-reconnection attempt would overwhelm the ingress gateway.

> * **Exponential Backoff:** The client SDK is hard-coded to execute an exponential backoff routine upon socket closure. The initial retry window (backoffMs) begins at 500 milliseconds.  
> * **Deterministic Jitter:** To stagger the ingress load, the client injects programmatic jitter by appending Math.random() \* 250 milliseconds to the backoff interval (setTimeout(() \=\> this.connect(...), this.backoffMs \+ Math.random() \* 250)).  
> * **The Escalation Cap:** On each subsequent failure, the backoff interval doubles until it reaches a hard maximum ceiling of 15,000 milliseconds (maxBackoffMs).

### **3\. Monotonic Sequence Auditing & Identity**

To ensure that transient drops do not cause the client to skip critical render telemetry or state transitions, every server envelope broadcast by the edge DO carries an incrementing seq integer.

> * **The Monotonic Invariant:** The sequence numbers are guaranteed to be unique and monotonically increasing, strictly enforcing the property *seq*(*ei*​)\<*seq*(*ej*​) for every earlier event *ei*​.  
> * **Rejection of Gapless Strictness:** The system deliberately avoids enforcing a globally "gapless" sequence (e.g., 1, 2, 3, 4...) because managing perfectly contiguous integers during concurrent transactions and state rollbacks is computationally expensive and fragile. Instead, it relies on strict deterministic ordering.  
> * **Client-Side Auditing:** The client tracks the highest sequence integer received. If it detects any numerical gap (for instance, the sequence jumps directly from 41 to 44), it autonomously dispatches a system.resyncRequest to pull the missing operational frames.

### **4\. The Delta Snapshot & Reconnection Replay Protocol**

When an artist re-opens their laptop, the new client connection must instantly "hijack" their session, decapitate any lingering zombie socket at the edge, and resume exactly where they left off.

> * **The Handshake:** Upon establishing the new socket, the client immediately sends a mandatory system.resyncRequest containing their active artistId and their last known sequence ID (last\_seen\_action\_id).  
> * **Storage Rehydration:** Because the ShotCoordinatorDO commits every channel state transition into its transactional NVMe memory (ctx.storage.put(...)), waking DO instances can deterministically answer these requests.  
> * **The Catch-Up Bundle:** The DO searches its active and completed state ledgers in SQLite history. It compiles a "Catch-up" bundle—a Delta Snapshot containing every message the artist missed while offline.  
> * **Fast-Forwarding the Viewport:** If the remote Rig 2 GPU finished rendering the shot while the artist was disconnected, the DO bypasses individual progress telemetry entirely. It immediately delivers the final SHOT\_READY completion payload along with the signed Cloudflare R2 asset link. The artist's local Remotion timeline ingests this URL and updates the viewport instantly, fast-forwarding the client to the present state without requiring a page refresh or manual human intervention.

### **5\. Clock-Offset Synchronization for Optical Playback**

Because distributed team members may be viewing the same render progression or timeline playback remotely, the system must guarantee that all clients render the exact same optical frame at the exact same millisecond.

> * The client continuously evaluates its network drift to calculate a normalized clockOffsetMs, derived from serverTime \- Date.now().  
> * Local video playback seeking inside the Remotion HTML5 player is mathematically bound to this offset using the integration: elapsedMs=(Date.now()+clockOffsetMs)−msg.currentScene.sceneStartTime.  
> * The video element's currentTime is then rigidly locked to elapsedMs/1000, ensuring visual parity across the network.

---

*User prompt: {{FOCUS: Studio Velocity Preservation: }} /extreme-details*

Response: Studio Velocity Preservation, achieved through dynamic round-robin queue management, is a critical operational defense against multi-tenant hardware starvation. It guarantees that interactive, iterative tasks from one artist are not blocked by massive background batch renders submitted by another, maintaining a fluid creative cadence across the distributed studio.

### **The Threat: Single-Tenant Starvation via Strict FIFO**

In a shared, multi-artist pipeline, a naive First-In, First-Out (FIFO) queue structure introduces a severe operational vulnerability. If the edge queue dispatches jobs to the shared GPU foundry purely based on arrival time, a single creator can inadvertently halt the entire studio's interactive velocity.

> * **The Batch Monopolization Scenario:** If Artist A, perhaps finalizing an episode, submits an entire 50-shot batch or a 24-shot animatic directly to the ShotCoordinatorDO, those jobs flood the FIFO queue.  
> * **The Blocking Duration:** Given that diffusion renders (like Wan 2.2) are compute-intensive, executing this block of jobs can completely lock the consumer GPU hardware for upwards of 40 minutes to over an hour.  
> * **The Impact on Interactive Revision:** If Artist B subsequently submits a single one-shot revision (e.g., testing a rapid prompt tweak or a new LoRA weight) while Artist A's batch is processing, Artist B is stranded. They are forced to wait the full 40 minutes for their 60-second test render to execute, destroying the interactive feedback loop essential for creative iteration.

### **The Solution: Weighted Fair Queuing & Tenant Round-Robin**

To resolve this contention and preserve studio velocity, the ShotCoordinatorDO abandons strict chronological execution, implementing a dynamic, per-artist round-robin interleaving algorithm.

> * **State-Aware Interleaving:** When the active hardware lock on Rig 2 is released (either through a clean completion, an abort, or a watchdog failure), the DO invokes its getNextFairJob() method.  
> * **Evaluating the Active Tenant:** The algorithm first identifies the artistId of the activeJob that just finished executing.  
> * **Array Scanning for Alternate Tenants:** Instead of immediately grabbing the next job at index 0, the DO scans the pending queue array using a findIndex operation to locate the first pending job that belongs to a *different* artistId.  
> * **Dynamic Re-ordering and Extraction:** If the queue is saturated by Artist A but contains a job from Artist B (e.g., chronologically ordered as \[A, A, A, B\]), the findIndex locates B. The algorithm then extracts Artist B's job from its later position using an array splice operation (this.queue.splice(alternateIndex, 1)\[0\]).  
> * **The Remapped Execution Sequence:** This extraction functionally reorders the execution priority to \[A, B, A, A\], pulling the minority tenant (Artist B) to the front of the line, guaranteeing that their single revision is processed immediately after the current active job finishes.

### **Graceful Fallback and Velocity Guarantees**

> * **Sequential Fallback:** If the findIndex scan returns \-1 (meaning no alternate artistId exists in the queue because only one creator is currently submitting tasks), the DO gracefully falls back to a standard FIFO extraction (this.queue.shift()). The single user's batch is processed sequentially at maximum throughput until a new tenant enters the queue.  
> * **Preserving the Interactive Cadence:** By enforcing this tenant partitioning algorithm directly at the edge control plane, the system mathematically ensures that massive background batch renders from one Scene Pod cannot starve the real-time, interactive creative revisions of another Pod. Both batch processing and rapid prototyping can co-exist on the same shared hardware infrastructure without requiring complex, manual priority flags or separate GPU pools.

---

*User prompt: {{FOCUS:3. Dynamic Queue Re-ordering }} /extreme-details*

Response: The architectural implementation of Dynamic Queue Re-ordering within the ShotCoordinatorDO is the primary mechanism for enforcing Studio Velocity Preservation. It replaces a naive First-In, First-Out (FIFO) queue with a state-aware, weighted fair-queuing algorithm that interleaves multi-tenant execution.

Here is an extreme-detail breakdown of the mechanical implementation and array operations governing this re-ordering logic.

### **1\. The Hazard of Strict Chronological Execution**

In a distributed studio environment, artists dispatch generative workloads of vastly different scopes to a shared GPU foundry.

> * **Batch Operations:** Artist A may submit a massive background render, such as a 50-shot animatic batch or an entire episode's worth of latent diffusion passes.  
> * **Interactive Operations:** Artist B, operating in a rapid prototyping loop, may submit a single 1-shot revision (e.g., testing a specific LoRA weight or prompt adjustment).  
> * **The Blocking Duration:** If the ShotCoordinatorDO utilizes a strict FIFO queue, Artist A's 50-shot batch floods the execution array. Because diffusion rendering is compute-intensive, this batch locks the GPU mutex for upwards of 40 to 60 minutes. Artist B's single interactive test is trapped behind 50 long-running jobs, destroying their creative iteration velocity.

### **2\. State-Aware Tenant Interleaving (getNextFairJob)**

To resolve this, the ShotCoordinatorDO abandons strict chronological execution when extracting the next job from its pending queue array. It implements a per-artist round-robin extraction algorithm:

`// Re-ordering queue to interleave tenants: [A, A, A, B] -> [A, B, A, A]`  
`private getNextFairJob(): ExecutionJob | undefined {`  
  `if (this.queue.length === 0) return undefined;`

  `const lastArtistId = this.activeJob?.artistId;`  
  `const alternateIndex = this.queue.findIndex(j => j.artistId !== lastArtistId);`

  `if (alternateIndex !== -1) {`  
    `return this.queue.splice(alternateIndex, 1)[0];`  
  `}`  
  `return this.queue.shift();`  
`}`

### **3\. Step-by-Step Array Mechanics**

When the active hardware lock on the remote GPU is released (e.g., a job completes or a watchdog timer trips), the DO calls getNextFairJob() to determine the next dispatch:

> 1. **Evaluate Active Tenant:** The algorithm inspects the artistId of the activeJob that most recently occupied the GPU lock (stored in lastArtistId).  
> 2. **Scan for Alternation (findIndex):** Instead of immediately pulling the job at index 0, it scans the pending this.queue array using a findIndex operation to locate the first pending job belonging to a *different* artistId than the one that just executed (j.artistId \!== lastArtistId).  
> 3. **Extraction via Splice:** If the queue is saturated chronologically by Artist A (\[A, A, A, B\]), the findIndex locates Artist B's job deeper in the array. The algorithm executes an array extraction (this.queue.splice(alternateIndex, 1)\[0\]).  
> 4. **The Resulting Remap:** This operation dynamically pulls the minority tenant to the front of the line, functionally reordering the execution sequence to \[A, B, A, A\]. Artist B's interactive revision is processed immediately, bypassing Artist A's remaining batch jobs.

### **4\. Graceful Fallback to Sequential Throughput**

If the findIndex scan returns \-1, it means every pending job in the queue belongs to the identical artistId (e.g., only Artist A is currently working).

> * In this scenario, the algorithm gracefully falls back to a standard array shift (this.queue.shift()).  
> * The single artist's batch is processed sequentially at maximum throughput without any artificial delays, continuing until another artist introduces a conflicting task into the queue.

---

*User prompt: {{FOCUS 2\. Eliminating the "Two-Queue" Failure Mode }} /extreme-details*

Response: Eliminating the "Two-Queue" failure mode is a cornerstone of the distributed hardware architecture. In an early design iteration, the edge Durable Object (DO) held an exclusive lease over the local GPU, effectively treating the cloud edge as the active hardware commander. This created a critical architectural flaw: if the Cloudflare Tunnel dropped or network packets were delayed, the edge might time out and reassign a job while the local GPU was still actively rendering it.

This section breaks down how the architecture completely eliminates this dangerous concurrency collision.

### **1\. The Danger of the Two-Queue Collision**

When a distributed system maintains two independent notions of queue ownership—one managed remotely by the edge control plane and one managed locally by the physical rendering node—it invites catastrophic hardware failures:

> * **The Split-Claimant Hazard:** If a network blip causes the edge DO's watchdog timer to trip prematurely, the DO assumes the remote worker is dead and re-queues or reassigns the active task to a new epoch or worker.  
> * **Simultaneous VRAM Allocation:** Meanwhile, the local GPU worker (unaware that its lease was revoked upstream because its local hardware lock is still engaged) continues processing the original diffusion pass.  
> * **The CUDA OOM Crash:** When the edge attempts to dispatch the new job or when competing memory pointers hit the graphics card, the system encounters two simultaneous claimants on one GPU VRAM allocation, instantly triggering a fatal **CUDA Out-of-Memory (OOM)** crash.

### **2\. The Architectural Solution: Inverting the Mutex**

To prevent this failure mode by structural construction rather than fragile timing sequences, the relationship between the edge and the local hardware is permanently inverted:

> * **Permanent Local Sovereignty (flock):** The local execution daemon (media-broker on Rig 2\) permanently holds an unconditional, OS-level file lock (flock) directly on the local GPU hardware interface.  
> * **The DO as a Passive Request Queue:** The edge Durable Object (ShotCoordinatorDO) possesses zero authority to command, lock, or seize the hardware. It is strictly relegated to a passive, single-threaded FIFO request queue.  
> * **Pull-Only Execution:** The local media-broker polls or pulls work from the edge DO *only* when its own local hardware lock is completely free and available.

The chain of command is strictly unilateral:

Remote DO⟶Logical Request Queue⟶Local media-broker⟶OS flock⟶GPU

### **3\. Collapsing the "Fallback Mode" into Normal Operation**

A major advantage of this inversion is that it eliminates code-path divergence.

> * In poorly designed architectures, "offline fallback modes" are implemented as entirely separate code paths that inevitably rot, drift, or fail when actually needed.  
> * By making the local lock permanent and unconditional, **the fallback path is the normal path**.  
> * When the internet tunnel is healthy, media-broker pulls requests from the edge DO. If the Cloudflare tunnel drops or edge connectivity is lost, the broker seamlessly falls back to reading render manifests from a local disk queue (/var/spool/renders) using the exact same execution code path.

Because the local hardware lock is always the ultimate arbiter, the two-queue collision problem is mathematically impossible: there is only ever one lock, and it lives locally on the workstation.

---

*User prompt: {{FOCUS 2\. Graceful Fallback and Velocity Guarantees }} /extreme-details*

### **Response: 1\. Velocity Guarantees: Sequential Fallback and Cloud Bursting**

The pipeline structurally enforces creative momentum by ensuring that queue-management algorithms and physical hardware limits never bottleneck studio velocity.

> * **Algorithmic Sequential Fallback:** The dynamic queue re-ordering algorithm (getNextFairJob()) protects interactive tasks by extracting minority tenant jobs from deep in the queue. However, if the queue array scan (findIndex) returns \-1—indicating that only a single artist is currently submitting jobs—the system guarantees zero artificial delay. It gracefully falls back to a standard this.queue.shift(), sequentially processing the single user's batch at maximum hardware throughput until another tenant enters the system.  
> * **Frictionless Elastic Bursting:** If the local hardware foundry (Rig 2\) becomes severely bottlenecked by concurrent multi-artist batches, the edge broker can automatically burst overflow rendering jobs out to elastic, ephemeral cloud pools (e.g., RunPod Serverless RTX 4090s). Because the media-broker architecture abstracts the hardware via a RenderProvider interface, this cloud scaling requires zero code or workflow changes on the artists' local laptops.

### **2\. Network Degradation: The Unconditional Local flock**

To uphold the studio's "Deletion Principle," local production must survive complete cloud provider or internet tunnel outages. The system guarantees velocity during network partitions by inverting standard distributed locking logic.

> * **Permanent OS-Level Lock:** The local rendering daemon on Rig 2 (media-broker) permanently holds an unconditional OS-level file lock (flock) on the GPU hardware interface. The edge Durable Object serves only as a passive FIFO queue with zero authority to command the hardware.  
> * **Zero Code-Path Divergence:** If the internet connection fails, media-broker automatically stops polling the edge and falls back to reading render manifests from a local disk queue located at /var/spool/renders. Production proceeds uninterrupted using local frame allocations, completely bypassing the network without requiring a fragile, alternative software execution path.

### **3\. Hardware Degradation: SIMULATION\_ONLY Mode**

If Rig 2 experiences a catastrophic physical failure (e.g., power outage, GPU crash) and drops completely offline, the system prevents the entire studio from halting by decoupling narrative truth from visual generation.

> * **Edge Hardware Detection:** When a job arrives at the edge gateway, the router evaluates connected listeners. If brokerSockets.length \=== 0 (meaning the GPU foundry is disconnected), the gateway checks the incoming payload for allowSimulationFallback.  
> * **Media-Free State Transitions:** Instead of rejecting the action, the edge gateway executes the narrative state mutations directly against the Cloudflare D1 relational database (e.g., updating character inventory, advancing conditions) and returns a COMMITTED\_WITHOUT\_MEDIA status to the writer.  
> * **Batch Catch-Up:** The unrendered scene ASTs are placed in a persistent backlog queue. This guarantees that writers can continue drafting episodes seamlessly at a cost of fractions of a cent; when Rig 2 eventually powers back on, it pulls from the backlog and batch-processes the missing visual plates to catch up to the active canon.

---

*User prompt: {{FOCUS: 1\. Ingress Gatekeeping & Dirty-State Invalidation (Cloudflare D1) (Edge-Director)}} /extreme-details*

Response: The **edge-director ingress boundary** (EdgeGateway in src/index.ts via Hono) acts as the zero-trust perimeter and epistemological gatekeeper of the generative production pipeline. Before any execution payload enters the physical GPU queue or touches the ShotCoordinatorDO actor, the edge gateway intercepts the request to evaluate authentication, syntactic validity, and relational narrative state.

### **Cryptographic Handshake & Schema Gatekeeping**

> * **Zero-Trust Token Verification:** The stateless worker validates machine service tokens and remote artist credentials using RS256-signed JSON Web Tokens (JWTs) or Cloudflare Access headers in under 5 milliseconds.  
> * **Two-Pass Zod Compilation:** Inbound execution payloads must adhere strictly to the SpokeExecutionPayloadSchema. The gateway executes rough semantic assertions on scalar types and bounds while rejecting arbitrary file paths, path traversal sequences (../), or malformed graph nodes before queue insertion.

### **Relational Continuity & The D1 Pre-Flight Check**

> * **The Deterministic Truth Query:** Rather than deploying non-deterministic LLMs to detect continuity drift, the edge worker executes a sub-millisecond relational query against Cloudflare D1 (CANON\_DB):  
>   `SELECT COUNT(*) AS dirty_count`  
>   `FROM scene_fact_dependencies`  
>   `WHERE scene_id = ? AND is_dirty = 1;`

> * **Sub-5ms Execution Denial:** If dirty\_count \> 0, upstream narrative facts (such as character injuries or inventory deltas) mutated without re-compiling the scene's Abstract Syntax Tree (AST). The gateway aborts dispatch with an immediate HTTP 412 Precondition Failed error (DIRTY\_SCENE\_REJECTED), spending \$0.00 of cloud GPU compute on obsolete story states.

### **Dirty-State Propagation & Dependency Hashing**

> * **Monotonic Version Cascades:** Facts maintain an incrementing integer version in D1. When a fact is modified, an automated SQL trigger identifies downstream scenes where pinned\_version \< latest\_version, flipping is\_dirty \= 1 and recording an invalidation reason.  
> * **1-Hop Dependency Hashing (*H*dep​):** To prevent unrelated edits from locking active writers out of draft sessions, the edge computes discrete 1-hop dependency hashes combining the target entity hash with its direct foreign keys. Authoritative multi-hop transitive closures are deferred to local compilation.

### **Transport Idempotency & Command Defense**

> * **Edge-Level Transport Deduplication:** Inbound webhook deliveries and dispatch tickets are evaluated against the D1 idempotency\_keys table using atomic INSERT ... ON CONFLICT DO NOTHING statements. If zero rows are inserted, duplicate network transmissions are discarded before task instantiation.  
> * **Zero Command Ingestion:** The gateway strictly enforces an "intents-only" model. Any client payload attempting to declare canonical state changes directly (such as ACTOR\_MOVED) is rejected at the boundary with HTTP 403 Forbidden.

Would you like to examine the exact D1 SQL schema migrations for scene\_fact\_dependencies next, or proceed to the Hono route implementation in src/index.ts?

---

*User prompt: {{FOCUS: 3\. WebSocket Hibernation Multiplexing & Reconnection Protocols (Edge-Director) }} /extreme-details*

Response: The **edge-director WebSocket Hibernation Multiplexing & Reconnection Engine** serves as the persistent, bidirectional communications backbone between remote client cockpits (**Rig 1 / The Conductor**) and the local GPU hardware spoke (**Rig 2 / media-broker**). By leveraging Cloudflare's WebSocket Hibernation API within a stateful Actor Model (ShotCoordinatorDO), the edge gateway decouples long-lived TCP sockets from active memory consumption, operating at near-zero idle compute costs while preserving deterministic state across network drops.

### **1\. Ingress Upgrade Handshake & Isolate Eviction**

Standard serverless functions cannot hold WebSockets open across long generative passes without incurring massive execution duration fees or hitting hard wall-clock timeouts. The system resolves this through a strict separation between stateless routing and stateful persistence:

> * **Stateless Handshake Delegation:** Inbound connections hit the Hono router (EdgeGateway in src/index.ts). The worker intercepts the initial HTTP GET upgrade request, validates signed JWTs, Clerk credentials, or Cloudflare Access service tokens in sub-5 milliseconds, and extracts the client role (?role=artist or ?role=broker).  
> * **Durable Object Handoff:** The stateless worker routes the upgraded connection to the singleton actor via its deterministic namespace ID (env.SHOT\_COORDINATOR.idFromName("global-render-queue")). Once stub.fetch(request) hands off the socket, the stateless worker isolate terminates immediately.  
> * **The Hibernation Freeze (ctx.acceptWebSocket):** The ShotCoordinatorDO accepts the connection using this.ctx.acceptWebSocket(server, \[role\]).  
> * **\$0.00 Idle Compute Burn:** Once accepted, Cloudflare's global Anycast proxy holds the bare TCP keep-alive at the network perimeter, while the V8 JavaScript isolate of the Durable Object is serialized and completely evicted from edge server RAM. While Rig 2 spends 60–90 seconds sampling diffusion latents in ComfyUI, the edge coordinator accrues zero duration compute charges.  
> * **Sub-2ms Telemetry Waking:** When bytes arrive on any attached socket, Cloudflare’s runtime detects the frame, wakes the isolate in under 2 milliseconds, and fires the webSocketMessage() handler to route packets before evicting the isolate back to sleep.

`Artist Client (Rig 1)          Cloudflare Anycast Edge                ShotCoordinatorDO`  
      `│                                  │                                   │`  
      `├────── WebSocket Upgrade ────────►│                                   │`  
      `│                                  ├────── Instantiates DO ───────────►│`  
      `│                                  │                                   ├─ ctx.acceptWebSocket(ws)[cite: 1]`  
      `│                                  │                                   │`  
      `│                                  │◄───── Isolate Evicted From RAM ───┤ ($0.00/sec compute)[cite: 1]`  
      `│                                  │   (TCP Socket Kept Open at Edge)  │`  
      `│                                  │                                   │`  
      `│   ... 45–90s Diffusion Pass ...  │                                   │[cite: 1]`  
      `│                                  │                                   │`  
      `│                                  │◄───── Broker Telemetry Arrives ───┤[cite: 1]`  
      `│                                  ├────── Wakes Isolate in <2ms ─────►│[cite: 1]`  
      `│◄───── Progress: 48% ─────────────┤                                   ├─ webSocketMessage() runs[cite: 1]`  
      `│                                  │◄───── Isolate Evicted Again ──────┤ ($0.00/sec compute)[cite: 1]`

### **2\. Duplex Multiplexing & Inside-Out Tunnel Topology**

To prevent security vulnerabilities, physical rendering hardware is never exposed directly to the public web. All network traffic flows through an inside-out multiplexing topology:

> * **Outbound cloudflared Socket Ingress:** The media-broker daemon on Rig 2 initiates an outbound connection upward to the edge DO over a Cloudflare Tunnel (EDGE\_DO\_WS\_URL=wss://.../ws?role=broker). Rig 2 leaves zero ports open to the public internet; port 8188 (ComfyUI) and port 3000 (loopback daemon) remain strictly behind local firewalls.  
> * **Tagged Socket Partitioning:** The DO partitions sockets into two distinct groups using Cloudflare’s attachment and tagging system: "artist" for client viewports and "broker" for GPU execution nodes.  
> * **Telemetry Normalization & Broadcasting:** media-broker taps the local ComfyUI WebSocket (ws://127.0.0.1:8188/ws). It captures raw step counts and node transitions (execution\_start, progress, executing), translates them into normalized BROKER\_PROGRESS packets, and pushes them up the tunnel. The DO receives the payload and broadcasts it strictly across the pool of connected "artist" sockets (this.ctx.getWebSockets("artist")), completely isolating the client from hardware-specific implementation details.

### **3\. Application-Layer Heartbeats & The Coma State**

Standard TCP keep-alives are too slow to detect severed mobile links, and web browsers do not expose low-level WebSocket protocol ping frames to client JavaScript. The edge-director enforces its own heartbeat protocol at the application layer:

> * **The 2-Second Pulse (system.ping):** The edge DO emits a periodic system.ping packet every 2 seconds containing an authoritative serverTime timestamp. The client acknowledges with system.pong.  
> * **The Coma State:** The client SDK tracks the duration since the last received packet (lastMessageAt). If three consecutive pings are missed (6 seconds of silence) or the staleness window exceeds 20 seconds, the client enters the **Coma State**. The Remotion viewport freezes, interactive controls are greyed out, and an offline overlay displays "Reconnecting..." rather than leaving the user in an unverified state.  
> * **Explicit Application Close Codes:** The edge DO avoids ambiguous network closures by terminating sessions using reserved custom status codes in the 4000–4999 range:  
  * 4001: Session Takeover / Lease Expired (issued when an existing socket is superseded or authentication expires).  
  * 4002: Killed by Admin (manual pipeline abort or operator override).  
  * 4003: Idempotency Collision (duplicate dispatch attempt with a matching payload fingerprint).  
> * **Deterministic Jitter & Reconnect Throttling:** If a regional point-of-presence blips, thousands of artist instances might reconnect simultaneously. The client SDK suppresses thundering-herd reconnect storms by executing an exponential backoff equation augmented with randomized jitter between 100 ms and 5,000 ms:  
>   Δ*t*retry​\=min(*t*base​×2attempt,*t*max​)\+random(100 ms,5000 ms)

### **4\. Monotonic Sequence Auditing & Reconnection Replay**

Because WebSocket hibernation evicts the JavaScript isolate from RAM, in-memory object properties reset upon eviction. All persistent session state must be anchored to transactional NVMe storage (ctx.storage).

> * **Monotonic seq Stamping:** Every message broadcast by the DO is stamped with a strictly increasing integer sequence number (*seqi*​\<*seqj*​). The client tracks the highest received sequence ID. If a frame arrives out of order or with a numerical gap (e.g., jumping from seq: 14 to seq: 18), the client dispatches a system.resyncRequest to pull missing delta frames.  
> * **The Resync Handshake:** When an artist reopens their laptop lid, the client issues a system.resyncRequest containing its artistId and last\_seen\_action\_id.  
> * **The Delta Snapshot:** The DO wakes up, blocks inbound concurrency (this.ctx.blockConcurrencyWhile), and reads its transactional ledger from ctx.storage. If the GPU finished rendering the plate while the artist was offline, the DO skips raw progress increments and immediately delivers the final SHOT\_READY completion payload containing the signed Cloudflare R2 asset URL.  
> * **Sub-Frame Optical Timeline Phase Alignment:** To guarantee that all artists viewing a live render stream see the exact same visual frame, the client continuously computes edge clock drift via system.ping:  
>   clockOffsetMs=serverTime−Date.now()  
>   elapsedMs=(Date.now()+clockOffsetMs)−msg.currentScene.sceneStartTime  
>   videoElement.currentTime=max(0,1000elapsedMs​)  
>   The local Remotion player snaps its playhead directly to this calculated time, locking optical playback to the edge's master clock without manual operator scrubbing.

### **5\. Session Takeover & Zombie Decapitation**

When traveling artists switch from office Wi-Fi to mobile tethering, orphaned network sockets can linger at the edge before TCP timeouts officially register. The ShotCoordinatorDO resolves conflicting sessions through an authoritative succession protocol:

> * **The Last-One-Wins Hijack:** The DO tracks active sockets by artistId. When a new incoming WebSocket handshake arrives for an existing session (e.g., Tab 2 opening or a network interface swap), the DO does not spawn a second listener or fail the request.  
> * **Decapitation:** The DO intercepts the active, older socket (Tab 1), immediately issues a Session Replaced payload followed by custom close frame 4001, and terminates the connection.  
> * **Succession Handover:** The new socket is granted the active reference, bound to the hibernation handler, and served the cached state snapshot. This eliminates split-brain client UI states where two browser tabs attempt to dispatch competing pipeline instructions.  
> * **Attachment Serialization Discipline:** When saving state across hibernation via server.serializeAttachment(), metadata is kept under Cloudflare's strict 128 KB serialization ceiling. The coordinator stores only bare identity pointers ({ artistId, sessionId, currentEpoch }), deliberately avoiding heavy scene ASTs or binary assets in the socket attachment to ensure rapid deserialization upon wake.

---

*User prompt: {{FOCUS: 4\. Distributed Leases, Monotonic Epochs, and Watchdog Circuit Breakers (Edge-Director) }} /extreme-details*

### **Response: 1\. The Split-Brain Zombie Runner Hazard**

Coordinating long-running generative workloads across distributed edge networks and remote GPU hardware presents the **Split-Brain Zombie Runner Problem**.

`[ edge-director (ShotCoordinatorDO) ]                             [ media-broker (Rig 2) ]`  
        `│                                                                     │`  
        `├──────────── Lease Granted (Epoch: 1) ──────────────────────────────►│ (Starts Render)[cite: 1, 3]`  
        `│                                                                     │`  
        `│   x--- Network Partition (Tunnel Drops Packets for 35s) ---x        │[cite: 1, 3]`  
        `│                                                                     │`  
        `├─ 30s Hardware Alarm Trips                                           │ (Still rendering...)[cite: 1, 3]`  
        `├─ Revokes Lease Epoch 1                                              │[cite: 1, 3]`  
        `├─ Re-queues Job to Rig 2B (Epoch: 2)                                 │[cite: 1, 3]`  
        `│                                                                     │`  
        `│◄─────────── Zombie Uploads Plate (Carrying Epoch 1) ────────────────┤ (Finishes Render)[cite: 1, 3]`  
        `│                                                                     │`  
        `└─── REJECTED VIA FENCING TOKEN ───► [ Drop Write / HTTP 409 ]        │[cite: 1, 3]`

When Rig 2 (media-broker driving ComfyUI on 127.0.0.1:8188) executes a heavy video diffusion pass (such as a 120-frame Wan 2.2 generation), network partitions can sever the outbound Cloudflare tunnel.

> * If the edge queue times out and reallocates the task to an alternate worker or increments the task lease, the original partitioned runner continues executing in physical memory unaware of its revocation.  
> * When network connectivity recovers, the original runner (now an asynchronous "zombie") completes its plate and attempts to push output frames to storage.  
> * Without strict concurrency controls, the zombie runner will silently overwrite canonical frames generated by the replacement worker, desynchronizing the episode timeline and causing severe artifact drift.  
> * At the hardware boundary, competing attempts to claim local execution without authoritative epoch validation lead to concurrent allocations, immediately triggering fatal CUDA Out-Of-Memory (OOM) exceptions.

### **2\. Temporal Authority & Heartbeat-Renewed Dynamic Leases**

The pipeline strictly bans static lease timeouts (such as an arbitrary 180-second TTL). Fixed timeouts create a dual failure mode: short windows kill legitimate, complex generative diffusion tasks mid-render, while long windows leave hardware locks stranded when a worker crashes.

The ShotCoordinatorDO serves as the single, absolute arbiter of time. Wall-clock timestamps from clients or workers are treated as unverified informational metadata and discarded during concurrency evaluations:

`[ Durable Object: Sole Time Authority ]`  
        `│`  
        `├─ Grants Lease: valid for 30 seconds (Epoch: N)[cite: 6, 12]`  
        `│`  
        `▼`  
`[ media-broker / Local Foundry ]`  
  `• Heartbeat Timer runs in background (every 10s)[cite: 6, 12]`  
  `• Sends HTTP POST /heartbeat { lease_id, epoch: N }[cite: 6, 12]`  
        `│`  
   `┌────┴──────────────────────────────────────────┐`  
   `▼ Heartbeat Received                            ▼ Network Partition / Worker Hang[cite: 6, 12]`  
`[ Extend lease by +30s ]                     [ 3 missed heartbeats (30s) ][cite: 6, 12]`  
`(Max Cap: 15 minutes)[cite: 6, 12]          Watchdog storage alarm fires[cite: 1, 6, 12]`  
                                                   `│`  
                                                   `▼`  
                                             `[ REVOKE LEASE (Epoch: N) ][cite: 6, 12]`  
                                             `Increment Epoch: N + 1[cite: 6, 12]`

> * **The 30-Second Rolling Lease:** When a worker claims a task, the ShotCoordinatorDO issues an exclusive execution lease valid for exactly 30 seconds.  
> * **The 10-Second Heartbeat Pulse:** The worker must send an HTTP POST /heartbeat or a WebSocket BROKER\_HEARTBEAT pulse every 10 seconds.  
> * **Dynamic Lease Extension:** Every valid heartbeat evaluated by ShotCoordinatorDO pushes the lease expiration boundary outward by \+30 seconds. As long as the compute worker reports hardware health, the task executes indefinitely without arbitrary interruptions.  
> * **Thread-Isolated Heartbeat Loop:** On Rig 2, media-broker isolates its heartbeat timer within an independent background thread or dedicated Web Worker, decoupled from the main Node.js event loop and PyTorch execution processes. Blocking operations—such as computing SHA-256 digests over multi-gigabyte video plates, synchronous I/O, or parsing large AST trees—cannot starve the timer or trigger false-positive lease expirations.  
> * **Absolute Execution Cap:** To catch infinite sampling loops or hung CUDA subroutines that continue pulsing heartbeats, the DO enforces an absolute ceiling of 15 minutes (900,000 ms). When reached, an ABSOLUTE\_TIMEOUT triggers an immediate forced revocation.  
> * **Worker-Initiated Push Semantics:** The architecture enforces worker-driven heartbeats rather than edge polling. Polling cannot reliably detect frozen workers between intervals and fails within stateless edge boundaries. Heartbeat responses return either CONTINUE or HALT, allowing master kill switches and budget freezes to terminate physical runners within 10 seconds.

### **3\. Proactive Edge Watchdogs (ctx.storage.setAlarm())**

Relying on incoming client requests to detect worker drops is an anti-pattern that leaves state machines stalled. The ShotCoordinatorDO utilizes Cloudflare’s hardware storage alarm API to enforce deterministic dead-man switches:

> * **Proactive Scheduling:** Immediately upon issuing or renewing a lease, the DO arms a hardware alarm scheduled 30 seconds into the future using this.ctx.storage.setAlarm(Date.now() \+ 30000).  
> * **Continuous Rescheduling:** Each valid heartbeat received before the timer elapses advances the alarm deadline (Date.now() \+ 30000).  
> * **Autonomous Execution:** If Rig 2 loses power, crashes, or drops network packets for 30 seconds (missing 3 consecutive 10-second pulses), the Cloudflare hypervisor autonomously wakes the ShotCoordinatorDO isolate.  
> * **The alarm() Handler:** The alarm handler executes a single-turn transactional check inside ctx.storage:  
  1. Inspects the active task status; if RUNNING or PROCESSING, it marks the lease as EXPIRED.  
  2. Bumps the monotonic epoch counter (*N*→*N*\+1), fencing out the current runner.  
  3. Increments the task's attempt counter and determines whether to requeue the plate or trip the circuit breaker.

### **4\. Monotonic Epoch Fencing Tokens**

To prevent late writes from partitioned workers, the ShotCoordinatorDO generates monotonically increasing epoch numbers that serve as cryptographic fencing tokens:

> * **Monotonic Incrementation:** Every time a lease is claimed, renewed, timed out, or revoked, the DO increments an integer counter (*N*→*N*\+1) stored transactionally in ctx.storage.  
> * **Token Issuance:** The worker receives this epoch value as its authoritative fencing\_token in the dispatch payload.  
> * **Trace Binding:** The epoch integer is bound to API headers, execution receipts, and staging file keys.  
> * **Atomic Invalidation:** When a worker submits its final completion RPC (POST /tasks/complete or BROKER\_COMPLETE), it must provide its assigned epoch token. The DO evaluates the token against its active storage ledger within a single-threaded execution context. If the active epoch has advanced (*N*payload​\<*N*current​), the DO rejects the call with an HTTP 409 Conflict.

### **5\. Structural Fencing via Content-Addressed Promotion Gate**

Object storage layers (such as Cloudflare R2 and AWS S3) do not natively evaluate custom application fencing tokens on standard PUT requests. A zombie worker with direct storage credentials can still write bytes to a bucket.

The edge-director solves this by enforcing fencing at the **promotion boundary** rather than the transport boundary:

`[ Worker (Rig 2) ]                                     [ Cloudflare R2 ]                     [ ShotCoordinatorDO ]`  
        `│                                                      │                                       │`  
        `├────── 1. Uploads Staging Plate ─────────────────────►│                                       │[cite: 2, 3]`  
        `│       staging/.../epoch_1_a8f5b.mp4                  │                                       │[cite: 2, 3]`  
        `│                                                      │                                       │`  
        `├────── 2. RPC: POST /tasks/complete { epoch: 1 } ────────────────────────────────────────────►│[cite: 2, 3]`  
        `│                                                      │                                       ├─ Validates Epoch[cite: 2, 3]`  
        `│                                                      │                                       │  (Current Epoch == 2)[cite: 2, 3]`  
        `│◄───── 3. Rejection: HTTP 409 Conflict ───────────────────────────────────────────────────────┤[cite: 2, 3]`  
        `│                                                      │                                       │`  
        `│                                                      │◄── 4. 7-Day Lifecycle Rule Purges ────┤[cite: 2, 3]`  
        `│                                                      │      (Never Promoted to Manifest)     │[cite: 2, 3]`

> 1. **Epoch-Scoped Staging Uploads:** The worker uploads its raw render artifacts exclusively to a staging prefix keyed by the task ID, its assigned epoch, and the content's SHA-256 hash:  
>    `staging/renders/${taskId}/epoch_${epoch}_${sha256}.mp4`

Because the key is content-addressed and epoch-scoped, a zombie worker writing to storage cannot overwrite existing objects or collisions from newer epochs. 2\. **The RPC Completion Gate:** Once the upload succeeds, the worker dispatches a completion sentinel (POST /tasks/complete) to the ShotCoordinatorDO carrying the staging key, the epoch token, and the SHA-256 digest. 3\. **Transactional Epoch Validation:** The DO inspects the incoming epoch within an atomic storage block. If the worker timed out and the DO advanced to epoch *N*\+1, the promotion is rejected with HTTP 409 Conflict. 4\. **Manifest Promotion:** Only if the epoch matches the current active lease does the DO promote the staging reference into the canonical episode manifest in ctx.storage and update the read-only projection in Cloudflare D1. 5\. **Idempotent RPC Safety:** The completion RPC is strictly idempotent. If the DO crashes after committing promotion, a retried completion RPC with the identical epoch returns success immediately without re-executing writes or corrupting manifests. 6\. **Automated Lifecycle Eviction:** Unpromoted staging objects written by stale zombie workers remain unindexed. They are automatically purged from R2 by a 7-day bucket lifecycle retention rule.

### **6\. Failure Taxonomy & Dead-Letter Queue (DLQ) Circuit Breakers**

A major distributed systems flaw is routing every expired lease directly to a failure state or retrying every job indefinitely. The edge-director differentiates between infrastructure hiccups and broken render inputs using an intelligent triage state machine:

Worker Death (Infrastructure Transient)=Poison Job (Deterministic Failure)  
                     `[ LEASE EXPIRATION DETECTED ]`  
                                   `│`  
                                   `▼`  
             `Fetch Job Record from Storage: execution_leases[cite: 8, 12]`  
                                   `│`  
                   `Has attempt_count < max_attempts (2)?[cite: 1, 4]`  
                   `┌───────────────┴───────────────┐`  
                   `▼ YES                           ▼ NO[cite: 8, 12]`  
      `[ WORKER CRASH (TRANSIENT) ]        [ POISONED JOB (DETERMINISTIC) ][cite: 8, 12]`  
      `• Increment attempt_count           • Transition status = 'DLQ'[cite: 8, 12]`  
      `• Increment Epoch (N -> N+1)        • Freeze lease; quarantine task[cite: 8, 12]`  
      `• Re-queue with fresh lease         • Format Error Trajectory Vector[cite: 8, 12]`  
      `• Healthy worker claims job         • Dispatch Alert to Astro Cockpit[cite: 1, 4]`

#### **Transient Infrastructure Faults (Worker Death)**

> * **Root Causes:** Network tunnel partitions, host OS out-of-memory kills, hypervisor spot evictions, or sudden power loss.  
> * **System Action:** If attempt\_count \< max\_attempts (default: 2), the system treats the fault as transient. The DO increments attempt\_count, revokes the dead lease, advances the epoch to fence the crashed node, and places the task back into the pending execution queue. A healthy worker claims the job with a fresh lease and new epoch.

#### **Deterministic Poison Tasks**

> * **Root Causes:** Malformed prompts, unsupported latent dimensions, or corrupt LoRA weights that reliably trigger PyTorch assertion errors or CUDA OOM faults on any GPU.  
> * **System Action:** If a job fails or starves heartbeats past max\_attempts (exceeding attempt 2), the circuit breaker trips. The task transitions to DLQ and is committed under dlq:\${jobId}.  
> * **Quarantine & Safety Freeze:** The DO freezes the task to stop automated retry loops from burning compute budgets or trapping the GPU in continuous crash cycles.  
> * **The Diagnostic Dossier:** The DO compiles an operational failure packet and surfaces it to the Astro Cockpit for human review:  
  * Task ID, scene ID, and target AST parameters.  
  * Last received heartbeat timestamp, host IP, and container runtime metrics.  
  * The structured Error Trajectory Vector (*E*): ⟨Domain,TargetEntity,RuleID,OffendingTokens⟩ detailing the failure cause.  
  * Direct action options: manual retry with adjusted frame bounds, parameter override, or permanent job deletion.

### **7\. End-to-End Operational Lifecycle Trace**

The following end-to-end lifecycle trace illustrates the complete interaction across the tripartite architecture during a lease lifecycle with a network split and zombie rejection:

| Step | Component | Action / State Delta | Network Hop & Protocol |
| :---- | :---- | :---- | :---- |
| **01** | Rig 1 (Conductor) | Compiles AST, locks 24fps frames via ffprobe, generates UUIDv7 idempotency\_key, submits dispatch payload. | POST /dispatch (Signed JWT) → EdgeGateway |
| **02** | EdgeGateway | Validates JWT, asserts Zod schema, checks D1 continuity (is\_dirty \== 0), routes to DO. | Internal RPC → ShotCoordinatorDO |
| **03** | ShotCoordinatorDO | Enqueues job, checks single-threaded hardware mutex; pulls task when mutex opens. | Internal single-threaded isolate |
| **04** | ShotCoordinatorDO | Increments epoch (0→1), sets watchdog alarm to \+30s, grants execution lease. | WS BROKER\_DISPATCH → Rig 2 (media-broker) |
| **05** | Rig 2 (media-broker) | Verifies local OS flock on GPU, flushes VRAM via /free, injects params into ComfyUI workflow. | Loopback HTTP POST :8188/prompt |
| **06** | Rig 2 (media-broker) | Spawns isolated worker thread; dispatches heartbeat pulse at *T*\=10s and *T*\=20s. | POST /heartbeat { epoch: 1 } → ShotCoordinatorDO |
| **07** | ShotCoordinatorDO | Heartbeats arrive cleanly; resets hardware alarm: ctx.storage.setAlarm(Date.now() \+ 30000). | Internal ctx.storage alarm reset |
| **08** | Cloudflare Tunnel | **Network Partition Occurs at *T*\=25s:** Outbound tunnel drops; heartbeats fail to reach edge. | Packets dropped across WAN |
| **09** | Rig 2 (media-broker) | GPU continues computing diffusion latents; background thread attempts heartbeats in isolation. | Retrying POST /heartbeat locally |
| **10** | ShotCoordinatorDO | **Hardware Alarm Fires at *T*\=50s:** 30s elapsed since last pulse; DO revokes lease. | Autonomous alarm() wake-up |
| **11** | ShotCoordinatorDO | Increments epoch (1→2); increments attempt\_count (1→2); requeues task for execution. | Atomic storage write in ctx.storage |
| **12** | Cloudflare Tunnel | **Network Restored at *T*\=65s:** Physical connection re-establishes; Rig 2 finishes sampling plate. | Outbound tunnel recovers |
| **13** | Rig 2 (media-broker) | Uploads plate to staging: staging/renders/\${taskId}/epoch\_1\_a8f5b.mp4. | HTTPS PUT → Cloudflare R2 |
| **14** | Rig 2 (media-broker) | Dispatches completion RPC carrying stale fencing token (epoch: 1). | POST /tasks/complete { epoch: 1 } → DO |
| **15** | ShotCoordinatorDO | Inspects epoch in atomic block; compares 1\<2; **Rejects write with HTTP 409 Conflict**. | HTTP 409 Conflict → Rig 2 |
| **16** | Cloudflare R2 | Staged plate remains unpromoted in manifest; purged after 7 days by bucket lifecycle rule. | Automated background GC |

---

*User prompt: {{FOCUS: 5\. Lock Management, Local Sovereignty, and Graceful Degradation (Edge-Director) }} /extreme-details*

### **Response: 1\. Inverting the Hardware Mutex (Local flock Sovereignty)**

The architectural foundation of lock management in edge-director is the inversion of hardware authority: the remote cloud edge must never hold an authoritative lock over a local physical workstation.

`CORRECTED INVERTED ARCHITECTURE:`  
`Remote DO ──► Logical Request Queue ──► Local media-broker ──► OS flock ──► GPU Silicon`

> * **The Anti-Pattern (Edge-Controlled Hardware):** Early distributed system designs allowed the edge Durable Object (DO) to dictate hardware possession, dispatching an instruction to Rig 2 that asserted *"you own the GPU now"* over a Wide Area Network (WAN). Under real-world network conditions, this created an immediate distributed failure point: if the outbound Cloudflare tunnel dropped packets, the physical workstation GPU was left in an ambiguous, frozen, or contested state despite being physically powered on and idle.  
> * **The "Two-Queue" Failure Mode:** If the local broker only enforced its hardware lock during an offline fallback routine, a slight network jitter could cause the edge DO's watchdog timer to trip and revoke a lease mid-render. The DO would reassign the shot to a new epoch (Worker B), while Rig 2's local rendering process was still running the original job. When network connectivity restored or competing pointers reached the graphics card, two simultaneous claimants attempted to allocate VRAM on a single consumer GPU, instantly triggering a fatal CUDA Out-of-Memory (OOM) crash.  
> * **Permanent Local flock Ownership:** To eliminate this collision by physical construction rather than fragile timing sequences, the local rendering daemon (media-broker on Rig 2\) permanently holds an unconditional, OS-level file lock (flock) directly on the GPU hardware interface.  
> * **The DO as a Passive Request Queue:** The edge ShotCoordinatorDO possesses zero authority to command, seize, or lock the physical silicon. It is strictly relegated to a passive, logical First-In, First-Out (FIFO) request queue.  
> * **The Pull-Only Execution Loop:** Rig 2 operates exclusively via pull semantics. The local media-broker polls or claims work from the edge DO *only* when its own local flock is released and available. The physical silicon dictates when it is ready to consume workloads, preventing the cloud from pushing jobs blindly onto local memory.

### **2\. Offline Local Fallback & Zero Code-Path Divergence**

To uphold the studio's Deletion Principle—guaranteeing that media production survives cloud provider outages or severed internet connections—the edge-director cannot be an indispensable production dependency.

> * **The Local Disk Spool (/var/spool/renders):** If the outbound Cloudflare tunnel severs or the edge DO becomes completely unreachable, the local media-broker daemon automatically halts remote polling and reads render requests directly from a local disk queue located at /var/spool/renders.  
> * **Zero Code-Path Divergence:** Production does not shift to a secondary "fallback mode". Separate fallback code paths inevitably rot, drift, and fail from disuse. Instead, media-broker executes the exact same rendering logic, VRAM flushing cycles (/free), parameter injections, and ComfyUI API templates (127.0.0.1:8188). The only difference is the source of the render manifest: a local file descriptor rather than a remote WebSocket feed.  
> * **Local Archive Integrity:** Offline generation proceeds uninterrupted using local frame allocations and audio clocks. Rendered video plates are hashed, written to the local content-addressed archive, and referenced in the local manifest. The edge DO represents a coordination optimization for multi-user studios, not a hard production requirement.

### **3\. Graceful Simulation Degradation (SIMULATION\_ONLY Mode)**

While the local disk spool manages network and cloud outages, the architecture must also account for catastrophic physical hardware failures on the workstation (e.g., Rig 2 suffers a power outage, motherboard crash, or damaged PSU). The system decouples narrative truth from pixel rasterization via SIMULATION\_ONLY mode.

> * **Edge Hardware Absence Detection:** When a scene execution payload hits the edge gateway, the router inspects connected listeners. If brokerSockets.length \=== 0 (indicating the physical GPU foundry is offline), the gateway checks whether the incoming payload has enabled allowSimulationFallback.  
> * **Media-Free State Transitions:** Rather than throwing an exception or blocking the writers' room, the edge gateway executes the scene's state transitions directly against Cloudflare D1 (CANON\_DB). It updates character somatic conditions, deducts consumable inventory, records social grievance debts, and returns a COMMITTED\_WITHOUT\_MEDIA receipt to the client.  
> * **The Persistent Backlog Queue:** The unrendered scene Abstract Syntax Trees (ASTs), conformed 24fps frame budgets, and deterministic seeds are placed into an append-only backlog queue inside D1. Creative personnel continue authoring subsequent episodes without waiting for hardware repairs.  
> * **Automated Batch Catch-Up:** When Rig 2 regains power and its media-broker daemon reconnects via its outbound tunnel, it senses its free local flock and begins pulling from the D1 backlog queue. It batch-renders the missing visual plates in the background until the media archive is aligned with the active canonical ledger.

### **4\. Multi-Entity Concurrency & Deadlock Elimination**

When multiple remote contributors or concurrent scenes attempt to mutate shared narrative reality across the edge, unconstrained distributed locking causes system gridlock.

> * **The Dining-Philosophers Hazard:** If Scene 1 mutates char\_pilot and subsequently claims loc\_culvert, while Scene 2 mutates loc\_culvert and subsequently claims char\_pilot, naive sequential lease acquisition triggers a circular-wait deadlock where both transactions freeze indefinitely.  
> * **Global Deterministic Lock Acquisition:** The transaction coordinator eliminates circular waits by enforcing strict lock acquisition ordering. Regardless of the order in which entities appear in the prose or scene AST, the engine extracts all target entity IDs, sorts them alphanumerically, and acquires the leases in that exact sorted sequence.  
> * **Reader-Writer Lock Semantics:** Exclusive write locks are reserved strictly for operations that actively mutate an entity's somatic, logistical, or relational state vectors. Drafting operations that merely reference an entity acquire shared **Read Leases**, eliminating false contention across a 10-person writers' room.

### **5\. Dual-Timer Lease Architecture: Interactive Mutex vs. Draft Retention**

To prevent abandoned browser tabs or severed connections from wedging entity access, the edge Durable Object decouples the short-lived editing lock from durable draft persistence.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   EDGE LEASE DUAL-TIMER ARCHITECTURE                   │`  
`├──────────────────────────────────┬─────────────────────────────────────┤`  
`│ INTERACTIVE EDIT LOCK            │ DRAFT RETENTION BUFFER              │`  
`│ (Short Mutex: 5 Minutes)         │ (Long Storage: 72 Hours)            │`  
`├──────────────────────────────────┼─────────────────────────────────────┤`  
`│ • Renewed via 30s heartbeat pulse│ • Uncommitted text stored safely in │`  
`│ • Hardware storage alarm fires at│   ctx.storage transactional memory. │`  
`│   5 minutes of silence.          │ • Decoupled from active socket state│`  
`│ • Frees entity for other writers │ • Enables side-by-side 3-way merge  │`  
`│   if collaborator walks away.    │   if edited during an outage.       │`  
`└──────────────────────────────────┴─────────────────────────────────────┘`

> * **The Single-Timer Flaw:** Conflating edit locks with draft persistence creates severe operational friction. A 72-hour interactive lock allows an abandoned laptop to block an entire department for days, whereas a 5-minute storage TTL destroys an author's in-progress prose if their Wi-Fi drops.  
> * **The 5-Minute Heartbeat Edit Lock:** When an artist opens an entity in their cockpit, the client dispatches a heartbeat pulse every 30 seconds. If the writer walks away or disconnects, the heartbeat starves. After 5 minutes of silence, a DO hardware storage alarm (ctx.storage.setAlarm()) autonomously fires, revoking the write lease and freeing the entity for other contributors.  
> * **The 72-Hour Draft Retention TTL:** Revoking the lease does not purge the writer's work. Uncommitted draft prose is retained safely in ctx.storage for a 72-hour Time-To-Live (TTL) retention window.  
> * **Reconnection Protocol:** When a writer reconnects after a network drop, the web cockpit inspects the entity state:  
  * *Lock Unclaimed:* The cockpit transparently re-acquires the write lease and brings the writer's local session forward without interruption.  
  * *Lock Claimed and Mutated:* If another contributor claimed the entity and modified it during the outage, the UI blocks a silent overwrite and presents a side-by-side three-way merge screen, allowing the writer to reconcile differences or fork their draft.

### **6\. The Deletion Principle & Edge Decommissioning Governance**

The ultimate architectural boundary between the deterministic local core and the asymmetric edge control plane is governed by the **Deletion Principle** and an explicit retirement trigger.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        THE DELETION PRINCIPLE                          │`  
`├──────────────────────────────────┬─────────────────────────────────────┤`  
`│ 1. THE NARRATIVE LEDGER          │ 2. THE MEDIA ARCHIVE                │`  
`│ (Model-Independent Reality)      │ (Archive-Dependent Artifacts)       │`  
`├──────────────────────────────────┼─────────────────────────────────────┤`  
`│ • Canon entities, facts, state   │ • Latent video plates, keyed alpha  │`  
`│   vectors, and dependency graphs.│   WebMs, and synthesized WAV stems. │`  
`│ • Stored in relational SQLite/D1.│ • Stored in content-addressed R2.   │`  
`│ • Consistent with respect to its │ • Irreplaceable: non-deterministic  │`  
`│   explicitly declared rules.     │   CUDA/sampling cannot reproduce it.│`  
`│ • Survives the total destruction │ • Requires active scrubbing and     │`  
`│   of all machine learning models.│   cold restore validation drills.   │`  
`└──────────────────────────────────┴─────────────────────────────────────┘`

> * **Unidirectional Authority:** The local Git repository never imports, awaits, or depends upon edge state to establish canon. The edge is an untrusted, disposable staging scratchpad; local Git remains the sole legislative sovereign. A total Cloudflare outage does not interrupt local authoring, compiling, linting, testing, or rendering.  
> * **The 60-Day Inactivity Retirement Trigger:** To prevent cloud infrastructure from calcifying through operational inertia, the edge tier is designed to be ephemeral. If active writer sessions record zero activity for 60 consecutive days—measured strictly by authenticated WebSocket heartbeat sessions, not automated background polling crons—decommissioning is triggered.  
> * **The 6-Step Decommissioning Runbook:**  
  1. *Final Drain:* A local CLI command (npm run lore:pull-staging) calls GET /drafts/drain to pull all remaining uncommitted drafts into the local staging/remote-drafts branch.  
  2. *Provenance Export:* Export author audit logs and session attribution records from the edge DO, committing them directly alongside the Git drafts.  
  3. *Canon Sealing:* Showrunner reviews the final diffs, runs the local compiler (scripts/compile.ts), and commits all valid work to main.  
  4. *Credential Revocation:* Rotate and revoke all Cloudflare Worker API tokens, service bindings, and mTLS certificates.  
  5. *Infrastructure Tear-Down:* Spin down Cloudflare Worker routes and Anycast tunnels via Terraform or Wrangler configuration scripts.  
  6. *Historical Commit Record:* Append an explicit DecommissionRecord into the repository commit log and revert studio operations to 100% offline Phase 1 & 2 local execution.  
> * **Reactivation Parity:** Because all edge infrastructure is codified as version-controlled configuration (wrangler.jsonc) and canonical state is fully captured in the local Git ledger, the entire edge tier can be re-provisioned and hydrated in minutes should remote collaborators onboard again in the future.

---

*User prompt: {{FOCUS: 1\. Cryptographic Handshake & Schema Compilation (Edge-Director)) }} /extreme-details*

Response: The **Cryptographic Handshake & Schema Compilation** layer of the edge-director (EdgeGateway in src/index.ts built on Hono) operates as the zero-trust perimeter and syntactic firewall of the generative production pipeline. Before any rendering job can touch the stateful ShotCoordinatorDO actor, trigger a database mutation, or consume GPU VRAM on Rig 2, this boundary authenticates identity, sanitizes untrusted input, resolves parameters against canonical truth, and compiles raw client requests into immutable execution contracts.

### **1\. Zero-Trust Cryptographic Ingress & Identity Federation**

The edge gateway sits on Cloudflare's global Anycast perimeter as an untrusted surface, accepting inbound calls from remote artist cockpits (**Rig 1**), traveling browser clients, and automated dispatch agents.

> * **Sub-5ms JWT & Service Token Verification:** Inbound HTTP POST dispatches and WebSocket upgrade requests pass through a fail-closed authentication middleware. The worker verifies RS256-signed JSON Web Tokens (e.g., Clerk session credentials) or Cloudflare Access Service Tokens (CF-Access-Client-Id and CF-Access-Client-Secret) within the V8 isolate in under 5 milliseconds. Unauthenticated or expired requests are terminated at the boundary with HTTP 401 Unauthorized without waking downstream Durable Objects.  
> * **Zero Edge Git Privilege Isolation:** To uphold zero-trust isolation and eliminate supply-chain injection vectors, the edge-director worker maintains **zero GitHub Personal Access Tokens (PATs) or repository administrative write keys** in its environment bindings. It possesses no capability to modify upstream Git source trees or commit canonical changes directly.  
> * **The "Intents, Never Commands" Boundary:** Clients are strictly untrusted. A client may only submit *Intents* (e.g., a desire to render a designated shot with defined creative bounds), never direct state assertions. Any payload attempting to declare canonical event occurrences directly (such as ACTOR\_MOVED or INVENTORY\_DEDUCTED) is intercepted and rejected with HTTP 403 Forbidden.

### **2\. Discriminated Schema Architecture & Syntactic Sanitization**

The gateway evaluates payloads using strict Zod schemas, treating all external JSON as hostile input.

`// packages/types/src/schemas/dispatch.ts`  
`import { z } from "zod";`

`export const BaseDispatchSchema = z.object({`  
  `idempotency_key: z.string().uuid(),`  
  `task_id: z.string().regex(/^task_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/), // UUIDv7`  
  `contract_version: z.literal("2.1.0"),`  
  `scene_id: z.string().regex(/^ep\d+_sc\d+$/),`  
  `shot_id: z.string().regex(/^sh_\d+_\d+$/),`  
  `payload_fingerprint: z.string().regex(/^[0-9a-f]{64}$/), // Hex SHA-256`  
`});`

`export const WanInpaintPayloadSchema = BaseDispatchSchema.extend({`  
  `template_id: z.literal("WAN21_I2V_SURGICAL_INPAINT"),`  
  `prompt_override: z.string().max(2000).optional(),`  
  `anchor_id: z.string().regex(/^[a-z0-9_]+$/),`  
  `bounding_box: z.object({`  
    `x1: z.number().int().nonnegative(),`  
    `y1: z.number().int().nonnegative(),`  
    `x2: z.number().int().positive(),`  
    `y2: z.number().int().positive(),`  
  `}),`  
  `frame_range: z.object({`  
    `start_frame: z.number().int().nonnegative(),`  
    `end_frame: z.number().int().positive(),`  
  `}),`  
`}).strict(); // Disallows unvetted additionalProperties`

`export const SpokeExecutionPayloadSchema = z.discriminatedUnion("template_id", [`  
  `WanInpaintPayloadSchema,`  
  `// Additional template schemas (e.g., WAN22_T2V_ESTABLISHING, REMOTION_OPTICAL_PASS)`  
`]);`

> * **Closed Discriminated Unions:** The schema discriminates strictly on template\_id. A whole-shot text-to-video request cannot supply extraneous bounding boxes, nor can an inpainting task omit geometric anchors.  
> * **Universal .strict() Enforcement:** Every schema branch executes .strict(), mirroring the JSON Schema rule additionalProperties: false. Inbound JSON containing unrecognized keys is rejected with HTTP 400 Bad Request, preventing parameter pollution attacks and stealth field injections.  
> * **Path Traversal & Injection Trap:** File paths, model tags, and asset identifiers are validated against strict alphanumeric regular expressions. Any occurrence of directory traversal strings (../, ..\\\\), root escapes (/etc/), or command separators (;, &&, |) triggers a terminal validation fault, blocking hostile strings from reaching ComfyUI prompt graphs on Rig 2\.

### **3\. Authoritative Server-Side Parameter Resolution vs. Client Declarations**

A primary distributed systems defect in naive rendering pipelines is allowing client applications to dictate physical realities like frame counts, aspect ratios, or duration budgets. The edge-director treats client-submitted numbers as non-authoritative proposals.

`[ CLIENT REQUEST PAYLOAD ]`  
  `• shot_id: "sh_101_04"`  
  `• template_id: "WAN21_I2V_SURGICAL_INPAINT"`  
  `• idempotency_key: UUID`  
  `• payload_fingerprint: SHA-256`  
                              `│`  
                              `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│               SERVER-SIDE RESOLUTION & VERIFICATION                    │`  
`│                                                                        │`  
`│ • Canonical RFC 8785 JSON stringify -> verify payload_fingerprint      │`  
`│ • Assert shot_id belongs to declared scene_id (reject pairing mismatch)│`  
`│ • Pull audio duration from manifest: duration_ms = 3120ms              │`  
`│ • Pull template config: native_fps = 16, lattice = 4n+1                │`  
`│ • Pull background matte dimensions: canvas_width = 1280, height = 720  │`  
`└─────────────────────────────┬──────────────────────────────────────────┘`  
                              `│`  
                              `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│               DETERMINISTIC PARAMETER COMPILATION                      │`  
`│                                                                        │`  
`│ • raw_native_frames = ceil(3.120 * 16) = 50 frames                     │`  
`│ • total_diffusion_allocation = 4 * ceil((50 - 1) / 4) + 1 = 53 frames  │`  
`│ • Validate half-open frame range: 0 <= start < end <= 53               │`  
`│ • Validate bounding box: 0 <= x1 < x2 <= 1280, 0 <= y1 < y2 <= 720     │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Relational Entity Pairing Assertion:** The gateway queries the relational manifest in D1 to verify that the declared shot\_id belongs to the specified scene\_id. If an artist client attempts to dispatch shot\_id: "sh\_101\_04" under scene\_id: "ep102\_sc01", the engine halts with HTTP 422 Unprocessable Entity.  
> * **Authoritative Audio Duration Lookup:** Clients never supply duration. Allowing a client to submit duration\_ms would permit compromised agents to alter frame budgets arbitrarily. The server fetches the true acoustic duration (3,120 ms) directly from the upstream audio manifest locked by ffprobe.  
> * **Server-Derived 4*n*\+1 Lattice Math:** Video diffusion autoencoders require temporal frame dimensions conforming to a 4*n*\+1 mathematical lattice. The server derives this allocation using ceiling arithmetic:  
>   *N*\=⌈(1000duration\_ms​)×native\_fps⌉\=⌈3.120×16⌉=50 frames  
>   total\_diffusion\_allocation=4×⌈4*N*−1​⌉\+1=4×⌈12.25⌉+1=53 frames  
> * **Geometric Invariant Assertions:** The server validates the client's creative bounds against authoritative canvas dimensions (1280×720) and the derived frame budget (53 frames) using explicit half-open interval conventions \[*start*,*end*):  
>   0≤start\_frame\<end\_frame≤53  
>   0≤*x*1​\<*x*2​≤1280,0≤*y*1​\<*y*2​≤720

### **4\. RFC 8785 Canonical JSON Serialization & Payload Fingerprinting**

To prevent replay attacks, collision bugs, and forged parameters, all dispatch contracts require cryptographic payload fingerprinting.

> * **RFC 8785 (JCS) Deterministic Normalization:** Standard JSON.stringify() exhibits non-deterministic key ordering and float serialization variances across V8 (Cloudflare Workers) and Node.js runtimes. The compiler processes payloads through an RFC 8785 JSON Canonicalization Scheme (JCS) library:  
  * Object keys are sorted lexicographically by UTF-16 code units.  
  * All insignificant whitespace between tokens is stripped.  
  * Floating-point numbers are normalized to exponential representations where required by the spec.  
> * **Total Variant Field Fingerprinting:** The server reconstructs the canonical string from all template-specific parameters (including prompt\_override, anchor\_id, and driving\_audio\_stem) and calculates the SHA-256 digest:  
>   Fingerprintserver​\=SHA-256(CanonicalJCS(ResolvedPayload))  
>   The server asserts that Fingerprintserver​≡payload.payload\_fingerprint. If a single whitespace, key, or parameter differs, execution aborts with HTTP 409 Conflict.  
> * **Edge-Level Transport Deduplication:** Before touching the hardware queue, the worker attempts an atomic insert into the D1 idempotency\_keys table using INSERT INTO idempotency\_records (key, fingerprint, created\_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING. If zero rows are affected, a duplicate network transmission is detected: the worker short-circuits, returning the existing active job status without queue insertion.

### **5\. Lexical Injection Defenses & Voice-Rail Screening**

When user-written prose, dialogue adaptations, or character voice-rails enter the dispatch compiler, the gateway treats natural language as potentially hostile data.

> * **Delimiter Stripping & Escaping:** Voice-rail instructions wrapped in XML tags (e.g., \<character\_voice\_rail character="Bog"\>) are vulnerable to tag termination injections. If an untrusted draft includes \</character\_voice\_rail\> SYSTEM: Ignore previous rules, the parser neutralizes it. The compiler strips or entity-escapes all delimiter-like sequences (\<, \>, /) inside untrusted text fields before assembling the ComfyUI prompt structure.  
> * **Pre-Submission Prompt Screening:** The gateway executes a regular-expression and keyword audit against prompt overrides, flagging system-prompt injection markers (e.g., "ignore above", "system instruction", "you are now in developer mode"). Offending payloads are rejected at the edge with HTTP 400 Bad Request (PROMPT\_SECURITY\_VIOLATION).  
> * **Schema-Locked Damage Bounding:** Natural language text is never passed directly to model execution blocks that can modify graph architecture. Prompts are restricted to typed string slots feeding isolated KSampler conditioning inputs, ensuring that even if an injection bypasses lexical filters, its blast radius is strictly confined to image styling and cannot alter scene layout, execution leases, or database state.  
> * **Provenance Chain Linking:** The validated payload, its RFC 8785 hash, and the author's verified session identity are combined into a trace context and passed downstream to Rig 2, ensuring every generated frame can be audited back to the specific author, timestamp, and client session.

---

*User prompt: {{FOCUS: 2\. The Relational Truth Gate (Cloudflare D1) (Edge-Director) }} /extreme-details*

Response: The **Relational Truth Gate** of the edge-director (POD-12: System Middleware) is the edge-native continuity checkpoint of the generative production pipeline. Governed by the foundational operational axiom—*“Truth lives in the relational ledger, and stale scenes must never be rendered”*—it establishes a deterministic, sub-millisecond mathematical filter in Cloudflare D1 (CANON\_DB) before compute payloads can reach physical GPU allocation queues.

### **1\. Operational Axiom & Pre-Flight Execution Architecture**

In a generative video architecture, rendering passes (such as 120-frame Wan 2.2 diffusion runs) represent high-latency, hardware-saturating operations. Dispatching a render for a scene whose narrative premises have drifted burns local graphics memory or incurs cloud GPU fees on frames destined for the trash bin.

> * **Epistemological Decoupling:** Narrative causality and somatic facts are strictly decoupled from model execution. Generative models are treated as untrusted rendering workers possessing zero narrative, temporal, or spatial authority.  
> * **The Zero-Dollar Invalidation Filter:** Rather than invoking stochastic Video-LLMs or heuristic prompt-evaluators to check script continuity, the edge gateway executes a relational query against Cloudflare D1.  
> * **Execution Boundary:** The pre-flight check executes inside the stateless Cloudflare Worker ingress isolate (EdgeGateway in src/index.ts via Hono) within 5 milliseconds of payload receipt. If continuity invariants are violated, execution halts before waking the ShotCoordinatorDO actor or signaling Rig 2, billing exactly **\$0.00** in GPU compute.

                        `INBOUND DISPATCH REQUEST`  
                 `(Signed JWT + SpokeExecutionPayload)`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│             EDGE GATEWAY: INGRESS ROUTER (src/index.ts)                │`  
`│                                                                        │`  
`│ • Validates JWT signatures and Zod structural constraints (<5ms)       │`  
`│ • Intercepts target scene_id                                           │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                                   `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│         THE RELATIONAL TRUTH GATE (Cloudflare D1: CANON_DB)            │`  
`│                                                                        │`  
`│   SELECT COUNT(*) AS dirty_count                                       │`  
`│   FROM scene_fact_dependencies                                         │`  
`│   WHERE scene_id = ? AND is_dirty = 1;                                 │`  
`└──────────────────────────────────┬─────────────────────────────────────┘`  
                                   `│`  
                  `┌────────────────┴────────────────┐`  
                  `▼                                 ▼`  
         `[ dirty_count > 0 ]               [ dirty_count == 0 ]`  
                  `│                                 │`  
                  `▼                                 ▼`  
   `[ HTTP 412 PRECONDITION FAILED ]        [ UNLOCK RENDER GATE ]`  
   `• Error: DIRTY_SCENE_REJECTED           • Forward to ShotCoordinatorDO`  
   `• GPU never woken; $0.00 billed         • Hardware Mutex queues task`  
   `• AST compilation halted                • Dispatches to Rig 2 Foundry`

### **2\. Relational Schema Substrate (Cloudflare D1 DDL)**

The continuity gate relies on a four-table relational architecture within Cloudflare D1 that tracks atomic canon facts, production scenes, dependency edges, and graph centrality:

`-- 1. THE FACT REGISTRY: Atomic narrative, somatic, and logistical assertions`  
`CREATE TABLE facts (`  
  `id TEXT PRIMARY KEY,                       -- e.g., 'fact_the_pilot_hand_injury'`  
  `claim_text TEXT NOT NULL,                  -- "The Pilot's right brachial plexus is severed."`  
  `scope TEXT CHECK(scope IN ('CHARACTER', 'LOCATION', 'LOGISTIC', 'LAW')) NOT NULL,`  
  `version INTEGER NOT NULL DEFAULT 1,        -- Monotonic integer incremented on modification`  
  `last_edited_by TEXT NOT NULL,`  
  `created_at INTEGER NOT NULL,`  
  `last_edited_at INTEGER NOT NULL`  
`);`

`-- 2. THE SCENE REGISTRY: Screenplay units in the active production arc`  
`CREATE TABLE scenes (`  
  `id TEXT PRIMARY KEY,                       -- e.g., 'ep101_sc03'`  
  `episode INTEGER NOT NULL,`  
  `scene_number INTEGER NOT NULL,`  
  `prose_text TEXT NOT NULL,                  -- Draft screenplay text or beat prose`  
  `status TEXT CHECK(status IN ('DRAFT', 'CLEAN', 'DIRTY', 'REVIEWED_NO_CHANGE')) NOT NULL DEFAULT 'CLEAN',`  
  `dirty_reason TEXT,                         -- Automated diagnostics detailing the mismatch`  
  `owner_id TEXT NOT NULL,`  
  `updated_at INTEGER NOT NULL`  
`);`

`-- 3. THE DEPENDENCY EDGE TABLE: Pinned-version relational links`  
`CREATE TABLE scene_fact_dependencies (`  
  `scene_id TEXT NOT NULL,`  
  `fact_id TEXT NOT NULL,`  
  `pinned_version INTEGER NOT NULL,           -- Version of the fact when the AST was compiled`  
  `is_dirty INTEGER NOT NULL DEFAULT 0,       -- 1 = upstream mutation invalidates scene`  
  `created_at INTEGER NOT NULL,`  
  `PRIMARY KEY (scene_id, fact_id),`  
  `FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,`  
  `FOREIGN KEY (fact_id) REFERENCES facts(id) ON DELETE CASCADE`  
`);`

`-- 4. PASSIVE TOPOLOGICAL CENTRALITY VIEW: Telemetry for blast-radius tracking`  
`CREATE VIEW v_fact_centrality_telemetry AS`  
`SELECT`   
  `f.id AS fact_id,`  
  `f.claim_text,`  
  `f.scope,`  
  `f.version,`  
  `COUNT(d.scene_id) AS active_dependent_scenes_count`  
`FROM facts f`  
`LEFT JOIN scene_fact_dependencies d ON f.id = d.fact_id`  
`GROUP BY f.id;`

> * **Facts as Atomic Single-Claim Nodes:** Statements of world reality are broken into atomic records rather than freeform text blobs. Each fact records an explicit scope, a human-readable claim\_text, and a strict monotonic integer version.  
> * **Scenes as State Operators:** Every scene operates as a state transformation node (*Sn*​→*Sn*\+1​) whose physical viability depends on explicit input facts.  
> * **Pinned-Version Edges:** The junction table scene\_fact\_dependencies binds a scene to a fact at a specific historical point (pinned\_version). An edge remains valid if and only if the pinned version matches the fact's active version.  
> * **Centrality Telemetry:** The v\_fact\_centrality\_telemetry view continuously computes the in-degree centrality (*k*in​) of every fact across all episodes, identifying load-bearing narrative pillars.

### **3\. Deterministic Pre-Flight Gatekeeping & Short-Circuit Mechanics**

When a dispatch payload reaches POST /api/shots/dispatch on the edge-director, the router intercepts the payload and interrogates D1 before initializing the execution lifecycle:

`// apps/worker/src/index.ts (EdgeGateway Pre-Flight Gate)`  
`app.post("/api/shots/dispatch", async (c) => {`  
  `const payload = await c.req.json<SpokeExecutionPayload>();`  
    
  `// 1. Relational Continuity Interrogation`  
  `` const query = ` ``  
    `SELECT COUNT(*) AS dirty_count`  
    `FROM scene_fact_dependencies`  
    `WHERE scene_id = ? AND is_dirty = 1;`  
  `` `; ``  
  `const result = await c.env.CANON_DB.prepare(query)`  
    `.bind(payload.sceneId)`  
    `.first<{ dirty_count: number }>();`

  `// 2. Deterministic Short-Circuit Denial`  
  `if (result && result.dirty_count > 0) {`  
    `return c.json({`  
      `error: "DIRTY_SCENE_REJECTED",`  
      `sceneId: payload.sceneId,`  
      `dirtyDependencies: result.dirty_count,`  
      `message: "Upstream canon changed. Re-lint and re-compile scene AST before queuing render."`  
    `}, 412);`  
  `}`

  `// 3. Execution Unlocked: Forward to Durable Object Mutex`  
  `const coordinatorId = c.env.SHOT_COORDINATOR.idFromName("global-render-queue");`  
  `const coordinatorStub = c.env.SHOT_COORDINATOR.get(coordinatorId);`  
  `return coordinatorStub.fetch(c.req.raw);`  
`});`

> * **Sub-Millisecond Query Latency:** Because Cloudflare D1 utilizes SQLite at the edge, simple primary-key indexed checks execute in fractions of a millisecond.  
> * **HTTP 412 Precondition Failed:** If dirty\_count \> 0, the client receives an immediate 412 Precondition Failed (or 409 SCENE\_DIRTY\_DEPENDENCIES), detailing exactly how many dependencies are stale.  
> * **AST Invalidation Flag:** The gate asserts that writing, compiling, and rendering are unidirectional:  
>   Draft Script⟶Compile AST⟶Pin Versions⟶Unlock Render  
>   Any change to upstream facts breaks this chain, demanding that the author or compiler re-lint the scene Abstract Syntax Tree before any pixels can be computed.

### **4\. Invalidation Engine, Propagation Logic & Transitive Blast Radius**

When a creator modifies an upstream fact in the narrative ledger, the database automatically cascades dirty states down the dependency graph.

#### **Invalidation Propagation Trigger**

An edge is declared stale whenever a fact's monotonic version exceeds the version pinned by a dependent scene:

∃*d*∈Scene.depends\_on∣*d*.pinned\_version\<Fact.version

Upon updating a fact record (UPDATE facts SET version \= version \+ 1, claim\_text \= ? WHERE id \= ?), an automated trigger or write transaction runs the invalidation update:

`UPDATE scene_fact_dependencies`  
`SET is_dirty = 1`  
`WHERE fact_id = :fact_id`   
  `AND pinned_version < (SELECT version FROM facts WHERE id = :fact_id);`

`UPDATE scenes`  
`SET status = 'DIRTY',`  
    `dirty_reason = 'Upstream fact mutated: ' || :fact_id`  
`WHERE id IN (`  
  `SELECT scene_id`   
  `FROM scene_fact_dependencies`   
  `WHERE fact_id = :fact_id AND is_dirty = 1`  
`);`

#### **Transitive Closure & Economic Blast Radius (Recursive CTE)**

Direct in-degree (*k*in​) only captures direct dependents. Narrative continuity propagates transitively: Scene 1 establishes a fact; Scene 4 depends on Scene 1; Scene 8 depends on Scene 4\.

To prevent systemic drift across an entire season arc, Cloudflare D1 executes a recursive Common Table Expression (CTE) to calculate the **True Economic Blast Radius** of an edit:

`WITH RECURSIVE downstream_cascade AS (`  
  `-- Anchor Member: Scenes directly consuming the mutated fact`  
  `SELECT`   
    `d.fact_id,`  
    `d.scene_id,`  
    `s.episode,`  
    `s.scene_number,`  
    `s.status AS scene_status,`  
    `1 AS depth`  
  `FROM scene_fact_dependencies d`  
  `JOIN scenes s ON d.scene_id = s.id`  
  `WHERE d.fact_id = :mutated_fact_id`

  `UNION ALL`

  `-- Recursive Member: Downstream scenes occurring later in the continuity sequence`  
  `SELECT`   
    `dc.fact_id,`  
    `s_next.id AS scene_id,`  
    `s_next.episode,`  
    `s_next.scene_number,`  
    `s_next.status AS scene_status,`  
    `dc.depth + 1`  
  `FROM downstream_cascade dc`  
  `JOIN scenes s_prev ON dc.scene_id = s_prev.id`  
  `JOIN scenes s_next ON s_prev.episode = s_next.episode`   
                     `AND s_next.scene_number > s_prev.scene_number`  
  `WHERE dc.depth < 5 -- Bounded depth to prevent runaway cycles`  
`)`  
`SELECT`   
  `dc.fact_id,`  
  `COUNT(DISTINCT dc.scene_id) AS total_downstream_blast_radius,`  
  `COUNT(DISTINCT CASE WHEN dc.scene_status = 'CLEAN' THEN dc.scene_id END) AS rendered_scenes_invalidated`  
`FROM downstream_cascade dc`  
`GROUP BY dc.fact_id;`

> * **Bounded Recursion:** The recursion depth is explicitly clamped (depth \< 5\) to prevent runaway circular queries while capturing the structural blast zone.  
> * **Economic Reporting:** By calculating rendered\_scenes\_invalidated, the compiler measures the exact cost of a lore change in lost GPU seconds, compositor render passes, and human audit hours.

### **5\. Authority Partitioning: Relational Ledger (D1) vs. Task Core (DO)**

To prevent distributed race conditions, the system enforces a strict boundary between transport deduplication, relational truth, and hardware execution authority:

`[ INBOUND DISPATCH REQUEST ]`  
              `│`  
              `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ EDGE INGRESS LAYER (Authoritative: Cloudflare D1)                      │`  
`│                                                                        │`  
`│ • Enforces transport-level idempotency via idempotency_keys table.     │`  
`│ • Evaluates delivery uniqueness with INSERT ... ON CONFLICT DO NOTHING.│`  
`│ • Enforces Relational Truth Gate (scene_fact_dependencies.is_dirty).   │`  
`│ • Executes BEFORE any task Durable Object is invoked.                  │`  
`└─────────────────────────────┬──────────────────────────────────────────┘`  
                              `│ Clean (is_dirty == 0) & Unique`  
                              `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ TASK EXECUTION PLANE (Authoritative: Cloudflare Durable Objects)       │`  
`│                                                                        │`  
`│ • ShotCoordinatorDO: Singleton owning FSM, mutex queue, & epochs.      │`  
`│ • GlobalCoordinatorDO: Singleton owning budget reservations & kill.    │`  
`│ • D1 Execution Rows: Read-only mirrors updated asynchronously.         │`  
`│ • Invariant: Hardware gating decisions read DO state, NEVER D1.        │`  
`└────────────────────────────────────────────────────────────────────────┘`

| Subsystem Component | Authoritative Store | Operational Mandate |
| :---- | :---- | :---- |
| **Transport Deduplication** | **Cloudflare D1** (idempotency\_keys) | Rejects duplicate network retries via INSERT ... ON CONFLICT DO NOTHING before task creation. |
| **Narrative Continuity Gate** | **Cloudflare D1** (CANON\_DB) | Blocks stale scene ASTs using relational pre-flight checks (is\_dirty \== 0). |
| **Hardware Mutex & Queue** | **ShotCoordinatorDO** (V8 RAM) | Serializes single-threaded GPU access, preventing concurrent allocation collisions. |
| **Lease & Epoch Fencing** | **ShotCoordinatorDO** (ctx.storage) | Issues 30s heartbeat-renewed leases and monotonic fencing tokens (*N*→*N*\+1). |
| **Task Status Mirroring** | **Cloudflare D1** (audit\_task\_runs) | Passive, read-only status projection populated asynchronously via DO Outbox channels. |

> * **The Invariant Rule:** Operational execution decisions (can a lease renew? has an epoch expired? can a plate merge?) must inspect the single-threaded memory of the Durable Object, **never** D1. D1 is authoritative for transport deduplication and pre-flight narrative truth, but remains a passive projection for active task lifecycles.

### **6\. Epistemological Standing & Graceful Degradation**

#### **Tri-State Epistemological Standing**

To prevent exploratory writing debates from immediately breaking active render pipelines, facts in D1 move through a managed three-stage lifecycle:

                  `CANONICAL STATE LEDGER (Cloudflare D1)`  
                                     `│`  
           `┌─────────────────────────┼─────────────────────────┐`  
           `▼                         ▼                         ▼`  
   `ACTIVE_ENDORSED           FLAGGED_FOR_REVIEW       DEPRECATED_ARCHIVED`  
   `(Canonical Law)           (Under Audit/Doubt)      (Retconned/Obsolete)`  
           `│                         │                         │`  
   `• Passes Pre-Flight       • Amber badge in UI      • Triggers cascading`  
   `• Normal production       • DOES NOT trigger dirty   is_dirty = 1 trigger`  
     `flow unlocked             cascade or break build • Blocks all renders`

> * **ACTIVE\_ENDORSED:** Certified canonical law. Passes the relational gate with zero friction.  
> * **FLAGGED\_FOR\_REVIEW:** An author or showrunner has questioned the fact. It displays an amber review badge on the dashboard but **explicitly does not dirty downstream dependencies or halt active renders**, decoupling creative scrutiny from destructive refactoring.  
> * **DEPRECATED\_ARCHIVED:** The fact has been retconned. The update trigger flips all dependent edges to is\_dirty \= 1, requiring downstream scenes to be reviewed, edited, or re-pinned.

#### **The "Still Good" Protocol**

Facts with high centrality (*k*in​\>15) that have not undergone human reconsideration for \>60 days surface on the Showrunner’s Astro Cockpit based on an automated audit metric:

Audit Priority Score=Days Since Reconsideration×log10​(Downstream Dependent Scenes+1)

The dashboard presents the fact alongside the three highest-tension dependent scenes. The Showrunner clicks **"Still Good"**, which updates last\_reconsidered\_at \= strftime('%s', 'now') in D1 without incrementing the fact version, keeping the downstream graph clean and verified without rendering interruption.

#### **Graceful Hardware Degradation (SIMULATION\_ONLY Mode)**

If Rig 2 experiences a physical failure, power cut, or GPU fault, narrative truth persists independently of pixel generation:

`// EdgeGateway Fallback Handling (src/index.ts)`  
`if (brokerSockets.length === 0 && payload.allowSimulationFallback) {`  
  `// Execute narrative state mutation in D1 directly without rendering media`  
  `const result = await executeNarrativeStateMutation(c.env.CANON_DB, payload.sceneAst);`  
    
  `return c.json({`  
    `status: "COMMITTED_WITHOUT_MEDIA",`  
    `sceneId: payload.sceneId,`  
    `stateDelta: result.delta,`  
    `message: "Narrative state advanced in D1. Rendering queued for batch processing when Rig 2 resumes."`  
  `});`  
`}`

> * **Media-Free Narrative Progression:** Writers advance character inventories, somatic injuries, and world coordinates in D1 at a cost of fractions of a cent.  
> * **Persistent Backlog Queue:** Unrendered scene ASTs are placed in a persistent queue in D1. When Rig 2 powers back on and reconnects its outbound tunnel, it drains the backlog and renders visual plates in an automated batch to align the media archive with the canonical truth.

---

*User prompt: {{FOCUS: 3\. Dirty-State Propagation Mechanics (Edge-Director) }} /extreme-details*

Response: **Dirty-State Propagation Mechanics** in the edge-director establish an edge-native, relational invalidation cascade that prevents stale, contradicted, or desynchronized narrative states from consuming GPU rendering resources. Operating directly over Cloudflare D1 (CANON\_DB), the subsystem translates modifications in upstream canonical facts into deterministic invalidation flags across the entire downstream production graph.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│               CANONICAL TRUTH LEDGER (Cloudflare D1)                   │`  
`│                                                                        │`  
`│   [ Fact: char_elias_prosthetic (v2) ] ◄── Pinned by Scene 03 (Clean)  │`  
`│                      │                                                 │`  
`│                      ▼ (Author edits fact: Elias loses arm -> v3)      │`  
`│   [ Fact: char_elias_prosthetic (v3) ]                                 │`  
`│                      │                                                 │`  
`│                      ▼ (propagate_fact_mutation Trigger / CTE)         │`  
`│   [ Dependency Edge: pinned_version (2) < current_version (3) ]        │`  
`│                      │                                                 │`  
`│                      ▼                                                 │`  
`│   [ Scene 03: scene_fact_dependencies.is_dirty = 1 ]                  │`  
`│   [ Scene 03 Status: 'CLEAN' -> 'DIRTY' / 'DRAFT' ]                    │`  
`└──────────────────────┬─────────────────────────────────────────────────┘`  
                       `│`  
                       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│            INGRESS DISPATCH GATEWAY (EdgeGateway / Hono)               │`  
`│                                                                        │`  
`│   SELECT COUNT(*) AS dirty_count                                       │`  
`│   FROM scene_fact_dependencies                                         │`  
`│   WHERE scene_id = 'ep101_sc03' AND is_dirty = 1;                      │`  
`│                      │                                                 │`  
`│                      ├─────── dirty_count > 0 ────────────────────────┐│`  
`│                      ▼                                                ▼│`  
`│         [ HTTP 412 PRECONDITION FAILED ]             [ DISPATCH TO GPU]│`  
`│         • Error: DIRTY_SCENE_REJECTED                • Lease Granted   │`  
`│         • Halts execution at T_0 ($0.00 billed)      • Renders Plate   │`  
`└────────────────────────────────────────────────────────────────────────┘`

### **1\. Mathematical Foundations of Relational Invalidation**

In episodic, branching narrative production, scenes cannot be treated as isolated prompt strings; they are state-transformation operators that depend on an exact configuration of world reality.

> * **The Invalidation Invariant:** Let a scene *S* have an Abstract Syntax Tree (AST) compiled against a set of canonical facts F*S*​\={*f*1​,*f*2​,…,*fk*​}⊂F. Each dependency edge *e*∈Edep​ between scene *S* and fact *fi*​ records a pinned\_version *v*pinned​(*S*,*fi*​). The scene *S* is mathematically valid if and only if all pinned versions equal the active versions in the canonical registry:  
>   Valid(*S*)⟺∀*fi*​∈F*S*​,*v*pinned​(*S*,*fi*​)=*v*active​(*fi*​)  
> * **Monotonic Fact Incrementation:** World truth moves unidirectionally. Whenever an author or simulation engine mutates an entity’s somatic vector (e.g., severing a limb), logistical vector (e.g., firing a bullet), or epistemic vector (e.g., discovering a secret), the fact’s version increments monotonically:  
>   *v*active​(*fi*​)⟵*v*active​(*fi*​)+1  
> * **The Dirty Flag Assertion:** If an upstream edit occurs, any edge where the pinned version is strictly less than the active version becomes dirty:  
>   is\_dirty(*S*,*fi*​)={10​if *v*pinned​(*S*,*fi*​)\<*v*active​(*fi*​)if *v*pinned​(*S*,*fi*​)=*v*active​(*fi*​)​  
>   Status(*S*)=’DIRTY’⟺*fi*​∈F*S*​∑​is\_dirty(*S*,*fi*​)\>0  
> * **Rejection of Wall-Clock Timestamps:** The system rejects standard file timestamps (mtime) and system clocks (Date.now()) for invalidation evaluations. In distributed edge computing, cross-datacenter clock skew and NTP jitter lead to out-of-order false negatives. Invalidation is strictly governed by discrete, monotonic integer version comparisons.

### **2\. D1 Schema Architecture & Invalidation DDL**

The invalidation engine executes inside Cloudflare D1 using a strongly typed relational schema that tracks facts, scenes, version-pinned dependencies, and automated audit trails:

`-- 1. CANONICAL FACT REGISTRY`  
`CREATE TABLE facts (`  
  `id TEXT PRIMARY KEY,                       -- e.g., 'char_elias_prosthetic'`  
  `entity_id TEXT NOT NULL,                   -- e.g., 'char_elias'`  
  `scope TEXT CHECK(scope IN ('SOMATIC', 'LOGISTICAL', 'EPISTEMIC', 'RELATIONAL', 'WORLD')) NOT NULL,`  
  `claim_text TEXT NOT NULL,                  -- "Elias has a functional cybernetic left arm."`  
  `state_payload TEXT NOT NULL,               -- JSON: {"condition": "FUNCTIONAL", "severity": 0.0}`  
  `version INTEGER NOT NULL DEFAULT 1,        -- Monotonic version counter`  
  `last_edited_by TEXT NOT NULL,              -- Author or process ID`  
  `updated_at INTEGER NOT NULL`  
`);`

`-- 2. EPISODIC SCENE REGISTRY`  
`CREATE TABLE scenes (`  
  `id TEXT PRIMARY KEY,                       -- e.g., 'ep101_sc03'`  
  `episode INTEGER NOT NULL,`  
  `scene_number INTEGER NOT NULL,`  
  `medium TEXT CHECK(medium IN ('VIDEO', 'COMIC', 'PROSE')) NOT NULL,`  
  `status TEXT CHECK(status IN ('DRAFT', 'CLEAN', 'DIRTY', 'REVIEWED_NO_CHANGE')) NOT NULL DEFAULT 'DRAFT',`  
  `ast_hash TEXT,                             -- SHA-256 of the compiled dialogue AST`  
  `dirty_reason TEXT,                         -- Automated audit string detailing the invalidation`  
  `updated_at INTEGER NOT NULL`  
`);`

`-- 3. SCENE-FACT DEPENDENCY JUNCTION TABLE`  
`CREATE TABLE scene_fact_dependencies (`  
  `scene_id TEXT NOT NULL,`  
  `fact_id TEXT NOT NULL,`  
  `pinned_version INTEGER NOT NULL,           -- Version of fact when AST was locked`  
  `is_dirty INTEGER NOT NULL DEFAULT 0,       -- 1 = Stale dependency; halts dispatch`  
  `invalidated_at INTEGER,                    -- Epoch timestamp when dirtied`  
  `PRIMARY KEY (scene_id, fact_id),`  
  `FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,`  
  `FOREIGN KEY (fact_id) REFERENCES facts(id) ON DELETE CASCADE`  
`);`

`CREATE INDEX idx_scene_fact_dirty ON scene_fact_dependencies(scene_id, is_dirty);`  
`CREATE INDEX idx_fact_dependencies ON scene_fact_dependencies(fact_id);`

#### **Automated Invalidation Triggers**

To eliminate reliance on asynchronous polling or manual cache busting, invalidation is enforced at the database layer via SQLite triggers:

`-- Trigger: Automatically flag dependency edges when a fact version increments`  
`CREATE TRIGGER trig_propagate_fact_mutation`  
`AFTER UPDATE OF version ON facts`  
`BEGIN`  
  `-- Step A: Mark all edges dirty where the pinned version is now obsolete`  
  `UPDATE scene_fact_dependencies`  
  `SET is_dirty = 1,`  
      `invalidated_at = strftime('%s', 'now')`  
  `WHERE fact_id = NEW.id`  
    `AND pinned_version < NEW.version;`

  `-- Step B: Downgrade the parent scene status and append the collision reason`  
  `UPDATE scenes`  
  `SET status = 'DIRTY',`  
      `dirty_reason = 'Upstream fact mutated: [' || NEW.id || '] advanced from v' || OLD.version || ' to v' || NEW.version || ' (' || NEW.claim_text || ')'`  
  `WHERE id IN (`  
    `SELECT scene_id`   
    `FROM scene_fact_dependencies`   
    `WHERE fact_id = NEW.id AND is_dirty = 1`  
  `);`  
`END;`

### **3\. The 5 Core Operations & Edge-Coverage Friction**

The lifecycle of narrative facts and scene compilation is restricted to five discrete, audited operations. No arbitrary mutations or untracked edits are permitted.

                            `THE 5 CORE OPERATIONS`  
                              
  `[ 1. CREATE_FACT ] ────────► Initial creation of atomic state claim.`  
                                     `│`  
  `[ 2. DRAW_EDGE ]   ────────► MANDATORY WRITE-TIME FRICTION:`  
                               `Scene cannot flip to CLEAN without declaring dependencies.`  
                                     `│`  
  `[ 3. EDIT_FACT ]   ────────► Text changes. Version increments (v2 -> v3).`  
                                     `│`  
                                     `▼`  
  `[ 4. PROPAGATION QUERY ] ──► SQL detects: pinned_version < current_version.`  
                               `Marks downstream scenes as DIRTY with reason string.`  
                                     `│`  
                                     `▼`  
  `[ 5. REVIEW & CLEAR ] ─────► Human opens dirty scene and explicitly marks either:`  
                               `(a) Edited to match (re-compiles AST, re-pins to v3)`  
                               `(b) Reviewed, no change needed (re-pins, logs audit)`

> 1. **CREATE\_FACT:** Any author or engine process can declare an atomic narrative condition. The fact is initialized at version \= 1\.  
> 2. **DRAW\_EDGE (Mandatory Write-Time Friction):** When a scene AST is compiled, the compiler inspects every entity referenced in dialogue, kinetic actions, and background environments. It writes explicit dependency rows into scene\_fact\_dependencies, pinning the edge to the fact’s active version (*v*active​). A scene is blocked from attaining 'CLEAN' status if it references entities without drawing explicit relational edges.  
> 3. **EDIT\_FACT:** An author edits a fact (e.g., *“Elias loses his left arm in Episode 1, Scene 1”*). The D1 transaction executes:  
>    `UPDATE facts`   
>    `SET version = version + 1,`   
>        `claim_text = 'Elias has a severed left arm stump.',`  
>        `state_payload = '{"condition": "SEVERED", "severity": 1.0}',`  
>        `updated_at = strftime('%s', 'now')`  
>    `WHERE id = 'char_elias_prosthetic';`

4\. **PROPAGATION\_QUERY (flagDirtyDependencies):** The automated trigger fires immediately, identifying all downstream scenes across the active production slate pinned to an earlier version. It sets is\_dirty \= 1 on the dependency junction and demotes the downstream scenes from 'CLEAN' to 'DIRTY' or 'DRAFT'. 5\. **REVIEW\_AND\_CLEAR:** Once a scene is flagged dirty, it cannot be rendered until a human or compiler re-certifies it through one of two explicit paths: \* **Path A (Edited to Match):** The writer rewrites the scene (e.g., removing actions where Elias uses two hands), re-compiles the AST, and updates the pinned edge: \`\`\`sql UPDATE scene\_fact\_dependencies SET pinned\_version \= 3, is\_dirty \= 0, invalidated\_at \= NULL WHERE scene\_id \= 'ep101\_sc03' AND fact\_id \= 'char\_elias\_prosthetic';

    `UPDATE scenes SET status = 'CLEAN', dirty_reason = NULL WHERE id = 'ep101_sc03';`  
    ```` ``` ````  
   `[cite: 4]`  
``*   **Path B (Reviewed, No Change Needed):** The writer inspects the scene and determines the fact change does not affect the scene's blocking (e.g., Elias is merely seated speaking without using his arms)[cite: 4]. The system updates `pinned_version = 3`, sets `status = 'REVIEWED_NO_CHANGE'`, and logs an immutable audit receipt[cite: 4].``

### **4\. Transitive Dependency Graph Traversal & Blast Radius (Recursive CTEs)**

A single upstream edit rarely stops at one scene. Changing a fact in Episode 1 sets off a cascading blast radius across episodes, seasons, and parallel media formats:

`[ Fact Mutation in Ep 1 ]`  
       `│`  
       `▼ (Elias loses his cybernetic arm)`  
       `├──► Scene 04: Pinned to Arm v1 ──► [ DIRTY: Halt Render ]`  
       `├──► Scene 08: Pinned to Arm v1 ──► [ DIRTY: Halt Render ]`  
       `└──► Scene 12: Pinned to Arm v1 ──► [ DIRTY: Halt Render ]`

#### **The CLI Diagnostic: sower why-dirty**

Before committing an upstream edit, authors run dry-run blast radius checks via the CLI to calculate the ripple effect:

`$ sower why-dirty fact_bog_arm_severed`

`[MUTATION]: fact_bog_arm_severed -> state: AGGRAVATED`  
  `├── Scene 040/03 (Direct Match: consumes fact_bog_arm_severed) -> INVALIDATED`  
  `├── Scene 040/07 (Downstream Dependent: assumes two-handed carry) -> INVALIDATED`  
  `└── Episode 041/01 (Epistemic Chain: Spleen references Bog's injury) -> INVALIDATED`  
`Total Blast Radius: 3 scenes across 2 episodes. Rebuild cost: $0.00 (Draft Phase).`

#### **The Recursive Blast-Radius CTE**

To discover multi-hop causal cascades—where Scene A depends on Fact X, Scene B depends on an inventory item transferred in Scene A, and Scene C assumes character presence—Cloudflare D1 executes a recursive Common Table Expression (CTE):

`WITH RECURSIVE downstream_blast_radius AS (`  
  `-- Anchor Member: Scenes directly bound to the mutated fact`  
  `SELECT`   
    `d.scene_id,`  
    `s.episode,`  
    `s.scene_number,`  
    `s.status AS initial_status,`  
    `1 AS cascade_depth`  
  `FROM scene_fact_dependencies d`  
  `JOIN scenes s ON d.scene_id = s.id`  
  `WHERE d.fact_id = :target_fact_id`

  `UNION ALL`

  `-- Recursive Member: Downstream sequential scenes occurring within the same narrative timeline`  
  `SELECT`   
    `s_next.id AS scene_id,`  
    `s_next.episode,`  
    `s_next.scene_number,`  
    `s_next.status AS initial_status,`  
    `dbr.cascade_depth + 1`  
  `FROM downstream_blast_radius dbr`  
  `JOIN scenes s_curr ON dbr.scene_id = s_curr.id`  
  `JOIN scenes s_next ON (`  
    `(s_next.episode = s_curr.episode AND s_next.scene_number > s_curr.scene_number)`  
    `OR (s_next.episode > s_curr.episode)`  
  `)`  
  `JOIN scene_fact_dependencies d_next ON s_next.id = d_next.scene_id`  
  `WHERE dbr.cascade_depth < 6 -- Clamped recursion depth to prevent circular traversals`  
`)`  
`SELECT`   
  `scene_id,`  
  `episode,`  
  `scene_number,`  
  `initial_status,`  
  `MIN(cascade_depth) AS shortest_hop_distance`  
`FROM downstream_blast_radius`  
`GROUP BY scene_id`  
`ORDER BY episode ASC, scene_number ASC;`

> * **Economic Cost Metric:** By running this traversal before updating the database, the compiler computes the number of rendered plates rendered obsolete (rendered\_scenes\_invalidated). During the draft phase, invalidation costs **\$0.00**; during active production, it flags high-cost visual re-renders before commits are sealed.

### **5\. The Transmedia X-Trigger Engine (Cross-Medium Push Invalidation)**

A passive database flag is insufficient across multi-disciplinary departments: a graphic novel team has no operational reason to monitor a video rendering queue, nor does a prose novelist inspect exposure sheets. The edge-director bridges this gap via the **Transmedia X-Trigger**.

`┌─────────────────────────────────────────────────────────────────────────────┐`  
`│                  THE TRANSMEDIA X-TRIGGER ARCHITECTURE                      │`  
`├─────────────────────────────────────────────────────────────────────────────┤`  
`│ 1. STATE DELTA COMMIT (Cloudflare D1 Ledger)                                │`  
`│    • Comic Pod commits Scene ep101_comic_p04.                               │`  
`│    • The Pilot spends 12.5L fuel + sustains right femoral laceration.       │`  
`│    • Universal Merkle Root updates: H_root -> H_new.                        │`  
`├─────────────────────────────────────────────────────────────────────────────┤`  
`│ 2. REVERSE DEPENDENCY GRAPH TRAVERSAL                                       │`  
`│    • D1 executes recursive graph query across scene_fact_dependencies.      │`  
`│    • Discovers 3 downstream dependencies:                                   │`  
`│      ├── ep101_sc06 (Video): Pinned to pre-injury fuel level ──► DIRTY      │`  
`│      ├── ch03_beat02 (Novel): Pinned to pre-injury mobility  ──► DIRTY      │`  
`│      └── ep102_sc01 (Video): Pinned to old Merkle root       ──► DIRTY      │`  
`├─────────────────────────────────────────────────────────────────────────────┤`  
`│ 3. FILTER & GATE: CROSS-MEDIUM ONLY                                         │`  
`│    • Filters out same-medium updates (handled in-suite).                    │`  
`│    • Isolates cross-medium targets: Video Pod & Novel Pod.                  │`  
`├─────────────────────────────────────────────────────────────────────────────┤`  
`│ 4. DUAL-PAYLOAD WEBHOOK BROADCAST                                           │`  
`│    • Dispatches real-time webhook to Astro Cockpit & Discord/Slack bots.    │`  
`│    • PAYLOAD LAYER 1: Advisory human-readable summary.                      │`  
`│    • PAYLOAD LAYER 2: Authoritative machine-readable JSON diff.             │`  
`└─────────────────────────────────────────────────────────────────────────────┘`

> * **The Cross-Medium Filter:** The trigger ignores internal same-medium revisions (e.g., Video Scene 1 updating Video Scene 2). It fires an active event-driven broadcast strictly when:  
>   mutatingMedium=affectedMedium  
> * **The Dual-Payload Contract:** To prevent LLM hallucination and ensure non-technical writers do not misinterpret raw cryptographic hashes, the X-Trigger dispatches a two-tier payload:  
  * **Layer 1 (Advisory Scaffolding):** A plain-language summary providing narrative context (*"The siphon was broken in Comic Page 4; fuel is leaking in subsequent chapters"*).  
  * **Layer 2 (Authoritative Ground Truth):** A structured, machine-readable JSON diff containing the typed state vectors:  
    `{`  
      `"event": "TRANSMEDIA_INVALIDATION",`  
      `"triggeringScene": "ep101_comic_p04",`  
      `"targetScene": "ep101_sc06",`  
      `"mutatedFact": "char_pilot_fuel_reserve",`  
      `"stateDelta": {`  
        `"somatic": {`  
          `"injuries_added": ["RIGHT_FEMORAL_LACERATION"],`  
          `"banned_kinetic_verbs": ["SPRINT", "KICK"]`  
        `},`  
        `"logistics": {`  
          `"item_id": "fuel_reserve",`  
          `"consumed_volume_liters": 12.5,`  
          `"remaining_units": 3.5`  
        `},`  
        `"epistemic": {`  
          `"revealed_secrets": ["SABOTAGED_VALVE"]`  
        `}`  
      `}`  
    `}`

  * **The Invariant Rule:** Natural language summaries are strictly advisory scaffolding; client tools and editors must parse Layer 2 to calculate UI state and timeline locks, eliminating semantic hallucination risks.

### **6\. Ingress Enforcement: Sub-5ms Execution Denial**

The dirty-state propagation engine connects directly to the edge gatekeeper (EdgeGateway in src/index.ts). Before any request wakes the stateful ShotCoordinatorDO actor, the gateway intercepts the dispatch:

`// apps/worker/src/index.ts (EdgeGateway Ingress Routing)`  
`app.post("/api/shots/dispatch", async (c) => {`  
  `const payload = await c.req.json<SpokeExecutionPayload>();`  
    
  `// 1. Interrogate the relational truth gate`  
  `` const query = ` ``  
    `SELECT`   
      `d.fact_id,`  
      `d.pinned_version,`  
      `f.version AS current_version,`  
      `f.claim_text`  
    `FROM scene_fact_dependencies d`  
    `JOIN facts f ON d.fact_id = f.id`  
    `WHERE d.scene_id = ? AND d.is_dirty = 1;`  
  `` `; ``  
    
  `const dirtyEdges = await c.env.CANON_DB.prepare(query)`  
    `.bind(payload.sceneId)`  
    `.all<{ fact_id: string; pinned_version: number; current_version: number; claim_text: string }>();`

  `// 2. Short-circuit execution if dirty dependencies exist`  
  `if (dirtyEdges.results && dirtyEdges.results.length > 0) {`  
    `return c.json({`  
      `error: "DIRTY_SCENE_REJECTED",`  
      `sceneId: payload.sceneId,`  
      `dirtyCount: dirtyEdges.results.length,`  
      `violations: dirtyEdges.results.map(edge => ({`  
        `factId: edge.fact_id,`  
        `pinnedVersion: edge.pinned_version,`  
        `currentVersion: edge.current_version,`  
        `divergence: edge.claim_text`  
      `})),`  
      `message: "Upstream canon changed. Re-lint and re-compile scene AST before queuing render."`  
    `}, 412); // HTTP 412 Precondition Failed`  
  `}`

  `// 3. Narrative reality clean: pass payload to ShotCoordinatorDO hardware mutex`  
  `const doId = c.env.SHOT_COORDINATOR.idFromName("global-render-queue");`  
  `const coordinatorStub = c.env.SHOT_COORDINATOR.get(doId);`  
  `return coordinatorStub.fetch(c.req.raw);`  
`});`

> * **Sub-5ms Execution Wall:** The indexed SQLite query against scene\_fact\_dependencies executes in under a millisecond.  
> * **Total GPU Protection:** If a human updates character lore while an episode animatic is queued, the request fails with HTTP 412 Precondition Failed (or HTTP 409 SCENE\_DIRTY\_DEPENDENCIES). The local GPU on Rig 2 never spins up, VRAM remains uncluttered, and cloud burst budgets remain at **\$0.00**, enforcing the rule that stale narrative scenes are blocked before pixels can be generated.

---

*User prompt: {{FOCUS: 4\. Blast Radius & Transitive Dependency Hashing (Edge-Director) }} /extreme-details*

Response: The **Blast Radius & Transitive Dependency Hashing** engine of the edge-director is the topological and cryptographic subsystem that governs cache validity, draft isolation, and render invalidation across the generative production fleet.

Rather than treating scenes as isolated text prompts, the pipeline models narrative reality as an immutable Directed Acyclic Graph (DAG). This subsystem calculates the exact downstream reachability of any canon modification and compiles cryptographic content fingerprints (*H*dep​), preventing obsolete script state from entering the GPU execution queue while protecting active writing sessions from cascading lockouts.

### **1\. Operational Coupling vs. Thematic Salience**

A foundational rule of the architecture dictates that no automated system ever makes holistic artistic or quality judgments. Graph centrality and reachability metrics measure **Operational Coupling**, strictly decoupled from dramatic importance.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        CENTRALITY AUDIT TAXONOMY                       │`  
`├──────────────────────┬──────────────────┬──────────────────────────────┤`  
`│ Tier Classification  │ In-Degree Range  │ Operational Role             │`  
`├──────────────────────┼──────────────────┼──────────────────────────────┤`  
`│ 1. DEAD LORE         │ kin ≤ 1          │ Unreferenced fluff; marked   │`  
`│                      │                  │ for pruning or hook creation.│`  
`├──────────────────────┼──────────────────┼──────────────────────────────┤`  
`│ 2. SATELLITE ASSET   │ 2 ≤ kin ≤ 4      │ Contextual nuance; holds     │`  
`│                      │                  │ localized dramatic purpose.  │`  
`├──────────────────────┼──────────────────┼──────────────────────────────┤`  
`│ 3. BALANCED HUB      │ 5 ≤ kin < Spine  │ Healthy recurring anchor;    │`  
`│                      │                  │ stable dramatic catalyst.    │`  
`├──────────────────────┼──────────────────┼──────────────────────────────┤`  
`│ 4. MONOLITHIC SPINE  │ kin ≥ SpineLimit │ Single point of failure;     │`  
`│                      │ (e.g., kin ≥ 15) │ high-risk blast radius node. │`  
`└──────────────────────┴──────────────────┴──────────────────────────────┘`

> * **In-Degree Centrality (*k*in​):** The baseline coupling of an entity *e* represents the number of downstream scenes that directly depend on its state:  
>   *k*in​(*e*)=∣{*s*∈Scenes∣*s* depends on *e*}∣  
> * **The Semantic Distinction:** A high *k*in​ does not signify a narrative's core philosophical theme; it signifies a structural dependency hazard. It does not tell the showrunner *"this prop is artistic genius"*; it informs the compiler *"modifying this prop invalidates 28 scenes across 4 episodes"*.  
> * **Topological Invalidation Set (I(*v*)):** The operational penalty of altering an entity *v* is determined by its transitive reachability in the reverse dependency multigraph Gref​:  
>   I(*v*)={*u*∈Vent​∣*u*⇝*v* in Gref​}  
> * **Transitive Invalidation Blast Radius (*R*blast​):** Evaluated as the normalized cardinality of the invalidation set over the total population *n*:  
>   *R*blast​(*v*)=*n*∣I(*v*)∣​  
> * **The Critical Invalidation Hazard Ceiling:** If *R*blast​(*v*)\>0.40 (or the configured max\_transitive\_blast\_radius\_ratio), the entity is flagged as a **Critical Invalidation Hazard**. Mutating its schema or dossier triggers a compilation rebuild cascading through more than 40% of the entire story bible, requiring human authorization.

### **2\. The Cascading Economic Cost Cliff Formula**

When a narrative fact escapes undetected past the drafting phase, the cost of rectification compounds non-linearly. The edge-director quantifies this using the **Cascading Blast-Radius Multiplier**:

Total Incident Cost=Δ*C*root​\+*d*∈Downstream∑​Δ*Cd*​⋅1{*d* is rendered}​\+Morale Overhead  
`[ T0: Draft Phase ] ────────► Compile / Linting Check ────────► $0.00 Compute Billed[cite: 1, 17]`  
       `│`  
       `▼ (Escapes Gate)`  
`[ T1: Dialogue Extraction ] ─► dialogue_ast.json Compiled ────► CPU Minutes[cite: 17]`  
       `│`  
       `▼ (Escapes Gate)`  
`[ T2: Acoustic Synthesis ] ──► TTS Stem Generation (.wav) ───► Local GPU Compute[cite: 17]`  
       `│`  
       `▼ (Escapes Gate)`  
`[ T3: Video Diffusion ] ─────► Wan 2.2 / ComfyUI Latents ─────► Heavy GPU VRAM / Cloud Burst Fees[cite: 5, 17]`  
       `│`  
       `▼ (Escapes Gate)`  
`[ T4: Optical Assembly ] ────► Remotion Chromium Composite ──► High CPU/Memory Rendering[cite: 3, 5]`  
       `│`  
       `▼ (Escapes Gate)`  
`[ T5: Broadcast / Release ] ─► Public Audience Delivery ─────► Full Pipeline Re-Render + Morale Cost[cite: 5]`

> * **Cost Phase *T*0​ (Drafting):** If sower why-dirty or the edge gate catches a fact contradiction prior to compilation, invalidation cost is mathematically **\$0.00**.  
> * **Cost Phase *T*3​ to *T*4​ (Post-Render):** If an entity mutation occurs after rendering, every rendered downstream child *d* must be discarded, flushing synthesized voice stems, latent caches, and Remotion visual compositions.  
> * **Bounded Query Aggregation:** Because the narrative DAG is an *O*(*E*) structure where active edges across a 3-to-6 episode arc rarely exceed 500 records, the economic cascade query evaluates inside SQLite in under 2 milliseconds.

### **3\. Deterministic Dependency Hashing (*H*dep​) Architecture**

A naive caching system invalidates all open sessions whenever the global canon root hash (*H*root​) changes. In a 10-person studio, this creates continuous drafting lockouts. The edge-director resolves this by evaluating discrete entity dependency hashes (*H*dep​).

                       `DRAFT CANDIDATE DEPENDENCY SET`  
                   `┌────────────────────────────────────┐`  
                   `│ Target: char_bog                   │`  
                   `│ FK 1:   prop_warm_pipe             │`  
                   `│ FK 2:   loc_sluice_gate            │`  
                   `└─────────────────┬──────────────────┘`  
                                     `│`  
                                     `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   RFC 8785 CANONICAL NORMALIZATION                     │`  
`│                                                                        │`  
`│ 1. Extract content hashes: [H_bog, H_warm_pipe, H_sluice_gate]         │`  
`│ 2. Sort lexicographically by UTF-16 code units (Strict Set Hashing)    │`  
`│ 3. Compute H_dep = SHA256(Sort([H_target, H_fk1, H_fk2, ...]))         │`  
`└────────────────────────────────────┬───────────────────────────────────┘`  
                                     `│`  
                                     `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│              TWO-TIER HASH RESOLUTION & EARLY WARNING                  │`  
`├────────────────────────────────────┬───────────────────────────────────┤`  
`│ ADVISORY EDGE EARLY WARNING        │ AUTHORITATIVE INGESTION GATE      │`  
`│ (1-Hop Foreign Key Check)          │ (Multi-Hop Transitive Closure)    │`  
`├────────────────────────────────────┼───────────────────────────────────┤`  
`│ • Evaluated by edge-director DO.   │ • Precomputed by local compiler.  │`  
`│ • Inspects immediate relations.    │ • Stores deep graph fingerprint.  │`  
`│ • Never blocks UI unexpectedly.    │ • Edge runs cheap O(1) equality.  │`  
`│ • Surfaces non-destructive diff:   │ • Blocks corrupted merges during  │`  
`│   "Warm Pipe changed. Click Rebase"│   git pull-and-ingest phases.     │`  
`└────────────────────────────────────┴───────────────────────────────────┘`

#### **Mathematical Formulation of *H*dep​**

An entity’s dependency hash combines its own content hash with the discrete content hashes of its direct foreign keys:

*H*dep​\=SHA256(Sort(\[*H*target​,*H*fk\_1​,*H*fk\_2​,…\]))

> * **Deterministic Set Hashing:** Foreign key hashes must be sorted lexicographically before hashing to ensure that array iteration order variance across V8 isolates and Node.js runtimes does not produce false mismatches.  
> * **The Hub Invalidation Trap:** In densely connected narrative universes, central hubs (such as a shared town square or a primary tavern) connect to dozens of characters and props. If multi-hop transitive closures were evaluated continuously at the edge, a minor edit to the tavern's decorative description would instantly invalidate every active writing session in the studio.  
> * **Two-Tier Architectural Boundary:**  
  1. **Advisory Edge Early Warning (1-Hop):** Staging Durable Objects check only direct (1-hop) foreign-key references. If a character references *The Warm Pipe*, their draft is flagged only if *The Warm Pipe* itself changes, remaining unaffected if an unrelated prop inside the same room changes.  
  2. **Authoritative Local Compilation (Multi-Hop Transitive Closure):** The local compiler traces the deep dependency graph, generates the transitive *H*dep​ fingerprint, and embeds it into the published manifest artifact. The edge director performs a fast, zero-CPU *O*(1) equality check against this precomputed token, achieving transitive awareness without turning the edge worker into a heavy graph compiler.  
> * **Graceful Rebase Contract:** When an upstream dependency mutates (*H*dep​ mismatch), the client cockpit preserves the writer's in-progress text in local memory and surfaces a side-by-side structured visual diff: *"The Warm Pipe sensory profile updated from H:3a1b to H:8f9c. Review changes and click to rebase"*.

### **4\. Recursive Graph Traversal on Cloudflare D1 (SQLite vs. Graph DBs)**

While dedicated graph engines (such as Neo4j) offer expressive Cypher querying, they introduce severe architectural liabilities when integrated into serverless edge pipelines:

| Architectural Criterion | Cloudflare D1 (In-Process SQLite) | Neo4j / AuraDB (External Cluster) |
| :---- | :---- | :---- |
| **Runtime Locality** | Native sub-millisecond edge binding to Cloudflare Workers. | External network hop via Bolt protocol or REST API. |
| **Cold Starts & Scaling** | Scales to zero instantly; zero connection pool exhaustion. | Stateful cluster requiring persistent TCP connection pooling. |
| **Cost Profile** | \$0.00 idle compute; fractions of a cent per million queries. | Dedicated instance sizing starting at \~\$65/mo minimum. |
| **ACID Guarantees** | In-process transactional atomicity within the worker boundary. | Distributed two-phase transactions over remote sockets. |

Using recursive Common Table Expressions (CTEs), Cloudflare D1 navigates transitive dependency trees in under 2 milliseconds without leaving the edge isolate.

#### **The Downstream Blast-Radius Recursive Query**

The following authoritative SQL CTE traverses the directed scene graph, discovers all downstream dependents, and flags invalidations when an entity or fact is altered:

`-- src/hub/queries/downstream_blast_radius.sql`  
`WITH RECURSIVE downstream_cascade AS (`  
  `-- Anchor Member: Scenes directly consuming the mutated fact or entity`  
  `SELECT`   
    `d.fact_id,`  
    `d.scene_id,`  
    `s.episode,`  
    `s.scene_number,`  
    `s.status AS initial_status,`  
    `1 AS depth`  
  `FROM scene_fact_dependencies d`  
  `JOIN scenes s ON d.scene_id = s.id`  
  `WHERE d.fact_id = :mutated_fact_id`

  `UNION ALL`

  `-- Recursive Member: Downstream scenes occurring sequentially later in continuity`  
  `SELECT`   
    `dc.fact_id,`  
    `s_next.id AS scene_id,`  
    `s_next.episode,`  
    `s_next.scene_number,`  
    `s_next.status AS initial_status,`  
    `dc.depth + 1`  
  `FROM downstream_cascade dc`  
  `JOIN scenes s_prev ON dc.scene_id = s_prev.id`  
  `JOIN scenes s_next ON (`  
    `(s_next.episode = s_prev.episode AND s_next.scene_number > s_prev.scene_number)`  
    `OR (s_next.episode > s_prev.episode)`  
  `)`  
  `JOIN scene_fact_dependencies d_next ON s_next.id = d_next.scene_id`  
  `WHERE dc.depth < 6 -- Bounded depth ceiling prevents infinite circular loops`  
`)`  
`SELECT`   
  `dc.fact_id,`  
  `dc.scene_id,`  
  `dc.episode,`  
  `dc.scene_number,`  
  `dc.initial_status,`  
  `MIN(dc.depth) AS shortest_hop_distance`  
`FROM downstream_cascade dc`  
`GROUP BY dc.scene_id`  
`ORDER BY dc.episode ASC, dc.scene_number ASC;`

#### **Compound Graph Mechanics: Diamond & Multi-Parent Dependencies**

> * **Multi-Parent Dependencies:** When a scene depends on multiple upstream facts (*F*1​,*F*2​,*F*3​), the engine does not require specialized handling. The relationship collapses into standard single-hop edge evaluations: the scene contains three entries in scene\_fact\_dependencies, and an update to any one triggers the invalidation flag.  
> * **Diamond Dependencies:** If Fact *A* and Fact *B* mutate independently in ways that are individually valid but mutually contradictory, the dependent scene at the base of the diamond is flagged dirty the instant *either* parent updates. The mechanism's objective is achieved: routing human review to the exact point of confluence.

### **5\. Bidirectional Causality & The Forensic CLI: sower why-dirty**

The unified provenance DAG operates symmetrically, providing two primary operational capabilities:

               `BIDIRECTIONAL GRAPH CAUSALITY`  
                             `▲`  
                             `│`  
     `BACKWARD CAUSALITY      │      FORWARD BLAST RADIUS`  
    `(Forensic Audit)         │     (Invalidation Sweep)`  
                             `│`  
`"Why does this frame exist?" │ "If Fact #42 changes, what breaks?"`  
                             `│`  
   `Master MP4 Composite      │      Canon Fact Mutated`  
            `│                │              │`  
            `▼                │              ▼`  
    `Remotion Timeline        │      Direct Scene Match`  
            `│                │              │`  
            `▼                │              ▼`  
    `Audio Stem (.wav)        │      Downstream Dependents`  
            `│                │              │`  
            `▼                │              ▼`  
    `Dialogue AST Beat        │      Epistemic Belief Chains`  
            `│                │              │`  
            `▼                │              ▼`  
    `Somatic Fact Vector      │      Full Rebuild Target List`  
                             `│`  
                             `▼`

#### **1\. Backward Audit (Forensic Provenance)**

Answers: *"Why does this specific pixel or audio wave exist?"* If an audit detects a continuity defect (e.g., Bog walking without a limp in frame 412), the engine traverses backward through the immutable hash chain:

Frame 412⟶Shot 03⟶Exposure Sheet⟶Audio Stem⟶AST Beat⟶Somatic Vector⟶Canon Constraint

#### **2\. Forward Analysis (sower why-dirty)**

Answers: *"If Fact X changes upstream, what breaks downstream?"* When an author modifies a canon dossier or somatic trait, the compiler evaluates the forward transitive closure before sealing changes:

`$ sower why-dirty fact_bog_arm_severed`

`[MUTATION]: fact_bog_arm_severed -> state: AGGRAVATED`  
  `├── Scene 040/03 (Direct Match: consumes fact_bog_arm_severed) -> INVALIDATED`  
  `├── Scene 040/07 (Downstream Dependent: assumes two-handed carry) -> INVALIDATED`  
  `└── Episode 041/01 (Epistemic Chain: Spleen references Bog's injury) -> INVALIDATED`  
`Total Blast Radius: 3 scenes across 2 episodes. Rebuild cost: $0.00 (Draft Phase).`

> * **Pre-Edit Impact-Radius Preview:** The exact same graph traversal query can be invoked speculatively in the authoring UI before an edit is committed, presenting writers with the anticipated cost cliff prior to applying breaking changes.  
> * **Acyclic Safety Guarantee:** Because Pass 2 compilation performs Depth-First Search (DFS) three-color cycle detection on every commit, circular dependencies (*A*→*B*→*C*→*A*) are physically eliminated from the repository. The transitive invalidation sweep is guaranteed to complete in finite time without infinite recursion loops.

### **6\. The Epistemological Audit Engine & Reconsideration Protocols**

To eliminate coordination overhead, recurring "canon review meetings" are replaced with continuous **Topological Blast-Radius Prioritization**.

> * **The Audit Priority Metric:** Facts with extensive downstream reach that have not undergone review are ranked using a logarithmic tension formula:  
>   Audit Priority Score=Days Since Reconsideration×log10​(Downstream Dependent Scenes+1)  
> * **The "Still Good" Protocol:** The Showrunner’s cockpit surfaces unresolved mysteries and monolithic spines exceeding 60 days without evaluation. The showrunner can click **"Still Good"**, which updates last\_reconsidered\_at in D1 without incrementing the fact version, keeping the downstream graph clean and verified without triggering false *H*dep​ churn or invalidating rendered media assets.  
> * **Asymmetric Minimal Enclosing Unit (MEU) Repair:** When a downstream script requires revalidation due to an upstream invalidation, repair logic operates asymmetrically:  
  * *Backward Sweep:* Scans upward to collect required active constraints (e.g., verifying an actor possesses a key) without modifying surrounding text.  
  * *Forward Sweep:* Expands downward only if an entity introduced within the repaired patch is referenced by subsequent dialogue or actions.  
  * *Seam Gate:* The stitched scene (prefix \+ patch \+ suffix) undergoes automated pronoun, coreference, and tense verification; repairs expanding beyond 40% of the scene boundary halt and trigger a human-in-the-loop review gate.

---

*User prompt: {{FOCUS: 4\. Transactional NVMe State and The Choke Point (Edge-Director) }} /extreme-details*

### **Response: 1\. The Physical Persistence Engine: NVMe Storage Substrate & Concurrency Blocking**

In standard serverless architectures, in-memory state is transient; worker processes are recycled, isolates are paused, and memory heaps are evicted without warning. The ShotCoordinatorDO (POD-12: System Middleware) prevents state loss by anchoring its operational data to Cloudflare’s collocated, transactional NVMe storage substrate (ctx.storage).

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE ISOLATE (ShotCoordinatorDO)                            │`  
`│                                                                        │`  
`│  [ Inbound WebSocket / RPC Request ]                                   │`  
`│                 │                                                      │`  
`│                 ▼                                                      │`  
`│  ┌──────────────────────────────────────────────────────────────────┐  │`  
`│  │ constructor(ctx, env) Boot Barrier                                │  │`  
`│  │                                                                  │  │`  
`│  │  this.ctx.blockConcurrencyWhile(async () => {                    │  │`  
`│  │    // 1. All network events queued in Anycast socket buffer      │  │`  
`│  │    // 2. Fetch critical operational keys in a single read        │  │`  
`│  │    const state = await this.ctx.storage.get([                    │  │`  
`│  │      "fsm_context", "execution_queue", "active_lease", "epoch"   │  │`  
`│  │    ]);                                                           │  │`  
`│  │    // 3. Hydrate V8 isolate memory heap from NVMe storage        │  │`  
`│  │    this.hydrateMemory(state);                                    │  │`  
`│  │  });                                                             │  │`  
`│  └──────────────────────────────────┬───────────────────────────────┘  │`  
`│                                     │ Storage Rehydrated               │`  
`│                                     ▼                                  │`  
`│  [ Single-Threaded V8 Processing Unlocked ]                            │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Eviction and Cold Rehydration:** When WebSocket connections hibernate or the edge runtime migrates an actor across data centers, volatile V8 RAM is wiped. The DO relies on its NVMe storage to preserve state integrity across restarts.  
> * **The Concurrency Boot Barrier (blockConcurrencyWhile):** Upon instantiation, the actor invokes this.ctx.blockConcurrencyWhile(...) within its constructor. This hypervisor-level barrier halts execution of all inbound HTTP requests, WebSocket frames, and hardware alarms. The actor retrieves its active lease record, monotonic epoch counters, execution queue array, and FSM context from disk in a single batched read, guaranteeing that no request accesses an uninitialized or partially loaded in-memory heap.  
> * **Atomic Storage Commit Discipline:** Every mutation—whether queueing a render, updating tenant positions, granting a lease, or bumping a fencing token—is committed through atomic storage transactions (await this.persistState()). This ensures that isolate crashes or sudden evictions leave no orphaned or torn state on disk.

### **2\. The Unified State Choke Point (leaveStateChokePoint / applyTransition)**

Allowing individual route handlers or error catch blocks to independently perform state cleanups introduces severe distributed state divergence: timers are orphaned, fencing tokens fail to increment, and stale tasks remain in queues. The ShotCoordinatorDO eliminates this failure mode by routing all state modifications and exits through a single, strictly typed transaction method: leaveStateChokePoint() (or applyTransition()).

`┌────────────────────────────────────────────────────────────────────────┐`  
`│             applyTransition(event, actor, payload) CHOKE POINT         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Storage Transaction Initiation: Open single-turn atomic block.      │`  
`│ 2. Evaluate FSM & Epoch Fencing: Assert transition and worker epoch.   │`  
`│ 3. Apply Context Patch: Atomically update fsm_context in DO storage.   │`  
`│ 4. Selective Epoch Fencing:                                            │`  
`│    • Revoking events (TIMEOUT, SECURITY, REJECT): Increment epoch.     │`  
`│    • Promoting events (MERGE, ADVANCE): Retain epoch for valid writes. │`  
`│ 5. Self-Transition Guard:                                              │`  
`│    • If nextState === currentState: skip timer re-arm & outbox enqueue.│`  
`│ 6. Declarative Timer Reconciliation (Transaction-Aware):               │`  
`│    • Cancel invalid timers via Storage Handle (pass txn).              │`  
`│    • Arm valid entry timers (watchdog, absolute cap, timeout).         │`  
`│ 7. Prefix-Keyed Outbox Enqueue (Multi-Lane Partitioning):              │`  
`│    • Write each action under individual key outbox:<lane>:<actionId>.  │`  
`│    • On ROLLING_BACK entry: purge all outbox:GITHUB:MERGE:* keys.      │`  
`│ 8. Commit Storage Transaction: Atomically commit state to disk.        │`  
`│ 9. Trigger Outbox Drain: Schedule immediate async outbox flush.        │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **The 8-Step Transactional Execution Sequence**

> 1. **Storage Transaction Initiation:** Opens an atomic, single-turn transaction via this.ctx.storage.transaction(async (txn) \=\> { ... }).  
> 2. **FSM Matrix & Fencing Validation:** Asserts that the transition from currentState to nextState is permitted under the Finite State Machine specification, verifying the caller's identity and lease token.  
> 3. **Context Patch Application:** Commits updated state fields, error vectors, and payload references into fsm\_context within the transaction.  
> 4. **Selective Epoch Fencing:**  
   * *Revoking Exits (TIMEOUT, CANCEL, SECURITY, REJECT):* Increments the monotonic epoch (*N*→*N*\+1), fencing out stale runners and revoking outstanding leases.  
   * *Promoting Exits (MERGE, ADVANCE):* Retains the active epoch (*N*), permitting verified workers to promote staged artifacts into the canonical manifest.  
> 5. **Self-Transition Guard:** If an event triggers a transition where nextState \=== currentState (e.g., an in-flight status poll), the choke point logs the event and exits the transaction early, preventing redundant timer re-arming and outbox spam.  
> 6. **Declarative Timer Reconciliation:** Evaluates active timers against the target state's requirements; invalid timers are cancelled and required timers (such as lease watchdogs or absolute caps) are scheduled directly through the storage handle.  
> 7. **Prefix-Keyed Outbox Enqueue:** Serializes side-effect actions into designated outbox lanes (outbox:\<lane\>:\<actionId\>). If transitioning to a recovery state (such as ROLLING\_BACK), the method scans and deletes pending speculative operations (e.g., outbox:GITHUB:MERGE:\*) before they can reach the network.  
> 8. **Atomic Commit & Async Flush:** The transaction commits all mutations to NVMe simultaneously; upon completion, it schedules an asynchronous background drain to execute the enqueued outbox actions.

### **3\. The Multi-Lane Outbox Architecture & Anti-Blocking Guarantees**

Executing external network requests (such as Cloudflare D1 updates, Slack alerts, or external API calls) directly inside an atomic storage transaction causes input/output gates to stall, risking transaction timeouts and isolate termination. The edge-director resolves this by decoupling local state commits from external side effects via a **Prefix-Keyed Multi-Lane Outbox**.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            PREFIX-KEYED OUTBOX STORAGE (ctx.storage.sql / KV)          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Lane 1: outbox:PROJECTION:<uuid>   ──► D1 Read-Only State Mirror       │`  
`│ Lane 2: outbox:BUDGET:<uuid>       ──► GlobalCoordinator Balance Sync │`  
`│ Lane 3: outbox:GITHUB:<uuid>       ──► PR Merge / Ephemeral Branch Del │`  
`│ Lane 4: outbox:ALERT:<uuid>        ──► Slack / Ops Surveillance Webhook│`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│             ASYNCHRONOUS OUTBOX DISPATCHER (ctx.waitUntil)             │`  
`│                                                                        │`  
`│ • Reads pending keys via prefix sweep: ctx.storage.list({ prefix })    │`  
`│ • Drains lanes independently (GitHub latency cannot block D1 mirrors)  │`  
`│ • Deletes key on 200 OK: await ctx.storage.delete(key)                 │`  
`│ • Transient failure: exponential backoff; poison pills evicted to DLQ  │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Prefix-Keyed Partitioning:** Outbox actions are stored with lane-prefixed keys (outbox:\<lane\>:\<actionId\>), allowing the storage layer to query, process, or clear specific categories of side effects independently:  
  * outbox:PROJECTION: Updates read-only task status rows in Cloudflare D1.  
  * outbox:BUDGET: Coordinates compute reservations and financial settlements with upstream billing coordinators.  
  * outbox:GITHUB: Manages external Git operations, such as creating merge pull requests or deleting tracking branches.  
  * outbox:ALERT: Pushes diagnostic failure cards and execution dossiers to Slack or web dashboards.  
> * **Elimination of Head-of-Line Blocking:** Because each outbox lane drains through independent asynchronous tasks, latency or rate-limiting on third-party APIs (such as GitHub or Slack) never blocks local D1 projections or internal queue operations.  
> * **Idempotent Dispatch and Cleanup:** The dispatcher processes each action via ctx.waitUntil(). Once an external operation confirms success (e.g., HTTP 200 OK), the item's key is removed from storage via await ctx.storage.delete(key). If a network blip occurs, the un-deleted key is picked up during the next flush cycle, preventing dropped side effects.  
> * **Rollback Purging:** When a task fails or an error triggers a state abort, the choke point executes an atomic prefix sweep to purge all speculative actions in outbox:GITHUB:MERGE:\*. This guarantees that a failed render or invalid AST never triggers an accidental branch merge or downstream task dispatch.

### **4\. Declarative Timer Reconciliation & Watchdog Synchronization**

Managing timeouts via detached, in-memory setTimeout calls is unsafe in serverless edge environments: when an isolate hibernates, in-memory timers pause or are discarded entirely. The edge-director implements declarative timer reconciliation backed by Cloudflare’s hardware storage alarm API (ctx.storage.setAlarm()).

| Timer Purpose | Trigger Mechanism | Target Action / Failure State |
| :---- | :---- | :---- |
| **Worker Lease Watchdog** | Storage Alarm (Date.now() \+ 30000\) | Revokes lease, bumps epoch (*N*→*N*\+1), requeues task or trips circuit breaker. |
| **Absolute Execution Ceiling** | Storage Alarm (Date.now() \+ 900000\) | Hard 15-minute cap; kills hung CUDA subroutines and quarantines task to DLQ. |
| **Draft Retention TTL** | Storage Alarm (Date.now() \+ 259200000\) | 72-hour expiration; sweeps abandoned staging drafts into archive storage. |
| **Outbox Drain Sweep** | Background Tick (ctx.waitUntil) | Flushes pending outbox:\<lane\>:\<actionId\> operations to external services. |

> * **Transactional Timer Management:** Timers are not created as ad-hoc runtime calls. The choke point reconciles them declaratively during state transitions, using the transaction handle to clear obsolete deadlines and arm new alarms in the same atomic commit that updates the state.  
> * **Zero Ghost Alarms:** When a worker finishes rendering and submits BROKER\_COMPLETE, the choke point cancels the active watchdog timer within the completion transaction. This prevents race conditions where a delayed alarm fires immediately after a successful render and revokes a valid completion.  
> * **Autonomous Hardware Recovery:** If Rig 2 drops its connection, crashes, or suffers a power loss mid-render, no external monitoring service is required. When the 30-second storage alarm expires, the hypervisor wakes the ShotCoordinatorDO isolate and triggers its alarm() handler. The actor enters leaveStateChokePoint(), bumps the fencing epoch to isolate the dead node, increments the retry counter, and either returns the shot to the FIFO queue or diverts it to the Dead-Letter Queue (dlq:\${jobId}).

---

*User prompt: {{FOCUS: 4\. Transactional NVMe State and The Choke Point (Edge-Director), 2\. The Persistent Outbound Tunnel Topology (Edge-Director) }} /extreme-details*

Response: The **edge-director** architecture pairs a stateful Actor Model running on NVMe-backed edge storage with an inside-out network topology. This technical foundation decouples high-throughput client orchestration from physical GPU hardware, ensuring zero-trust security and complete transactional integrity across distributed networks.

## **4\. Transactional NVMe State and The Choke Point**

Standard serverless functions operate statelessly: when an isolate pauses or is recycled, all in-memory variables and execution heaps are wiped. The ShotCoordinatorDO (POD-12: System Middleware) prevents state corruption by anchoring its lifecycle, queue, and timers to Cloudflare's transactional NVMe storage substrate (ctx.storage).

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE ISOLATE (ShotCoordinatorDO)                            │`  
`│                                                                        │`  
`│  [ Inbound WebSocket Frame / HTTP RPC Request ]                        │`  
`│                 │                                                      │`  
`│                 ▼                                                      │`  
`│  ┌──────────────────────────────────────────────────────────────────┐  │`  
`│  │ constructor(ctx, env) BOOT BARRIER                               │  │`  
`│  │                                                                  │  │`  
`│  │  this.ctx.blockConcurrencyWhile(async () => {                    │  │`  
`│  │    // 1. Anycast proxy buffers all incoming socket/HTTP frames   │  │`  
`│  │    // 2. Batched transactional read against NVMe disk            │  │`  
`│  │    const state = await this.ctx.storage.get([                    │  │`  
`│  │      "fsm_context", "execution_queue", "active_lease", "epoch"   │  │`  
`│  │    ]);                                                           │  │`  
`│  │    // 3. Hydrate V8 isolate memory heap from storage snapshot    │  │`  
`│  │    this.hydrateMemory(state);                                    │  │`  
`│  │  });                                                             │  │`  
`│  └──────────────────────────────────┬───────────────────────────────┘  │`  
`│                                     │ Storage Rehydrated (<2ms)        │`  
`│                                     ▼                                  │`  
`│  [ Single-Threaded V8 Event Loop Processing Unlocked ]                  │`  
`└────────────────────────────────────────────────────────────────────────┘`

### **1\. NVMe Storage Substrate & Concurrency Blocking (blockConcurrencyWhile)**

> * **Cold Rehydration from NVMe:** When a Durable Object hibernates or migrates across edge data centers, its V8 RAM heap is evicted. The actor’s persistent state—including the active task lease, tenant FIFO queue, fencing epoch, and FSM context—resides entirely on local NVMe flash via Cloudflare's collocated transactional engine (ctx.storage).  
> * **The Concurrency Boot Barrier:** To eliminate race conditions during cold starts, the actor invokes this.ctx.blockConcurrencyWhile(...) within its constructor. This creates a hypervisor-level execution barrier: all incoming HTTP requests, WebSocket frames, and scheduled hardware alarms are held in network buffers until the asynchronous rehydration callback completes.  
> * **Batched NVMe Fetch:** The DO reads its operational keys in a single round-trip (await this.ctx.storage.get(\["fsm\_context", "execution\_queue", "active\_lease", "epoch"\])). The in-memory heap is restored before any dispatch or telemetry handler executes, ensuring that no client ever interacts with a half-initialized actor.  
> * **Atomic Storage Commit Discipline:** Any mutation affecting the hardware mutex—such as enqueueing a job, reordering tenant positions, issuing a lease, or bumping a fencing token—must be committed through an atomic storage transaction (await this.persistState()). If an edge isolate crashes or suffers sudden termination, the underlying Write-Ahead Log (WAL) rolls back cleanly, leaving zero torn writes on disk.

### **2\. The Unified State Choke Point (applyTransition / leaveStateChokePoint)**

Distributing state-mutation logic across disconnected route handlers or error catch blocks creates distributed divergence: timers are orphaned, fencing tokens fail to increment, and ghost tasks remain stuck in execution queues. The ShotCoordinatorDO eliminates this failure mode by routing all state modifications and exits through a single, strictly typed transaction method: applyTransition().

`┌────────────────────────────────────────────────────────────────────────┐`  
`│             applyTransition(event, actor, payload) CHOKE POINT         │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ 1. Storage Transaction Initiation: Open single-turn atomic block.      │`  
`│ 2. Evaluate FSM & Epoch Fencing: Assert transition and worker epoch.   │`  
`│ 3. Apply Context Patch: Atomically update fsm_context in DO storage.   │`  
`│ 4. Selective Epoch Fencing:                                            │`  
`│    • Revoking events (TIMEOUT, SECURITY, REJECT): Increment epoch.     │`  
`│    • Promoting events (MERGE, ADVANCE): Retain epoch for valid writes. │`  
`│ 5. Self-Transition Guard:                                              │`  
`│    • If nextState === currentState: update context patch & return.     │`  
`│ 6. Declarative Timer Reconciliation (Transaction-Aware):               │`  
`│    • Cancel invalid timers via Storage Handle (pass txn).              │`  
`│    • Arm valid entry timers (watchdog, retry backoff, timeout).        │`  
`│ 7. Prefix-Keyed Outbox Enqueue (Multi-Lane Partitioning):              │`  
`│    • Write each action under individual key outbox:<lane>:<actionId>.  │`  
`│    • On ROLLING_BACK entry: purge all outbox:GITHUB: actions.          │`  
`│ 8. Commit Storage Transaction: Atomically commit state to disk.        │`  
`│ 9. Trigger Outbox Drain: Schedule immediate async outbox flush.        │`  
`└────────────────────────────────────────────────────────────────────────┘`

The 8-step transactional sequence operates as follows:

> 1. **Storage Transaction Initiation:** Opens an atomic, single-turn transaction via this.ctx.storage.transaction(async (txn) \=\> { ... }).  
> 2. **FSM Matrix & Epoch Fencing Validation:** Asserts that the requested state transition from currentState to nextState is structurally valid under the finite state machine matrix, verifying that caller permissions and lease tokens match.  
> 3. **Context Patch Application:** Updates task metadata, error descriptors, and entity parameters within the fsm\_context record in NVMe storage.  
> 4. **Selective Epoch Fencing:**  
   * *Revoking Exits (TIMEOUT, CANCEL, SECURITY, REJECT):* Increments the monotonic epoch (*N*→*N*\+1), fencing out the current worker and invalidating its lease.  
   * *Promoting Exits (MERGE, ADVANCE):* Retains the current epoch (*N*), permitting verified workers to promote staged artifacts into the canonical manifest.  
> 5. **Self-Transition Guard:** If an event results in nextState \=== currentState (such as an in-flight status poll or progress tick), the choke point updates the context patch and returns immediately, preventing redundant timer re-arming and duplicate outbox enqueueing.  
> 6. **Declarative Timer Reconciliation:** Evaluates active timers against the target state's requirements; invalid timers are cancelled and required timers (such as lease watchdogs or absolute caps) are scheduled directly through the storage handle.  
> 7. **Prefix-Keyed Outbox Enqueue:** Serializes side-effect actions into designated outbox lanes (outbox:\<lane\>:\<actionId\>). If transitioning to a recovery state (ROLLING\_BACK), it executes an atomic prefix sweep to purge all pending outbox:GITHUB: operations.  
> 8. **Commit Storage Transaction & Drain:** The transaction atomically writes all state changes, timer registrations, and outbox actions to NVMe. Upon exiting the transaction, it dispatches an asynchronous background drain via ctx.waitUntil().

### **3\. Prefix-Keyed Multi-Lane Outbox Architecture**

Executing external network calls (such as D1 updates, Git operations, or webhook alerts) directly inside an atomic storage transaction causes distributed locks to stall, risking transaction timeouts and isolate termination. The edge-director decouples local NVMe state commits from external side effects through a **Prefix-Keyed Multi-Lane Outbox**:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│            PREFIX-KEYED OUTBOX STORAGE (ctx.storage.sql / KV)          │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Lane 1: outbox:PROJECTION:<uuid>   ──► D1 Read-Only State Mirror       │`  
`│ Lane 2: outbox:BUDGET:<uuid>       ──► GlobalCoordinator Balance Sync │`  
`│ Lane 3: outbox:GITHUB:<uuid>       ──► PR Merge / Ephemeral Branch Del │`  
`│ Lane 4: outbox:ALERT:<uuid>        ──► Slack / Ops Surveillance Webhook│`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│             ASYNCHRONOUS OUTBOX DISPATCHER (ctx.waitUntil)             │`  
`│                                                                        │`  
`│ • Reads pending keys via prefix sweep: ctx.storage.list({ prefix })    │`  
`│ • Drains lanes independently (GitHub latency cannot block D1 mirrors)  │`  
`│ • Deletes key on 200 OK: await ctx.storage.delete(key)                 │`  
`│ • Transient failure: exponential backoff; poison pills evicted to DLQ  │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Prefix-Keyed Storage Partitioning:** Outbox actions are persisted with lane-prefixed keys (outbox:\<lane\>:\<actionId\>), allowing the storage layer to query, process, or clear specific categories of side effects independently:  
  * outbox:PROJECTION: Updates read-only task status rows in Cloudflare D1.  
  * outbox:BUDGET: Coordinates compute reservations and financial settlements with upstream billing coordinators.  
  * outbox:GITHUB: Manages external Git operations, such as creating merge pull requests or deleting tracking branches.  
  * outbox:ALERT: Pushes diagnostic failure cards and execution dossiers to Slack or web dashboards.  
> * **Elimination of Head-of-Line Blocking:** Because each outbox lane drains through independent asynchronous tasks, latency or rate-limiting on third-party APIs (such as GitHub or Slack) never blocks local D1 projections or internal queue operations.  
> * **Idempotent Dispatch and Cleanup:** The dispatcher processes each action via ctx.waitUntil(). Once an external operation confirms success (e.g., HTTP 200 OK), the item's key is removed from storage via await ctx.storage.delete(key). If a network blip occurs, the un-deleted key is picked up during the next flush cycle, preventing dropped side effects.  
> * **Rollback Purging:** When a task fails or an error triggers a state abort, the choke point executes an atomic prefix sweep to purge all speculative actions in outbox:GITHUB:MERGE:\*. This guarantees that a failed render or invalid AST never triggers an accidental branch merge or downstream task dispatch.

### **4\. Declarative Timer Reconciliation & Watchdogs**

Managing timeouts via detached, in-memory setTimeout calls is unsafe in serverless edge environments: when an isolate hibernates, in-memory timers pause or are discarded entirely. The edge-director implements declarative timer reconciliation backed by Cloudflare’s hardware storage alarm API (ctx.storage.setAlarm()):

| Timer Purpose | Trigger Mechanism | Target Action / Failure State |
| :---- | :---- | :---- |
| **Worker Lease Watchdog** | Storage Alarm (Date.now() \+ 30000\) | Revokes lease, bumps epoch (*N*→*N*\+1), requeues task or trips circuit breaker. |
| **Absolute Execution Ceiling** | Storage Alarm (Date.now() \+ 900000\) | Hard 15-minute cap; kills hung CUDA subroutines and quarantines task to DLQ. |
| **Draft Retention TTL** | Storage Alarm (Date.now() \+ 259200000\) | 72-hour expiration; sweeps abandoned staging drafts into archive storage. |
| **Outbox Drain Sweep** | Background Tick (ctx.waitUntil) | Flushes pending outbox:\<lane\>:\<actionId\> operations to external services. |

> * **Transactional Timer Management:** Timers are reconciled declaratively during state transitions, using the transaction handle to clear obsolete deadlines and arm new alarms in the same atomic commit that updates the state.  
> * **Zero Ghost Alarms:** When a worker finishes rendering and submits BROKER\_COMPLETE, the choke point cancels the active watchdog timer within the completion transaction. This prevents race conditions where a delayed alarm fires immediately after a successful render and revokes a valid completion.  
> * **Autonomous Hardware Recovery:** If Rig 2 drops its connection, crashes, or suffers a power loss mid-render, no external monitoring service is required. When the 30-second storage alarm expires, the hypervisor wakes the ShotCoordinatorDO isolate and triggers its alarm() handler. The actor enters the choke point, bumps the fencing epoch to isolate the dead node, increments the retry counter, and either returns the shot to the FIFO queue or diverts it to the Dead-Letter Queue (dlq:\${jobId}).

## **2\. The Persistent Outbound Tunnel Topology**

Rig 2 hosts headless ComfyUI on local port 8188 to process native GGUF text passes, speech synthesis, and heavy temporal diffusion (Wan 2.2). Connecting remote client cockpits directly to physical workstations over public IP addresses introduces critical security, stability, and concurrency vulnerabilities.

`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: LOCAL FOUNDRY GPU                                                               │`  
`│                                                                                        │`  
`│  [ Headless ComfyUI (:8188) ]                                                          │`  
`│         ▲                                                                              │`  
`│         │ (127.0.0.1 HTTP / WebSocket Loopback)                                        │`  
`│         ▼                                                                              │`  
`│  [ media-broker daemon (:3000) ]                                                       │`  
`│         │                                                                              │`  
`│         │ (Encrypted Outbound Pipe)                                                    │`  
`│         ▼                                                                              │`  
`│  [ cloudflared daemon ]                                                                │`  
`│         │                                                                              │`  
`│         │ (Outbound Encrypted Tunnel - Zero Inbound Firewall Ports Open)               │`  
`└─────────┼──────────────────────────────────────────────────────────────────────────────┘`  
          `│`  
          `│ WAN (Outbound Anycast Mesh)`  
          `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE ZERO TRUST GATEWAY                                                          │`  
`│  • Edge Anycast Perimeter                                                              │`  
`│  • Service Token & mTLS Inspection                                                     │`  
`└─────────┬──────────────────────────────────────────────────────────────────────────────┘`  
          `│`  
          `▼`  
`┌────────────────────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE: edge-director (POD-12: System Middleware)                             │`  
`│                                                                                        │`  
`│  ├── Ingress Gateway Worker (src/index.ts)                                             │`  
`│  │   • Validates JWTs, Clerk Sessions, & Service Tokens (<5ms)                         │`  
`│  │   • Intercepts D1 Continuity Gate (SELECT COUNT(*) ... is_dirty == 0)               │`  
`│  │   • Upgrades HTTP to persistent WebSocket connections                               │`  
`│  │                                                                                     │`  
`│  └── ShotCoordinatorDO (src/ShotCoordinator.ts - Cloudflare Durable Object)            │`  
`│      ├── WebSocket Hibernation API: Holds TCP keep-alive; $0.00 idle compute           │`  
`│      ├── Tagged Socket Map: Sockets partitioned by role ("artist" vs. "broker")        │`  
`│      ├── Hardware Mutex: Serializes GPU execution via single-threaded FIFO queue       │`  
`│      └── Watchdog Engine: 30s heartbeat leases with monotonic epoch fencing tokens     │`  
`└────────────────────────────────────────────────────────────────────────────────────────┘`

### **1\. Zero-Trust Ingress & The Inside-Out Network Topology**

Exposing physical workstations directly to the public web creates three severe failure modes:

> 1. **Unauthenticated Remote Execution (RCE):** Exposing ComfyUI’s raw API port (:8188) to the public internet presents a severe security risk, as custom nodes can execute arbitrary Python commands and shell scripts on the host OS.  
> 2. **GPU Memory Collisions:** Concurrent HTTP POST /prompt calls issued by two artists simultaneously attempt to allocate VRAM at the exact same instant, triggering fatal CUDA Out-Of-Memory (OOM) crashes.  
> 3. **Flaky Client Connections:** Mobile clients on Wi-Fi drop TCP connections frequently. A direct socket connected to Rig 2 either halts the render prematurely or loses the returned video plate if the client disconnects mid-generation.

Rig 2 resolves this by enforcing an **inside-out network architecture**:

> * **Zero Inbound Firewall Ports:** Rig 2 opens zero inbound ports on its local router or OS firewall. Local services (ComfyUI on port 8188 and media-broker on port 3000\) bind strictly to 127.0.0.1.  
> * **Outbound cloudflared Tunnel:** The workstation runs a local Cloudflare Tunnel daemon (cloudflared) that establishes an encrypted, persistent outbound-only connection to Cloudflare’s global Anycast edge network.  
> * **Service Token Authentication:** All traffic routed down the tunnel requires Cloudflare Access Service Tokens (CF-Access-Client-Id and CF-Access-Client-Secret), isolating the physical compute hardware from the public internet.

### **2\. Bidirectional Multiplexing & Role-Tagged Sockets**

The edge-director multiplexes traffic across disparate clients through role-based WebSocket connections:

> * **URL Ingress Routing:**  
  * **Rig 2 Foundry Spoke:** Connects upward to the internal endpoint (wss://director.internal.studio.net/ws?role=broker) authenticated via mTLS or Cloudflare Access Service Tokens.  
  * **Remote Artist Cockpits (Rig 1):** Connect to the public endpoint (wss://director.studio.net/ws?role=artist) authenticated via Clerk session JWTs or signed developer tokens.  
> * **Sub-5ms Stateless Handshake:** The stateless Hono worker (EdgeGateway in src/index.ts) validates the cryptographic token, verifies that the target scene is not marked dirty in D1 (is\_dirty \== 0), and immediately forwards the HTTP Upgrade request to the ShotCoordinatorDO actor via env.SHOT\_COORDINATOR.get(id).fetch(c.req.raw). The stateless worker isolate terminates immediately.  
> * **Tagged Socket Attachment:** The ShotCoordinatorDO accepts the connection using Cloudflare's WebSocket Hibernation API, tagging the socket with its role:  
>   `this.ctx.acceptWebSocket(webSocket, [role]); // role is "artist" or "broker"`

> * **Isolated Broadcast Channels:** When the coordinator broadcasts progress or state updates, it isolates recipients using this.ctx.getWebSockets("artist") or this.ctx.getWebSockets("broker"), ensuring hardware telemetry reaches client viewports without exposing internal broker communication to artists.

### **3\. Telemetry Normalization & Bridge Mechanics**

Rig 2's local media-broker daemon acts as an intelligent bridge between raw ComfyUI execution events and the edge coordinator:

> * **Local Tapping:** media-broker connects locally to ws://127.0.0.1:8188/ws over the loopback interface, listening to ComfyUI's internal event stream.  
> * **Event Normalization:** Raw execution events—such as K-Sampler step increments (progress), model loading stages (executing), and latency timestamps—are translated into a standardized BROKER\_PROGRESS JSON packet:  
>   `{`  
>     `"type": "BROKER_PROGRESS",`  
>     `"taskId": "task_01954b72-3c81-723a-8b1e-9a4f61e2cb01",`  
>     `"epoch": 4,`  
>     `"step": 28,`  
>     `"totalSteps": 50,`  
>     `"percentage": 56,`  
>     `"vramUsedBytes": 19421532160,`  
>     `"currentNode": "KSamplerAdvanced"`  
>   `}`

> * **Tunnel Telemetry Forwarding:** The normalized packet is pushed up the persistent outbound tunnel to the ShotCoordinatorDO. The DO wakes from hibernation in under 2 milliseconds, routes the progress update to the appropriate artist cockpit, and immediately hibernates again.  
> * **Completion Sentinel Interception:** When ComfyUI emits its completion sentinel ({ executing: { node: null } }), media-broker intercepts the signal. It verifies the output .mp4 character plate on the local scratch disk, hashes the file using SHA-256, and begins the upload process to Cloudflare R2.

### **4\. Resilience, Disconnection Handling & Zombie Rejection**

Network partitions across the outbound tunnel are managed through distributed fencing tokens and epoch validation:

`[ edge-director (ShotCoordinatorDO) ]                             [ media-broker (Rig 2) ]`  
        `│                                                                     │`  
        `├──────────── Lease Granted (Epoch: 1) ──────────────────────────────►│ (Starts Render)[cite: 1, 4]`  
        `│                                                                     │`  
        `│   x--- Network Partition (Tunnel Drops Packets for 35s) ---x        │[cite: 1, 4]`  
        `│                                                                     │`  
        `├─ 30s Hardware Alarm Trips                                           │ (Still rendering...)[cite: 1, 4]`  
        `├─ Revokes Lease Epoch 1                                              │[cite: 1, 4]`  
        `├─ Re-queues Job to Rig 2B (Epoch: 2)                                 │[cite: 1, 4]`  
        `│                                                                     │`  
        `│◄─────────── Zombie Uploads Plate (Carrying Epoch 1) ────────────────┤ (Finishes Render)[cite: 1, 4]`  
        `│                                                                     │`  
        `└─── REJECTED VIA FENCING TOKEN ───► [ Drop Write / HTTP 409 ]        │[cite: 1, 4]`

> * **Heartbeat Loss Detection:** Rig 2 must transmit an asynchronous BROKER\_HEARTBEAT every 10 seconds over the tunnel. If a network drop interrupts tunnel traffic for 30 seconds, the ShotCoordinatorDO watchdog alarm (ctx.storage.setAlarm()) fires autonomously at the edge.  
> * **Epoch Invalidation:** The DO revokes the lease, bumps its internal monotonic epoch counter (*N*→*N*\+1), and re-queues the task.  
> * **Zombie Rejection Protocol:** When the network partition heals and the disconnected runner attempts to upload its completed plate using the old epoch token (*N*), the DO inspects the token in an atomic storage block. Because *N*\<*N*\+1, the write is rejected with an HTTP 409 Conflict.  
> * **Content-Addressed Staging Isolation:** Staged objects written to staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4 are never promoted to the canonical manifest. Unindexed files are purged automatically by a 7-day R2 lifecycle retention rule, preventing zombie artifacts from corrupting production storage.

### **5\. Local Inverted Sovereignty (flock) over the Tunnel**

To prevent the edge control plane from becoming a single point of failure for physical rendering hardware, the architecture inverts traditional distributed locking:

> * **Permanent Local flock Ownership:** The media-broker daemon on Rig 2 permanently holds an OS-level file lock (flock) on the GPU hardware interface. The edge DO possesses zero authority to command, lock, or allocate physical GPU resources.  
> * **Passive Request Polling:** The edge DO operates strictly as a passive FIFO queue. media-broker pulls leased jobs down the tunnel *only* when its local hardware lock is released and the graphics card is idle.  
> * **Offline Disk Queue Fallback (/var/spool/renders):** If the outbound Cloudflare tunnel is completely severed, media-broker automatically halts remote polling and reads render manifests from a local spool directory on disk (/var/spool/renders). Production continues using the exact same code path, ensuring that local studio rendering proceeds without depending on external cloud network availability.

---

*User prompt: {{FOCUS: 3\. Reconnection Replay & The Monotonic Log (Edge-Director), 4\. Telemetry Multiplexing & Translation (Edge-Director)}} /extreme-details*

### **Response: 1\. Reconnection Replay & The Monotonic Log**

The edge-director decouples client timeline visualization from network stability. Because generative video sampling runs across extended durations (60–120 seconds per plate), client cockpits on **Rig 1** frequently encounter Wi-Fi drops, sleep cycles, and IP migrations. The ShotCoordinatorDO utilizes transactional NVMe storage (ctx.storage) combined with monotonic sequence stamping to ensure that zero operational events are dropped and disconnected clients can seamlessly fast-forward to canonical truth upon reconnection.

`Artist Client (Rig 1)                                   edge-director (ShotCoordinatorDO)`  
      `│                                                                │`  
      `├── [In-Flight Session Drops / Laptop Closes]                    │`  
      `│   x---------------- WAN Severed ----------------x              │`  
      `│                                                                ├─ ComfyUI renders plate on Rig 2[cite: 1, 7]`  
      `│                                                                ├─ ctx.storage.put("state", SHOT_READY)[cite: 28]`  
      `│                                                                ├─ Generates signed R2 asset URL[cite: 1, 7]`  
      `│                                                                │`  
      `├── [Client Awakens: TCP Reconnects]                             │`  
      `├────── WSS Handshake (Signed JWT) ─────────────────────────────►│[cite: 1, 4]`  
      `│                                                                ├─ ctx.acceptWebSocket(ws, ["artist"])[cite: 1, 4]`  
      `├────── system.resyncRequest { artistId, last_seen_seq: 41 } ───►│[cite: 28]`  
      `│                                                                │`  
      `│                                                                ├─ Evaluates Monotonic Ledger[cite: 28]`  
      `│                                                                ├─ Detects Terminal State reached[cite: 1, 7]`  
      `│                                                                ├─ Suppresses granular 42..89 ticks[cite: 1]`  
      `│◄───── SHOT_READY { seq: 90, r2_url: "https://..." } ───────────┤[cite: 1, 7]`  
      `│                                                                │`  
      `├─ Remotion Viewport mounts video plate at target frame ─────────┤[cite: 1]`

#### **Monotonic Sequence Auditing & Identity**

Every message envelope broadcast from the ShotCoordinatorDO down to an artist socket is stamped with an integer sequence number (seq):

seq(*ei*​)\<seq(*ei*\+1​)∀*i*∈N

> * **Sequence Increment Discipline:** The sequence counter is backed by an atomic integer in NVMe storage (ctx.storage.get("last\_seq")). The DO increments this value on each state delta and telemetry broadcast before pushing bytes to the network.  
> * **Gap Detection:** The client SDK maintains an internal register of the highest received sequence integer (highestSeqReceived). If a packet arrives with a numerical gap (for instance, jumping from seq: 41 directly to seq: 44), the client flags an out-of-order delivery or network drop and dispatches an immediate system.resyncRequest containing last\_seen\_seq: 41\.  
> * **Rejection of Strict Gapless Enforcement on Wire:** The transport protocol requires deterministic ordering, but avoids blocking the client thread if a single intermediate progress tick is skipped. However, state transitions (e.g., QUEUED → PROCESSING → COMPLETED) are strictly non-skippable.

`export interface ServerEnvelope<T = unknown> {`  
  `readonly seq: number;`  
  `readonly traceId: string;`  
  `readonly eventType: "BROKER_PROGRESS" | "SHOT_READY" | "HEARTBEAT_ACK" | "CIRCUIT_BREAKER_TRIPPED";`  
  `readonly timestamp: number;`  
  `readonly payload: T;`  
`}`

`export interface ResyncRequestPayload {`  
  `readonly type: "system.resyncRequest";`  
  `readonly artistId: string;`  
  `readonly taskId: string;`  
  `readonly lastSeenSeq: number;`  
`}`

#### **The Resync Handshake & Delta Snapshot Replay**

When an artist reopens their laptop lid, the client socket executes a session recovery sequence:

> 1. **Transport Connection:** The client opens an upgraded WebSocket to wss://director.studio.net/ws?role=artist.  
> 2. **Handshake Payload:** The client immediately transmits a system.resyncRequest containing its artistId, active taskId, and lastSeenSeq.  
> 3. **Storage Ledger Interrogation:** The ShotCoordinatorDO receives the resync frame, suspends inbound message processing using this.ctx.blockConcurrencyWhile(...), and interrogates its transactional NVMe storage:  
   * *If the task is still sampling:* The DO retrieves all queued events where seq\>lastSeenSeq and replays the latest pipeline state snapshot.  
   * *If the task completed while offline:* The DO does not re-emit hundreds of obsolete KSampler step increments. It extracts the finalized completion record from ctx.storage and delivers a single SHOT\_READY envelope containing the signed Cloudflare R2 asset link, the SHA-256 plate hash, and the final monotonic sequence ID.  
> 4. **Zero-Intervention Viewport Snapping:** The artist's local Remotion timeline engine on Rig 1 receives the SHOT\_READY message, updates its \<Sequence\> components, and mounts the new MP4 proxy asset at the precise frame boundary without requiring manual timeline scrubbing or browser reloads.

#### **Application-Layer Keep-Alives & The Coma State**

Because standard web browser environments do not expose raw TCP keep-alives or protocol-level WebSocket ping/pong frames to the JavaScript execution layer, network dropouts on client machines can silently hang open sockets for minutes. The edge-director enforces its own heartbeat protocol at the application layer:

> * **The 2-Second Heartbeat Pulse:** The edge DO continuously broadcasts an application-level system.ping frame every 2,000 ms, carrying the authoritative serverTime timestamp. The client responds immediately with system.pong.  
> * **The Coma State Trigger:** The client's socket manager maintains an active lastMessageAt timestamp. If three consecutive pings are missed (6 seconds of silence) or if Date.now() \- this.lastMessageAt exceeds 20 seconds, the client SDK marks the socket dead.  
> * **Visual Degradation:** The UI shifts into the **Coma State**:  
  * The Remotion playback canvas freezes on its last known good frame.  
  * Timeline controls and rendering buttons are greyed out to prevent conflicting dispatches.  
  * A status badge displays "Reconnecting to Edge Gateway...".  
> * **Application Close Codes:** The edge DO utilizes reserved custom close codes in the 4000–4999 range to communicate disconnection causes:  
  * 4001: LEASE\_EXPIRED / SESSION\_TAKEOVER (Active session hijacked by a newer client tab or lease lost).  
  * 4002: KILLED\_BY\_ADMIN (Manual abort or master kill-switch flipped).  
  * 4003: IDEMPOTENCY\_COLLISION (Task rejected due to concurrent conflicting fingerprint).

#### **Deterministic Reconnection Jitter**

When a regional network point-of-presence drops and recovers, hundreds of client workstations reconnect simultaneously. To prevent this thundering-herd ingress wave from overloading the edge-director Worker and database pools, client SDKs implement exponential backoff with deterministic jitter:

Δ*t*retry​\=min(*t*base​×2attempt,*t*max​)\+rand(100 ms,5000 ms)  
`export class EdgeChannelSocket {`  
  `private backoffMs = 500;`  
  `private readonly maxBackoffMs = 15000;`  
  `private reconnectAttempt = 0;`

  `public scheduleReconnect(connectFn: () => void): void {`  
    `const jitter = Math.floor(Math.random() * 4900) + 100; // 100ms to 5000ms`  
    `const delay = Math.min(this.backoffMs * Math.pow(2, this.reconnectAttempt), this.maxBackoffMs) + jitter;`  
      
    `this.reconnectAttempt++;`  
    `setTimeout(() => {`  
      `connectFn();`  
    `}, delay);`  
  `}`  
`}`

#### **Clock-Offset Synchronization for Optical Playback**

To ensure that distributed editors, showrunners, and animators viewing a live stream or scrubbed timeline see the exact same optical video frame, the client continuously syncs its local clock with the edge:

`Local Client Clock (Date.now())                     Edge Coordinator Master Clock (serverTime)`  
        `│                                                                │`  
        `├────── system.ping (T0: Client Send) ──────────────────────────►│`  
        `│                                                                ├─ Records serverTime (T1)`  
        `│◄───── system.pong { serverTime: T1 } (T2: Client Recv) ────────┤`  
        `│                                                                │`  
        `├─ Round-Trip Time: RTT = T2 - T0                                │`  
        `├─ Offset: clockOffsetMs = T1 - (T0 + RTT / 2)                   │`  
        `▼                                                                ▼`

clockOffsetMs=serverTime−(*T*0​\+2RTT​)

When an artist tracks active live generation or multi-user review sessions, Remotion player head positions are computed deterministically against this offset:

elapsedMs=(Date.now()+clockOffsetMs)−sceneStartTime  
timelineFrame=⌊(1000elapsedMs​)×24⌋

The video element's playback head snaps to the calculated offset, ensuring sub-frame alignment across distributed client nodes.

### **2\. Telemetry Multiplexing & Translation**

The edge-director serves as an intelligent, protocol-translating telemetry bridge between low-level GPU node execution (**Rig 2**) and high-level animation timelines (**Rig 1**).

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: LOCAL FOUNDRY GPU (ComfyUI :8188)                               │`  
`│ • Emits raw WebSocket stream on ws://127.0.0.1:8188/ws                 │`  
`│ • Events: "executing" { node: "37" }, "progress" { value: 12, max: 50 }│`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Loopback Interception (:8188/ws)[cite: 16]`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: media-broker DAEMON (Node.js)                                   │`  
`│ • Maps Node IDs to semantic pipeline stages (KSampler, VAE, LoRA)      │`  
`│ • Aggregates total steps and calculates overall task percentage        │`  
`│ • Compiles normalized BROKER_PROGRESS payload                          │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ Outbound cloudflared Tunnel (WSS)[cite: 1, 4]`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ CLOUDFLARE EDGE: edge-director (ShotCoordinatorDO)                     │`  
`│                                                                        │`  
`│ • Wakes DO from Hibernation via Anycast (<2ms latency)                 │`  
`│ • Records latest telemetry progress to NVMe ctx.storage                │`  
`│ • Stamps envelope with monotonic sequence ID (seq: N + 1)              │`  
`│ • Multiplexes payload strictly across tagged sockets:                  │`  
`│   this.ctx.getWebSockets("artist")                                     │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│ WSS Broadcast[cite: 1, 4]`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 1: THE CONDUCTOR / ASTRO COCKPIT                                   │`  
`│ • Receives normalized BROKER_PROGRESS envelope                         │`  
`│ • Updates UI progress bar, VRAM meters, and Remotion scene cache       │`  
`└────────────────────────────────────────────────────────────────────────┘`

#### **ComfyUI Loopback Tapping & Event Normalization**

On Rig 2, media-broker maintains a persistent local loopback connection to ws://127.0.0.1:8188/ws. It consumes ComfyUI’s raw event stream and normalizes it into a vendor-agnostic pipeline schema before network egress:

| ComfyUI Native Event | Payload Characteristics | Translated edge-director Output |
| :---- | :---- | :---- |
| execution\_start | { prompt\_id: UUID } | TASK\_INITIALIZED |
| executing (node \!== null) | { node: "37", prompt\_id: UUID } | BROKER\_STAGE\_CHANGE (Stage: DIFFUSION\_SAMPLING) |
| progress | { value: 25, max: 50, prompt\_id: UUID } | BROKER\_PROGRESS (Percentage: 50%) |
| executing (node \=== null) | { node: null, prompt\_id: UUID } | TASK\_EXECUTION\_COMPLETE (Triggers R2 upload) |
| execution\_error | { exception\_type: "CUDA OOM", ... } | BROKER\_FAILURE (Trips Circuit Breaker) |

`// packages/types/src/telemetry.ts`  
`export interface BrokerProgressPayload {`  
  `readonly type: "BROKER_PROGRESS";`  
  `readonly taskId: string;`  
  `readonly traceId: string;`  
  `readonly epoch: number;`  
  `readonly step: number;`  
  `readonly totalSteps: number;`  
  `readonly percentage: number;`  
  `readonly currentNodeId: string;`  
  `readonly stage: "LOAD_WEIGHTS" | "SAMPLING_LATENTS" | "VAE_DECODE" | "COLOR_CONFORM";`  
  `readonly vramUsedBytes: number;`  
  `readonly vramTotalBytes: number;`  
`}`

> * **Step Smoothing:** ComfyUI fires progress events on every sampling step. For a 50-step diffusion pass across 4 sampling nodes, raw socket spam can degrade WAN performance. media-broker smooths updates by throttling emissions to a maximum rate of 10 Hz (every 100 ms) or on integral percentage changes (Δ%≥1%), reducing network overhead without sacrificing visual responsiveness.  
> * **VRAM Health Monitoring:** Each progress tick samples Nvidia Management Library (NVML) metrics via the local host daemon, tracking vramUsedBytes and vramTotalBytes. If allocation exceeds 92% of hardware capacity during sampling, an early memory warning flag is embedded into the telemetry frame.

#### **Tagged Socket Partitioning & Broadcast Isolation**

When incoming connections pass through the Hono gateway (EdgeGateway in src/index.ts), they are tagged by role during WebSocket upgrade acceptance:

`// apps/director/src/ShotCoordinator.ts`  
`export class ShotCoordinatorDO implements DurableObject {`  
  `constructor(private ctx: DurableObjectState, private env: Env) {}`

  `async fetch(request: Request): Promise<Response> {`  
    `const url = new URL(request.url);`  
    `const role = url.searchParams.get("role"); // "artist" | "broker"`

    `if (role !== "artist" && role !== "broker") {`  
      `return new Response("Invalid socket role", { status: 400 });`  
    `}`

    `const pair = new WebSocketPair();`  
    `const [client, server] = Object.values(pair);`

    `// Accept with Cloudflare Hibernation API and attach role tag`  
    `this.ctx.acceptWebSocket(server, [role]);`

    `return new Response(null, { status: 101, webSocket: client });`  
  `}`

  `async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {`  
    `const data = JSON.parse(message.toString());`

    `if (data.type === "BROKER_PROGRESS") {`  
      `// 1. Transactionally persist latest progress for resync replay`  
      `await this.ctx.storage.put("latest_progress", data);`

      `// 2. Broadcast strictly to artist sockets, isolating broker nodes`  
      `const artistSockets = this.ctx.getWebSockets("artist");`  
      `const envelope: ServerEnvelope = {`  
        `seq: await this.getNextSeq(),`  
        `traceId: data.traceId,`  
        `eventType: "BROKER_PROGRESS",`  
        `timestamp: Date.now(),`  
        `payload: data,`  
      `};`

      `const serialized = JSON.stringify(envelope);`  
      `for (const socket of artistSockets) {`  
        `socket.send(serialized);`  
      `}`  
    `}`  
  `}`  
`}`

> * **Role Isolation:** Client cockpits never receive raw broker control frames or heartbeats, and GPU rendering spoke nodes never receive artist UI clickstreams.  
> * **Scale-to-Zero Hibernation:** The ShotCoordinatorDO isolate remains sleeping during intermediate rendering passes. It wakes up in \<2 ms only when incoming bytes strike the Cloudflare edge proxy, relays the message to active artist sockets, and immediately hibernates again.

#### **Trace Context Propagation Architecture**

To enable root-cause diagnosis of failures across disparate environments (Edge Worker, Node.js Conductor, PyTorch GPU container, Remotion renderer), the system propagates a unified trace\_id:

`[ Rig 1: The Conductor ] ──► Compiles Scene AST & Generates trace_id: "tr_8f1b2c4a9e"[cite: 4, 7]`  
           `│`  
           `├── Header: X-Trace-Id: "tr_8f1b2c4a9e" ──► edge-director Ingress[cite: 4, 7]`  
           `│                                                  │`  
           `│                                                  ├── WebSocket Tag: { trace_id: "tr_8f1b2c4a9e" }[cite: 4, 7]`  
           `│                                                  │`  
           `▼                                                  ▼`  
`[ Rig 2: media-broker ] ◄─────────────────────────────────────┘`  
  `├── Injects prompt_id tag: "tr_8f1b2c4a9e" into ComfyUI graph[cite: 4, 7]`  
  `├── Appends x-amz-meta-trace-id: "tr_8f1b2c4a9e" on R2 Upload[cite: 4, 7]`  
  `└── Emits log line: {"trace_id":"tr_8f1b2c4a9e","event":"SAMPLING_COMPLETE"}[cite: 4, 7]`

> * **Header Injection:** The trace\_id (e.g., tr\_8f1b2c4a9e) is instantiated at scene compilation time on Rig 1 and forwarded via HTTP headers (X-Trace-Id) and WebSocket initial handshakes.  
> * **ComfyUI Workflow Metadata:** media-broker embeds the trace\_id into the ComfyUI workflow JSON under an isolated metadata node ("extra\_pnginfo": { "trace\_id": "..." }).  
> * **Cloudflare R2 Object Metadata:** When the completed .mp4 plate is uploaded to Cloudflare R2, the S3 upload client sets metadata headers (x-amz-meta-trace-id: tr\_8f1b2c4a9e, x-amz-meta-epoch: 4).  
> * **Unified Postmortem Correlation:** If an out-of-memory crash, watchdog timeout, or perceptual QA failure occurs, operators query the single trace\_id across Cloudflare Logpush, local systemd logs on Rig 2, and Remotion CLI outputs to pinpoint the exact failure boundary.

#### **Egress Sentinel Interception & Final Handoff**

The termination of a video render follows an explicit egress protocol:

`Rig 2 (media-broker)                 Cloudflare R2 Bucket          edge-director DO`  
      `│                                       │                           │`  
      `├─ ComfyUI emits: { node: null }[cite: 16]     │                           │`  
      `├─ Validates MP4 on scratch disk[cite: 16]     │                           │`  
      `├─ Computes SHA-256 Digest[cite: 16]           │                           │`  
      `│                                       │                           │`  
      `├─ Streams MP4 to Staging Key ─────────►│                           │[cite: 16]`  
      `│  staging/.../epoch_4_a8f5b.mp4        │                           │`  
      `│                                       │                           │`  
      `├─ RPC: POST /tasks/complete ──────────────────────────────────────►│[cite: 1, 16]`  
      `│  { taskId, epoch: 4, sha256, key }    │                           ├─ Asserts active Epoch == 4[cite: 1]`  
      `│                                       │                           ├─ Promotes staging to canonical[cite: 1]`  
      `│                                       │                           ├─ Releases Hardware Mutex[cite: 1]`  
      `│                                       │                           │`  
      `│◄───── HTTP 200 OK ────────────────────────────────────────────────┤[cite: 1]`  
      `│                                       │                           │`  
      `│                                       │                           ├─ Broadcasts to Artists:[cite: 1]`  
      `│                                       │                           │  SHOT_READY { seq: 114, url }[cite: 1]`

> 1. **Completion Sentinel Detection:** When ComfyUI finishes the final node in its execution graph, it broadcasts { "executing": { "node": null } } over its local WebSocket.  
> 2. **Artifact Verification:** media-broker intercepts this sentinel. Before contacting the edge, it executes an asynchronous validation check on the local scratch disk:  
   * Asserts file size is greater than zero and does not match the empty-file SHA-256 sentinel constant:  
     SHA-256(∅)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  
   * Executes an internal ffprobe call to verify that container moov atoms are complete and video stream durations match the target frame count.  
> 3. **Content-Addressed Staging Upload:** media-broker uploads the file to Cloudflare R2 under an epoch-scoped key: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4.  
> 4. **Completion RPC & Promotion Gate:** media-broker issues an authenticated completion RPC down the tunnel to ShotCoordinatorDO (POST /tasks/complete).  
> 5. **Epoch Validation & Lock Release:** The DO validates the epoch token inside an atomic storage block. If valid, it commits the asset pointer to the canonical manifest, releases the hardware mutex to unblock the next queued shot, and broadcasts a SHOT\_READY envelope containing the signed R2 asset URL to all connected artist sockets.

---

*User prompt: {{FOCUS: 3\. Proactive Watchdog Alarms (Edge-Director), 4\. Monotonic Epochs and Fencing Tokens (Edge-Director) /extreme-details*

### **Response: 1\. Proactive Watchdog Alarms (ctx.storage.setAlarm)**

#### **The Reactive Detection Anti-Pattern vs. Edge Storage Alarms**

Relying on incoming client HTTP requests or subsequent polling pulses to detect a dead worker is a dangerous distributed anti-pattern. If Rig 2 crashes, suffers a local kernel panic, or experiences a sudden hardware power cut, no inbound request will ever arrive to notify the edge control plane. In a naive reactive system, the execution lease remains stranded indefinitely, blocking downstream production queues and leaving client cockpits hanging in unverified states.

The edge-director resolves this by establishing proactive, hardware-level deadlines inside the ShotCoordinatorDO via Cloudflare’s ctx.storage.setAlarm() API. Rather than passively waiting for failure notifications, the Durable Object arms an autonomous timer at the edge hypervisor level that triggers intervention unless actively suppressed by healthy hardware telemetry.

               `PROACTIVE WATCHDOG STORAGE ALARM TIMELINE`  
   
 `T = 0s         Lease Granted (Epoch N). DO sets alarm: now + 30,000ms[cite: 1, 2, 8]`  
                `Rig 2 begins diffusion sampling pass[cite: 1, 10].`  
                  `│`  
 `T = 10s        Rig 2 emits Heartbeat #1. DO resets alarm: now + 30,000ms[cite: 1, 8, 10].`  
                  `│`  
 `T = 20s        Rig 2 emits Heartbeat #2. DO resets alarm: now + 30,000ms[cite: 1, 8, 10].`  
                  `│`  
 `T = 25s        x─── WAN Partition / Rig 2 Crash (Tunnel Drops) ───x[cite: 1, 8]`  
                  `│`  
 `T = 30s        Heartbeat #3 MISSED (Silence: 10s)[cite: 1, 8].`  
 `T = 40s        Heartbeat #4 MISSED (Silence: 20s)[cite: 1, 8].`  
 `T = 50s        Heartbeat #5 MISSED (Silence: 30s elapsed since T = 20s)[cite: 1, 8].`  
                  `│`  
                `▼`  
         `[ STORAGE ALARM FIRES AUTONOMOUSLY AT CLOUDFLARE EDGE ][cite: 1, 8]`  
         `• Wakes ShotCoordinatorDO isolate in <2ms[cite: 1, 22].`  
         `• Evaluates active lease state from NVMe storage[cite: 1, 8, 10].`  
         `• Revokes lease; advances monotonic epoch (N -> N+1)[cite: 1, 2, 8].`  
         `• Evaluates attempt_count vs maxAttempts (2)[cite: 1, 10].`  
         `• Re-queues task OR isolates to dlq:${jobId}[cite: 1, 10].`

#### **The 30-Second Rolling Window & The 10-Second Heartbeat Pulse**

The pipeline bans static, hard-coded execution timeouts (e.g., a rigid 180-second TTL). Arbitrary timeouts introduce an irreconcilable operational trade-off: short limits abort complex, legitimate 120-frame video passes mid-generation, while long limits stall production for several minutes when a worker crashes.

> * **The Authoritative Window:** The ShotCoordinatorDO issues dynamic execution leases bounded by a strict 30-second rolling window.  
> * **The Telemetry Pulse:** The media-broker daemon on Rig 2 must transmit an HTTP POST /heartbeat or a WebSocket BROKER\_HEARTBEAT payload every 10 seconds.  
> * **Dynamic Extension:** Each valid heartbeat received before deadline expiration pushes the Durable Object’s storage alarm forward by 30 seconds (this.ctx.storage.setAlarm(Date.now() \+ 30000)). As long as the physical machine continues pulsing healthy hardware telemetry, complex multi-minute diffusion jobs proceed without arbitrary aborts.

#### **Thread Isolation on Rig 2**

The 10-second heartbeat loop on Rig 2 must run inside an independent Web Worker or decoupled background process, completely isolated from the main Node.js event loop and PyTorch execution runtime.

If the primary process blocks its event loop while performing synchronous disk I/O, parsing multi-megabyte AST JSON files, or computing SHA-256 digests over a 2 GB output video plate, an un-isolated timer will stall. This stall prevents outbound heartbeats from dispatching, causing the edge DO's watchdog alarm to fire prematurely and declare a healthy, working foundry dead. Decoupling the heartbeat timer to a background thread ensures that only genuine host crashes, network partitions, or CUDA lockups trip the alarm.

#### **The 15-Minute Absolute Execution Ceiling**

To prevent runaway loops from monopolizing hardware, the ShotCoordinatorDO enforces an absolute execution ceiling of 15 minutes (900,000 ms).

If an anomalous PyTorch subroutine enters an infinite latent sampling loop or a CUDA kernel hangs while continuing to pulse heartbeats from its isolated worker thread, the 15-minute cap takes precedence. When the absolute timer elapses, the DO overrides all active heartbeat extensions, immediately revokes the lease, fences out the worker, and terminates the execution slot.

#### **Alarm Execution Trace (alarm()) & Choke Point Invariants**

When 30 seconds elapse without a valid heartbeat, the Cloudflare hypervisor autonomously wakes the ShotCoordinatorDO isolate and triggers its alarm() method:

`// apps/director/src/ShotCoordinator.ts`  
`export class ShotCoordinatorDO implements DurableObject {`  
  `constructor(private ctx: DurableObjectState, private env: Env) {}`

  `async alarm(): Promise<void> {`  
    `// 1. Transactionally read active lease and FSM context`  
    `const lease = await this.ctx.storage.get<ExecutionLease>("active_lease");`  
    `if (!lease || lease.status !== "RUNNING") {`  
      `return; // No active job in flight; clear alarm`  
    `}`

    `// 2. Route exit through the unified state choke point`  
    `await this.applyTransition({`  
      `type: "WATCHDOG_EXPIRE",`  
      `actor: "SYSTEM",`  
      `payload: {`  
        `reason: "HEARTBEAT_TIMEOUT_30S",`  
        `lastHeartbeatAt: lease.lastHeartbeatAt,`  
        `expiredEpoch: lease.currentEpoch`  
      `}`  
    `});`  
  `}`  
`}`

The WATCHDOG\_EXPIRE event passes through the unified transactional choke point (applyTransition / leaveStateChokePoint):

> 1. **Atomic Storage Transaction:** Opens a single-turn transactional block in ctx.storage.  
> 2. **Epoch Increment:** Automatically bumps the monotonic epoch counter (*N*→*N*\+1), instantly revoking write authority for the stalled runner.  
> 3. **Attempt Tracking:** Increments the task's attempt\_count integer.  
> 4. **Outbox Action Enqueue:** Enqueues an asynchronous notification into outbox:PROJECTION: to update Cloudflare D1, and dispatches a disconnect alert to all connected artist WebSocket clients.

#### **DLQ Routing & Failure Triage (Transient vs. Deterministic)**

The watchdog does not blindly retry every failed task indefinitely, as doing so traps the foundry in infinite restart loops. It categorizes lease expirations using strict failure triage:

Transient Infrastructure Failurevs.Deterministic Poison Task  
                         `[ WATCHDOG ALARM TRIPPED ]`  
                                     `│`  
                                     `▼`  
                `Inspect attempt_count against maxAttempts (2)[cite: 1, 10]`  
                                     `│`  
                     `┌───────────────┴───────────────┐`  
                     `▼                               ▼`  
        `[ attempt_count < 2 ]               [ attempt_count >= 2 ][cite: 1, 10]`  
        `(Transient Worker Crash)            (Deterministic Poison Task)[cite: 10]`  
                     `│                               │`  
                     `▼                               ▼`  
       `• Increment attempt_count           • Transition task to 'DLQ'[cite: 10]`  
       `• Bump Epoch (N -> N+1)             • Commit to dlq:${jobId}[cite: 10]`  
       `• Requeue in FIFO Mutex Array       • Freeze execution lease[cite: 10]`  
       `• Available for next healthy node   • Dispatch Dossier to Cockpit[cite: 10]`

> * **Transient Failures (attempt\_count \< 2):** Caused by brief network blips, host OS spot evictions, or transient power interruptions. The task is returned to the FIFO queue to be picked up by the next available worker with a new lease and a clean epoch (*N*\+1).  
> * **Deterministic Poison Tasks (attempt\_count \>= 2):** Caused by corrupted input parameters (e.g., non-compliant latent dimensions triggering PyTorch assertion errors) that predictably crash any GPU. The circuit breaker trips, evicting the task from the active queue and quarantining it under dlq:\${jobId}.  
> * **Showrunner Diagnostic Dossier:** The Astro Cockpit surfaces the dead-lettered job directly to the Showrunner. The dossier includes the task specification, the last recorded heartbeat timestamp, container metrics, and the structured Error Trajectory Vector (*E*\=⟨Domain,TargetEntity,RuleID,OffendingTokens⟩). Human operators can adjust frame budgets, override prompts, or purge the job without risking automated queue stalls.

### **2\. Monotonic Epochs and Fencing Tokens**

#### **The Split-Brain Zombie Runner Hazard**

When coordinating remote GPU workloads across distributed tunnels, network partitions introduce the **Split-Brain Zombie Runner Problem**:

`[ edge-director (DO) ]                                            [ media-broker (Rig 2) ]`  
        `│                                                                     │`  
        `├──────────── Lease Granted (Epoch: 1) ──────────────────────────────►│ (Starts Render)[cite: 1, 10]`  
        `│                                                                     │`  
        `│   x--- Network Partition (Tunnel Drops Packets for 35s) ---x        │[cite: 1, 8, 10]`  
        `│                                                                     │`  
        `├─ 30s Storage Alarm Trips[cite: 1, 8, 10]                           │ (Still rendering...)[cite: 1, 10]`  
        `├─ Revokes Lease Epoch 1[cite: 1, 8, 10]                             │`  
        `├─ Re-queues Job to Alternate Node (Epoch: 2)[cite: 1, 8, 10]        │`  
        `│                                                                     │`  
        `│◄─────────── Zombie Uploads Plate (Carrying Epoch 1) ────────────────┤ (Finishes Render)[cite: 1, 10]`  
        `│                                                                     │`  
        `└─── REJECTED VIA FENCING TOKEN ───► [ Drop Write / HTTP 409 ]        │[cite: 1, 2, 8, 10]`

If Rig 2’s tunnel drops packets for 35 seconds, the edge watchdog alarm trips, revokes the lease, and reassigns the shot to an alternate worker under a new epoch. However, Rig 2’s physical GPU is unaware of the network timeout and continues processing the diffusion graph in local memory. When the partition heals, Rig 2 (now an asynchronous "zombie") attempts to push its output.

Without strict epoch fencing, this zombie runner will overwrite canonical video plates generated by the replacement worker, corrupting episode manifests and desynchronizing continuity.

#### **Monotonic Token Generation (*N*→*N*\+1)**

To prevent out-of-order writes, the ShotCoordinatorDO acts as the single source of temporal truth, managing an integer sequence of monotonic epochs:

> * **Sequential Epoch Progression:** The epoch counter begins at initialization and advances strictly monotonically (*N*→*N*\+1).  
> * **Token Issuance:** When a worker claims a lease via POST /tasks/claim or a WebSocket dispatch, the DO increments currentEpoch in NVMe storage and issues that integer as the worker's fencingToken.  
> * **Binding:** The worker must include this exact token in all subsequent heartbeats, progress packets, and completion requests.  
> * **Monotonic Non-Repudiation:** Because each lease grant or revocation advances the counter, no two active workers can hold the same epoch for a given task.

#### **The Promotion Boundary vs. Transport Boundary**

Object storage backends such as Cloudflare R2 and AWS S3 do not natively evaluate custom application tokens during raw PUT operations. Any client holding valid pre-signed credentials can write raw bytes to an object key.

The edge-director resolves this by decoupling raw byte storage from canonical truth, enforcing fencing structurally at the **promotion boundary** rather than the transport boundary:

`[ Worker (Rig 2) ]                                     [ Cloudflare R2 ]                     [ ShotCoordinatorDO ]`  
        `│                                                      │                                       │`  
        `├────── 1. Raw Byte Write (PUT) ──────────────────────►│                                       │[cite: 1, 8, 11]`  
        `│       staging/renders/.../epoch_1_a8f5b.mp4          │                                       │[cite: 1, 8, 11]`  
        `│                                                      │                                       │`  
        `├────── 2. Completion RPC: POST /tasks/complete { epoch: 1 } ─────────────────────────────────►│[cite: 1, 8, 11]`  
        `│                                                      │                                       ├─ Evaluates Epoch in ctx.storage[cite: 1, 8, 11]`  
        `│                                                      │                                       │  (Current Epoch == 2)[cite: 1, 8, 10]`  
        `│◄───── 3. Rejection Response: HTTP 409 Conflict ──────────────────────────────────────────────┤[cite: 1, 2, 8, 10]`  
        `│                                                      │                                       │`  
        `│                                                      │◄── 4. Lifecycle Rule Purges ──────────┤[cite: 1, 8, 11]`  
        `│                                                      │      (Never Promoted to Manifest)     │[cite: 1, 8, 11]`

> 1. **Epoch-Scoped Staging Uploads:** The worker uploads raw video plates exclusively to an isolated, epoch-scoped, content-addressed staging path:  
>    `staging/renders/${taskId}/epoch_${epoch}_${sha256}.mp4`

Because the file path includes both the epoch and the SHA-256 digest, writes from competing workers never collide or overwrite existing files in storage. 2\. **The Completion RPC Gate:** After the upload completes, the worker sends a completion sentinel (POST /tasks/complete) to the ShotCoordinatorDO, presenting its assigned epoch token along with the staging path and content hash. 3\. **Atomic Epoch Evaluation:** The single-threaded DO intercepts the request and verifies the token against the active lease in ctx.storage:

> * *Epoch Matches (Npresented​\==Ncurrent​):* The lease is valid. The DO atomically writes the staging path into the canonical episode manifest, unlocks the hardware mutex, and returns HTTP 200 OK.  
> * *Epoch Stale (Npresented​\<Ncurrent​):* A timeout or manual cancellation occurred, and the lease was revoked. The DO immediately rejects the request with an **HTTP 409 Conflict**.  
> 4. **Garbage Collection of Zombie Bytes:** Staged files that fail promotion are never indexed in episode manifests. They remain unreferenced in R2 and are automatically purged by a 7-day bucket lifecycle retention rule. A partitioned zombie worker can write unindexed bytes to object storage, but it is structurally incapable of promoting those bytes into canonical production truth.

#### **Idempotent Completion RPC Safety**

Network blips can occur immediately after a successful render promotion, causing the worker’s client to retry its completion call.

To prevent retried requests from triggering false HTTP 409 Conflict errors, the completion RPC is strictly idempotent. When the DO successfully promotes a task to COMPLETED, it persists the final receipt and content hash in ctx.storage. If a retried POST /tasks/complete arrives carrying the same epoch and task ID, the DO detects the completed state and re-returns HTTP 200 OK with the signed R2 URL, avoiding duplicate state mutations or spurious error alerts.

#### **Selective Epoch Fencing in the State Choke Point**

State transitions within the ShotCoordinatorDO are governed by an authoritative Finite State Machine (FSM) executed inside applyTransition(). Epoch advancement is applied selectively based on whether an exit event is *revoking* or *promoting*:

`// Selective Epoch Fencing inside the DO Choke Point`  
`const revokingEvents = new Set([`  
  `"WATCHDOG_EXPIRE",`  
  `"SECURITY_VIOLATION",`  
  `"OPERATOR_CANCEL",`  
  `"TIMEOUT",`  
  `"KILL_SWITCH_TRIP"`  
`]);`

`const promotingEvents = new Set([`  
  `"BROKER_COMPLETE",`  
  `"HUMAN_APPROVE",`  
  `"QUALITY_PASS"`  
`]);`

`if (revokingEvents.has(event.type)) {`  
  `// Bump epoch to immediately fence out active and partitioned workers`  
  `context.currentEpoch += 1; // N -> N+1[cite: 1, 2, 8, 19]`  
  `context.activeLease = null;`  
`} else if (promotingEvents.has(event.type)) {`  
  `// Retain active epoch; verify worker presented token matches context.currentEpoch`  
  `if (payload.epoch !== context.currentEpoch) {`  
    ``throw new FsmConflictError(`Stale epoch token: presented ${payload.epoch}, current ${context.currentEpoch}`); //[cite: 1, 2, 8, 19]``  
  `}`  
`}`

> * **Revoking Exits (WATCHDOG\_EXPIRE, SECURITY\_VIOLATION, OPERATOR\_CANCEL):** These events indicate failure, timeout, or security breaches. The choke point increments currentEpoch (*N*→*N*\+1), invalidating outstanding leases and ensuring that any late-arriving packets or uploads from the evicted node are rejected.  
> * **Promoting Exits (BROKER\_COMPLETE, HUMAN\_APPROVE):** These events represent successful completions. The choke point verifies that the presented epoch exactly matches context.currentEpoch and retains the current epoch value, allowing the valid asset to be committed to canonical storage without self-fencing.

#### **Core Mechanical Demarcation**

| Architectural Dimension | Proactive Watchdog Alarms (ctx.storage.setAlarm) | Monotonic Epochs & Fencing Tokens |
| :---- | :---- | :---- |
| **Primary Failure Guard** | Detects crashed daemons, power cuts, and dropped network tunnels. | Prevents late-arriving writes from partitioned "zombie" workers. |
| **Execution Domain** | Cloudflare Edge Hypervisor Alarm API (setAlarm). | NVMe Storage State Engine (ctx.storage). |
| **Operational Cadence** | 30s rolling lease window; 10s heartbeat renewals; 15m hard ceiling. | Increments (*N*→*N*\+1) on every lease grant, revocation, or timeout. |
| **Enforcement Layer** | Autonomous isolate wake-up inside alarm(). | Promotion boundary gate via POST /tasks/complete. |
| **Storage Concurrency Impact** | Sets active\_lease status to EXPIRED; triggers DLQ triage. | Rejects stale commits with HTTP 409 Conflict; leaves artifacts in R2 staging. |

---

*User prompt: {{FOCUS: 6\. The Dead-Letter Queue (DLQ) and Triage (Edge-Director), 4\. SIMULATION\_ONLY Mode (When the GPU is Dead) (Edge-Director) /extreme-details*

### **Response: 1\. The Dead-Letter Queue (DLQ) & Failure Triage Architecture**

The Dead-Letter Queue (DLQ) subsystem in edge-director prevents broken execution payloads from trapping the shared GPU hardware in infinite restart loops, while ensuring failed jobs do not disappear into silent neglect.

                           `[ LEASE FAILURE / WATCHDOG TRIP ]`  
                                          `│`  
                                          `▼`  
                      `Read Task Context from ctx.storage: attempt_count[cite: 1]`  
                                          `│`  
                        `Is attempt_count < maxAttempts (2)?[cite: 1]`  
                        `┌─────────────────┴─────────────────┐`  
                        `▼ YES                               ▼ NO[cite: 1, 13]`  
         `[ TRANSIENT INFRASTRUCTURE FAULT ]        [ DETERMINISTIC POISON TASK ][cite: 1, 13]`  
         `• Increment attempt_count (1 -> 2)[cite: 1]       • Transition status -> 'DLQ'[cite: 1, 13]`  
         `• Increment currentEpoch (N -> N+1)[cite: 1]      • Write payload to dlq:${jobId}[cite: 1]`  
         `• Release activeLease hardware lock[cite: 1]       • Freeze lease; halt automated retry[cite: 1, 13]`  
         `• Return task to FIFO Mutex Queue[cite: 1]         • Compile Diagnostic Dossier (Vector E)[cite: 1, 5]`  
         `• Next healthy spoke claims job[cite: 1, 13]       • Dispatch P0 Alert to Cockpit & Ops[cite: 1, 5]`

#### **Failure Taxonomy: Infrastructure Transient vs. Deterministic Poison Job**

A core distributed systems flaw is routing every job whose lease expires or crashes directly into a generic failure queue. The ShotCoordinatorDO enforces an explicit failure taxonomy to distinguish between two categorically different runtime anomalies:

Worker Death (Infrastructure Transient)=Poison Job (Deterministic Failure)

> * **Transient Infrastructure Faults (attempt\_count \< maxAttempts):** These occur when the physical machine drops network packets, the host OS kills a background daemon, a spot hypervisor evicts an instance, or power blips mid-generation. Because the render input itself is valid, the ShotCoordinatorDO increments attempt\_count, bumps the monotonic epoch (*N*→*N*\+1) to fence the crashed instance, and returns the task to the pending FIFO queue. When Rig 2 re-establishes connectivity or a secondary GPU spoke checks in, the job is claimed cleanly under a fresh lease.  
> * **Deterministic Poison Tasks (attempt\_count \>= maxAttempts):** These occur when input parameters are intrinsically un-renderable—such as an invalid latent aspect ratio, an out-of-bounds frame budget, or a corrupted LoRA checkpoint that predictably triggers a PyTorch assertion or CUDA Out-Of-Memory (OOM) fault across every graphics card. Retrying these payloads blindly burns compute and stalls the entire studio queue. When a task exhausts its attempt ceiling (default maxAttempts: 2), the circuit breaker trips and evicts the job to the DLQ.

#### **Storage Layout & Quarantine Isolation (dlq:\${jobId})**

Once a job is declared a poison task, the DO isolates its entire execution state to prevent automated processes from accessing it:

`// Inside ShotCoordinatorDO applyTransition() choke point`  
`if (context.attemptCount >= MAX_ATTEMPTS) {`  
  ``const dlqKey = `dlq:${context.jobId}`;``  
  `const dlqRecord: DeadLetterRecord = {`  
    `jobId: context.jobId,`  
    `artistId: context.artistId,`  
    `sceneId: context.sceneId,`  
    `shotId: context.shotId,`  
    `templateId: context.templateId,`  
    `payload: context.payload,`  
    `attemptCount: context.attemptCount,`  
    `failedAt: Date.now(),`  
    `lastEpoch: context.currentEpoch,`  
    `lastHeartbeatAt: context.lastHeartbeatAt,`  
    `errorVector: synthesizeErrorVector(context.lastError),`  
    `stackTrace: context.lastErrorTrace ?? "WATCHDOG_HEARTBEAT_EXHAUSTION"`  
  `};`

  `// Atomically persist to NVMe and remove from active scheduling`  
  `await this.ctx.storage.put(dlqKey, dlqRecord);`  
  ``await this.ctx.storage.delete(`task:${context.jobId}`);``  
  `this.activeJob = null;`  
  `this.activeLease = null;`  
    
  `// Advance epoch to fence out any lingering background processes`  
  `context.currentEpoch += 1;`  
`}`

> * **Key Isolation:** The job is written to dlq:\${jobId} in ctx.storage and unlinked from active queue arrays and task maps.  
> * **Hardware Mutex Release:** The active hardware lock on the GPU is released, permitting the getNextFairJob() scheduler to advance to the next waiting scene and preventing a deadlocked production floor.  
> * **Epoch Advancement:** The monotonic epoch counter increments (*N*→*N*\+1), guaranteeing that if the failed runner attempts a late write, its completion sentinel is rejected with HTTP 409 Conflict.

#### **The Diagnostic Escalation Dossier & Error Trajectory Vector (*E*)**

Jobs in the DLQ do not fail silently. The edge-director enqueues an asynchronous notification into outbox:ALERT: that surfaces a Diagnostic Escalation Dossier directly to the Showrunner’s Astro Cockpit and the \#ops-bridge alerting channel:

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                   DLQ DIAGNOSTIC ESCALATION DOSSIER                    │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ Task ID: task_01954b72-3c81-723a-8b1e-9a4f61e2cb01                     │`  
`│ Target:  EP101_SC02 / SH003 (WAN_VIDEO_PLATE)                          │`  
`│ Artist:  artist_montreal | Attempts Exhausted: 2 / 2                   │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ LAST HEARTBEAT METRICS:                                                │`  
`│ • Timestamp: 2026-09-28T16:42:12.102Z (Stall duration: 34.2s)         │`  
`│ • Host Node: rig2-foundry.studio.internal (10.0.4.12)                  │`  
`│ • VRAM at Stall: 23,891 MB / 24,576 MB (97.2% capacity)               │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ ERROR TRAJECTORY VECTOR (E):                                           │`  
`│ ⟨ DOMAIN:        HARDWARE_CUDA_ALLOCATOR ⟩                             │`  
`│ ⟨ TARGET_ENTITY: char_pilot_v4.safetensors ⟩                           │`  
`│ ⟨ RULE_ID:       OOM_RESERVE_EXCEEDED_24GB ⟩                           │`  
`│ ⟨ OFFENDING:     targetFrames=193, width=1280, height=720 ⟩            │`  
`├────────────────────────────────────────────────────────────────────────┤`  
`│ STACK TRACE:                                                           │`  
`│ torch.cuda.OutOfMemoryError: Allocation on device 0 would exceed       │`  
`│ allowed memory. Attempted to allocate 3.42 GiB (GPU 0; 23.69 GiB total)│`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **Task Metadata & Session Ownership:** Contains the immutable task UUID, scene/shot identifiers, initiating artistId, and the exact AST parameters submitted.  
> * **Hardware Telemetry Snapshot:** Captures the last recorded heartbeat timestamp, GPU host IP, container runtime metrics, and memory utilization at the point of failure.  
> * **The Error Trajectory Vector (*E*):** A structured 4-tuple defining the failure boundary:  
>   *E*\=⟨Domain,TargetEntity,RuleID,OffendingTokens⟩  
>   This formal categorization distinguishes hardware budget breaches (such as CUDA memory ceilings) from narrative invariant rejections (such as missing character props).

#### **Operator Adjudication & Recovery Pathways**

Once a task is quarantined in the DLQ, human operators or autonomous repair agents resolve the failure using three structured triage pathways:

`// Interface for Showrunner Cockpit DLQ Resolution API`  
`export interface DlqResolutionRequest {`  
  `readonly jobId: string;`  
  `readonly action: "RETRY_WITH_OVERRIDE" | "BURST_TO_CLOUD" | "PURGE_DISCARD";`  
  `readonly overrides?: {`  
    `readonly targetFrames?: number;`  
    `readonly promptOverride?: string;`  
    `readonly loraTag?: string;`  
    `readonly scaleResolution?: number; // e.g., 0.85 (-15% latent downscale)`  
  `};`  
`}`

> 1. **Parameter Override & Requeue (RETRY\_WITH\_OVERRIDE):** If the failure was caused by borderline VRAM limits (such as requesting 193 frames for an 8-second speech line), the operator applies a corrective downscale factor (e.g., cutting latent resolution by 15% or splitting the shot). The DO pulls the job from dlq:\${jobId}, resets attempt\_count \= 0, updates the payload with the new parameters, and places it back into the active FIFO queue.  
> 2. **Cloud Burst Routing (BURST\_TO\_CLOUD):** If the shot requires memory capacity beyond the local workstation's 24 GB ceiling (such as multi-character LoRA compositions), the operator re-routes the task to an enterprise cloud tier. The edge DO routes the task directly to RunPod Serverless pinned to an 80 GB NVIDIA A100 or 48 GB L40S instance, bypassing Rig 2's local consumer GPU entirely.  
> 3. **Purge & Rollback (PURGE\_DISCARD):** If the shot is deemed invalid or creatively redundant, the operator discards it. The DO deletes dlq:\${jobId}, updates the scene status to BLOCKED in Cloudflare D1, and frees associated budget reservations without altering canonical narrative ledgers.

### **2\. SIMULATION\_ONLY Mode (When the GPU is Dead)**

The fundamental architectural principle of the generative studio is that **narrative truth lives in the relational ledger, not in the physical rendering hardware**. If Rig 2 experiences a catastrophic hardware failure—such as a power outage, burned-out power supply, or PCIe controller crash—the production pipeline does not halt. The edge-director shifts execution into **SIMULATION\_ONLY mode**.

                             `INBOUND SCENE DISPATCH`  
                                       `│`  
                                       `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│            EdgeGateway INGRESS ROUTER (src/index.ts)                   │`  
`│                                                                        │`  
`│ • Validates Signed JWT & SpokeExecutionPayload (<5ms)[cite: 1]                 │`  
`│ • Inspects active broker connections: brokerSockets.length === 0[cite: 1]     │`  
`└──────────────────────────────────────┬─────────────────────────────────┘`  
                                       `│`  
                    `┌──────────────────┴──────────────────┐`  
                    `▼                                     ▼`  
         `[ brokerSockets.length > 0 ]          [ brokerSockets.length === 0 ][cite: 1]`  
                    `│                                     │`  
                    `▼                                     ▼`  
          `[ NORMAL FOUNDRY PATH ]             Check payload.allowSimulationFallback[cite: 1]`  
          `• Forward to ShotCoordinatorDO                  │`  
          `• Claim hardware mutex lease         ┌──────────┴──────────┐`  
          `• Rig 2 renders plate to R2[cite: 1]        ▼ FALSE               ▼ TRUE[cite: 1]`  
                                              `[ HTTP 503 ERROR ]   [ TRIGGER SIMULATION_ONLY ][cite: 1]`  
                                              `"FOUNDRY_OFFLINE"    • Advance narrative D1 state[cite: 1]`  
                                              `(Zero write allowed) • Return COMMITTED_WITHOUT_MEDIA[cite: 1]`  
                                                                   `• Append AST to D1 Backlog Queue[cite: 1]`

#### **Hardware Absence Detection & Ingress Router Logic**

The entry gate for SIMULATION\_ONLY execution runs directly inside the Hono ingress worker (EdgeGateway in src/index.ts). Before attempting to lock mutexes or wake the ShotCoordinatorDO isolate, the router interrogates the active connection pool:

`// apps/director/src/index.ts (Ingress Gateway Router)`  
`app.post("/dispatch", async (c) => {`  
  `const payload = await c.req.json<SpokeExecutionPayload>();`  
    
  `// 1. Inspect connected hardware spokes via Durable Object query or tag map`  
  `const brokerSockets = await getActiveBrokerSockets(c.env);`

  `// 2. Hardware Spoke Offline Evaluation`  
  `if (brokerSockets.length === 0) {`  
    `if (payload.allowSimulationFallback) {`  
      ``console.warn(`[EdgeDirector] Foundry offline. Triggering SIMULATION_ONLY mode for ${payload.sceneId}`);``  
        
      `// Step A: Execute narrative state transitions directly in Cloudflare D1`  
      `const mutationResult = await executeNarrativeStateMutation(c.env.DB, payload.sceneAst);`  
        
      `// Step B: Record unrendered shot into the persistent D1 backlog queue`  
      `` await c.env.DB.prepare(` ``  
        `INSERT INTO scene_render_backlog (`  
          `task_id, scene_id, shot_id, scene_ast, conformed_frames, seed, status, created_at`  
        `) VALUES (?, ?, ?, ?, ?, ?, 'QUEUED_FOR_RECONNECT', ?)`  
      `` `).bind( ``  
        `payload.taskId,`  
        `payload.sceneId,`  
        `payload.shotId,`  
        `JSON.stringify(payload.sceneAst),`  
        `payload.targetFrames,`  
        `payload.seed,`  
        `Date.now()`  
      `).run();`

      `// Step C: Return clean 200 OK receipt to client Conductor`  
      `return c.json({`  
        `status: "COMMITTED_WITHOUT_MEDIA",`  
        `sceneId: payload.sceneId,`  
        `stateDelta: mutationResult.delta,`  
        `backlogTaskId: payload.taskId,`  
        `message: "Narrative state advanced in D1. Rendering queued for batch processing when Rig 2 resumes."`  
      `}, 200);`  
    `}`

    `// Fallback rejected by client contract`  
    `return c.json({`   
      `error: "FOUNDRY_OFFLINE",`   
      `message: "No active GPU spoke connected and allowSimulationFallback is false."`   
    `}, 503);`  
  `}`

  `// 3. Normal execution flow: Forward to ShotCoordinatorDO mutex queue`  
  `return forwardToRenderQueue(c, payload);`  
`});`

> * **The allowSimulationFallback Assertion:** Writers or pipeline tools explicitly indicate whether a shot is permitted to advance purely as a logical beat. Production animatics or rough beat drafting enable this flag; final optical release builds disable it to force strict hardware verification.  
> * **Zero-Downtime Narrative Velocity:** When enabled, the absence of GPU hardware does not return an HTTP error. The gateway responds with HTTP 200 OK and status COMMITTED\_WITHOUT\_MEDIA, preventing scriptwriters and story directors from being blocked when the render box is down.

#### **Media-Free Narrative State Transitions (Cloudflare D1)**

In SIMULATION\_ONLY mode, the edge gateway executes state mutations directly against the relational ledger (CANON\_DB in Cloudflare D1) without awaiting pixel or audio synthesis:

`-- Executed inside a single atomic D1 batch transaction during SIMULATION_ONLY mode`  
`BEGIN TRANSACTION;`

`-- 1. Mutate somatic vectors (e.g., character injury sustains damage)`  
`UPDATE entity_somatic_states`  
`SET condition = 'FRACTURED_RIGHT_CLAVICLE',`  
    `banned_kinetic_verbs = '["CLIMB", "VAULT", "TWO_HANDED_AIM"]',`  
    `updated_at = strftime('%s', 'now')`  
`WHERE entity_id = 'char_pilot' AND scene_context = 'EP101_SC02';`

`-- 2. Deduct physical logistics & consumable inventories`  
`UPDATE entity_inventory_ledgers`  
`SET remaining_units = remaining_units - 1,`  
    `last_action = 'DISCHARGED_FLARE_ROUND'`  
`WHERE entity_id = 'item_flare_gun' AND owner_id = 'char_pilot';`

`-- 3. Record narrative grievance debt and epistemic secrets`  
`INSERT INTO narrative_grievance_ledger (source_entity, target_entity, severity_score, claim)`  
`VALUES ('char_pilot', 'char_spurl', 4, 'Abandoned at culvert without perimeter covering fire');`

`-- 4. Advance canonical episode marker`  
`UPDATE episode_progress_manifest`  
`SET active_scene_index = active_scene_index + 1`  
`WHERE episode_id = 'EP101';`

`COMMIT;`

> * **Sub-Cent Operating Overhead:** Because state execution involves only row updates and constraint checks in SQLite, advancing story state costs fractions of a cent per episode, completely insulated from expensive cloud GPU hourly rates.  
> * **State Machine Progression:** The global narrative state transitions cleanly (*Sn*​→*Sn*\+1​). Characters take damage, lose supplies, and record social debts with mathematical permanence, establishing canonical reality regardless of whether a single frame of video exists.

#### **The Persistent Backlog Queue & Automated Batch Catch-Up**

While narrative truth advances, the visual plates cannot be skipped permanently. The edge-director tracks all unrendered elements in a dedicated D1 table: scene\_render\_backlog.

`CREATE TABLE scene_render_backlog (`  
  `task_id TEXT PRIMARY KEY,`  
  `scene_id TEXT NOT NULL,`  
  `shot_id TEXT NOT NULL,`  
  `scene_ast TEXT NOT NULL,                  -- Immutable serialized AST contract`  
  `conformed_frames INTEGER NOT NULL,        -- Locked frame budget from audio ffprobe`  
  `seed INTEGER NOT NULL,                    -- Deterministic PRNG seed`  
  `status TEXT CHECK(status IN ('QUEUED_FOR_RECONNECT', 'PROCESSING_BATCH', 'RENDERED_RECONCILED')) NOT NULL,`  
  `created_at INTEGER NOT NULL,`  
  `processed_at INTEGER`  
`);`

`CREATE INDEX idx_backlog_status ON scene_render_backlog(status, created_at ASC);`

`[ Rig 2 Foundry Powered Down ] ──► edge-director writes unrendered ASTs to scene_render_backlog[cite: 1]`  
                                          `│`  
                                          `│ (Writers complete Episode 101 draft in D1)[cite: 1]`  
                                          `│`  
`[ Rig 2 Regains Power / Reconnects ] ─────┤[cite: 1]`  
                                          `│`  
                                          `▼`  
                      `media-broker establishes outbound tunnel[cite: 1, 2]`  
                      `Verifies local OS-level flock is released[cite: 4, 12]`  
                                          `│`  
                                          `▼`  
                      `POST /api/backlog/drain-next { limit: 10 }[cite: 1, 4]`  
                                          `│`  
                      `┌───────────────────┴───────────────────┐`  
                      `▼                                       ▼`  
            `[ STAGE-LEVEL BATCHING ]                 [ ASSET RECONCILIATION ][cite: 2, 4]`  
            `• Loads Wan 2.2 model once[cite: 2]               • Writes plates to R2[cite: 1, 2]`  
            `• Renders all backlogged plates[cite: 1]          • Flips status -> RENDERED[cite: 1, 2]`  
            `• Zero model swapping overhead[cite: 2]           • Remotion mounts assets[cite: 1, 2]`

> * **Zero Code-Path Divergence:** When Rig 2 regains power, boots its OS, and launches media-broker, it opens its outbound cloudflared tunnel. The broker senses that its local hardware lock (flock) is free and queries the edge gateway for pending backlog items. It executes the backlog jobs using the exact same Node.js loop, ComfyUI templates, and VRAM management rules (/free) used in live production.  
> * **Stage-Level Batch Catch-Up:** Rather than executing the backlogged shots one-by-one with inefficient per-shot model swaps, media-broker batches them by stage:  
  1. Loads the TTS audio checkpoint once, synthesizing speech stems for all queued backlog items.  
  2. Flushes VRAM via POST 127.0.0.1:8188/free and asserts baseline memory.  
  3. Loads the Wan 2.2 diffusion model once, rendering all Greenscreen \#00FF00 video plates sequentially at maximum hardware throughput.  
> * **Manifest Reconciliation:** As each batch plate uploads to Cloudflare R2, media-broker updates the D1 backlog status to RENDERED\_RECONCILED and commits the content-addressed URL into the episode manifest.  
> * **Optical Alignment:** When the human Showrunner or artist re-opens their local Remotion cockpit on Rig 1, the compositor ingests the newly generated R2 URLs and mounts the video plates directly into the timeline, completing the transition from simulated abstraction to fully realized media.

---

*User prompt: {{FOCUS: 3\. Graceful Degradation: The Local Offline Fallback (Edge-Director), 2\. Eliminating the "Two-Queue" Failure Mode (Edge-Director), 1\. Inverting the Hardware Mutex (Local flock Sovereignty) (Edge-Director) }} /extreme-details*

### **Response: 1\. Inverting the Hardware Mutex (Local flock Sovereignty)**

The architectural foundation governing compute execution in edge-director is the complete inversion of hardware authority between the cloud edge and the physical workstation. In distributed systems design, granting a remote network coordinator direct locking authority over on-premises silicon creates an unstable dependency boundary.

`INCORRECT (EDGE-AUTHORITY ANTI-PATTERN):`  
`Cloudflare DO ──► "You own the GPU now" ──► Hope WAN tunnel holds ──► GPU Silicon`  
                                                                       `▲`  
                       `(Network partition creates stranded/contested lock)[cite: 3]`

`CORRECTED INVERTED ARCHITECTURE:`  
`Remote DO ──► Logical Request Queue ──► Local media-broker ──► OS flock ──► GPU Silicon`

> * **The Edge-Authority Anti-Pattern:** Early pipeline designs permitted the edge Durable Object (ShotCoordinatorDO) to hold an exclusive lease over the physical GPU, declaring down to Rig 2 that it had acquired the hardware lock. If the outbound Cloudflare tunnel dropped packets, fluctuated, or severed entirely, the physical GPU was left in an ambiguous, contested, or frozen state despite sitting physically powered on and idle in the local studio.  
> * **Permanent Local File Lock (flock):** To eliminate this failure mode by construction, authority is permanently anchored to the local machine. The local execution daemon (media-broker on Rig 2\) permanently holds an unconditional, OS-level file lock (flock) directly on the GPU hardware interface.  
> * **The DO Relegated to a Passive Request Queue:** The edge Durable Object possesses zero authority to command, seize, or allocate physical silicon. The DO functions strictly as a passive, single-threaded logical First-In, First-Out (FIFO) request queue.  
> * **The Pull-Only Execution Model:** The local daemon on Rig 2 operates exclusively via pull semantics. media-broker polls or claims work from the edge DO *only* when its own local flock is released and available. Silicon dictates when it is ready to consume workloads, preventing cloud isolates from pushing render tasks onto local memory blindly.  
> * **Strict Chain of Command:** The execution path enforces a single, unidirectional hierarchy:  
>   Remote DO⟶Logical Request Queue⟶Local media-broker⟶OS flock⟶GPU

### **2\. Eliminating the "Two-Queue" Failure Mode**

When a distributed architecture maintains two independent notions of queue ownership—one managed remotely at the edge control plane and another managed locally at the execution spoke—it introduces the catastrophic "Two-Queue" collision hazard.

                           `THE TWO-QUEUE COLLISION HAZARD`  
                             
   `[ Remote Cloud Edge (DO) ]                              [ Local Rig 2 (Foundry) ]`  
               `│                                                       │`  
               `├───── Job A Leased to Rig 2 (Epoch N) ────────────────►│ (GPU starts diffusion pass)[cite: 1, 3]`  
               `│                                                       │`  
               `│   x──── Transient Network Partition / Delay ────x     │ (GPU still rendering Job A)[cite: 1, 3]`  
               `│                                                       │`  
               `├─ Watchdog Timer Trips (30s silence)                   │`  
               `├─ DO assumes Worker dead; revokes lease                │`  
               `├─ DO reassigns Job A to Worker B / Epoch N+1           │`  
               `│                                                       │`  
               `│   x──── Network Reconnects / Worker B Hits GPU ───x   │`  
               `│                                                       ▼`  
               `└──────────────────────────────────────────────► [ FATAL COLLISION ]`  
                                                                `• Two claimants on 1 GPU[cite: 1, 3]`  
                                                                `• Concurrent VRAM allocation[cite: 1, 3]`  
                                                                `• CUDA OUT-OF-MEMORY (OOM)[cite: 1, 3]`

#### **The Dual-Claimant Concurrency Hazard**

If the local media-broker only enforced its hardware lock conditionally (e.g., executing a local lock during an offline fallback mode, but relying on edge-orchestrated leases during connected mode), the system becomes vulnerable to network jitter:

> 1. Rig 2 begins rendering Job A under Epoch *N*.  
> 2. A brief network hiccup or delayed heartbeat causes the edge DO's watchdog timer to trip after 30 seconds.  
> 3. The DO marks the lease expired and reassigns Job A (or dispatches a concurrent task) to an alternate worker or new epoch (*N*\+1).  
> 4. Meanwhile, Rig 2's local process is still running the original diffusion pass inside VRAM, completely unaware that its edge lease was revoked upstream.  
> 5. When the network tunnel clears or a competing job instruction reaches the workstation, two tasks attempt to allocate tensors on the graphics card simultaneously.  
> 6. Because consumer GPUs cannot execute concurrent diffusion graphs, this immediately triggers a fatal **CUDA Out-Of-Memory (OOM)** crash—the exact failure mode the mutex was designed to prevent.

#### **The Architectural Remedy: Collapsing Dual Queues into a Single Local Invariant**

The architecture eliminates the two-queue hazard by treating edge leases as optional *requests* rather than binding *commands*:

> * **One Universal Lock:** The local flock on Rig 2 is held **always**, across both normal and degraded operations. There are not two locks (one cloud, one local); there is only ever one lock, and it is local to the machine.  
> * **Requests, Never Commands:** The edge DO never commands Rig 2 to execute. It merely queues candidate payloads. When Rig 2's GPU completes an operation and releases its local flock, media-broker inspects the request queue and pulls exactly one task.  
> * **Structural Impossibility of Dual Claimants:** Because a task can only execute when the single, local flock is physically acquired by media-broker, no external edge event, watchdog timeout, or lease reassignment can force a second allocation onto the GPU silicon while a render is in progress. The two-claimant condition is eliminated by physical construction rather than by fragile timing sequences.

### **3\. Graceful Degradation: The Local Offline Fallback**

The studio's foundational **Deletion Principle** mandates that production must survive the complete destruction or partition of cloud infrastructure. If Cloudflare suffers an outage or WAN access is severed, local production cannot stall.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│ RIG 2: media-broker EXECUTION HARNESS                                  │`  
`│                                                                        │`  
`│                    [ Local OS flock Acquired ]                         │`  
`│                                 │                                      │`  
`│                                 ▼                                      │`  
`│                     Is Cloudflare DO Reachable?                        │`  
`│                     ┌───────────┴───────────┐                          │`  
`│                     ▼ YES                   ▼ NO                       │`  
`│           [ PULL FROM EDGE DO ]   [ PULL FROM LOCAL SPOOL ]            │`  
`│           • Remote WebSocket      • /var/spool/renders                 │`  
`│           • Outbound Tunnel       • Local Disk FIFO                    │`  
`│                     │                       │                          │`  
`│                     └───────────┬───────────┘                          │`  
`│                                 ▼                                      │`  
`│                [ UNIFIED COMPUTE EXECUTION PATH ]                      │`  
`│                • Identical VRAM /free hygiene flush                    │`  
`│                • Identical modular ComfyUI JSON templates              │`  
`│                • Identical 24fps quantization arithmetic               │`  
`│                • Identical stage-level model batching                  │`  
`│                                 │                                      │`  
`│                                 ▼                                      │`  
`│                 [ GPU SILICON DIFFUSION PASS ]                         │`  
`└────────────────────────────────────────────────────────────────────────┘`

> * **The Local Disk Spool (/var/spool/renders):** When internet connectivity fails, the outbound cloudflared tunnel disconnects, or the edge DO is unreachable, media-broker automatically shifts its ingestion source to a local disk-based queue at /var/spool/renders.  
> * **Zero Code-Path Divergence:** Crucially, offline fallback is **not a separate code path**. In poorly engineered distributed pipelines, separate fallback modes inevitably decay, drift, and fail when called upon because they are rarely exercised in daily testing. Because media-broker permanently owns its local flock during connected operation, the offline path is the exact same execution loop:  
  * The identical VRAM hygiene flush calls (POST 127.0.0.1:8188/free).  
  * The identical modular ComfyUI API templates and parameter injection routines.  
  * The identical stage-level batching (Text → Audio → Video).  
  * The only divergence is the source of the manifest: reading from a local file descriptor rather than an incoming WebSocket frame.  
> * **Local Content-Addressed Archiving:** While disconnected, rendered video plates are hashed via SHA-256 and committed directly to the local content-addressed disk archive rather than dispatched to Cloudflare R2. The local episode manifest is updated and sealed with zero dependency on the external network.  
> * **The Architectural Reality:** The edge Durable Object represents an optimization for multi-user coordination across remote writers and traveling artists, not an indispensable production requirement. If the cloud is wiped away, the local workstation remains a completely autonomous, self-sovereign digital production studio.

---

*User prompt: take a look at the beginning of the conversation and express all of the most important details until the last response for 1500 words on the Edge Director*

### **Response: 1\. Concrete System Identity and Operational Boundaries**

The **edge-director** functions as an edge-native, stateful traffic controller, concurrency mutex, and telemetry relay (classified as POD-12: System Middleware under Macro-Node 04: Supply Chain / Infrastructure). It serves as an automated digital assistant director and line producer. It does not write prose, direct aesthetic nuance, or invent canon; it enforces scheduling discipline, hardware safety, and data consistency across distributed endpoints.

`┌────────────────────────────────────────────────────────────────────────┐`  
`│                        STUDIO TOPOLOGY & BOUNDARIES                    │`  
`├──────────────────────┬────────────────────────┬────────────────────────┤`  
`│ Node                 │ Hardware Domain        │ Operational Boundary   │`  
`├──────────────────────┼────────────────────────┼────────────────────────┤`  
`│ The Conductor        │ Rig 1 (Local CPU/RAM)  │ Narrative truth, audio │`  
`│ (produceEpisode.ts)  │ Zero dedicated GPU     │ synthesis, ffprobe,    │`  
`│                      │                        │ Remotion compositing   │`  
`├──────────────────────┼────────────────────────┼────────────────────────┤`  
`│ edge-director        │ Cloudflare Worker +    │ Ingress gatekeeper, D1 │`  
`│ (EdgeGateway / DO)   │ Durable Object (Edge)  │ continuity check, FIFO │`  
`│                      │                        │ mutex, epoch leases    │`  
`├──────────────────────┼────────────────────────┼────────────────────────┤`  
`│ media-broker         │ Rig 2 (Local Foundry)  │ OS-level flock, VRAM   │`  
`│                      │ Consumer GPU (24GB)    │ flush (/free), ComfyUI │`  
`│                      │                        │ headless execution     │`  
`└──────────────────────┴────────────────────────┴────────────────────────┘`

The system separates the epistemological engine from the presentation layers. Upstream, **The Conductor** on Rig 1 compiles the Abstract Syntax Tree (AST), generates dialogue audio stems via local Text-To-Speech (TTS), and locks discrete 24fps frame budgets using continuous millisecond audio duration:

target\_frames=⌈(1000duration\_ms​)×24⌉

Downstream, **media-broker** on Rig 2 executes generative diffusion graphs inside local ComfyUI processes (127.0.0.1:8188).

The edge-director sits between these environments. Implemented as an ingress router (EdgeGateway in src/index.ts using Hono) backed by a singleton Durable Object (ShotCoordinatorDO), it manages multi-tenant hardware contention on consumer GPUs without risking CUDA Out-of-Memory (OOM) faults, lost socket connections, or unauthorized compute charges.

### **2\. Ingress Gatekeeping & The Relational Continuity Gate (D1)**

Every dispatch payload sent from Rig 1 or traveling artist cockpits must enter through the EdgeGateway. The gateway acts as a fail-closed firewall operating directly on Cloudflare’s global Anycast perimeter.

#### **Cryptographic and Schema Validation**

Inbound HTTP dispatches must provide valid machine service tokens or JSON Web Tokens (JWTs). The gateway verifies the payload structure against the SpokeExecutionPayload Zod schema in under 5 milliseconds. Payloads with missing parameters, malformed AST nodes, or unvetted configuration keys are rejected at the edge.

#### **The Relational Continuity Check**

Generative video models (e.g., Wan 2.2) require significant GPU resources. Dispatching a render for a scene whose narrative premises have drifted burns local compute or incurs cloud GPU fees on obsolete frames. The edge-director evaluates continuity prior to execution by running a sub-millisecond query against Cloudflare D1 (CANON\_DB):

`SELECT COUNT(*) AS dirty_count`  
`FROM scene_fact_dependencies`  
`WHERE scene_id = ? AND is_dirty = 1;`

                     `INBOUND DISPATCH PAYLOAD`  
                                 `│`  
                                 `▼`  
`┌──────────────────────────────────────────────────────────────────┐`  
`│ EdgeGateway Ingress Router (src/index.ts)                        │`  
`│ • Validates JWT signatures and Zod schemas (<5ms)                │`  
`│ • Runs relational continuity query in Cloudflare D1 (CANON_DB)   │`  
`└────────────────────────────────┬─────────────────────────────────┘`  
                                 `│`  
                 `┌───────────────┴───────────────┐`  
                 `▼                               ▼`  
        `[ dirty_count > 0 ]             [ dirty_count == 0 ]`  
                 `│                               │`  
                 `▼                               ▼`  
  `[ HTTP 412 PRECONDITION FAILED ]       [ FORWARD TO DO ]`  
  `• Error: DIRTY_SCENE_REJECTED          • Check Idempotency Key`  
  `• GPU not engaged ($0.00 billed)       • Enqueue into ShotCoordinator`

If dirty\_count \> 0, upstream narrative facts (e.g., character injuries, inventory mutations, world conditions) have changed without a corresponding AST re-linting pass. The gateway halts execution immediately, returning an HTTP 412 Precondition Failed error:

`{`  
  `"error": "DIRTY_SCENE_REJECTED",`  
  `"sceneId": "EP101_SC02",`  
  `"dirtyDependencies": 1,`  
  `"message": "Upstream canon changed. Re-lint and re-compile scene AST before queuing render."`  
`}`

By validating continuity at the edge, invalid rendering jobs are blocked before waking the ShotCoordinatorDO actor or signaling Rig 2, spending **\$0.00** in GPU compute on out-of-date story states.

### **3\. Single-Threaded Mutex & Velocity-Preserving Queues (ShotCoordinatorDO)**

A single consumer GPU (such as an NVIDIA RTX 4090 with 24 GB of VRAM) cannot process concurrent diffusion graphs without triggering fatal CUDA Out-Of-Memory exceptions. The ShotCoordinatorDO acts as a stateful, single-threaded hardware mutex.

                             `ShotCoordinatorDO MUTEX`  
                                        `│`  
           `┌────────────────────────────┴────────────────────────────┐`  
           `▼                                                         ▼`  
   `[ SINGLE-THREADED QUEUE ]                                 [ DYNAMIC FAIR RE-ORDERING ]`  
   `• Cloudflare guarantees serialized                        • Interleaves multi-tenant jobs`  
     `execution via single V8 event loop[cite: 1]            • Array scan finds alternate artistId`  
   `• ctx.storage checks idempotency_key[cite: 1]            • [A, A, A, B] extracted to [A, B, A, A]`  
   `• Rejects duplicate client submissions[cite: 1]          • Prevents single-user batch starvation`

> * **Concurrency Serialization:** Cloudflare guarantees that all inbound requests, WebSocket events, and internal timers targeted at a specific Durable Object ID are processed sequentially through a single V8 event loop. The DO enforces a strict single-threaded queue, ensuring Rig 2 executes exactly one shot at a time.  
> * **Idempotency Enforcement:** Network retries from client applications can duplicate work. Every dispatch carries a client-generated idempotency\_key. The DO checks this key against its transactional key-value store (ctx.storage). If the key has already been processed or is currently active, the duplicate request is safely discarded.  
> * **Dynamic Fair Re-Ordering (getNextFairJob):** In a multi-artist studio, naive First-In, First-Out (FIFO) queuing introduces a single-tenant starvation vulnerability. If Artist A queues a 50-shot batch, a strict FIFO queue locks the consumer GPU for over an hour, leaving Artist B unable to run a single iterative test. The DO resolves this by scanning its internal queue for alternate tenant IDs:

`// Dynamic queue re-ordering to interleave tenants: [A, A, A, B] -> [A, B, A, A]`  
`private getNextFairJob(): ExecutionJob | undefined {`  
  `if (this.queue.length === 0) return undefined;`

  `const lastArtistId = this.activeJob?.artistId;`  
  `const alternateIndex = this.queue.findIndex(j => j.artistId !== lastArtistId);`

  `if (alternateIndex !== -1) {`  
    `return this.queue.splice(alternateIndex, 1)[0];`  
  `}`  
  `return this.queue.shift();`  
`}`

If multiple artists have jobs waiting, the DO extracts the minority tenant's task from deeper in the array, pulling it forward to execute immediately after the current active job finishes. If no alternate tenant exists (alternateIndex \=== \-1), it falls back to standard FIFO execution (this.queue.shift()), processing the batch without artificial delays.

### **4\. WebSocket Hibernation Multiplexing & Reconnection Protocols**

Long diffusion passes (60 to 90 seconds per plate) make holding open traditional, stateful server connections cost-prohibitive.

`Artist Client (Rig 1)          Cloudflare Anycast Edge                ShotCoordinatorDO`  
      `│                                  │                                   │`  
      `├────── WebSocket Upgrade ────────►│                                   │`  
      `│                                  ├────── Instantiates DO ───────────►│`  
      `│                                  │                                   ├─ ctx.acceptWebSocket(ws)[cite: 1]`  
      `│                                  │◄───── Isolate Evicted From RAM ───┤ ($0.00/sec compute)[cite: 1]`  
      `│                                  │   (TCP Socket Kept Open at Edge)  │`  
      `│   ... 60s Diffusion Pass ...     │                                   │[cite: 1]`  
      `│                                  │◄───── Broker Telemetry Arrives ───┤`  
      `│                                  ├────── Wakes Isolate in <2ms ─────►│`  
      `│◄───── Progress: 45% ─────────────┤                                   ├─ Broadcasts progress[cite: 1]`  
      `│                                  │◄───── Isolate Evicted Again ──────┤ ($0.00/sec compute)[cite: 1]`

> * **Scale-to-Zero Memory:** The ShotCoordinatorDO implements Cloudflare's WebSocket Hibernation API (this.ctx.acceptWebSocket(server, \[tag\])). Once a connection is established, the DO’s V8 isolate is serialized and evicted from active memory while Cloudflare's edge proxy maintains the underlying TCP connection. The system consumes **\$0.00** in duration billing while waiting for Rig 2 to sample latents.  
> * **Sub-2ms Telemetry Waking:** When media-broker pushes a progress packet up the tunnel, Cloudflare wakes the DO isolate in under 2 milliseconds, routes the normalized payload across connected artist sockets (this.ctx.getWebSockets("artist")), and returns the isolate to hibernation.  
> * **Reconnection Replay:** If an artist closes their laptop mid-render, the DO records state transitions in ctx.storage. Upon reconnecting, the client issues a system.resyncRequest with its lastSeenSeq. The DO replays missed lifecycle events and provides the final Cloudflare R2 signed asset URL, allowing the client's local Remotion timeline to mount the rendered plate without manual intervention.

### **5\. Distributed Leases, Monotonic Epochs, and Watchdogs**

Fixed timeouts (e.g., a static 180-second TTL) create operational failure points: they kill legitimate complex jobs mid-generation and leave hardware locks stranded if a worker crashes early. The ShotCoordinatorDO acts as the temporal authority, using rolling leases and proactive alarms.

`[ Durable Object: Temporal Authority ]`  
        `│`  
        `├─ Grants Lease: 30-second rolling window (Epoch: N)[cite: 1]`  
        `│`  
        `▼`  
`[ media-broker / Local Foundry ]`  
  `• Heartbeat loop runs in an independent background thread[cite: 1]`  
  `• Sends BROKER_HEARTBEAT every 10s carrying current fencing token[cite: 1]`  
        `│`  
   `┌────┴──────────────────────────────────────────┐`  
   `▼ Heartbeat Received                            ▼ Network Partition / Worker Hang`  
`[ Extend lease by +30s ]                     [ 3 missed heartbeats (30s) ][cite: 1]`  
`ctx.storage.setAlarm(now + 30000)[cite: 1]  Watchdog storage alarm fires[cite: 1]`  
                                                   `│`  
                                                   `▼`  
                                             `[ REVOKE LEASE (Epoch: N) ][cite: 1]`  
                                             `Increment Epoch: N + 1[cite: 1]`

> * **Heartbeat-Renewed Leases:** The DO grants an exclusive execution lease with a 30-second validity window. The media-broker daemon renews this lease every 10 seconds via an asynchronous heartbeat pulse. Each valid heartbeat extends the lease by \+30 seconds, allowing complex diffusion tasks to run without premature timeouts.  
> * **Thread-Isolated Heartbeats:** On Rig 2, the heartbeat timer runs in a decoupled background thread. If the main Node.js process blocks during heavy I/O operations (such as computing SHA-256 hashes over multi-gigabyte video plates), the heartbeat continues pulsing, preventing false-positive lease expirations.  
> * **Monotonic Epoch Fencing Tokens:** Every lease grant, timeout, or revocation increments an internal monotonic integer (fencing\_token). If a network partition isolates Rig 2, the DO's watchdog alarm fires after 3 missed heartbeats (30 seconds), revokes the lease, and advances the epoch (*N*→*N*\+1). If the partitioned node recovers later as an asynchronous "zombie" and attempts to commit its plate, the DO detects the stale token (*N*\<*N*\+1) and rejects the write with an HTTP 409 Conflict.

`[ Worker (Rig 2) ]                                     [ Cloudflare R2 ]                     [ ShotCoordinatorDO ]`  
        `│                                                      │                                       │`  
        `├────── 1. Uploads Staging Plate ─────────────────────►│                                       │`  
        `│       staging/.../epoch_1_a8f5b.mp4                  │                                       │`  
        `│                                                      │                                       │`  
        `├────── 2. RPC: POST /tasks/complete { epoch: 1 } ────────────────────────────────────────────►│`  
        `│                                                      │                                       ├─ Validates Epoch`  
        `│                                                      │                                       │  (Current Epoch == 2)`  
        `│◄───── 3. Rejection: HTTP 409 Conflict ───────────────────────────────────────────────────────┤`  
        `│                                                      │                                       │`  
        `│                                                      │◄── 4. 7-Day Lifecycle Rule Purges ────┤`  
        `│                                                      │      (Never Promoted to Manifest)     │`

> * **Promotion Boundary Fencing:** Because object storage (R2) does not natively evaluate fencing tokens on PUT requests, workers write rendered plates to an epoch-scoped key: staging/renders/\${taskId}/epoch\_\${epoch}\_\${sha256}.mp4. The asset is promoted to canonical production truth only when the DO validates the completion RPC. Staged files from stale epochs remain unpromoted and are reclaimed by bucket lifecycle policies.  
> * **Hardware Watchdog Alarms (ctx.storage.setAlarm):** The DO schedules proactive hardware alarms using Cloudflare's storage alarm API. If a worker goes offline, the alarm wakes the DO isolate autonomously to trip the circuit breaker and requeue the task (up to an attempt limit of 2\) without relying on external polling. If attempts are exhausted, the job routes to the Dead-Letter Queue (dlq:\${jobId}) and alerts operators.

### **6\. Lock Inversion, Inside-Out Tunnels, and Graceful Degradation**

#### **Local flock Sovereignty**

To prevent network drops from wedging on-premises hardware, locking authority is inverted. The local daemon (media-broker on Rig 2\) holds an unconditional, OS-level file lock (flock) on the GPU hardware interface.

The edge Durable Object possesses zero authority to command the hardware; it acts as a passive, pull-only FIFO request queue. media-broker pulls jobs from the edge DO *only* when its local flock is released. This ensures that two independent network requests can never trigger concurrent VRAM allocations or cause a CUDA OOM crash.

#### **Persistent Outbound Tunnel Topology (cloudflared)**

Rig 2 operates behind corporate NATs and firewalls with zero open inbound ports. ComfyUI (127.0.0.1:8188) and media-broker (127.0.0.1:3000) bind strictly to localhost. The broker establishes an encrypted, outbound-only WebSocket connection up to the edge-director over Cloudflare Tunnel (cloudflared), authenticated via Cloudflare Access Service Tokens. Traveling artists interact exclusively with the edge, insulating physical studio hardware from public internet exposure.

`[ Artist Laptop (Rig 1) ] ──► Inbound WSS / HTTPS`  
                                      `│`  
                                      `▼`  
                         `┌───────────────────────────┐`  
                         `│   edge-director (CF DO)   │`  
                         `└─────────────▲─────────────┘`  
                                       `│`   
                 `media-broker maintains persistent`   
                 `OUTBOUND WebSocket connection up to DO`  
                                       `│`  
`┌── Rig 2 (Local Foundry Spoke) ───────┴──────────────────────────────┐`  
`│                                                                     │`  
`│  [ cloudflared ] ◄────────────── [ media-broker ] (:3000 loopback)  │`  
`│                                           │                         │`  
`│                                    (127.0.0.1 IPC)                  │`  
`│                                           ▼                         │`  
`│                                  [ ComfyUI ] (:8188)                │`  
`└─────────────────────────────────────────────────────────────────────┘`

#### **Graceful Offline Fallback**

If the outbound tunnel disconnects, media-broker shifts to reading render manifests from a local disk queue (/var/spool/renders). It executes these jobs through the exact same ComfyUI interface, VRAM flush routines (POST /free), and quantization logic used during online mode. Production continues uninterrupted on local hardware, maintaining the invariant that the cloud edge optimizes coordination but is not an indispensable dependency for physical execution.

#### **Hardware Failure: SIMULATION\_ONLY Mode**

If Rig 2 suffers a catastrophic hardware fault (e.g., power loss, GPU failure), the edge-director prevents studio-wide blocks via SIMULATION\_ONLY mode.

`// EdgeGateway Ingress Router (src/index.ts)`  
`app.post("/dispatch", async (c) => {`  
  `const payload = await c.req.json();`  
  `const brokerSockets = await getActiveBrokerSockets(c.env);`

  `// If GPU foundry is offline, evaluate execution mode`  
  `if (brokerSockets.length === 0) {`  
    `if (payload.allowSimulationFallback) {`  
      ``console.warn(`[EdgeDirector] Foundry offline. Triggering SIMULATION_ONLY mode for ${payload.sceneId}`);``  
        
      `// Execute narrative state transition in D1 without generating pixels`  
      `const result = await executeNarrativeStateMutation(c.env.DB, payload.sceneAst);`  
        
      `return c.json({`  
        `status: "COMMITTED_WITHOUT_MEDIA",`  
        `sceneId: payload.sceneId,`  
        `stateDelta: result.delta,`  
        `message: "Narrative state advanced in D1. Rendering queued for batch processing when Rig 2 resumes."`  
      `});`  
    `}`

    `return c.json({ error: "FOUNDRY_OFFLINE", message: "No active GPU spoke connected." }, 503);`  
  `}`

  `// Normal execution flow`  
  `return forwardToRenderQueue(c, payload);`  
`});`

In this mode, narrative mutations execute directly in Cloudflare D1. Writers continue advancing character injuries, deducting inventory, and logging relationship deltas at minimal cost. The unrendered scene ASTs are preserved in a persistent D1 backlog queue. When Rig 2 reconnects, media-broker drains the backlog and renders the missing visual plates in an automated batch, reconciling the visual archive with canonical truth.

### **7\. End-to-End Operational Lifecycle Trace**

The complete, multi-hop lifecycle of an execution request across the edge-director pipeline executes through 23 distinct steps:

`Artist (Rig 1)              EdgeGateway               ShotCoordinatorDO             media-broker (Rig 2)          ComfyUI (:8188)`  
      `│                          │                            │                              │                           │`  
 `1.   ├─ POST /dispatch ────────►│                            │                              │                           │`  
      `│  (JWT + Payload)         ├─ 2. Query D1 (is_dirty)    │                              │                           │`  
      `│                          ├─ 3. Assert (dirty == 0)    │                              │                           │`  
      `│                          ├─ 4. Forward to DO ────────►│                              │                           │`  
      `│                          │                            ├─ 5. Check Idempotency Key    │                           │`  
      `│                          │                            ├─ 6. Enqueue Job [FIFO]       │                           │`  
      `│                          │                            ├─ 7. Lock Mutex (Active = null│                           │`  
      `│                          │                            ├─ 8. Issue Lease (Epoch: 4) ─►│                           │`  
      `│                          │                            │     (fencingToken: 4, 30s)   │                           │`  
      `│                          │                            │                              ├─ 9. /free VRAM Flush ────►│`  
      `│                          │                            │                              ├─ 10. Poll nvidia-smi      │`  
      `│                          │                            │                              ├─ 11. POST /prompt ───────►│`  
      `│                          │                            │◄── 12. BROKER_HEARTBEAT ─────┤  (Isolated Thread)        │`  
      `│                          │                            ├─ 13. Extend Watchdog (30s)   │                           │`  
      `│                          │                            │◄── 14. BROKER_PROGRESS (45%)─┤◄─ /ws Telemetry ──────────┤`  
      `│◄─ 15. PROGRESS (45%) ────┴────────────────────────────┤                              │                           │`  
      `│   (via Hibernated WSS)                                │                              │                           │`  
      `│                                                       │                              ├─ 16. Render Finished ─────┤`  
      `│                                                       │                              ├─ 17. Neural Matting Pass  │`  
      `│                                                       │                              ├─ 18. Upload to R2 Bucket  │`  
      `│                                                       │◄── 19. BROKER_COMPLETE ──────┤  (Signed Hash URL)        │`  
      `│                                                       │    (fencingToken: 4)         │                           │`  
      `│                                                       ├─ 20. Assert (token == 4)     │                           │`  
      `│                                                       ├─ 21. Release Mutex Lock      │                           │`  
      `│◄─ 22. SHOT_READY ─────────────────────────────────────┤                              │                           │`  
      `│   (Asset URL: pub-r2.../sha256_e3b0...)               ├─ 23. Dispatch Next Job       │                           │`

> 1. **Dispatch Submission:** Rig 1 sends an authenticated POST /dispatch request with a signed JWT and the SpokeExecutionPayload.  
> 2. **D1 Continuity Interrogation:** EdgeGateway queries scene\_fact\_dependencies in Cloudflare D1.  
> 3. **Continuity Assertion:** The gateway verifies dirty\_count \== 0\.  
> 4. **Durable Object Routing:** The gateway routes the payload to ShotCoordinatorDO via its namespace ID.  
> 5. **Idempotency Verification:** The DO checks the idempotency\_key against ctx.storage to prevent duplicate renders.  
> 6. **Queue Insertion:** The DO adds the validated task to its single-threaded FIFO queue array.  
> 7. **Mutex Acquisition:** The DO checks that its hardware lock is unallocated (activeJob \=== null).  
> 8. **Lease Grant:** The DO increments the epoch counter (*N*\=4), sets a 30-second watchdog alarm, and issues the lease over the broker WebSocket.  
> 9. **VRAM Hygiene Flush:** media-broker calls POST 127.0.0.1:8188/free to purge previous model weights from memory.  
> 10. **Hardware Pre-Flight:** The broker queries nvidia-smi to confirm VRAM is clear.  
> 11. **Graph Injection:** The broker injects frame counts and seeds into the ComfyUI API endpoint (POST /prompt).  
> 12. **Asynchronous Heartbeat:** The broker's isolated background thread pulses BROKER\_HEARTBEAT every 10 seconds.  
> 13. **Lease Extension:** The DO receives the heartbeat and pushes the watchdog alarm back by \+30 seconds.  
> 14. **Loopback Telemetry Ingestion:** The broker reads raw node progress from ComfyUI's local WebSocket and forwards normalized progress up the tunnel.  
> 15. **Hibernation Relay:** The DO wakes from hibernation, broadcasts the progress percentage to connected artist sockets, and evicts its isolate back to sleep.  
> 16. **Render Completion:** ComfyUI completes the final sampling step and emits its completion sentinel.  
> 17. **Alpha Matting / Post-Processing:** The broker runs background removal passes if designated by the workflow.  
> 18. **Staging Storage Upload:** The broker uploads the rendered .mp4 plate to Cloudflare R2 under an epoch-scoped key.  
> 19. **Completion RPC:** The broker sends a BROKER\_COMPLETE sentinel carrying the signed asset hash and fencing token (*N*\=4).  
> 20. **Fencing Token Assertion:** The single-threaded DO verifies that the presented token matches its active epoch (4==4).  
> 21. **Hardware Mutex Release:** The DO marks the task complete, releases the active lease, and clears the hardware lock.  
> 22. **Asset Notification:** The DO delivers a SHOT\_READY envelope containing the signed R2 URL to the artist's client cockpit, mounting the video plate into the Remotion timeline.  
> 23. **Next Task Dispatch:** The DO calls getNextFairJob() to select the next pending shot from its queue, ensuring fair multi-tenant access across the studio.

---
