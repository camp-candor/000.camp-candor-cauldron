# Broadcast Terminal Architecture: OBS Browser Source, Cloudflare Durable Objects & Playout vs. Live-Render Paths

An operational architecture specification covering the terminal broadcast layer: OBS integration, Clerk authentication boundaries, Cloudflare Worker and Durable Object WebSocket infrastructure, and the trade-offs between playout and live-render architectures.

---

## 1. Outermost Broadcast Layer Overview

The terminal delivery loop connects an edge orchestration layer to an on-premises OBS broadcast client:

```
[ Cloudflare Edge: Worker (Upgrade Handler) ] ── (Validates Clerk token)
                     │
                     ▼
[ Cloudflare Durable Object (WebSocket Hibernation API) ] ── Holds persistent channel state
                     ▲
                     │ (Two-way WebSocket: ws://...)
                     ▼
[ Local Machine: Browser Page / Server ]
   ├── Authentication: Clerk Session verification
   └── Embedded Client: OBS Browser Source (Chromium Embedded Framework - CEF)
```

---

## 2. Worker vs. Durable Object WebSocket Lifecycle

### The Stateless Worker Fallacy:
A bare Cloudflare Worker cannot hold persistent WebSocket connections open across hours of broadcasting. Standard Worker invocations are short-lived, stateless, and lack continuous in-memory execution contexts.

### The Durable Object Architecture:
1. **The Worker's Sole Job:** Intercepts the initial HTTP `GET` upgrade request, validates the Clerk session token, and forwards the connection to a named **Durable Object (DO)**.
2. **WebSocket Hibernation API:**
   * Standard WebSockets in DOs keep instances running continuously, draining CPU budget and driving up billing costs.
   * Under the **WebSocket Hibernation API**, Cloudflare's edge proxy maintains the TCP connection while the DO's JavaScript execution context is evicted from memory during idle periods.
   * The DO wakes automatically when an incoming message arrives or can broadcast to connected sockets without keeping in-memory execution context alive.
3. **Channel Scheduling Authority:** The DO serves as the single source of truth for channel programming, tracking what is currently playing, upcoming scene queues, and viewer-facing overlay triggers.

---

## 3. Playout Architecture vs. Live-Render Path

When outputting generative content to OBS, two distinct operational paths exist:

| Architectural Metric | Path A: Playout Architecture (Recommended) | Path B: Live-Render Path |
|---|---|---|
| **Mechanism** | Scenes are pre-rendered into finished `.mp4` files via `renderMedia()`. The local client (or OBS VLC/Media Source) simply plays back a queued file playlist. | Local browser runs `@remotion/player`, receives scene props over WebSockets, and renders React compositions live in real time. |
| **WebSocket Role** | Control/state channel only (e.g., `"now playing: SC-12"`, `"trigger overlay B"`, `"next file: SC-13.mp4"`). | Pushes complete scene props, dynamic parameters, and layout states in real time. |
| **OBS Integration** | Standard OBS Media Source or VLC Playlist Source. | OBS Browser Source (embedded CEF instance). |
| **Operational Stability** | **Rock-solid.** 100% immune to rendering lag, dropped frames under CPU spikes, or CEF rendering bugs. | **Fragile.** Prone to dropped frames, GPU contention between OBS and Chromium, and browser crashes on long runs. |
| **Creative Flexibility** | Linear or pre-compiled branching. | Real-time reactive changes, live chat/viewer integrations, on-the-fly re-ordering. |

*Recommendation:* For automated 24/7 channels, use the **Playout Path**. Pre-render scenes to finished files using tuned batch concurrency, reserving the WebSocket strictly for scheduling authority and overlay coordination.

---

## 4. Operator vs. Viewer Authentication (The Role of Clerk)

* **Not Viewer Gating:** In a private broadcast ingest setup, Clerk authentication does not gate viewers (viewers watch the final YouTube/Twitch stream).
* **Machine / Operator Security Boundary:** Clerk authorizes the local broadcast machine as an authenticated playout client of the Cloudflare scheduling service. It proves to the Worker that the client opening the socket is the legitimate broadcast box before granting access to the private channel schedule.
