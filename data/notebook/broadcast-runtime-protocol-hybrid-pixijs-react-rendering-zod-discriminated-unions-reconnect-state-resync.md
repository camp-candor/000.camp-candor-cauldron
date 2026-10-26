# Broadcast Runtime Protocol: Hybrid PixiJS/React Rendering, Zod Discriminated Unions & Reconnect State Resync

A technical engineering specification covering the client-side broadcast runtime protocol: single-store fan-out to PixiJS and React, Zod schema validation, video texture compositing, heartbeat staleness checks, state resync across Durable Object hibernation cycles, and the complete dot-namespaced control catalog.

---

## 1. Single-Store Architecture: PixiJS & React Fan-Out

To prevent desynchronization between continuous generative graphics and structured DOM elements:
* **The Anti-Pattern:** Allowing the PixiJS canvas and React components to parse the incoming WebSocket stream independently leads to race conditions, dropped packets, and visual drift.
* **The Single-Store Pattern:** A single centralized message handler validates packets and updates a shared client-side store (e.g., Zustand or an event emitter). Both rendering engines act strictly as subscribers:
  * **PixiJS Canvas Layer:** Imperative subscription syncing WebGL canvas state (procedural generative graphics, background loops, or texture playback).
  * **React DOM Layer:** Reactive subscription rendering structured overlays (lower-thirds, "now playing" cards, stream alerts).

---

## 2. Structural Envelope & Dot-Namespaced Routing

Every message separates a thin, fixed envelope (routing/replay concerns) from a type-specific payload (domain data):
```typescript
interface Envelope<T extends string, P> {
  type: T;            // Dot-namespaced, e.g. "scene.play"
  seq: number;        // Monotonic per-connection (gap detection for resync)
  v: 1;               // Protocol version
  serverTime: number; // Epoch ms (clock-offset math for seeking)
  payload: P;
}
```

### Architectural Principles:
1. **Namespace by Domain:** `type` strings are dot-prefixed (`scene.play`, `overlay.show`, `audio.setBed`, `pixi.trigger`, `system.ping`). The client dispatcher routes by `type.split(".")[0]` to the target subsystem reducer before per-type logic executes.
2. **Two Independent Unions:** `ServerMessage` (server-to-client) and `ClientMessage` (client-to-server) are validated separately, reflecting the asymmetrical nature of command streams vs. client telemetry.
3. **Message Shapes:**
   * *State-Replace:* Idempotent (e.g., `scene.play`, `overlay.show`, `audio.setBed`). Replaying during resync resets state safely. **Default shape.**
   * *One-Shot Triggers:* Non-idempotent (e.g., `scene.skip`, `pixi.trigger`). Carries an `actionId` (UUID) for client deduplication.
   * *Client-Reported Events:* Telemetry (e.g., `scene.ended`, `scene.error`) flowing client $\longrightarrow$ DO to advance scheduling.
4. **Coarse Slices Over Fine-Grained Diffs:** For `overlay.update`, transmit full props rather than field-level deltas, making message logs self-contained for audit and post-incident debugging.

---

## 3. Boundary Schema Validation: Zod Discriminated Unions

Every message is validated at the wire boundary using `safeParse` to prevent uncaught exceptions from terminating the broadcast loop:

```typescript
import { z } from "zod";

const SceneRef = z.string().regex(/^SC-\d{2,4}$/);

export const PlayScenePayload = z.object({
  sceneId: SceneRef,
  sceneStartTime: z.number(),
  audioBedVersion: z.string(),
});

export const ShowOverlayPayload = z.object({
  componentId: z.enum(["NOW_PLAYING", "LOWER_THIRD", "VIEWER_ALERT"]),
  props: z.record(z.unknown()),
});

export const ResyncSnapshotPayload = z.object({
  currentScene: z.object({ sceneId: SceneRef, sceneStartTime: z.number() }),
  overlays: z.array(z.object({
    componentId: z.enum(["NOW_PLAYING", "LOWER_THIRD", "VIEWER_ALERT"]),
    props: z.record(z.unknown()),
  })),
  audioBed: z.object({ version: z.string(), muted: z.boolean() }),
});

export const ServerMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("scene.play"), seq: z.number(), v: z.literal(1), serverTime: z.number(), payload: PlayScenePayload }),
  z.object({ type: z.literal("overlay.show"), seq: z.number(), v: z.literal(1), serverTime: z.number(), payload: ShowOverlayPayload }),
  z.object({ type: z.literal("system.resyncSnapshot"), seq: z.number(), v: z.literal(1), serverTime: z.number(), payload: ResyncSnapshotPayload }),
  z.object({ type: z.literal("system.ping"), seq: z.number(), v: z.literal(1), serverTime: z.number(), payload: z.object({}) }),
]);
```

---

## 4. The Complete Dot-Namespaced Message Catalog

