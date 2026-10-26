# Simulation Engine Axioms: Knowledge Graph Causal Engine, LevelGraph & Neo4j Integration

An architectural treatise on foundational simulation design, defining the Knowledge Graph not as passive data storage, but as an active tension field, causal engine, and deontic constraint enforcer.

---

## 1. The Knowledge Graph as a Tension Field

A database stores isolated entities; a Knowledge Graph is an interconnected causal matrix enforcing physical and narrative consequence across the simulated universe:
* **The Atom (Nodes / Existence):**
  * Nodes represent physical entities (`pc_evelyn`, `obj_sword`, `room_tavern`) or conceptual entities (`faction_thieves_guild`, `event_murder_882`, `quest_save_princess`).
  * *Conservation of Mass (Orphan Nodes):* A node does not depend on a spatial coordinate to exist. Deleting the location of an object does not destroy it; it becomes an *Orphan Node* in the void awaiting reconnection. State and matter cannot be deleted by database error.
* **The Bond (Edges / Covenants):**
  * Relationships are active verbs (`(:Player)-[:WIELDS]->(:Sword)`, `(:Guard)-[:SERVES]->(:King)`).
  * *State as Edge Metadata:* State belongs to the relationship, not the object. Ownership is stored as an edge property: `[:WIELDS { hand: "right", durability: 80 }]`. The Logic Kernel queries the *nature* of the grip, not a static boolean field on the sword.

---

## 2. Topology as Logic: Deontic Constraints & Social Propagation

The graph structure directly executes deontic constraints (laws, permissions, and accessibility) without imperative `if/else` logic:

### A. The "Locked Door" Topological Gate
Instead of checking `door.isLocked === true`, accessibility is resolved via graph path topology:
* Path: `(Room_A)-[:CONNECTED_TO]->(Room_B)`.
* If the edge is missing or marked `state: "LOCKED"`, mathematically **Room B does not exist relative to Room A**.

### B. Social Propagation & Transitive Blast Radii
Consequence propagates through graph traversal rather than hardcoded event scripts:
* Fact 1: `(Player)-[:KILLED]->(Goblin_A)`.
* Fact 2: `(Goblin_King)-[:LOVES]->(Goblin_A)`.
* Query Traversal: `MATCH (King)-[:LOVES]->(victim)<-[:KILLED]-(Player)`.
* Result: The King's hostility is mathematically derived from the topology of the crime.

---

## 3. Graph Surgery: The Atomic Transaction

State mutation occurs via topological transplantation rather than row updates, eliminating race conditions and item duplication:
1. **Sever:** `DELETE EDGE (:Player)-[:WIELDS]->(:Sword)` (momentary falling state; unowned).
2. **Forge:** `CREATE EDGE (:Sword)-[:LOCATED_IN]->(:Room)` (final state; grounded).
* Guarantees an entity is never in two places at once, nor in zero places unless explicitly annihilated.

---

## 4. The "Native" Pivot: Embedded LevelGraph vs. External Neo4j

Balancing latency and computational scope across architecture tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. EMBEDDED GRAPH: LevelGraph (v9.0-Native / ZoneDO)        │
│    - Location: Node.js process / Cloudflare Durable Object  │
│    - Latency: ~0ms (Application Heap / NVMe)                │
│    - Scope: Local Room / Sharded Tile Physics ("Can I hit") │
├─────────────────────────────────────────────────────────────┤
│ 2. EXTERNAL GRAPH: Neo4j (Global Shard)                     │
│    - Location: Remote cluster / Aura via Bolt over HTTP     │
│    - Latency: ~50ms (Network Wire)                          │
│    - Scope: Global Macro-State ("Who is the King of X")     │
└─────────────────────────────────────────────────────────────┘
```

### The "Thundering Herd" Prevention on Edge Workers:
Workers do not maintain persistent TCP sockets to Neo4j. The Edge treats Neo4j as an HTTP REST endpoint, executing atomic transactions and terminating immediately:
```typescript
export class GraphClient {
  private readonly endpoint: string;
  private readonly auth: string;

  constructor(env: Env) {
    this.endpoint = env.NEO4J_URI;
    this.auth = env.NEO4J_AUTH;
  }

  async executeTransaction(cypher: string, params: Record<string, any>): Promise<QueryResult> {
    const response = await fetch(`${this.endpoint}/db/data/transaction/commit`, {
      method: 'POST',
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statements: [{ statement: cypher, parameters: params }],
      }),
    });
    if (!response.ok) throw new Error(`Graph Heresy: ${response.statusText}`);
    return await response.json();
  }
}
```

---

## 5. The Epistemic Filter: Secret Gating for Narrator Models

The Knowledge Graph functions as the Access Control List (ACL) for reality, preventing LLM narrative agents from hallucinating unperceived items:
* Query: *"What do I see?"*
* Topology: `(Room)-[:CONTAINS]->(Trap)`.
* Gatekeeper Check: Does `(Player)-[:DETECTED]->(Trap)` exist?
  * **False:** The `Trap` node is strictly pruned from the LLM context payload. The model literally cannot perceive it.
  * **True:** The `Trap` node is injected into `<active_context>`.
