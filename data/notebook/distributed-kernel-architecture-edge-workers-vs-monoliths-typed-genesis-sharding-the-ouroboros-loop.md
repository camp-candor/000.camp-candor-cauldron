# Distributed Kernel Architecture: Edge Workers vs. Monoliths, Typed Genesis Sharding & The Ouroboros Loop

An architectural specification examining the deployment topology of the Logic Kernel (Edge Durable Objects vs. Centralized Compute), typed multi-world configuration sharding, and end-to-end state loop verification.

---

## 1. Where the Brain Lives: Edge vs. Centralized Monolith

The Logic Kernel is a pure, isomorphic TypeScript function library:
$$\text{Input (State + Action)} \longrightarrow \text{Process (Math + Logic)} \longrightarrow \text{Output (State Delta)}$$

Because it has zero dependencies on DOM APIs or browser state, it can execute anywhere JavaScript runs. However, physical latency dictates placement:

```
[ EDGE ARCHITECTURE (Twitch Combat / Movement) ]
Player (London) ──(5ms)──► ZoneDO (London Edge) ──(0ms Kernel Math)──► Response (5ms) = 10ms Total

[ MONOLITH ARCHITECTURE (Centralized Cloud) ]
Player (London) ──(70ms Transatlantic Wire)──► Virginia Server ──(0ms Math)──► Response (70ms) = 150ms Total
```

### The Hybrid Partitioning Rule:
* **The Hands (Edge Durable Objects):** Sub-millisecond twitch actions, collision detection, and instant combat calculations run locally in `ZoneDO`.
* **The Brain (Centralized Compute / Heavy Monolith):** Heavy operations that exceed Cloudflare's CPU time thresholds (e.g., 10,000-hex Wave Function Collapse dungeon generation, continental A* pathfinding, or simulating 50 years of economic history) run on dedicated Node.js servers (Render, Fly.io, or EC2).

---

## 2. Library of Genesis: Typed Sharding vs. The Monolith God Object

Storing all world constraints in a single JSON file creates a bloated, fragile God Object. The architecture shards configurations into modular world blueprints validated by Zod at build time:

```
packages/config/
├── package.json
├── src/
│   ├── index.ts          <-- The Typed Exporter
│   ├── loader.ts         <-- The Zod Validation Gate
│   └── worlds/
│       ├── dark_sun.json
│       ├── eberron.json
│       ├── forgotten_realms.json
│       └── ravenloft.json
```

### The Validation Gate (`packages/config/src/loader.ts`):
Configuration is not passive storage; it contains the compiler logic that rejects invalid schemas before deployment:
```typescript
import { WorldSchema } from '@repo/types';
import darkSunRaw from './worlds/dark_sun.json';
import eberronRaw from './worlds/eberron.json';

// THE GATE OF JUDGMENT: Build fails here if JSON violates the law
export const DarkSunConfig = WorldSchema.parse(darkSunRaw);
export const EberronConfig = WorldSchema.parse(eberronRaw);

export const WORLDS = {
  dark_sun: DarkSunConfig,
  eberron: EberronConfig,
} as const;
```

* **The Architectural Law:** `packages/types` defines the shape of the law; `packages/config` enforces and exports the content of the law; application runtimes consume the verified law with full IntelliSense and zero runtime ambiguity.

---

## 3. The Ouroboros Test (End-to-End Read/Write Loop)

A simulation system that cannot write and read its own state deterministically is merely a hallucination engine. The Ouroboros Test validates the entire circuit:

```
[ React Client (apps/octo) ]
            │
            │ 1. WebSocket HELLO packet
            ▼
[ Cloudflare Edge (apps/edge) ] ── Spawns ZoneDO
            │
            │ 2. Authenticated Fetch { event: "PLAYER_CONNECT", id: "user_123" }
            ▼
[ Core Node.js API (apps/server) ]
            │
            ├──► WRITE: Neo4j MERGE (p:Player {id: "user_123"}) SET p.last_seen = timestamp()
            └──► READ:  Neo4j MATCH (p:Player {id: "user_123"}) RETURN p.last_seen
            │
            ▼ 3. Returns database timestamp to Edge
[ Cloudflare Edge ]
            │
            ▼ 4. Emits WebSocket verified timestamp to Client
[ React Client ] ── Displays: "Last Seen: [Timestamp] verified by Graph"
```

* **Verification Criterion:** If the timestamp rendered on screen matches the integer timestamp in Neo4j, the nervous system is intact.