| Domain | Type | Direction | Classification | Purpose |
|---|---|---|---|---|
| **`system.*`** | `system.hello` | C$\rightarrow$S | Handshake | Session token, machine id, supported protocol version |
| | `system.ack` | S$\rightarrow$C | Handshake | Connection authorized and live |
| | `system.reject` | S$\rightarrow$C | Termination | Invalid/expired session (distinct close code; halts blind retry) |
| | `system.ping` | S$\rightarrow$C | Heartbeat | Carries `serverTime` for drift tracking |
| | `system.resyncRequest` | C$\rightarrow$S | Recovery | Dispatched on connect and `seq` gap detection |
| | `system.resyncSnapshot` | S$\rightarrow$C | State-Replace | Full state snapshot across all domain slices |
| | `system.shutdownNotice`| S$\rightarrow$C | Event | Advance warning of scheduled DO restart/deployment |
| | `system.sessionExpiring`| S$\rightarrow$C | Event | Clerk session token nearing expiration |
| | `system.protocolMismatch`| Both | Error | Protocol version incompatibility notification |
| | `system.error` | S$\rightarrow$C | Event | Non-fatal processing error for out-of-band logging |
| **`scene.*`** | `scene.play` | S$\rightarrow$C | State-Replace | Start scene at specified timestamp |
| | `scene.preload` | S$\rightarrow$C | Command | Prefetch/buffer upcoming scene asset |
| | `scene.seek` | S$\rightarrow$C | Command | Jump within active scene |
| | `scene.pause` / `resume` | S$\rightarrow$C | Command | Operator maintenance override |
| | `scene.skip` | S$\rightarrow$C | One-Shot Trigger | Abort-and-advance with deduplication `actionId` |
| | `scene.queueUpdate` | S$\rightarrow$C | State-Replace | Replace upcoming playlist queue |
| | `scene.ended` | C$\rightarrow$S | Event | Client reports natural EOF for server state advance |
| | `scene.error` | C$\rightarrow$S | Event | Client reports video decoding/playback failure |
| **`audio.*`** | `audio.setBed` | S$\rightarrow$C | State-Replace | Load pre-baked audio-bed manifest (layers, Foley, ducking) |
| | `audio.mute` / `unmute` | S$\rightarrow$C | Command | Operator mute override |
| | `audio.setMasterGain` | S$\rightarrow$C | State-Replace | Set global audio gain level |
| **`overlay.*`**| `overlay.show` | S$\rightarrow$C | State-Replace | Mount named React component with full props |
| | `overlay.update` | S$\rightarrow$C | State-Replace | Replace props on mounted overlay (full payload) |
| | `overlay.hide` | S$\rightarrow$C | State-Replace | Unmount specified component |
| | `overlay.hideAll` | S$\rightarrow$C | State-Replace | Clear all overlays (idle/fallback state) |
| **`pixi.*`** | `pixi.setState` | S$\rightarrow$C | State-Replace | Set generative mode and parameters |
| | `pixi.trigger` | S$\rightarrow$C | One-Shot Trigger | Trigger transient visual burst with `actionId` |
| | `pixi.setPalette` | S$\rightarrow$C | State-Replace | Swap active color/texture parameters |
| **`viewer.*`** | `viewer.*` | — | Extension Point| Reserved for future chat/donation interactive triggers |

---

## 5. PixiJS Video Texture Compositing & Alpha Codecs

When wrapping Remotion `.mp4` video inside PixiJS via `Texture.from(videoElement)`:
* **Opaque Video (H.264 / H.265):** Full-frame playback during scenes; Pixi active during idle/transitions.
* **Alpha Channel Video (ProRes 4444 / WebM VP9 with Alpha):** Required if Pixi generative graphics must show through transparent regions of the Remotion video.

---

## 6. Client Reconnect, Heartbeats & Clock-Offset Resync

```typescript
class ChannelSocket {
  private ws: WebSocket | null = null;
  private backoffMs = 500;
  private readonly maxBackoffMs = 15_000;
  private lastMessageAt = Date.now();
  private heartbeatTimer?: ReturnType<typeof setInterval>;

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.backoffMs = 500;
      this.lastMessageAt = Date.now();
      this.send({ type: "system.resyncRequest" }); // Mandatory resync
      this.startStalenessWatch();
    };

    this.ws.onmessage = (e) => {
      this.lastMessageAt = Date.now();
      handleIncoming(e.data); // Zod safeParse
    };

    this.ws.onclose = (e) => {
      this.stopStalenessWatch();
      if (e.code === 4001) return handleReauth(); // Expired Clerk session
      this.scheduleReconnect();
    };

    this.ws.onerror = () => this.ws?.close();
  }

  private scheduleReconnect() {
    setTimeout(() => this.connect(this.ws!.url), this.backoffMs + Math.random() * 250);
    this.backoffMs = Math.min(this.backoffMs * 2, this.maxBackoffMs);
  }

  private startStalenessWatch() {
    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastMessageAt > 20_000) {
        store.getState().enterIdleFallback();
        this.ws?.close();
      }
    }, 5_000);
  }

  private stopStalenessWatch() {
    clearInterval(this.heartbeatTimer);
  }
}
```

### Critical Reconnection Laws:
1. **Application-Level Pings:** Browsers do not expose WebSocket protocol-level ping frames. Heartbeats must be application-level `system.ping` messages from the DO.
2. **Clock-Offset Video Seeking:**
   ```typescript
   function applyResync(msg: ResyncSnapshotPayload, serverTime: number) {
     const clockOffsetMs = serverTime - Date.now();
     const elapsedMs = (Date.now() + clockOffsetMs) - msg.currentScene.sceneStartTime;
     videoElement.currentTime = Math.max(0, elapsedMs / 1000);
     store.getState().setOverlays(msg.overlays);
     store.getState().setAudioBed(msg.audioBed);
   }
   ```
3. **Monotonic Sequence Auditing:** Every server envelope carries an incrementing `seq` integer. Any gap (e.g., jumping from 41 to 44) triggers an automatic `system.resyncRequest`.
4. **Durable Object State Persistence:** Channel state must be committed to `ctx.storage.put(...)` on every transition so that waking DO instances answer `system.resyncRequest` with valid chronological offsets.
