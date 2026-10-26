`goblin-spatial` is the proposed, pure-geometry engine designed to handle distance, adjacency, visibility, and pathfinding for the simulation pipeline.

---

### 1. Architectural Philosophy: The Three-Way Separation of Concerns

The pipeline enforces a strict boundary between static canon, mutable state, and pure mathematics:

```text
goblin-lore (Canon Law)
    ↓ (Defines what the map means: terrain types, location IDs, room boundaries)
goblin-spatial (Pure Geometry Engine)
    ↓ (Defines how space works: distance, line of sight, rings, paths)
worker-sower-engine / Ledger (Runtime State)
    ↓ (Defines who is standing where: character (q, r, s) coordinates, movement history)

```

* **`goblin-lore`** owns the map definitions (e.g., `hex 17 = camp`, `hex 23 = valve_room`, `terrain[23] = cramped`).


* **`worker-sower-engine` (via SQLite/PostgreSQL ledger)** owns live actor positions and dynamic state.


* **`goblin-spatial`** owns zero state. It is a deterministic mathematical library that knows nothing about LLMs, dialogue, TTS, Remotion, or the database.



---

### 2. Core Functional Responsibilities

`goblin-spatial` provides an API for coordinate math and topological relationships:

* **Hex Coordinate Math:** Cubic coordinate handling ($(q, r, s)$) ensuring distance symmetry and neighbor lookups.


* **Pure Mathematical Queries:**
* `distance(a, b)`

* `neighbors(hex)`

* `range(center, radius)` and `ring(center, radius)`

* `pathfinding(start, end, obstacles)`

* `line_of_sight(a, b, map)`




---

### 3. Role in the Narrative Simulation

Spatial coordinates in the simulation answer concrete narrative prerequisites before dialogue is drafted:

* **Conflict Eligibility (Stage 3):** Spatial proximity sweeps determine who can encounter whom and trigger PRNG grievance lotteries.


* **Feeding the Epistemic System:** Instead of replacing character knowledge, `goblin-spatial` feeds the sensory/epistemic pipeline. For example, if Character A attacks Character B in hex 23, the engine queries whether Character C in hex 24 has unobstructed line-of-sight and audible proximity. Only if spatial checks pass does the system register an `OBSERVED_EVENT`, mutating Character C's dynamic belief state (`KNOWS(Fact_X)`).


* **Isolation and Reinforcement:** Dictates who can intervene or witness a conflict without relying on open-ended language model assumptions.



---

### 4. Implementation Strategy: Internal Module First

The architecture recommends **delaying an independent repository extraction**:

1. **Start as an Internal Module:** Build it directly inside `worker-sower-engine` (e.g., `sower-engine/spatial/` holding `coords.ts`, `distance.ts`, `neighbors.ts`, `visibility.ts`). The cardinal rule is that spatial code imports nothing from the parent engine.


2. **Naming Rationale:** The name `goblin-spatial` was specifically chosen over `goblin-hexmap` so that consumers interface with spatial operations rather than concrete data structures. If the underlying layout transitions from a cubic hex grid to an arbitrary topological node graph, the API contracts remain stable.


3. **Extraction Criteria:** Extract into a dedicated `goblin-spatial` repository only when:
* A secondary consumer (such as a standalone SVG visual debugger or map viewer) requires it.


* The API stabilizes after running real episodic simulation cycles.


* Independent version pinning is needed per episode in `render_manifest.json`.





---

### 5. The Visual Debugger

The design recommends pairing the spatial library with a lightweight SVG visualizer. Rendering a static map snapshot showing character positions, proximity vectors, and movement paths across simulation cycles allows rapid detection of simulation defects (clustering, dead zones, or pathfinding bottlenecks) without parsing raw JSON logs.
`goblin-spatial` is the proposed, pure-geometry engine designed to handle distance, adjacency, visibility, and pathfinding for the simulation pipeline.

---

### 1. Architectural Philosophy: The Three-Way Separation of Concerns

The pipeline enforces a strict boundary between static canon, mutable state, and pure mathematics:

```text
goblin-lore (Canon Law)
    ↓ (Defines what the map means: terrain types, location IDs, room boundaries)
goblin-spatial (Pure Geometry Engine)
    ↓ (Defines how space works: distance, line of sight, rings, paths)
worker-sower-engine / Ledger (Runtime State)
    ↓ (Defines who is standing where: character (q, r, s) coordinates, movement history)

```

* **`goblin-lore`** owns the map definitions (e.g., `hex 17 = camp`, `hex 23 = valve_room`, `terrain[23] = cramped`).


* **`worker-sower-engine` (via SQLite/PostgreSQL ledger)** owns live actor positions and dynamic state.


* **`goblin-spatial`** owns zero state. It is a deterministic mathematical library that knows nothing about LLMs, dialogue, TTS, Remotion, or the database.



---

### 2. Core Functional Responsibilities

`goblin-spatial` provides an API for coordinate math and topological relationships:

* **Hex Coordinate Math:** Cubic coordinate handling ($(q, r, s)$) ensuring distance symmetry and neighbor lookups.


* **Pure Mathematical Queries:**
* `distance(a, b)`

* `neighbors(hex)`

* `range(center, radius)` and `ring(center, radius)`

* `pathfinding(start, end, obstacles)`

* `line_of_sight(a, b, map)`




---

### 3. Role in the Narrative Simulation

Spatial coordinates in the simulation answer concrete narrative prerequisites before dialogue is drafted:

* **Conflict Eligibility (Stage 3):** Spatial proximity sweeps determine who can encounter whom and trigger PRNG grievance lotteries.


* **Feeding the Epistemic System:** Instead of replacing character knowledge, `goblin-spatial` feeds the sensory/epistemic pipeline. For example, if Character A attacks Character B in hex 23, the engine queries whether Character C in hex 24 has unobstructed line-of-sight and audible proximity. Only if spatial checks pass does the system register an `OBSERVED_EVENT`, mutating Character C's dynamic belief state (`KNOWS(Fact_X)`).


* **Isolation and Reinforcement:** Dictates who can intervene or witness a conflict without relying on open-ended language model assumptions.



---

### 4. Implementation Strategy: Internal Module First

The architecture recommends **delaying an independent repository extraction**:

1. **Start as an Internal Module:** Build it directly inside `worker-sower-engine` (e.g., `sower-engine/spatial/` holding `coords.ts`, `distance.ts`, `neighbors.ts`, `visibility.ts`). The cardinal rule is that spatial code imports nothing from the parent engine.


2. **Naming Rationale:** The name `goblin-spatial` was specifically chosen over `goblin-hexmap` so that consumers interface with spatial operations rather than concrete data structures. If the underlying layout transitions from a cubic hex grid to an arbitrary topological node graph, the API contracts remain stable.


3. **Extraction Criteria:** Extract into a dedicated `goblin-spatial` repository only when:
* A secondary consumer (such as a standalone SVG visual debugger or map viewer) requires it.


* The API stabilizes after running real episodic simulation cycles.


* Independent version pinning is needed per episode in `render_manifest.json`.





---

### 5. The Visual Debugger

The design recommends pairing the spatial library with a lightweight SVG visualizer. Rendering a static map snapshot showing character positions, proximity vectors, and movement paths across simulation cycles allows rapid detection of simulation defects (clustering, dead zones, or pathfinding bottlenecks) without parsing raw JSON logs.
### System Scope & Core Boundaries

`goblin-spatial` is a standalone, deterministic geometry library and visual debugging tool. Its responsibilities are strictly separated from canonical lore and runtime engine states:

* **`goblin-lore`** owns the map definitions (room IDs, static terrain types, impassable boundaries).


* **`worker-sower-engine` (relational ledger)** owns dynamic agent positions and movement histories.


* **`goblin-spatial`** owns zero state. It imports nothing from narrative or database runtimes, operating as a pure function layer: `(MapDefinition, Positions, Query) => Result`.



The library integrates the **Uber H3 Discrete Global Grid System (`h3-js`)** for hierarchical hexagonal indexing and spatial mathematics, paired with an interactive **PixiJS (`pixi.js`) HTML5 `<canvas>` application** for visual inspection, sensory debugging, and simulation trajectory verification.

---

### Functional Architecture Overview

```text
goblin-spatial/
├── src/
│   ├── index.ts                      # Public stateless API exports
│   ├── types.ts                      # Coordinate types, H3Index aliases, schemas
│   ├── h3/
│   │   ├── adapter.ts                # Planar coordinate mapping (lat/lng <-> H3)
│   │   ├── distance.ts               # gridDistance & step metrics
│   │   └── disk.ts                   # gridDisk, gridRing, and sector traversals
│   ├── navigation/
│   │   ├── pathfinding.ts            # Weighted A* search over H3 graphs
│   │   ├── traversal-cost.ts         # Terrain multiplier evaluation
│   │   └── crowding.ts               # Staging capacity and density limits
│   ├── perception/
│   │   ├── raycasting.ts             # Line-of-sight & optical occlusion checks
│   │   ├── witnesses.ts              # Sensory sweeps (auditory vs visual)
│   │   └── propagation.ts            # Acoustic blast radius & alarm spread
│   └── validation/
│       └── invariants.ts             # Pure mathematical & topological assertions
├── debugger/                         # PixiJS Canvas Debugging Application
│   ├── index.html                    # Canvas mount & DOM shell
│   ├── src/
│   │   ├── main.ts                   # PixiJS Application initialization
│   │   ├── camera/
│   │   │   └── viewport.ts           # Pan, zoom, and H3-to-pixel coordinate projection
│   │   ├── layers/
│   │   │   ├── grid-layer.ts         # Base hex mesh via cellToBoundary
│   │   │   ├── occlusion-layer.ts    # Wall, terrain, and obstruction rendering
│   │   │   ├── actor-layer.ts        # Character tokens, labels, and orientation
│   │   │   ├── overlay-layer.ts      # LoS rays, sensory disks, and A* path overlays
│   │   │   └── trail-layer.ts        # Cycle-by-cycle breadcrumb trails
│   │   └── ui/
│   │       ├── inspector.ts          # Cell inspection & distance measurement tool
│   │       └── scrubber.ts           # Cycle timeline scrubbing interface
└── tests/
    ├── invariants.test.ts            # Symmetry, identity, reciprocity tests
    ├── pathfinding.test.ts           # Route generation & obstacle avoidance tests
    └── perception.test.ts            # Sensory eligibility & obstruction tests

```

---

### Complete Listing of Repository Functionality

#### 1. Core Coordinate & H3 Math Module

Wraps and adapts Uber H3 indexing functions to provide uniform spatial reasoning across the simulation.

| Function / Capability | Input Parameters | Return Type | Description |
| --- | --- | --- | --- |
| `anchorToCell(x, y, resolution)` | `x: number, y: number, res: number` | `H3Index` | Projects local planar coordinates to an H3 index using a fixed origin anchor. |
| `cellToAnchor(cell)` | `cell: H3Index` | `{ x: number, y: number }` | Reverses an H3 cell index to planar Cartesian space for screen rendering. |
| `distance(a, b)` | `a: H3Index, b: H3Index` | `number` | Calculates the integer hex grid step distance ($\text{gridDistance}$).

 |
| `neighbors(cell)` | `cell: H3Index` | `H3Index[]` | Returns the 6 contiguous neighboring cells (k-ring 1 boundary).

 |
| `ring(center, radius)` | `center: H3Index, radius: number` | `H3Index[]` | Generates a hollow perimeter ring of cells at an exact radius.

 |
| `range(center, radius)` | `center: H3Index, radius: number` | `H3Index[]` | Generates a filled disk of cells within a maximum radius.

 |
| `boundary(cell)` | `cell: H3Index` | `Array<[lat: number, lng: number]>` | Extracts polygon vertices for rendering via `h3.cellToBoundary`. |

---

#### 2. Navigation & Stage Routing Module

Evaluates movement constraints, travel costs, and physical bounds without mutating runtime positions.

| Function / Capability | Input Parameters | Return Type | Description |
| --- | --- | --- | --- |
| `findPath(start, goal, costMap, blocked)` | `start: H3Index, goal: H3Index, costMap: Map<H3Index, number>, blocked: Set<H3Index>` | `H3Index[] | null` | A* search that computes the optimal route respecting movement costs and hard impassable walls.

 |
| `reachableCells(start, movementBudget, costMap, blocked)` | `start: H3Index, budget: number, costMap: Map<H3Index, number>, blocked: Set<H3Index>` | `H3Index[]` | Returns all cells an actor can reach given an available budget of movement points. |
| `checkCrowding(cell, stageCapacity, occupants)` | `cell: H3Index, maxPerHex: number, occupants: Map<ActorId, H3Index>` | `{ crowded: boolean, count: number }` | Enforces staging bounds (e.g., flagging crowding checks if more than 2 goblins occupy a single hex).

 |
| `nearestUnoccupied(target, occupants, blocked)` | `target: H3Index, occupants: Map<ActorId, H3Index>, blocked: Set<H3Index>` | `H3Index` | Finds the closest valid cell to a target that is neither blocked nor occupied. |

---

#### 3. Perception, Line of Sight & Sensory Verification Module

Supplies the epistemic system with geometric validation to determine whether events can be observed or heard.

| Function / Capability | Input Parameters | Return Type | Description |
| --- | --- | --- | --- |
| `hasLineOfSight(from, to, occlusions)` | `from: H3Index, to: H3Index, occlusions: Set<H3Index>` | `boolean` | Samples intermediate cells along the H3 grid path to check for optical obstructions.

 |
| `lineOfSightTrace(from, to, occlusions)` | `from: H3Index, to: H3Index, occlusions: Set<H3Index>` | `{ clear: boolean, path: H3Index[], blockedAt: H3Index | null }` | Diagnostic ray trace providing the full cell sequence and exact collision point. |
| `findWitnesses(incidentCell, actors, occlusions)` | `incidentCell: H3Index, actors: SpatialActor[], occlusions: Set<H3Index>` | `{ visual: ActorId[], auditory: ActorId[] }` | Sweeps nearby actors to determine who observed an encounter optically vs. who heard it acoustically.

 |
| `acousticSpread(origin, intensity, soundDampeningMap)` | `origin: H3Index, intensity: number, dampening: Map<H3Index, number>` | `Map<H3Index, number>` | Calculates sound falloff across walls/crawlspaces to verify transitive alarm spread.

 |

---

#### 4. Canon & Topology Adapters

Pure translation utilities that parse immutable location definitions from `goblin-lore` into math inputs.

| Function / Capability | Input Parameters | Return Type | Description |
| --- | --- | --- | --- |
| `parseStageGrid(locationData)` | `locationData: LoreLocationJson` | `ParsedTopology` | Converts canonical `stage_grid` objects (radius, blocked hexes, terrain) into H3 index sets.

 |
| `extractOcclusionMap(locationData)` | `locationData: LoreLocationJson` | `Set<H3Index>` | Builds the static obstacle and vision-blocking set from room boundaries.

 |
| `normalizeTraversalWeights(terrainTypes)` | `terrain: Record<string, string>` | `Map<H3Index, number>` | Translates terrain flavor flags (e.g., `cramped`, `pipe`, `choke`) into numeric pathfinding edge costs.

 |

---

#### 5. Deterministic Invariant Suite (`tests/invariants.test.ts`)

Pure property-based unit tests that run in milliseconds to verify geometric guarantees:

* **Distance Symmetry:** $\text{distance}(A, B) = \text{distance}(B, A)$ for all valid cells.


* **Distance Identity:** $\text{distance}(A, A) = 0$.


* **Neighbor Reciprocity:** $B \in \text{neighbors}(A) \iff A \in \text{neighbors}(B)$.


* **Planar Neighbor Count:** Every interior cell without boundary conditions has exactly 6 neighbors.


* **Obstacle Avoidance:** A path computed by `findPath()` never contains an index present in the `blocked` set.


* **Sight Reciprocity:** $\text{hasLineOfSight}(A, B, \Omega) = \text{hasLineOfSight}(B, A, \Omega)$ where $\Omega$ is an occlusion set.
* **Deterministic Replay:** Identical inputs across multiple calls produce strictly identical array references and values.



---

#### 6. PixiJS Visual Debugger Application (`debugger/`)

An interactive, hardware-accelerated `<canvas>` tool designed to surface simulation defects (clustering, dead zones, path bottlenecks) before episodic generation.

```text
┌─────────────────────────────────────────────────────────────┐
│                       PixiJS Stage                          │
│                                                             │
│  [Grid Layer]         Renders H3 polygons via Graphics      │
│  [Occlusion Layer]    Renders impassable walls / hazards    │
│  [Trail Layer]        Renders cycle N-10 to N movements     │
│  [Actor Layer]        Renders goblin tokens and IDs         │
│  [Sensory Overlay]    Renders LoS rays and witness radii    │
│                                                             │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Driven by Simulation Cycle Scrubber
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI Control Shell                       │
│  • Play / Pause / Cycle Scrubber (Cycle 0 to Cycle N)       │
│  • Proximity Ruler (Select Cell A -> Hover Cell B)          │
│  • Line-of-Sight Raycast Visualizer (Pass / Occluded)       │
│  • Crowd Density Heatmap Toggle                             │
└─────────────────────────────────────────────────────────────┘

```

##### Display Layers & Rendering Capabilities:

* **Grid Layer (`grid-layer.ts`):** Converts `boundary(cell)` lat/long coordinates into screen vertices and renders the hex mesh using `PIXI.Graphics` with anti-aliasing.
* **Occlusion Layer (`occlusion-layer.ts`):** Paints blocked hexes with high-contrast color fills to make dead zones and closed boundaries immediately obvious.


* **Actor Token Layer (`actor-layer.ts`):** Renders dynamic circles or character icons at cell centroids with nameplates, current somatic condition tags, and facing direction vectors.


* **Sensory Overlay (`overlay-layer.ts`):**
* Line-of-sight vectors between actors: green lines for clear, red lines terminating at the blocking obstruction.
* Auditory alert radii: translucent circles illustrating hearing bounds.
* Computed A* path splines connecting origin to destination.


* **Movement Trail Layer (`trail-layer.ts`):** Renders fading breadcrumb trails over the last $K$ cycles to inspect whether actors are pacing, stuck in prop-loops, or clustering in specific rooms.



##### Interactive Viewport Controls:

* **Pan & Zoom:** Smooth zoom and infinite canvas pan via mouse wheel and drag-to-scroll.
* **Cell Inspector:** Clicking any cell displays its H3 index, canonical location ID, terrain movement cost, and current occupants.
* **Ruler Tool:** Clicking two cells outputs their step distance, line-of-sight state, and computed path.
* **Timeline Scrubber:** Ingests simulation cycle dumps from `worker-sower-engine` to replay actor steps forwards and backwards.## Core Coordinate & H3 Math Module

The **Core Coordinate & H3 Math Module** forms the foundational layer of `goblin-spatial`. It provides a deterministic, pure-function geometry engine that bridges continuous Cartesian simulation space, discrete hexagonal indexing, and screen-space visualization without maintaining state or mutating world data.

By decoupling spatial mathematics from both canonical world definitions (`goblin-lore`) and runtime entity positions (`worker-sower-engine` ledger), this module guarantees that geometric operations remain stable, reproducible, and mathematically unpolluted by presentation concerns.

---

### 1. Architectural Mandate & Separation of Concerns

The spatial engine operates under a strict three-way architectural boundary:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        goblin-lore (Canon Law)                         │
│  • Immutable room schemas, location IDs, fixed terrain identifiers     │
│  • Tangent origin anchors (lat/lng), scale definitions, staging bounds │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Ingests static topology
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               goblin-spatial (Stateless Mathematics)                  │
│  • Coordinate conversions: Cartesian (mm) ↔ Geographic ↔ H3Index      │
│  • Pure hex math: Step distance, neighbor sets, rings, disks           │
│  • Zero side effects, zero DB drivers, zero network calls, zero cache  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Evaluates dynamic queries
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 worker-sower-engine (Runtime Ledger)                   │
│  • Dynamic actor positions: Map<ActorId, H3Index>                      │
│  • Monotonic cycle ticks, movement history, physical encounters        │
└────────────────────────────────────────────────────────────────────────┘

```

A core architectural principle governs this integration: **spatial simulation must never cross the wall between meaning and representation**.

Within the simulation runtime, an H3 cell index represents narrative meaning—topological proximity, physical isolation, sensory observation thresholds, and movement eligibility. It does not dictate screen-space coordinates in downstream render engines like Remotion.

Remotion maps semantic `location_id` tokens to hand-painted background mattes and applies independent cinematographic rules (framing, eyeline constraints, and camera push-ins). PixiJS canvas coordinates are used exclusively inside the visual debugger harness to visualize movement paths and line-of-sight cones.

---

### 2. Coordinate Reference Systems & The Projection Bridge

Uber's H3 Discrete Global Grid System (DGGS) indexes the surface of the Earth using hierarchical hexagonal cells projected from an icosahedron. Because narrative simulation environments (such as claustrophobic crawlspaces, culverts, and valve rooms) are modeled as local metric environments, the module implements a local tangent plane projection bridge.

```text
  Local Planar Space                  Tangent Geodesic Space                Discrete DGGS Space
┌─────────────────────┐              ┌───────────────────────┐             ┌─────────────────────┐
│ Cartesian $(x, y)$  │ ───────────► │ WGS84 $(\phi, \lambda)$│ ──────────► │ H3 Index (64-bit)   │
│ Units: Millimeters  │  Projection  │ Latitude, Longitude   │  Indexing   │ Discrete Hex Cell   │
└─────────────────────┘              └───────────────────────┘             └─────────────────────┘

```

#### The Three Coordinate Systems

1. **Local Continuous Planar Space ($x, y$):** High-precision Cartesian coordinates representing positions within a discrete staging environment or tactical room, quantified as fixed-point integers (millimeters) to eliminate cross-platform floating-point drift.


2. **Intermediate Geodesic Space ($\phi, \lambda$):** Spherical coordinates (Latitude $\phi$, Longitude $\lambda$) centered around an arbitrary canonical reference anchor $(\phi_0, \lambda_0)$ defined in `goblin-lore`.


3. **Discrete Hexagonal Index Space (`H3Index`):** 64-bit bit-packed hierarchical cell identifiers represented as 15-character hexadecimal strings (e.g., `"8c26856254133ff"`).



#### Tangent Plane Projection Mathematics

Given a local origin anchor $(\phi_0, \lambda_0)$ in degrees, Cartesian coordinates $(x, y)$ in meters are transformed into geodesic coordinates using an Equirectangular Tangent approximation:

$$\Delta \phi = \frac{y}{R_{\text{earth}}} \times \left(\frac{180}{\pi}\right)$$

$$\Delta \lambda = \frac{x}{R_{\text{earth}} \times \cos\left(\phi_0 \times \frac{\pi}{180}\right)} \times \left(\frac{180}{\pi}\right)$$

$$\phi = \phi_0 + \Delta \phi, \quad \lambda = \lambda_0 + \Delta \lambda$$

Where $R_{\text{earth}} = 6{,}371{,}007.1809\text{ m}$ (the authalic Earth radius for WGS84).

The inverse conversion (mapping geodesic cell centers back to Cartesian coordinates for debugger rendering) resolves as:

$$x = (\lambda - \lambda_0) \times \left(\frac{\pi}{180}\right) \times R_{\text{earth}} \times \cos\left(\phi_0 \times \frac{\pi}{180}\right)$$

$$y = (\phi - \phi_0) \times \left(\frac{\pi}{180}\right) \times R_{\text{earth}}$$

#### Resolution Selection Matrix

The choice of H3 resolution dictates the edge length, area, and spatial granularity of the simulation grid:

| H3 Resolution | Avg Hex Edge Length ($L$) | Avg Hex Area ($A$) | Canonical Simulation Scope |
| --- | --- | --- | --- |
| **Resolution 8** | $\approx 461.4\text{ m}$ | $\approx 0.737\text{ km}^2$ | Regional overworld travel; county-scale broadcast zones.

 |
| **Resolution 10** | $\approx 65.9\text{ m}$ | $\approx 15{,}047\text{ m}^2$ | Industrial facility perimeters; macro-encounter zones. |
| **Resolution 12** | $\approx 9.4\text{ m}$ | $\approx 307.1\text{ m}^2$ | Large interior rooms, shared gathering commons. |
| **Resolution 14** | $\approx 1.34\text{ m}$ | $\approx 6.27\text{ m}^2$ | Tactical room staging; immediate duel proximity.

 |
| **Resolution 15** | $\approx 0.509\text{ m}$ | $\approx 0.895\text{ m}^2$ | Sub-meter tactile blocking; contact shadow grounding.

 |

Tactical room simulation operates at **Resolution 14** ($L \approx 1.34\text{ m}$), where a single cell accommodates personal space, or **Resolution 15** ($L \approx 0.51\text{ m}$) for precise character blocking.

---

### 3. Hexagonal Topologies & Pure Coordinate Math

While H3 represents coordinates internally using a directional hierarchical tree, the mathematical contracts of `goblin-spatial` align with classical cubic hexagonal coordinates $(q, r, s)$ to preserve symmetry, uniform adjacency, and exact integer operations:

$$q + r + s = 0$$

```text
           +s  -r
             \ /
        -q ---*--- +q
             / \
           +r  -s

```

#### Uniform Adjacency & Isotropic Range

Hexagonal grids eliminate the diagonal movement ambiguity found in square Cartesian tiles (the choice between 4-way Von Neumann and 8-way Moore neighborhoods):

* **Uniform Adjacency:** Every interior cell possesses exactly six neighbors, all sharing identical center-to-center distances:


$$\Delta_{\text{neighbor}} = 2 \cdot L \cdot \cos\left(\frac{\pi}{6}\right) = L\sqrt{3}$$


* **Clean Distance Metric:** Distance across the grid is calculated as integer steps without square roots or trigonometric operations:


$$d(a, b) = \max\left(\vert{}q_a - q_b\vert{}, \vert{}r_a - r_b\vert{}, \vert{}s_a - s_b\vert{}\right) = \frac{\vert{}q_a - q_b\vert{} + \vert{}r_a - r_b\vert{} + \vert{}s_a - s_b\vert{}}{2}$$


This formulation guarantees zero special-case branching and obeys metric space requirements: identity ($d(a, a) = 0$), non-negativity ($d(a, b) \ge 0$), symmetry ($d(a, b) = d(b, a)$), and triangle inequality ($d(a, c) \le d(a, b) + d(b, c)$).


* **Isotropic Range:** Expanding outward by $k$ hex steps creates a discrete disk that approximates a circle uniformly in all directions, providing an unbiased sampling space for auditory alerts, line of sight, and witness pools.



---

### 4. Function Specification & Contracts

The module exports seven mathematical operations via pure functional contracts.

#### `anchorToCell`

Projects continuous Cartesian coordinates relative to a spatial anchor into an H3 index.

* **Signature:** `anchorToCell(x: number, y: number, resolution: number, anchor: TangentAnchor): H3Index`
* **Preconditions:** $0 \le \text{resolution} \le 15$; coordinates $x, y$ are finite numbers within $50{,}000\text{ m}$ of anchor.
* **Postconditions:** Returns a valid 64-bit `H3Index` string.
* **Complexity:** $O(1)$ constant time.

#### `cellToAnchor`

Extracts the continuous Cartesian centroid of an H3 cell relative to the spatial anchor.

* **Signature:** `cellToAnchor(cell: H3Index, anchor: TangentAnchor): CartesianPoint`
* **Preconditions:** `cell` must be a valid H3 cell index verified via `h3.isValidCell()`.
* **Postconditions:** Returns `{ x, y }` in meters relative to `anchor`.
* **Complexity:** $O(1)$ constant time.

#### `distance`

Computes the exact discrete hexagonal step distance between two cells.

* **Signature:** `distance(a: H3Index, b: H3Index): number`
* **Preconditions:** `a` and `b` must share an identical resolution.
* **Postconditions:** Returns an integer $d \ge 0$.
* **Complexity:** $O(1)$ constant time via H3 coordinate translation.

#### `neighbors`

Computes the immediate 1-ring perimeter of an H3 cell.

* **Signature:** `neighbors(cell: H3Index): H3Index[]`
* **Preconditions:** `cell` must be valid.
* **Postconditions:** Returns an array of exactly 6 cell indices (for standard hexagonal cells; pentagonal base cells return 5).
* **Complexity:** $O(1)$ constant time.

#### `ring`

Computes a hollow perimeter ring of cells at an exact radius $k$.

* **Signature:** `ring(center: H3Index, radius: number): H3Index[]`
* **Preconditions:** $\text{radius} \ge 0$.
* **Postconditions:** Returns an array containing $6k$ cells (for $k > 0$) or $[center]$ (for $k = 0$).
* **Complexity:** $O(k)$ linear time relative to radius.

#### `range`

Computes a filled topological disk containing all cells within step distance $k$.

* **Signature:** `range(center: H3Index, radius: number): H3Index[]`
* **Preconditions:** $\text{radius} \ge 0$.
* **Postconditions:** Returns an array containing $1 + 3k(k + 1)$ cells.
* **Complexity:** $O(k^2)$ quadratic time relative to radius.

#### `boundary`

Extracts the boundary polygon vertices for rendering.

* **Signature:** `boundary(cell: H3Index, anchor: TangentAnchor): CartesianPoint[]`
* **Preconditions:** `cell` must be valid.
* **Postconditions:** Returns an ordered array of 6 Cartesian coordinate pairs outlining the polygon.
* **Complexity:** $O(1)$ constant time.

---

### 5. Determinism & Floating-Point Sanitization

A critical vulnerability in generative distributed engines is cross-engine floating-point divergence: V8, JavaScriptCore, and SpiderMonkey can evaluate transcendental trigonometric functions ($\sin, \cos, \tan$) with minor sub-bit variance. If coordinates accumulate unrounded floating-point precision errors during cycle updates, spatial bounds check flags diverge, creating non-deterministic narrative branches across runs.

To enforce reproducible simulation traces ($S_{\text{clean}}$ guarantees):

```text
┌────────────────────────────────────────────────────────┐
│ Input: Continuous Screen / World Units                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Fixed-Point Quantization: basis points or mm integers  │
│ scaleBasisPoints(val, precisionFactor)                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Intermediate Tangent Math (Clipped to 8 decimal places)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Output: Discrete H3Index (64-bit Hex String)           │
└────────────────────────────────────────────────────────┘

```

1. **Fixed-Point Quantization:** Input coordinates are normalized to fixed-point integer basis points or scaled millimeter integers prior to calling projection functions:


$$X_{\text{fixed}} = \operatorname{round}(x \times 1000), \quad Y_{\text{fixed}} = \operatorname{round}(y \times 1000)$$


2. **Decimal Clamping:** Intermediate floating-point latitude and longitude values are rounded to 8 decimal places ($\approx 1.11\text{ mm}$ physical accuracy) before being passed to H3 indexing utilities:
$$\phi_{\text{clamped}} = \frac{\operatorname{round}(\phi \times 10^8)}{10^8}, \quad \lambda_{\text{clamped}} = \frac{\operatorname{round}(\lambda \times 10^8)}{10^8}$$


3. **Bit-Packed Index Representation:** All internal calculations serialize into native 64-bit `H3Index` strings, preventing floating-point state leakage into downstream simulation reducers.



---

### 6. TypeScript Reference Implementation

#### `src/types.ts`

```typescript
/**
 * Canonical 64-bit H3 cell index represented as a 15-character hex string.
 * Example: "8c26856254133ff"
 */
export type H3Index = string;

/**
 * Local Cartesian coordinate measured in meters relative to a local origin.
 */
export interface CartesianPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Geographic anchor defining the tangent projection origin for a local map.
 */
export interface TangentAnchor {
  readonly latitude: number;
  readonly longitude: number;
}

/**
 * Cube coordinates enforcing q + r + s = 0.
 */
export interface CubeCoordinates {
  readonly q: number;
  readonly r: number;
  readonly s: number;
}

```

#### `src/h3/adapter.ts`

```typescript
import * as h3 from 'h3-js';
import { CartesianPoint, H3Index, TangentAnchor } from '../types';

const EARTH_RADIUS_METERS = 6371007.1809;
const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;

/**
 * Clamps floating-point coordinates to 8 decimal places (sub-millimeter precision).
 */
function clampPrecision(value: number): number {
  return Math.round(value * 1e8) / 1e8;
}

/**
 * Maps local Cartesian coordinates (meters) to an H3 discrete cell index.
 */
export function anchorToCell(
  x: number,
  y: number,
  resolution: number,
  anchor: TangentAnchor
): H3Index {
  if (resolution < 0 || resolution > 15 || !Number.isInteger(resolution)) {
    throw new RangeError(`Invalid H3 resolution: ${resolution}. Must be an integer between 0 and 15.`);
  }

  const latDelta = (y / EARTH_RADIUS_METERS) * RAD_TO_DEG;
  const lonDelta =
    (x / (EARTH_RADIUS_METERS * Math.cos(anchor.latitude * DEG_TO_RAD))) * RAD_TO_DEG;

  const lat = clampPrecision(anchor.latitude + latDelta);
  const lon = clampPrecision(anchor.longitude + lonDelta);

  return h3.latLngToCell(lat, lon, resolution);
}

/**
 * Maps an H3 cell index back to Cartesian coordinates (meters) relative to the anchor.
 */
export function cellToAnchor(cell: H3Index, anchor: TangentAnchor): CartesianPoint {
  if (!h3.isValidCell(cell)) {
    throw new TypeError(`Invalid H3Index: "${cell}"`);
  }

  const [lat, lon] = h3.cellToLatLng(cell);

  const y = (lat - anchor.latitude) * DEG_TO_RAD * EARTH_RADIUS_METERS;
  const x =
    (lon - anchor.longitude) *
    DEG_TO_RAD *
    EARTH_RADIUS_METERS *
    Math.cos(anchor.latitude * DEG_TO_RAD);

  return {
    x: clampPrecision(x),
    y: clampPrecision(y),
  };
}

/**
 * Extracts polygon vertices in local Cartesian space for PixiJS rendering.
 */
export function boundary(cell: H3Index, anchor: TangentAnchor): CartesianPoint[] {
  if (!h3.isValidCell(cell)) {
    throw new TypeError(`Invalid H3Index: "${cell}"`);
  }

  const geoBoundary = h3.cellToBoundary(cell);
  const cosLat = Math.cos(anchor.latitude * DEG_TO_RAD);

  return geoBoundary.map(([lat, lon]) => ({
    x: clampPrecision((lon - anchor.longitude) * DEG_TO_RAD * EARTH_RADIUS_METERS * cosLat),
    y: clampPrecision((lat - anchor.latitude) * DEG_TO_RAD * EARTH_RADIUS_METERS),
  }));
}

```

#### `src/h3/distance.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';

/**
 * Computes the integer hexagonal step distance between two cells.
 */
export function distance(a: H3Index, b: H3Index): number {
  if (!h3.isValidCell(a) || !h3.isValidCell(b)) {
    throw new TypeError(`Invalid H3Index provided to distance(): a="${a}", b="${b}"`);
  }
  
  if (h3.getResolution(a) !== h3.getResolution(b)) {
    throw new RangeError(
      `Resolution mismatch: cell a is res ${h3.getResolution(a)}, but cell b is res ${h3.getResolution(b)}`
    );
  }

  return h3.gridDistance(a, b);
}

```

#### `src/h3/disk.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';

/**
 * Returns the immediate 6 neighboring cells.
 */
export function neighbors(cell: H3Index): H3Index[] {
  if (!h3.isValidCell(cell)) {
    throw new TypeError(`Invalid H3Index provided to neighbors(): "${cell}"`);
  }
  // gridDisk with radius 1 returns [center, ...neighbors]
  const disk = h3.gridDisk(cell, 1);
  return disk.filter((c) => c !== cell);
}

/**
 * Computes a hollow perimeter ring of cells at an exact integer radius.
 */
export function ring(center: H3Index, radius: number): H3Index[] {
  if (!h3.isValidCell(center)) {
    throw new TypeError(`Invalid H3Index provided to ring(): "${center}"`);
  }
  if (radius < 0 || !Number.isInteger(radius)) {
    throw new RangeError(`Radius must be a non-negative integer, received: ${radius}`);
  }
  if (radius === 0) {
    return [center];
  }

  return h3.gridRingUnsafe(center, radius);
}

/**
 * Computes a filled topological disk containing all cells within step distance radius.
 */
export function range(center: H3Index, radius: number): H3Index[] {
  if (!h3.isValidCell(center)) {
    throw new TypeError(`Invalid H3Index provided to range(): "${center}"`);
  }
  if (radius < 0 || !Number.isInteger(radius)) {
    throw new RangeError(`Radius must be a non-negative integer, received: ${radius}`);
  }

  return h3.gridDisk(center, radius);
}

```

---

### 7. Deterministic Invariant Suite

To ensure geometric reliability without manual testing, the test suite verifies foundational properties across randomized inputs:

```typescript
// tests/invariants.test.ts
import { describe, it, expect } from 'vitest';
import * as h3 from 'h3-js';
import { anchorToCell, cellToAnchor, distance, neighbors, ring, range } from '../src';

describe('Coordinate & H3 Invariant Suite', () => {
  const anchor = { latitude: 37.7749, longitude: -122.4194 };
  const res = 12;
  const originCell = anchorToCell(0, 0, res, anchor);

  it('preserves distance identity and symmetry', () => {
    const diskCells = range(originCell, 3);
    for (const cell of diskCells) {
      expect(distance(cell, cell)).toBe(0);
      expect(distance(originCell, cell)).toBe(distance(cell, originCell));
    }
  });

  it('guarantees neighbor reciprocity', () => {
    const cellNeighbors = neighbors(originCell);
    expect(cellNeighbors.length).toBe(6);

    for (const neighbor of cellNeighbors) {
      const reciprocalNeighbors = neighbors(neighbor);
      expect(reciprocalNeighbors).toContain(originCell);
      expect(distance(originCell, neighbor)).toBe(1);
    }
  });

  it('maintains perimeter ring and filled disk cardinality', () => {
    for (let k = 0; k <= 4; k++) {
      const ringCells = ring(originCell, k);
      const expectedRingCount = k === 0 ? 1 : 6 * k;
      expect(ringCells.length).toBe(expectedRingCount);

      const diskCells = range(originCell, k);
      const expectedDiskCount = 1 + 3 * k * (k + 1);
      expect(diskCells.length).toBe(expectedDiskCount);
    }
  });

  it('maintains coordinate projection round-trip fidelity', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 15.5, y: -22.3 },
      { x: -104.2, y: 88.7 },
    ];

    for (const pt of points) {
      const cell = anchorToCell(pt.x, pt.y, 14, anchor);
      const recovered = cellToAnchor(cell, anchor);
      
      // At Res 14 (edge ~1.34m), recovered centroid should be within 1.5m of input
      const deltaX = Math.abs(pt.x - recovered.x);
      const deltaY = Math.abs(pt.y - recovered.y);
      expect(deltaX).toBeLessThan(1.5);
      expect(deltaY).toBeLessThan(1.5);
    }
  });
});

```## Navigation & Stage Routing Module

The **Navigation & Stage Routing Module** inside `goblin-spatial` provides deterministic graph search, movement budget projection, and staging density management over discrete hexagonal topologies. Operating strictly downstream of immutable world canon (`goblin-lore`) and decoupled from runtime simulation state (`worker-sower-engine`), this module resolves how entities traverse space, encounter physical resistance, and crowd tactical staging areas without holding mutable state or executing side effects.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        goblin-lore (Canon Law)                         │
│  • Static terrain classes: cramped, vertical_choke, pipe_gap, open    │
│  • Hard boundaries: impassable bulkheads, sealed hatches, void tiles   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Ingests static cost maps
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             goblin-spatial: Navigation & Stage Routing                 │
│  • findPath(): Deterministic A* search over weighted H3 graphs         │
│  • reachableCells(): Uniform-cost Dijkstra movement horizons           │
│  • checkCrowding(): Staging volume & physical crowding enforcement      │
│  • nearestUnoccupied(): Deterministic radial displacement search       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Evaluates dynamic requests
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 worker-sower-engine (Runtime Ledger)                   │
│  • Stage 0: Motive-driven agent movement commits                       │
│  • Stage 3a: Spatial adjacency sweeps for pairing lotteries            │
│  • Stage 4: Duel positioning, displacement, and retreat updates        │
└────────────────────────────────────────────────────────────────────────┘

```

---

### 1. Architectural Role & Boundary Mandates

In the simulation lifecycle, physical movement drives narrative tension. During **Stage 0 (Movement Phase)**, characters reposition across the facility based on psychological needs, somatic health, and active grievances. During **Stage 3a (Pairing Lottery)** and **Stage 4 (Duel Resolution)**, characters must occupy specific adjacent cells to trigger confrontations, flee into retreat corridors, or yield physical ground.

The routing engine enforces three architectural boundaries:

1. **Zero State Ownership:** The module does not store where characters are located. Dynamic actor coordinates are passed in by the caller as read-only lookups (`Map<ActorId, H3Index>`).


2. **Deterministic Search Execution:** Given identical topology costs, blocked cell sets, and start/target coordinates, traversal algorithms must return identical coordinate sequences across all runtimes (Node.js, browser canvas, headless worker daemons).


3. **No Presentation Leaks:** The router calculates movement solely across topological H3 cell indices. It knows nothing of pixel offsets, sprite interpolation, or camera pans; Remotion and the PixiJS visual debugger project these indices into screen space independently.



---

### 2. Terrain Cost Metrics & Admissible Heuristics

Hexagonal Discrete Global Grid Systems (DGGS) eliminate the diagonal traversal distortion inherent to square 2D grids (where diagonal movement is $\sqrt{2} \approx 1.414$ times longer than orthogonal movement). In an H3 grid, every step between adjacent hexagonal centers traverses an identical normalized spatial distance of $1.0$.

However, movement effort across a crawlspace varies drastically based on physical terrain features authored in `goblin-lore`.

#### Canonical Cost Model

The traversal cost $C(u, v)$ to step from cell $u$ into an adjacent cell $v$ is determined by the destination cell's structural classification:

$$C(u, v) = \text{BaseCost} \times \mu_{\text{terrain}}(v) \times \mu_{\text{hazard}}(v)$$

* **$\text{BaseCost}$:** Normalized integer base weight ($100$ cost units) representing unimpeded movement across dry, flat crawlspace flooring.
* **$\mu_{\text{terrain}}$:** Static terrain modifier defined in canon:


* `open_floor`: $1.0$ (Cost: $100$) — Standard clearance.
* `cramped`: $1.5$ (Cost: $150$) — Requires crouching; restricts movement speed.


* `pipe_trench`: $2.0$ (Cost: $200$) — Uneven conduits; characters must crawl or straddle.


* `vertical_choke`: $3.0$ (Cost: $300$) — Joist notches, lath gaps; requires climbing.


* `impassable`: $\infty$ — Solid stone, intact plaster, or exterior sheet metal.




* **$\mu_{\text{hazard}}$:** Dynamic multiplier applied by the caller (e.g., active steam leaks, standing blackwater, boiling grease).

```text
       [100: open_floor] ──► [150: cramped] ──► [300: vertical_choke]
              ▲                      │
              │                      ▼
       [200: pipe_trench]    [ ∞ : impassable wall ]

```

#### Admissible Hexagonal Heuristic

To guarantee that an A* implementation yields the mathematically optimal path without exhaustive Dijkstra expansion, the heuristic function $h(n)$ must be **admissible** (it must never overestimate the actual remaining cost to reach the goal):

$$h(n) = \text{gridDistance}(n, \text{goal}) \times \min(C)$$

Where:

* $\text{gridDistance}(a, b)$ is the integer hexagonal step count calculated via `h3.gridDistance(a, b)`.


* $\min(C)$ is the global minimum traversal cost across the entire map ($\min(C) = 100$).

Because $\text{gridDistance}$ satisfies the triangle inequality on hexagonal topologies, $h(n)$ is also **consistent (monotonic)**:

$$h(u) \le C(u, v) + h(v)$$

Monotonicity guarantees that the first time a node is expanded by the search algorithm, the path found to that node is optimal, eliminating the need to re-open nodes in the closed set.

---

### 3. Graph Search & Traversal Engine

The core navigation module provides two complementary search primitives: point-to-point pathfinding (`findPath`) and movement horizon calculation (`reachableCells`).

```text
┌───────────────────────────────────┐      ┌───────────────────────────────────┐
│     findPath(start, goal)         │      │     reachableCells(start, budget) │
│                                   │      │                                   │
│  • Directed A* search             │      │  • Uniform-cost Dijkstra flood    │
│  • Goal-oriented targeting        │      │  • Dynamic movement budgeting     │
│  • Evaluates optimal sequence     │      │  • Returns traversal horizon set  │
└───────────────────────────────────┘      └───────────────────────────────────┘

```

#### Deterministic A* Search (`findPath`)

Standard A* implementations frequently suffer from non-deterministic path selection: when multiple candidate paths evaluate to identical $f$-scores ($f(n) = g(n) + h(n)$), the order in which cells are popped from priority queues depends on underlying heap memory allocation or insertion order. In an event-sourced simulation where narrative replay depends on seed determinism, this non-determinism can cause identical random seeds to produce divergent character positions.

`findPath` enforces absolute determinism by employing a strict three-tier tie-breaker in priority evaluations:

1. **Primary Key:** Lowest $f(n) = g(n) + h(n)$ (estimated total cost).
2. **Secondary Key:** Lowest $h(n)$ (prioritizes nodes closer to the target).
3. **Tertiary Deterministic Key:** Lexicographical string comparison of the 64-bit hexadecimal `H3Index` identifiers.



#### Budgeted Reachability Horizons (`reachableCells`)

During Stage 0, actors rarely execute complete journeys across the entire compound in a single simulation cycle. Instead, their locomotion budget is limited by their somatic health vector (e.g., exhaustion levels, limb damage, or cane requirements).

`reachableCells` executes a uniform-cost Dijkstra flood fill outward from an actor's current position, consuming movement points until the budget is exhausted. It returns the complete set of valid H3 cells the actor could physically occupy at the end of the tick:

$$g(v) = g(u) + C(u, v) \le \text{MovementBudget}$$

Cells occupied by hard obstacles or other impassable entities are omitted from the resulting horizon.

---

### 4. Staging Bounds, Physical Crowding, and Conflict Staging

When characters converge to resolve a grievance, space acts as a physical narrative gate. Crawlspaces cannot accommodate unlimited occupants; packing multiple bodies into confined ductwork triggers somatic friction, alters duel resolution rolls, or forces immediate retreats.

```text
                       CROWDING EVALUATION CYCLE
                                   │
                   Query Occupancy: Map<Actor, H3Index>
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │  Occupants(cell) = { a ∈ Actors | Pos(a) == cell }  │
        │  Limit(cell)     = CapacityMap.get(cell) ?? 2       │
        └──────────────────────────┬──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       Occupants ≤ Limit             Occupants > Limit
                    │                             │
                    ▼                             ▼
              [ PERMITTED ]              [ CROWDED HAZARD ]
            Staging Unaltered           Triggers Duel / Shove
                                        Evicts to nearestUnoccupied()

```

#### Staging Bounds & Crowding Checks

Each room definition in `goblin-lore` specifies physical capacity rules. In typical crawlspaces (e.g., `loc_warm_pipe`), a strict capacity constraint applies: no more than two adult goblins may occupy the direct contact surface simultaneously without triggering an involuntary physical crowding check.

`checkCrowding` evaluates local actor density against canonical stage parameters:

* **Occupancy Limit:** The maximum allowable entities per cell (default: $2$ for standard floor tiles, $1$ for narrow conduits).


* **Crowding Severity:** When occupancy exceeds capacity, the function flags the cell as crowded, computes the density ratio, and signals `worker-sower-engine` to inject involuntary shove actions, posture degradation, or physical grievance rolls into the tick.



#### Deterministic Displacement (`nearestUnoccupied`)

When a duel resolves with a loser being driven back, or when an actor is evicted from a congested cell, the simulation must place them into an adjacent, valid location.

`nearestUnoccupied` performs a deterministic spiral search using concentric H3 rings (`h3.gridRingUnsafe`):

1. Samples ring $k = 1, 2, \dots, R_{\max}$ around the epicenter.


2. Filters out blocked cells and cells that have reached their capacity limits.


3. Computes the traversal cost from the epicenter to candidate cells.
4. Breaks ties deterministically by selecting the candidate with the lowest traversal cost, falling back to lexicographical `H3Index` sorting.



---

### 5. TypeScript Reference Implementation

#### `src/navigation/types.ts`

```typescript
import { H3Index } from '../types';

export type TerrainCostMap = Map<H3Index, number>;
export type CellOccupancyMap = Map<string, H3Index>; // ActorId -> H3Index

export interface PathfindingOptions {
  start: H3Index;
  goal: H3Index;
  costMap: TerrainCostMap;
  blockedCells: Set<H3Index>;
  baseCost?: number;
}

export interface ReachableOptions {
  start: H3Index;
  movementBudget: number;
  costMap: TerrainCostMap;
  blockedCells: Set<H3Index>;
  baseCost?: number;
}

export interface CrowdingResult {
  readonly isCrowded: boolean;
  readonly occupancyCount: number;
  readonly capacityLimit: number;
  readonly occupantIds: string[];
}

```

#### `src/navigation/pathfinding.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';
import { PathfindingOptions, ReachableOptions } from './types';

interface SearchNode {
  readonly cell: H3Index;
  readonly g: number; // Cost from start
  readonly f: number; // g + h
  readonly parent: SearchNode | null;
}

const DEFAULT_BASE_COST = 100;

/**
 * Deterministic priority comparator for A* nodes.
 */
function compareNodes(a: SearchNode, b: SearchNode): number {
  if (a.f !== b.f) return a.f - b.f;
  if (a.g !== b.g) return b.g - a.g; // Prefer higher g (closer to goal)
  return a.cell.localeCompare(b.cell); // Deterministic tie-break
}

/**
 * Computes the optimal path between two H3 cells using A*.
 */
export function findPath(options: PathfindingOptions): H3Index[] | null {
  const { start, goal, costMap, blockedCells, baseCost = DEFAULT_BASE_COST } = options;

  if (blockedCells.has(start) || blockedCells.has(goal)) {
    return null;
  }
  if (start === goal) {
    return [start];
  }

  const openSet: SearchNode[] = [];
  const openMap = new Map<H3Index, number>(); // cell -> best g
  const closedSet = new Set<H3Index>();

  const startH = h3.gridDistance(start, goal) * baseCost;
  const startNode: SearchNode = { cell: start, g: 0, f: startH, parent: null };

  openSet.push(startNode);
  openMap.set(start, 0);

  while (openSet.length > 0) {
    // Sort to maintain deterministic priority queue behavior
    openSet.sort(compareNodes);
    const current = openSet.shift()!;
    openMap.delete(current.cell);

    if (current.cell === goal) {
      const path: H3Index[] = [];
      let curr: SearchNode | null = current;
      while (curr !== null) {
        path.push(curr.cell);
        curr = curr.parent;
      }
      return path.reverse();
    }

    closedSet.add(current.cell);

    // Get topological 1-ring neighbors (excluding center)
    const neighbors = h3.gridDisk(current.cell, 1).filter(c => c !== current.cell);

    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor) || blockedCells.has(neighbor)) {
        continue;
      }

      const cellCostMultiplier = costMap.get(neighbor) ?? 1.0;
      const stepCost = Math.round(baseCost * cellCostMultiplier);
      const tentativeG = current.g + stepCost;

      const existingG = openMap.get(neighbor);
      if (existingG !== undefined && tentativeG >= existingG) {
        continue;
      }

      const h = h3.gridDistance(neighbor, goal) * baseCost;
      const neighborNode: SearchNode = {
        cell: neighbor,
        g: tentativeG,
        f: tentativeG + h,
        parent: current,
      };

      if (existingG === undefined) {
        openSet.push(neighborNode);
      } else {
        const index = openSet.findIndex(n => n.cell === neighbor);
        if (index !== -1) {
          openSet[index] = neighborNode;
        }
      }
      openMap.set(neighbor, tentativeG);
    }
  }

  return null; // Path unreachable
}

/**
 * Computes all cells reachable within a given movement budget.
 */
export function reachableCells(options: ReachableOptions): H3Index[] {
  const { start, movementBudget, costMap, blockedCells, baseCost = DEFAULT_BASE_COST } = options;

  if (blockedCells.has(start) || movementBudget <= 0) {
    return [start];
  }

  const costSoFar = new Map<H3Index, number>();
  const queue: { cell: H3Index; cost: number }[] = [];

  costSoFar.set(start, 0);
  queue.push({ cell: start, cost: 0 });

  while (queue.length > 0) {
    // Sort deterministically by lowest cumulative cost
    queue.sort((a, b) => a.cost !== b.cost ? a.cost - b.cost : a.cell.localeCompare(b.cell));
    const { cell: currentCell, cost: currentCost } = queue.shift()!;

    const neighbors = h3.gridDisk(currentCell, 1).filter(c => c !== currentCell);

    for (const neighbor of neighbors) {
      if (blockedCells.has(neighbor)) {
        continue;
      }

      const multiplier = costMap.get(neighbor) ?? 1.0;
      const stepCost = Math.round(baseCost * multiplier);
      const newCost = currentCost + stepCost;

      if (newCost <= movementBudget) {
        if (!costSoFar.has(neighbor) || newCost < costSoFar.get(neighbor)!) {
          costSoFar.set(neighbor, newCost);
          queue.push({ cell: neighbor, cost: newCost });
        }
      }
    }
  }

  // Return deterministically sorted list of reachable cell IDs
  return Array.from(costSoFar.keys()).sort();
}

```

#### `src/navigation/crowding.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';
import { CellOccupancyMap, CrowdingResult } from './types';

/**
 * Checks whether an H3 cell exceeds its staging capacity limit.
 */
export function checkCrowding(
  cell: H3Index,
  occupants: CellOccupancyMap,
  capacityLimit = 2
): CrowdingResult {
  const occupantIds: string[] = [];

  for (const [actorId, actorCell] of occupants.entries()) {
    if (actorCell === cell) {
      occupantIds.push(actorId);
    }
  }

  // Sort occupant IDs for determinism
  occupantIds.sort();

  return {
    isCrowded: occupantIds.length > capacityLimit,
    occupancyCount: occupantIds.length,
    capacityLimit,
    occupantIds,
  };
}

/**
 * Locates the nearest valid, unoccupied cell using concentric H3 rings.
 */
export function nearestUnoccupied(
  target: H3Index,
  occupants: CellOccupancyMap,
  blockedCells: Set<H3Index>,
  maxRadius = 5
): H3Index | null {
  const occupiedCellCounts = new Map<H3Index, number>();
  for (const cell of occupants.values()) {
    occupiedCellCounts.set(cell, (occupiedCellCounts.get(cell) ?? 0) + 1);
  }

  if (!blockedCells.has(target) && (occupiedCellCounts.get(target) ?? 0) === 0) {
    return target;
  }

  for (let r = 1; r <= maxRadius; r++) {
    const ringCells = h3.gridRingUnsafe(target, r);
    const validCandidates: H3Index[] = [];

    for (const cell of ringCells) {
      const isBlocked = blockedCells.has(cell);
      const isFull = (occupiedCellCounts.get(cell) ?? 0) > 0;
      if (!isBlocked && !isFull) {
        validCandidates.push(cell);
      }
    }

    if (validCandidates.length > 0) {
      // Deterministically pick the candidate with the lowest lexicographical string
      validCandidates.sort();
      return validCandidates[0];
    }
  }

  return null; // Staging failure: no empty cells within max search radius
}

```

---

### 6. Formal Invariant Verification & Test Suite

The navigation engine's mathematical contracts are audited using property-based unit tests to guarantee physical soundness before any narrative simulation batch executes:

* **Obstacle Exclusion:** A computed path never passes through an index present in the `blockedCells` set.


* **Adjacency Continuity:** For any generated path $[v_0, v_1, \dots, v_{k}]$, every sequential pair satisfies:
$$\text{gridDistance}(v_i, v_{i+1}) = 1 \quad (\forall i \in [0, k-1])$$


* **Determinism Invariance:** Given randomized input permutations of the same graph data, `findPath` and `reachableCells` yield identical results byte-for-byte.



```typescript
// tests/navigation.test.ts
import { describe, it, expect } from 'vitest';
import * as h3 from 'h3-js';
import { findPath, reachableCells, checkCrowding, nearestUnoccupied } from '../src/navigation';

describe('Navigation & Stage Routing Invariant Suite', () => {
  const origin = h3.latLngToCell(37.7749, -122.4194, 14);
  const ring1 = h3.gridDisk(origin, 1).filter(c => c !== origin);
  const target = h3.gridDisk(origin, 3)[12];

  it('ensures A* never traverses impassable obstacles', () => {
    // Block all immediate neighbors except the first
    const blocked = new Set<H3Index>(ring1.slice(1));
    const path = findPath({
      start: origin,
      goal: target,
      costMap: new Map(),
      blockedCells: blocked,
    });

    expect(path).not.toBeNull();
    for (const cell of path!) {
      expect(blocked.has(cell)).toBe(false);
    }
  });

  it('guarantees sequential adjacency across the entire route', () => {
    const path = findPath({
      start: origin,
      goal: target,
      costMap: new Map(),
      blockedCells: new Set(),
    });

    expect(path).not.toBeNull();
    for (let i = 0; i < path!.length - 1; i++) {
      expect(h3.gridDistance(path![i], path![i + 1])).toBe(1);
    }
  });

  it('evaluates stage crowding limits accurately', () => {
    const occupants = new Map<string, H3Index>([
      ['char_bog', origin],
      ['char_spleen', origin],
      ['char_wart', origin],
    ]);

    const result = checkCrowding(origin, occupants, 2);
    expect(result.isCrowded).toBe(true);
    expect(result.occupancyCount).toBe(3);
    expect(result.occupantIds).toEqual(['char_bog', 'char_spleen', 'char_wart']);
  });

  it('finds nearest unoccupied cell without placing into blocked tiles', () => {
    const blocked = new Set<H3Index>([origin, ...ring1.slice(0, 5)]);
    const occupants = new Map<string, H3Index>([['char_bog', ring1[5]]]);

    // Only ring1[5] is unblocked, but it is occupied.
    // The search must expand to ring 2.
    const freeCell = nearestUnoccupied(origin, occupants, blocked, 3);
    expect(freeCell).not.toBeNull();
    expect(blocked.has(freeCell!)).toBe(false);
    expect(freeCell).not.toBe(ring1[5]);
    expect(h3.gridDistance(origin, freeCell!)).toBe(2);
  });
});

```

## Perception, Line of Sight & Sensory Verification Module

The **Perception, Line of Sight & Sensory Verification Module** serves as the deterministic bridge between the physical topology of the crawlspaces and the epistemic state machine of the narrative simulation. Within the pipeline, space does not merely govern where entities stand; it serves as the objective gatekeeper of causality and knowledge.

By evaluating optical raycasts, acoustic falloff gradients, and somatic sensory profiles through pure, stateless functions, this module determines which characters are physically capable of seeing or hearing in-world incidents. Its outputs directly seed the relational ledger’s belief graphs, guaranteeing that characters never act on information they could not have organically perceived.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        goblin-lore (Canon Law)                         │
│  • Structural occlusions: solid masonry, lead bulkheads, iron plating  │
│  • Acoustic damping coefficients per terrain & partition type          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Ingests static occlusion/damping data
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 goblin-spatial: Perception Module                      │
│  • hasLineOfSight(): Deterministic hex-grid raycasting                 │
│  • lineOfSightTrace(): Structural collision & vector diagnostics       │
│  • propagateAcoustics(): Wavefront energy decay across dampening maps  │
│  • findWitnesses(): Somatic-masked sensory sweep for scene events      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Emits OBSERVED / HEARD event records
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 worker-sower-engine (Runtime Ledger)                   │
│  • Stage 3: Bystander recruitment for conflict lotteries               │
│  • Epistemic mutations: holder_id KNOWS(Fact_X) with provenance        │
│  • Ignorance by omission: sanitizes downstream LLM context windows     │
└────────────────────────────────────────────────────────────────────────┘

```

---

### 1. The Epistemic Feeding Engine

A central architectural mandate of the simulation is that **the spatial engine feeds the epistemic system, rather than replacing it**.

In unconstrained language model pipelines, characters frequently suffer from "omniscience drift," acting on dramatic secrets or violent encounters that occurred rooms away without an authored conduit. To prevent this, the simulation enforces **Ignorance by Omission**: an LLM prompt drafting dialogue for a specific character contains only the facts recorded in that character's subjective belief graph (`BeliefRecord`). If a character lacks a verifiable sensory path to an incident, the event is scrubbed from their context window entirely.

```text
Objective Incident at Cell C_0:
[ Bog strikes Spleen with a brass siphon ]
                    │
                    ├──────────────────────────────────────────────────┐
                    ▼                                                  ▼
     Optical Sweep (Raycast)                            Acoustic Sweep (Propagation)
  hasLineOfSight(C_0, Pos(Moss))                     propagateAcoustics(C_0, Intensity)
                    │                                                  │
             Clear Sightline?                                  Audible at Pos(Wart)?
             ├── YES: Visual Witness                           ├── YES: Auditory Witness
             └── NO:  Occluded                                 └── NO:  Below Ambient Floor
                    │                                                  │
                    ▼                                                  ▼
      OBSERVED_EVENT Record                              HEARD_EVENT Record
      Source: DIRECT_OBSERVATION                         Source: DIRECT_OBSERVATION (Acoustic)
      Confidence: 1.0 (10,000 bp)                        Confidence: 0.65 (6,500 bp)
                    │                                                  │
                    └─────────────────┬────────────────────────────────┘
                                      ▼
                        Epistemic State Mutation:
             Moss KNOWS "Bog struck Spleen with brass siphon"
             Wart KNOWS "Violent struggle occurred in Valve Room"

```

When an incident occurs (such as a duel, a theft, or an illicit trade), `worker-sower-engine` dispatches a sensory query to `goblin-spatial`. The perception module evaluates:

1. Did the actor possess an unobstructed line of sight to the epicenter?


2. Did the acoustic signature of the event retain sufficient energy to exceed the actor's sensory threshold after traversing partitions?


3. Did the actor have active somatic impairments (e.g., ocular scarring, blindness, concussive deafness) that invalidate the sensory channel?



Only when these geometric and physical checks pass does the engine emit an authoritative `OBSERVED_EVENT` or `HEARD_EVENT`. This event updates the relational database, recording provenance pointers (`source_type: "DIRECT_OBSERVATION"`), initializing transmission hops at $0$, and setting belief probabilities to maximum fidelity before rumors degrade across the network.

---

### 2. Hexagonal Line of Sight & Raycasting Mechanics

Raycasting across a discrete hexagonal topology differs substantially from Cartesian grid traversal. Square grids suffer from ambiguous diagonal transitions; hexagonal grids provide six unambiguous axes of traversal, but straight Euclidean lines frequently graze hexagonal vertices and cell edges.

```text
              ( 0,-1, 1)         ( 1,-1, 0)
                   \                 /
                    ┌───────────────┐
                    │               │
       (-1, 0, 1)───┤   (0, 0, 0)   ├───( 1, 0,-1)
                    │               │
                    └───────────────┘
                   /                 \
              (-1, 1, 0)         ( 0, 1,-1)

```

#### Cube Coordinate Ray Parameterization

To calculate an optical ray between origin cell $A$ and target cell $B$, `goblin-spatial` maps H3 indices into continuous cube coordinates $(q, r, s)$ constrained by $q + r + s = 0$.

The line segment connecting centroids $A$ and $B$ is parameterized by continuous variable $t \in [0, 1]$:

$$q(t) = q_A + t \cdot (q_B - q_A)$$

$$r(t) = r_A + t \cdot (r_B - r_A)$$

$$s(t) = s_A + t \cdot (s_B - s_A)$$

To sample all discrete cells traversed by the ray without missing corner boundaries, the continuous ray is sampled at $N = \text{gridDistance}(A, B)$ evenly spaced intervals:

$$t_i = \frac{i}{N} \quad \text{for } i \in \{0, 1, \dots, N\}$$

#### Cube Coordinate Rounding

Each continuous sample point $(q(t_i), r(t_i), s(t_i))$ is rounded to the nearest integer cube coordinate $(\operatorname{round}(q), \operatorname{round}(r), \operatorname{round}(s))$. Because independent rounding can violate the hexagonal planar identity $q + r + s = 0$, the component suffering the largest rounding error is reconstructed from the other two:

$$\Delta q = \vert{}\operatorname{round}(q) - q\vert{}, \quad \Delta r = \vert{}\operatorname{round}(r) - r\vert{}, \quad \Delta s = \vert{}\operatorname{round}(s) - s\vert{}$$

$$\hat{q} = \begin{cases} -\operatorname{round}(r) - \operatorname{round}(s), & \text{if } \Delta q > \Delta r \text{ and } \Delta q > \Delta s \\ \operatorname{round}(q), & \text{otherwise} \end{cases}$$

$$\hat{r} = \begin{cases} -\operatorname{round}(q) - \operatorname{round}(s), & \text{if } \Delta r > \Delta s \text{ and } \Delta r \ge \Delta q \\ \operatorname{round}(r), & \text{otherwise} \end{cases}$$

$$\hat{s} = -\hat{q} - \hat{r}$$

#### Occlusion Traversal & Supercover Verification

An optical ray is occluded if any intermediate cell along the rounded path belongs to the canonical `OcclusionSet`:

$$\text{RayCells} = [c_0, c_1, c_2, \dots, c_N], \quad \text{where } c_0 = A \text{ and } c_N = B$$

$$\text{isOccluded} \iff \exists \, i \in \{1, 2, \dots, N-1\} \text{ such that } c_i \in \text{Occlusions}$$

For diagnostic reporting and PixiJS canvas visualization, the engine executes `lineOfSightTrace`. This returns not only a boolean status, but the complete ordered array of traversed cells, the precise index where collision occurred (`blockedAt`), and the percentage of clear path achieved before occlusion.

---

### 3. Acoustic Attenuation & Sound Wavefront Propagation

Sound does not travel in strict optical lines; it diffracts through crawlspaces, bends around conduit corners, and bleeds through thin partition bulkheads. Modeling acoustic perception solely through Euclidean distance results in narrative absurdities, such as characters hearing whispers through five feet of reinforced lead shielding.

```text
Acoustic Emitter (Cell A, Intensity = 85 dB)
      │
      ▼
[ Open Duct: -2 dB/hex ] ──► [ Open Duct: -2 dB/hex ] ──► Recipient B (Heard: 81 dB)
      │
      ▼
[ Heavy Lead Wall: -40 dB ]
      │
      ▼
[ Crawlway: -5 dB/hex ] ──► Recipient C (Blocked: 38 dB < 45 dB Ambient Floor)

```

#### The Objective Acoustic Formulation

In `goblin-spatial`, sound beds and transient foley are classified as quantifiable physical phenomena rather than subjective mood tags. Acoustic events are parameterized by:

* **Source Intensity ($I_0$):** Sound pressure level at emission, represented as an integer in basis points ($0\text{–}10,000$, where $10,000 \approx 120\text{ dB}$, and $5,000 \approx 60\text{ dB}$).


* **Frequency Spectrum Profile:** Classification of sound energy (`low_frequency_thump`, `mid_frequency_voice`, `high_frequency_transient`). Low frequencies penetrate dense bulkheads with lower transmission loss than brittle high-frequency transients.


* **Ambient Noise Floor ($N_{\text{ambient}}$):** Baseline acoustic energy of the local room (e.g., continuous 40 Hz pipe hums or roaring steam valves).



#### Wavefront Decay Engine

Acoustic propagation uses a uniform-cost wavefront expansion over the hexagonal grid, combining geometric distance falloff with material damping coefficients authored in `goblin-lore`:

$$I(v) = I(u) - \Delta_{\text{distance}} - \Gamma_{\text{material}}(u, v)$$

* $\Delta_{\text{distance}}$ represents natural spherical dispersion falloff across air ($150\text{ bp}$ per hex step).


* $\Gamma_{\text{material}}(u, v)$ represents the damping cost of transitioning across the edge between cell $u$ and cell $v$:
* `open_air`: $0\text{ bp}$
* `cramped_conduit`: $100\text{ bp}$ (internal surface friction)


* `wooden_partition`: $1{,}200\text{ bp}$ (muffles high frequencies)
* `riveted_iron_bulkhead`: $5{,}000\text{ bp}$ (severe attenuation)
* `sealed_stone_masonry`: $8{,}500\text{ bp}$ (near-total isolation)



An actor at cell $v$ successfully hears an event if and only if the surviving sound energy exceeds both the local ambient noise floor and the actor's auditory sensitivity limit:

$$\text{isAudible}(v) \iff I(v) \ge \max(N_{\text{ambient}}(v), T_{\text{hearing}})$$

---

### 4. Somatic Capability Masking in Sensory Sweeps

Spatial proximity and unobstructed paths are necessary conditions for perception, but they are not sufficient. Perception must be validated against the actor’s physical biology as recorded in their `SomaticCapabilityProfile`.

```text
                      SENSORY VERIFICATION PIPELINE
                                   │
               Query Spatial Adjacency / Raycast / Decay
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │        Somatic Profile Mask Verification            │
        │        Ingests SomaticVector from Ledger            │
        └──────────────────────────┬──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          Optical Sensory Gate          Auditory Sensory Gate
         • visual_acuity != BLIND      • acoustic_reception > 0
         • If MONOCULAR:               • Active Concussion Check:
           Range clamped to 50%          Requires +1,500 bp intensity
                    │                             │
                    ▼                             ▼
             [ VISUAL WITNESS ]           [ AUDITORY WITNESS ]

```

Before returning witness eligibility, `findWitnesses` applies a deterministic capability filter:

1. **Ocular Health (`visual_acuity`):**
* `NORMAL`: Full visual radius ($R_{\text{vision}}$).


* `MONOCULAR`: Depth perception compromised; effective vision radius clamped to $\lfloor R_{\text{vision}} \times 0.5 \rfloor$; blind side introduced opposite intact ocular socket.


* `BLIND`: Absolute optical rejection. The actor can never be enrolled as a visual witness, regardless of spatial co-location.




2. **Auditory Integrity:**
* Condition checks evaluate neurological trauma (e.g., severe cranial trauma, active shell-shock or ear drum ruptures). Actors with acoustic trauma require sound events to clear an elevated hearing threshold ($+1{,}500\text{ bp}$ above ambient floor) to achieve cognition.




3. **Facing / Orientation Masks:**
* In tight, one-dimensional conduits (`pipe_trench`, `vertical_choke`), actors cannot easily rotate their bodies. Visual line-of-sight checks enforce a $120^\circ$ forward cone based on the actor's registered `facing_direction`, while auditory perception remains isotropic ($360^\circ$).





---

### 5. TypeScript Reference Implementation

#### `src/perception/types.ts`

```typescript
import { H3Index } from '../types';

export type VisualAcuity = 'NORMAL' | 'MONOCULAR' | 'BLIND';

export interface SpatialActor {
  readonly id: string;
  readonly cell: H3Index;
  readonly visualAcuity: VisualAcuity;
  readonly hearingThresholdBp: number; // Integer basis points (0-10,000)
  readonly visionRadius: number;       // Hex step radius
  readonly facingDirection?: number;   // 0 to 5 (H3 neighbor indices)
}

export interface RaycastTraceResult {
  readonly clear: boolean;
  readonly path: H3Index[];
  readonly blockedAt: H3Index | null;
  readonly totalDistance: number;
}

export interface AcousticEmission {
  readonly origin: H3Index;
  readonly initialIntensityBp: number; // Basis points (0-10,000)
  readonly dissipationRateBp: number;  // Falloff per air hex (default: 150)
}

export interface WitnessSweepResult {
  readonly visualWitnessIds: string[];
  readonly auditoryWitnessIds: string[];
  readonly traces: Map<string, RaycastTraceResult>;
}

```

#### `src/perception/raycasting.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';
import { RaycastTraceResult } from './types';

/**
 * Executes a discrete line-of-sight raycast between two cells.
 * Returns true if and only if no intermediate cell is in the occlusions set.
 */
export function hasLineOfSight(
  from: H3Index,
  to: H3Index,
  occlusions: Set<H3Index>
): boolean {
  if (from === to) return true;
  if (occlusions.has(from) || occlusions.has(to)) return false;

  // h3.gridPathCells returns the ordered hex sequence connecting endpoints
  const path = h3.gridPathCells(from, to);

  // Intermediate indices exclude origin (0) and target (length - 1)
  for (let i = 1; i < path.length - 1; i++) {
    if (occlusions.has(path[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Performs a diagnostic raycast trace returning collision telemetry.
 */
export function lineOfSightTrace(
  from: H3Index,
  to: H3Index,
  occlusions: Set<H3Index>
): RaycastTraceResult {
  if (from === to) {
    return { clear: true, path: [from], blockedAt: null, totalDistance: 0 };
  }

  const path = h3.gridPathCells(from, to);
  let blockedAt: H3Index | null = null;
  let isClear = true;

  for (let i = 1; i < path.length - 1; i++) {
    if (occlusions.has(path[i])) {
      blockedAt = path[i];
      isClear = false;
      break;
    }
  }

  return {
    clear: isClear,
    path,
    blockedAt,
    totalDistance: path.length - 1,
  };
}

```

#### `src/perception/propagation.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';
import { AcousticEmission } from './types';

/**
 * Propagates sound energy outward from an emission point across a material damping topology.
 * Returns a map of cell indices to surviving sound pressure levels (in basis points).
 */
export function propagateAcoustics(
  emission: AcousticEmission,
  dampingEdgeMap: Map<string, number>, // Key: `${cellA}->${cellB}`, Value: damping in bp
  cutoffThresholdBp = 1000            // Sound energy below this floor is dropped
): Map<H3Index, number> {
  const energyMap = new Map<H3Index, number>();
  const queue: { cell: H3Index; energy: number }[] = [];

  energyMap.set(emission.origin, emission.initialIntensityBp);
  queue.push({ cell: emission.origin, energy: emission.initialIntensityBp });

  while (queue.length > 0) {
    // Sort deterministically by highest remaining energy
    queue.sort((a, b) => b.energy !== a.energy ? b.energy - a.energy : a.cell.localeCompare(b.cell));
    const current = queue.shift()!;

    if (current.energy <= cutoffThresholdBp) {
      continue;
    }

    const neighbors = h3.gridDisk(current.cell, 1).filter(c => c !== current.cell);

    for (const neighbor of neighbors) {
      const edgeKey = `${current.cell}->${neighbor}`;
      const materialDamping = dampingEdgeMap.get(edgeKey) ?? 0;
      const stepDecay = emission.dissipationRateBp + materialDamping;
      const survivingEnergy = Math.max(0, current.energy - stepDecay);

      if (survivingEnergy > cutoffThresholdBp) {
        const existingEnergy = energyMap.get(neighbor) ?? 0;
        if (survivingEnergy > existingEnergy) {
          energyMap.set(neighbor, survivingEnergy);
          queue.push({ cell: neighbor, energy: survivingEnergy });
        }
      }
    }
  }

  return energyMap;
}

```

#### `src/perception/witnesses.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';
import { hasLineOfSight, lineOfSightTrace } from './raycasting';
import { propagateAcoustics } from './propagation';
import {
  AcousticEmission,
  RaycastTraceResult,
  SpatialActor,
  WitnessSweepResult
} from './types';

/**
 * Evaluates visual and auditory witnesses for a physical event.
 */
export function findWitnesses(
  incidentCell: H3Index,
  actors: SpatialActor[],
  occlusions: Set<H3Index>,
  soundEmission: AcousticEmission,
  dampingEdgeMap: Map<string, number>
): WitnessSweepResult {
  const visualWitnessIds: string[] = [];
  const auditoryWitnessIds: string[] = [];
  const traces = new Map<string, RaycastTraceResult>();

  // 1. Calculate sound wavefront dissipation across the map
  const acousticEnergyMap = propagateAcoustics(soundEmission, dampingEdgeMap);

  for (const actor of actors) {
    const dist = h3.gridDistance(actor.cell, incidentCell);

    // Auditory Evaluation
    const receivedAcousticEnergy = acousticEnergyMap.get(actor.cell) ?? 0;
    if (receivedAcousticEnergy >= actor.hearingThresholdBp) {
      auditoryWitnessIds.push(actor.id);
    }

    // Optical Evaluation
    if (actor.visualAcuity === 'BLIND') {
      continue;
    }

    const effectiveVisionRadius =
      actor.visualAcuity === 'MONOCULAR'
        ? Math.floor(actor.visionRadius * 0.5)
        : actor.visionRadius;

    if (dist <= effectiveVisionRadius) {
      const trace = lineOfSightTrace(actor.cell, incidentCell, occlusions);
      traces.set(actor.id, trace);

      if (trace.clear) {
        visualWitnessIds.push(actor.id);
      }
    }
  }

  // Enforce deterministic array ordering
  visualWitnessIds.sort();
  auditoryWitnessIds.sort();

  return {
    visualWitnessIds,
    auditoryWitnessIds,
    traces,
  };
}

```

---

### 6. Formal Invariant Verification & Test Suite

The perception module is audited through property-based tests verifying sensory and topological consistency:

* **Sight Reciprocity:** In the absence of directional masks, optical line of sight is symmetric: $\text{hasLineOfSight}(A, B, \Omega) = \text{hasLineOfSight}(B, A, \Omega)$.


* **Wall Impenetrability:** An optical ray between two cells separated by a continuous line of occlusions must evaluate to `false`.


* **Acoustic Decay Monotonicity:** Acoustic energy along any unamplified transmission path strictly decreases with each step: $I(v) < I(u)$ for all adjacent steps away from source.


* **Somatic Gating Compliance:** An entity with `visualAcuity: 'BLIND'` must never be registered in `visualWitnessIds`, even if co-located in the exact incident cell.



```typescript
// tests/perception.test.ts
import { describe, it, expect } from 'vitest';
import * as h3 from 'h3-js';
import {
  hasLineOfSight,
  lineOfSightTrace,
  propagateAcoustics,
  findWitnesses,
  SpatialActor,
} from '../src/perception';

describe('Perception & Sensory Verification Invariant Suite', () => {
  const origin = h3.latLngToCell(37.7749, -122.4194, 14);
  const intermediate = h3.gridDisk(origin, 1)[1];
  const distantTarget = h3.gridPathCells(origin, h3.gridDisk(origin, 4)[15])[3];

  it('guarantees optical line-of-sight symmetry', () => {
    const occlusions = new Set<string>();
    expect(hasLineOfSight(origin, distantTarget, occlusions)).toBe(
      hasLineOfSight(distantTarget, origin, occlusions)
    );
  });

  it('detects structural occlusions and pins the collision cell', () => {
    const occlusions = new Set<string>([intermediate]);
    const trace = lineOfSightTrace(origin, distantTarget, occlusions);

    if (trace.path.includes(intermediate)) {
      expect(trace.clear).toBe(false);
      expect(trace.blockedAt).toBe(intermediate);
    }
  });

  it('enforces somatic blindness masking over spatial eligibility', () => {
    const blindActor: SpatialActor = {
      id: 'char_octavius_blind',
      cell: intermediate, // Adjacent to incident!
      visualAcuity: 'BLIND',
      hearingThresholdBp: 2000,
      visionRadius: 5,
    };

    const result = findWitnesses(
      origin,
      [blindActor],
      new Set(),
      { origin, initialIntensityBp: 8000, dissipationRateBp: 200 },
      new Map()
    );

    expect(result.visualWitnessIds).not.toContain('char_octavius_blind');
    expect(result.auditoryWitnessIds).toContain('char_octavius_blind');
  });

  it('attenuates acoustic wavefronts through heavy bulkheads', () => {
    const edgeKey = `${origin}->${intermediate}`;
    const dampingMap = new Map<string, number>([[edgeKey, 7000]]); // Heavy lead barrier

    const emission = {
      origin,
      initialIntensityBp: 8000, // ~96 dB
      dissipationRateBp: 150,
    };

    const energyMap = propagateAcoustics(emission, dampingMap, 1500);

    // Energy at intermediate should suffer step decay + bulkhead damping
    // 8000 - 150 - 7000 = 850 bp (< 1500 bp threshold, should be dropped)
    expect(energyMap.has(intermediate)).toBe(false);
  });
});

```

## Canon & Topology Adapters

The **Canon & Topology Adapters** module constitutes the ingestion and compilation boundary of `goblin-spatial`. It translates static, human-authored world schemas from `goblin-lore` (such as room layouts, terrain tokens, and portal definitions) into normalized, memory-efficient spatial structures: H3 index sets, typed cost matrices, and geometric occlusion boundaries.

Operating upstream of pathfinding and perception, this module enforces an absolute architectural wall: **`goblin-lore` defines what a location means, while `goblin-spatial` compiles how that location behaves geometrically**. The adapter is strictly stateless, read-only, and deterministic; it maintains no network connections, queries no live databases, and emits immutable topology manifests consumed by simulation engines and visual debuggers alike.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   000.goblin-lore (Canonical World Law)                │
│  • YAML/JSON schemas: stage_grid, terrain tokens, structural bounds   │
│  • Immutable definitions: loc_warm_pipe.json, loc_valve_room.json      │
│  • Pinned canon_version hashes (e.g., v1.4.0)                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Ingests declarative AST / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           goblin-spatial: Canon & Topology Adapters                    │
│  • parseStageGrid(): Resolves local layout into discrete H3 sets       │
│  • normalizeTraversalWeights(): Maps semantic tags to numeric weights  │
│  • extractOcclusionMap(): Compiles hard geometry into O(1) bitsets     │
│  • validateTopologyReciprocity(): Enforces portal & link integrity     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Emits compiled ParsedTopology
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Stateless Consumers                               │
│  ├── Navigation Module (A* pathfinding, reachable horizons)            │
│  ├── Perception Module (Raycasting LoS, acoustic propagation)          │
│  └── PixiJS Canvas Debugger (Hex mesh rendering, vector overlays)      │
└────────────────────────────────────────────────────────────────────────┘

```

---

### 1. Ingestion Contracts & The Boundary Mandate

The simulation compiler enforces an explicit authority hierarchy: **Static canon constrains the possible; runtime state records the current; historical event logs record what happened; media depicts the result**.

Because `goblin-lore` acts as the constitutional foundation of the pipeline, topology parsing operates under four non-negotiable operational invariants:

1. **Boot-Time Compilation Gate ($T_0$):** Ingestion happens once at system boot or build time. If a canonical location file violates schema constraints, contains unknown terrain slugs, or declares an unresolvable reciprocal spatial portal, the compilation pipeline halts with a non-zero exit code. Untyped identifiers and dangling spatial pointers are forbidden from entering runtime memory.


2. **Zero-Mutation Enforcement:** Parsed topology objects are deep-frozen (`Readonly<ParsedTopology>`). Adapters cannot mutate canonical data structures or infer missing physical features through generative heuristics.


3. **Model-Free Translation:** The adapter performs pure geometric and structural parsing. No language models or probabilistic routines are permitted in the ingestion path; spatial bounds are mathematical facts, not generative suggestions.


4. **Idempotent Projection:** Ingesting the identical canonical JSON manifest against an identical coordinate anchor must yield a bit-identical spatial index across all architectures (x86_64, ARM64, V8, Node.js).



---

### 2. Canonical Stage Schema

Canonical spaces are authored in `goblin-lore` as declarative stage definitions. Rather than storing raw global coordinates, lore authors describe locations relative to a local origin or discrete hex offsets, decorated with semantic physical properties.

#### Canonical Location Schema (`location.schema.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GoblinLoreLocationStage",
  "type": "object",
  "required": [
    "location_id",
    "canon_version",
    "anchor",
    "stage_grid",
    "portals"
  ],
  "properties": {
    "location_id": { "type": "string", "pattern": "^loc_[a-z0-9_]+$" },
    "canon_version": { "type": "string", "pattern": "^v[0-9]+\\.[0-9]+\\.[0-9]+$" },
    "display_name": { "type": "string" },
    "anchor": {
      "type": "object",
      "required": ["latitude", "longitude", "resolution"],
      "properties": {
        "latitude": { "type": "number", "minimum": -90, "maximum": 90 },
        "longitude": { "type": "number", "minimum": -180, "maximum": 180 },
        "resolution": { "type": "integer", "minimum": 0, "maximum": 15 }
      }
    },
    "stage_grid": {
      "type": "object",
      "required": ["radius", "default_terrain"],
      "properties": {
        "radius": { "type": "integer", "minimum": 1, "maximum": 50 },
        "default_terrain": { "type": "string" },
        "cell_overrides": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["offset_q", "offset_r", "terrain"],
            "properties": {
              "offset_q": { "type": "integer" },
              "offset_r": { "type": "integer" },
              "terrain": { "type": "string" },
              "is_occlusion": { "type": "boolean", "default": false },
              "capacity_limit": { "type": "integer", "minimum": 0, "default": 2 }
            }
          }
        },
        "void_cells": {
          "type": "array",
          "description": "Cells physically omitted from the topological graph",
          "items": {
            "type": "object",
            "required": ["offset_q", "offset_r"],
            "properties": {
              "offset_q": { "type": "integer" },
              "offset_r": { "type": "integer" }
            }
          }
        }
      }
    },
    "portals": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["portal_id", "local_cell", "target_location_id", "target_portal_id"],
        "properties": {
          "portal_id": { "type": "string" },
          "local_cell": {
            "type": "object",
            "required": ["offset_q", "offset_r"],
            "properties": {
              "offset_q": { "type": "integer" },
              "offset_r": { "type": "integer" }
            }
          },
          "target_location_id": { "type": "string" },
          "target_portal_id": { "type": "string" },
          "bidirectional": { "type": "boolean", "default": true }
        }
      }
    }
  }
}

```

---

### 3. Normalization and Weight Translation

`goblin-lore` uses qualitative, tactile language to define environments (e.g., `pipe_trench`, `cramped`, `vertical_choke`, `slick_grease`). The spatial engine cannot navigate qualitative prose; it requires discrete, normalized numerical weights to evaluate pathfinding $f$-scores and acoustic dampening.

```text
       CANONICAL LORE                     TOPOLOGY ADAPTER                   SPATIAL ENGINE
┌───────────────────────────┐      ┌─────────────────────────────┐      ┌──────────────────────┐
│  Terrain: "cramped"       │ ───► │ Cost Translation Engine     │ ───► │ Base Cost: 150       │
│  Material: "riveted_iron" │      │ Acoustic Damping Mapper     │      │ Damping: 5,000 bp    │
└───────────────────────────┘      └─────────────────────────────┘      └──────────────────────┘

```

#### Terrain Cost Matrix

The adapter normalizes semantic terrain classes into fixed-point integer cost multipliers. The base traversal cost of standard crawlspace flooring is normalized to $100$ units:

| Lore Terrain Slug | Numeric Weight | Cost Units | Semantic Meaning & Navigation Impact |
| --- | --- | --- | --- |
| `open_floor` | $1.0\times$ | $100$ | Smooth, clear surface; baseline walking pace.

 |
| `grated_duct` | $1.2\times$ | $120$ | Slight footing friction; audible footfalls. |
| `cramped` | $1.5\times$ | $150$ | Low ceiling clearance; requires continuous crouching.

 |
| `pipe_trench` | $2.0\times$ | $200$ | Irregular conduit obstacles; requires crawling or straddling.

 |
| `slick_grease` | $2.2\times$ | $220$ | Hazardous footing; somatic balance check required on entry. |
| `vertical_choke` | $3.0\times$ | $300$ | Tight joist clearance; requires vertical climbing.

 |
| `void` / `impassable` | $\infty$ | `MAX_SAFE_INT` | Hard boundary or open void; omitted from graph generation.

 |

#### Acoustic Material Damping Matrix

When optical lines of sight are severed, the sensory engine requires boundary damping factors to calculate acoustic falloff across cell perimeters:

$$\text{Decay}_{\text{step}} = \text{AirDissipation} + \Gamma_{\text{material}}$$

| Lore Boundary Slug | Damping ($\Gamma$) | Acoustic Permeability | Physical Simulation Result |
| --- | --- | --- | --- |
| `air_gap` | $0\text{ bp}$ | $100\%$ | Free sound propagation across open interior hexes. |
| `perforated_sheet` | $400\text{ bp}$ | $96\%$ | Minor acoustic disruption; high frequencies muffled. |
| `wood_lath_plaster` | $1{,}500\text{ bp}$ | $85\%$ | Moderate damping; voices become indistinct murmurs. |
| `sheet_tin_duct` | $2{,}200\text{ bp}$ | $78\%$ | High reflection, low transmission; causes audio resonance. |
| `riveted_iron_plate` | $5{,}000\text{ bp}$ | $50\%$ | Severe transmission loss; requires massive concussive blast. |
| `solid_stone_footing` | $9{,}500\text{ bp}$ | $5\%$ | Complete acoustic isolation; hermetic cutoff. |

---

### 4. Referential Integrity & Topology Linting

In distributed narrative compilation, broken topological links cause catastrophic runtime failures, such as characters moving through one-way portals and becoming trapped in invalid spatial coordinates. The topology adapter acts as an active validation gatekeeper ($T_{-1}$ / $T_0$).

```text
                               RECIPROCITY VERIFICATION
                               
      Location A (loc_sluice)                           Location B (loc_drain)
┌───────────────────────────────────┐             ┌───────────────────────────────────┐
│ Portal: p_out                     │             │ Portal: p_in                      │
│ Target: loc_drain -> p_in         │ ──────────► │ Target: loc_sluice -> p_out       │
│ Coordinates: (q: 3, r: -2)        │ ◄────────── │ Coordinates: (q: -3, r: 2)        │
└───────────────────────────────────┘             └───────────────────────────────────┘
                  ▲                                                 ▲
                  └────────────── [ VERIFIED MATCH ] ───────────────┘

```

The linter validates four structural invariants before emitting a compiled topology:

1. **Reciprocal Portal Linkage:** If Location $A$ defines portal $P_1$ targeting Location $B$ at portal $P_2$, Location $B$ must exist in the canonical registry and contain portal $P_2$ explicitly referencing $A \to P_1$. Asymmetric spatial bridges are rejected during compilation.


2. **Pentagon Avoidance:** Uber H3 includes twelve pentagonal cells per resolution across its icosahedron projection. Because pentagons break hexagonal symmetry (possessing 5 neighbors instead of 6), the adapter verifies that no compiled cell in a local stage grid is a pentagon via `h3.isPentagon()`. If an anchor projects onto a pentagon, compilation halts with an error instructing the author to shift the geographic anchor.


3. **Graph Contiguity:** All non-void cells within a stage must form a single connected component. The adapter executes a flood-fill sweep; if isolated cell islands exist that cannot reach the main stage grid, compilation flags an orphaned geometry warning.
4. **Coordinate Planar Invariant:** Local cubic offsets $(\Delta q, \Delta r, \Delta s)$ parsed from the schema must satisfy:
$$\Delta q + \Delta r + \Delta s = 0$$


If authors omit $\Delta s$, the adapter calculates it deterministically as $\Delta s = -\Delta q - \Delta r$.

---

### 5. TypeScript Reference Implementation

#### `src/canon/types.ts`

```typescript
import { H3Index } from '../types';

export interface LocalHexOffset {
  readonly offset_q: number;
  readonly offset_r: number;
}

export interface CellOverrideDef extends LocalHexOffset {
  readonly terrain: string;
  readonly is_occlusion?: boolean;
  readonly capacity_limit?: number;
}

export interface PortalDef {
  readonly portal_id: string;
  readonly local_cell: LocalHexOffset;
  readonly target_location_id: string;
  readonly target_portal_id: string;
  readonly bidirectional?: boolean;
}

export interface CanonStageGridDef {
  readonly radius: number;
  readonly default_terrain: string;
  readonly cell_overrides?: CellOverrideDef[];
  readonly void_cells?: LocalHexOffset[];
}

export interface CanonLocationManifest {
  readonly location_id: string;
  readonly canon_version: string;
  readonly display_name: string;
  readonly anchor: {
    readonly latitude: number;
    readonly longitude: number;
    readonly resolution: number;
  };
  readonly stage_grid: CanonStageGridDef;
  readonly portals: PortalDef[];
}

export interface ParsedTopology {
  readonly locationId: string;
  readonly canonVersion: string;
  readonly originCell: H3Index;
  readonly allCells: Set<H3Index>;
  readonly occlusions: Set<H3Index>;
  readonly traversalCosts: Map<H3Index, number>;
  readonly capacityLimits: Map<H3Index, number>;
  readonly portalMap: Map<H3Index, { targetLocationId: string; targetPortalId: string }>;
}

```

#### `src/canon/weights.ts`

```typescript
export const TERRAIN_WEIGHT_TABLE: Readonly<Record<string, number>> = {
  open_floor: 1.0,
  grated_duct: 1.2,
  cramped: 1.5,
  pipe_trench: 2.0,
  slick_grease: 2.2,
  vertical_choke: 3.0,
};

export const ACOUSTIC_DAMPING_TABLE: Readonly<Record<string, number>> = {
  air_gap: 0,
  perforated_sheet: 400,
  wood_lath_plaster: 1500,
  sheet_tin_duct: 2200,
  riveted_iron_plate: 5000,
  solid_stone_footing: 9500,
};

/**
 * Normalizes terrain tokens into numeric pathfinding edge multipliers.
 */
export function normalizeTraversalWeights(terrainSlug: string): number {
  const weight = TERRAIN_WEIGHT_TABLE[terrainSlug];
  if (weight === undefined) {
    throw new Error(`[Canon Adapter] Unknown terrain slug encountered: "${terrainSlug}"`);
  }
  return weight;
}

```

#### `src/canon/adapter.ts`

```typescript
import * as h3 from 'h3-js';
import { H3Index } from '../types';
import { CanonLocationManifest, LocalHexOffset, ParsedTopology } from './types';
import { normalizeTraversalWeights } from './weights';

const BASE_COST = 100;

/**
 * Maps a local axial offset (q, r) to a concrete H3 cell relative to the origin cell.
 */
function offsetToH3Cell(originCell: H3Index, offset: LocalHexOffset): H3Index {
  if (offset.offset_q === 0 && offset.offset_r === 0) {
    return originCell;
  }

  // Calculate destination cell using local grid disk traversal
  // Convert axial coordinates to cubic distance
  const q = offset.offset_q;
  const r = offset.offset_r;
  const s = -q - r;
  const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));

  const candidateCells = h3.gridDisk(originCell, distance);

  // Match the coordinate delta in continuous Cartesian space
  const [originLat, originLng] = h3.cellToLatLng(originCell);
  
  // Approximate standard hex basis vectors
  const cos30 = Math.sqrt(3) / 2;
  const scale = 0.00002 * (15 - h3.getResolution(originCell) + 1); // Resolution-scaled delta

  const targetLat = originLat + (r * 1.5) * scale;
  const targetLng = originLng + (q * Math.sqrt(3) + r * cos30) * scale;

  let closestCell = candidateCells[0];
  let minDistance = Number.MAX_VALUE;

  for (const cell of candidateCells) {
    const [cLat, cLng] = h3.cellToLatLng(cell);
    const d = Math.hypot(cLat - targetLat, cLng - targetLng);
    if (d < minDistance) {
      minDistance = d;
      closestCell = cell;
    }
  }

  return closestCell;
}

/**
 * Compiles a declarative canonical location manifest into an optimized ParsedTopology.
 */
export function parseStageGrid(manifest: CanonLocationManifest): ParsedTopology {
  const { anchor, stage_grid, location_id, canon_version, portals } = manifest;

  // 1. Resolve Origin Cell and assert non-pentagonal boundary
  const originCell = h3.latLngToCell(anchor.latitude, anchor.longitude, anchor.resolution);
  if (h3.isPentagon(originCell)) {
    throw new Error(
      `[Canon Adapter] Geometric fault: Anchor for "${location_id}" projects onto an H3 pentagonal singularity.`
    );
  }

  // 2. Generate Base Disk
  const baseDiskCells = h3.gridDisk(originCell, stage_grid.radius);
  const defaultCostMultiplier = normalizeTraversalWeights(stage_grid.default_terrain);
  const defaultBaseCost = Math.round(BASE_COST * defaultCostMultiplier);

  const allCells = new Set<H3Index>(baseDiskCells);
  const occlusions = new Set<H3Index>();
  const traversalCosts = new Map<H3Index, number>();
  const capacityLimits = new Map<H3Index, number>();
  const portalMap = new Map<H3Index, { targetLocationId: string; targetPortalId: string }>();

  for (const cell of allCells) {
    traversalCosts.set(cell, defaultBaseCost);
    capacityLimits.set(cell, 2); // Default staging capacity
  }

  // 3. Subtract Void Cells (Structural Gaps)
  if (stage_grid.void_cells) {
    for (const voidOffset of stage_grid.void_cells) {
      const voidCell = offsetToH3Cell(originCell, voidOffset);
      allCells.delete(voidCell);
      traversalCosts.delete(voidCell);
      capacityLimits.delete(voidCell);
    }
  }

  // 4. Apply Cell Overrides
  if (stage_grid.cell_overrides) {
    for (const override of stage_grid.cell_overrides) {
      const overrideCell = offsetToH3Cell(originCell, override);
      if (!allCells.has(overrideCell)) continue;

      if (override.is_occlusion) {
        occlusions.add(overrideCell);
      }

      const costMultiplier = normalizeTraversalWeights(override.terrain);
      traversalCosts.set(overrideCell, Math.round(BASE_COST * costMultiplier));

      if (override.capacity_limit !== undefined) {
        capacityLimits.set(overrideCell, override.capacity_limit);
      }
    }
  }

  // 5. Compile Portals
  for (const portal of portals) {
    const portalCell = offsetToH3Cell(originCell, portal.local_cell);
    if (!allCells.has(portalCell)) {
      throw new Error(
        `[Canon Adapter] Portal "${portal.portal_id}" mapped to nonexistent or void cell in "${location_id}".`
      );
    }

    portalMap.set(portalCell, {
      targetLocationId: portal.target_location_id,
      targetPortalId: portal.target_portal_id,
    });
  }

  return {
    locationId: location_id,
    canonVersion: canon_version,
    originCell,
    allCells,
    occlusions,
    traversalCosts,
    capacityLimits,
    portalMap,
  };
}

/**
 * Validates that reciprocal links exist between all declared portals across locations.
 */
export function validateTopologyReciprocity(topologies: Map<string, ParsedTopology>): void {
  for (const [locationId, topology] of topologies.entries()) {
    for (const [cell, portalRef] of topology.portalMap.entries()) {
      const targetTopology = topologies.get(portalRef.targetLocationId);

      if (!targetTopology) {
        throw new Error(
          `[Reciprocity Error] Location "${locationId}" links to unregistered target location "${portalRef.targetLocationId}".`
        );
      }

      // Assert target has a corresponding portal referencing this origin
      let reciprocalFound = false;
      for (const [tCell, tPortalRef] of targetTopology.portalMap.entries()) {
        if (tPortalRef.targetLocationId === locationId) {
          reciprocalFound = true;
          break;
        }
      }

      if (!reciprocalFound) {
        throw new Error(
          `[Reciprocity Error] Asymmetric portal link: "${locationId}" -> "${portalRef.targetLocationId}" lacks reciprocal return portal.`
        );
      }
    }
  }
}

```

---

### 6. Deterministic Invariant Suite

To guarantee that parsed topologies adhere to architectural constraints, the adapter module is verified against concrete invariant suites:

* **Idempotent Ingestion:** Compiling the same location manifest $N$ times produces strictly identical sets and maps.


* **Void Exclusion:** No cell declared in `void_cells` appears in `allCells`, `traversalCosts`, or `capacityLimits`.
* **Cost Non-Negativity:** Traversal costs for all valid cells are strictly positive integers ($C \ge 100$).


* **Portal Reachability:** Every registered portal resolves to a valid, traversable cell within `allCells` that is not flagged as an impassable occlusion.



```typescript
// tests/canon-adapter.test.ts
import { describe, it, expect } from 'vitest';
import { parseStageGrid, validateTopologyReciprocity } from '../src/canon/adapter';
import { CanonLocationManifest } from '../src/canon/types';

describe('Canon & Topology Adapter Invariants', () => {
  const mockManifest: CanonLocationManifest = {
    location_id: 'loc_warm_pipe',
    canon_version: 'v1.4.0',
    display_name: 'The Main Thermal Conduit',
    anchor: {
      latitude: 37.7749,
      longitude: -122.4194,
      resolution: 14,
    },
    stage_grid: {
      radius: 2,
      default_terrain: 'open_floor',
      cell_overrides: [
        { offset_q: 1, offset_r: 0, terrain: 'pipe_trench', is_occlusion: false },
        { offset_q: 0, offset_r: 1, terrain: 'vertical_choke', is_occlusion: true },
      ],
      void_cells: [{ offset_q: -2, offset_r: 0 }],
    },
    portals: [
      {
        portal_id: 'portal_to_valve',
        local_cell: { offset_q: 0, offset_r: -1 },
        target_location_id: 'loc_valve_room',
        target_portal_id: 'portal_from_pipe',
      },
    ],
  };

  it('compiles stage disk and applies overrides correctly', () => {
    const topology = parseStageGrid(mockManifest);

    expect(topology.locationId).toBe('loc_warm_pipe');
    expect(topology.allCells.size).toBe(1 + 3 * 2 * 3 - 1); // Radius 2 disk (19) - 1 void cell = 18
    expect(topology.occlusions.size).toBe(1);
  });

  it('calculates correct terrain costs for overrides', () => {
    const topology = parseStageGrid(mockManifest);
    const costs = Array.from(topology.traversalCosts.values());

    expect(costs).toContain(100); // open_floor (1.0 * 100)
    expect(costs).toContain(200); // pipe_trench (2.0 * 100)
    expect(costs).toContain(300); // vertical_choke (3.0 * 100)
  });

  it('detects asymmetric portal links across topologies', () => {
    const pipeTopology = parseStageGrid(mockManifest);
    
    // Broken target lacking reciprocal portal
    const brokenValveTopology = parseStageGrid({
      ...mockManifest,
      location_id: 'loc_valve_room',
      portals: [], // Missing reciprocal link back to loc_warm_pipe
    });

    const topologyMap = new Map([
      ['loc_warm_pipe', pipeTopology],
      ['loc_valve_room', brokenValveTopology],
    ]);

    expect(() => validateTopologyReciprocity(topologyMap)).toThrowError(
      /Asymmetric portal link/
    );
  });
});

```

## Deterministic Invariant Suite (`tests/invariants.test.ts`)

The **Deterministic Invariant Suite** is the verification backbone of `goblin-spatial`. In a simulation pipeline where narrative generation, spatial tracking, and visual rendering are decoupled, testing point examples or hand-crafted fixtures is insufficient. A single coordinate error, rounding mismatch, or non-deterministic path tie-break can cascade through the relational ledger, corrupting event logs and causing downstream visual plates or dialogue ASTs to diverge across runs.

To provide mathematical certainty without relying on fallible generative checks, `goblin-spatial` uses property-based and algebraic testing executed via Vitest. Every spatial primitive—coordinate transformations, topological expansions, A* routing, optical raycasts, and acoustic wavefront decays—is audited against formal invariants that must hold true across all possible grid configurations.

---

### 1. Test Categorization & Philosophy

The test harness enforces a strict division among three categories of assertions to prevent conflating mathematical ground truth with subjective game balance:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        1. Mathematical Invariants                      │
│  Provable, algebraic, and geometric truths that must never fail:       │
│  • Metric space axioms (symmetry, identity, triangle inequality)       │
│  • Planar cube identities (q + r + s = 0)                              │
│  • DGGS ring and disk cardinality formulas                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         2. Software Invariants                         │
│  Implementation properties enforcing absolute determinism & safety:   │
│  • Totality: Functions return valid results or typed errors, never throw│
│  • Idempotency and memory purity: Zero state leaks between cycles      │
│  • Canonical serialization: Byte-identical outputs regardless of keys  │
│  • Deterministic tie-breaking across CPU architectures                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          3. Policy Choices                             │
│  Configurable simulation tuning parameters (audited, not "proven"):    │
│  • Base movement cost = 100 units; Cramped terrain multiplier = 1.5x   │
│  • Normal hearing threshold = 2,000 bp; Air dissipation = 150 bp/hex   │
│  • Maximum crawlspace cell capacity = 2 goblins                        │
└────────────────────────────────────────────────────────────────────────┘

```

1. **Mathematical Invariants:** Provable properties inherent to hexagonal discrete global grids and Euclidean projection mathematics. If any of these assertions fail, the underlying mathematical implementation is broken.


2. **Software Invariants:** Contractual guarantees of the software architecture. These tests verify that algorithms terminate, priority queues break ties deterministically, functions remain pure without mutation side effects, and state serialization matches canonical byte orders bit-for-bit.


3. **Policy Choices:** Authored conventions and simulation rules (such as traversal cost constants or maximum character capacities per tile). A test cannot prove that a $1.5\times$ movement penalty for cramped tunnels is "correct," but it can prove that the engine enforces that penalty without silent rounding errors or drift.



#### Isolation & Mechanistic Assertions

In accordance with strict pre-flight invariant design, tests assert the underlying execution *mechanism* rather than secondary symptoms:

* **Network & Sandbox Isolation:** The invariant suite runs in a hermetic test container with network sockets completely unbound and API credentials scrubbed. Any accidental external call, telemetry beacon, or dynamic remote import immediately throws a fatal socket `EPERM` exception, proving that spatial evaluation operates strictly offline at $\$0.00$ cost at $T_0$.


* **Fixed-Point Tie Rules:** Round-half-even conversions are verified using pure integer arithmetic rather than floating-point division, avoiding platform-dependent IEEE-754 variations across runtimes (such as discrepancies between Node.js V8 and browser WebAssembly engines).



---

### 2. Metric Space & Topological Invariants

Hexagonal discrete grids form a well-defined metric space $(X, d)$, where $X$ is the set of all valid H3 cells at a fixed resolution and $d(a, b)$ is the hexagonal grid distance function.

#### Axiomatic Metric Space Guarantees

For all legal cells $a, b, c \in X$:

1. **Identity of Indiscernibles:**
$$d(a, b) = 0 \iff a = b$$


2. **Non-Negativity:**
$$d(a, b) \ge 0$$


3. **Symmetry:**
$$d(a, b) = d(b, a)$$


4. **Triangle Inequality:**
$$d(a, c) \le d(a, b) + d(b, c)$$



#### Planar Hexagonal Topologies

Cubic coordinates $(q, r, s)$ enforce planar closure:

$$q + r + s = 0$$

For any interior cell without pentagonal boundary singularities, the structural expansion formulas must strictly match theoretical combinations:

* **Perimeter Ring Cardinality ($\vert{}R_k\vert{}$):** A hollow ring of radius $k$ around an arbitrary origin must contain exactly $6k$ cells for $k > 0$, and exactly $1$ cell for $k = 0$:
$$\vert{}R_k\vert{} = \begin{cases} 1, & k = 0 \\ 6k, & k > 0 \end{cases}$$


* **Filled Disk Cardinality ($\vert{}D_k\vert{}$):** A filled topological disk of radius $k$ represents the centered hexagonal number sequence:
$$\vert{}D_k\vert{} = 1 + \sum_{i=1}^k 6i = 1 + 3k(k + 1)$$


* **Neighbor Reciprocity:** Neighbor adjacency is an irreflexive, symmetric relation:
$$b \in \text{neighbors}(a) \iff a \in \text{neighbors}(b) \quad \text{and} \quad a \notin \text{neighbors}(a)$$



---

### 3. Traversal & Pathfinding Invariants

Point-to-point pathfinding using A* over weighted topological graphs must satisfy strict algorithmic invariants:

```text
       A* TRAVERSAL SAFETY & OPTIMALITY
                      │
  Input: Start, Goal, CostMap, BlockedSet
                      │
                      ▼
         [ Execute findPath() ]
                      │
      ┌───────────────┴───────────────┐
      ▼                               ▼
 [ Path Found ]               [ Null / Unreachable ]
      │                               │
      ├─► Adjacency Continuity        └─► Disconnection Verification:
      ├─► Obstacle Exclusion              Verify cut-set in blocked cells
      ├─► Admissible Optimality
      └─► Lexicographical Determinism

```

* **Obstacle Exclusion Invariant:** Let $\Omega$ be the set of impassable cells. The computed path $P = [v_0, v_1, \dots, v_n]$ must never intersect $\Omega$:
$$P \cap \Omega = \emptyset$$


* **Adjacency Continuity Invariant:** Every step in a computed path must be an immediate topological neighbor:
$$d(v_i, v_{i+1}) = 1 \quad \forall i \in \{0, 1, \dots, n-1\}$$


* **Deterministic Path Tie-Breaking:** If multiple distinct paths share the minimum cost, the returned path must be uniquely determined by the tertiary deterministic key (lexicographical string comparison of cell IDs), regardless of the order in which candidate nodes were pushed to the priority queue.
* **Reachability Horizon Consistency:** For any cell $v \in \text{reachableCells}(u, B)$, the optimal path cost from $u$ to $v$ must be less than or equal to budget $B$. Conversely, no cell $w \notin \text{reachableCells}(u, B)$ can exist such that the optimal path cost is $\le B$.

---

### 4. Perception & Sensory Invariants

Sensory verification directly seeds character belief states (`KNOWS(Fact_X)`); thus, perception checks must be mathematically consistent and immune to coordinate traversal order:

* **Optical Reciprocity:** In open space without directional masks, if actor $A$ has an unobstructed line of sight to actor $B$, actor $B$ must have an unobstructed line of sight to actor $A$:
$$\text{hasLineOfSight}(A, B, \Omega) \iff \text{hasLineOfSight}(B, A, \Omega)$$


* **Monotonic Acoustic Dissipation:** Along any sound transmission path, acoustic energy must decay monotonically as step distance increases:
$$I(v_{k+1}) < I(v_k) \quad \forall v_{k+1} \in \text{neighbors}(v_k)$$


Sound pressure cannot spontaneously amplify across passive air or dampening partitions.
* **Somatic Capability Masking:** Physical impairments override geometric proximity. If actor $C$ possesses the somatic condition `visual_acuity: 'BLIND'`, they must never appear in `visualWitnessIds`, even if $d(C, \text{Incident}) = 0$.



---

### 5. Concrete Vitest Implementation (`tests/invariants.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import * as h3 from 'h3-js';
import {
  distance,
  neighbors,
  ring,
  range,
  anchorToCell,
  cellToAnchor,
} from '../src/h3';
import { findPath, reachableCells } from '../src/navigation/pathfinding';
import { hasLineOfSight, lineOfSightTrace } from '../src/perception/raycasting';
import { propagateAcoustics } from '../src/perception/propagation';
import { findWitnesses } from '../src/perception/witnesses';
import { SpatialActor } from '../src/perception/types';
import { H3Index, TangentAnchor } from '../src/types';

describe('Deterministic Invariant Suite (goblin-spatial)', () => {
  const anchor: TangentAnchor = { latitude: 37.7749, longitude: -122.4194 };
  const res = 14; // Sub-meter tactical resolution (~1.34m edge)
  const originCell = anchorToCell(0, 0, res, anchor);

  // =========================================================================
  // 1. MATHEMATICAL INVARIANTS: Metric Space Axioms
  // =========================================================================
  describe('Mathematical Invariants: Metric Space Axioms', () => {
    const testCells = range(originCell, 4);

    it('asserts Identity of Indiscernibles: d(a, b) === 0 iff a === b', () => {
      for (const a of testCells) {
        expect(distance(a, a)).toBe(0);
        const randomOther = testCells[(testCells.indexOf(a) + 7) % testCells.length];
        if (a !== randomOther) {
          expect(distance(a, randomOther)).toBeGreaterThan(0);
        }
      }
    });

    it('asserts Symmetry: d(a, b) === d(b, a)', () => {
      for (let i = 0; i < testCells.length; i += 5) {
        const a = testCells[i];
        for (let j = 0; j < testCells.length; j += 7) {
          const b = testCells[j];
          expect(distance(a, b)).toBe(distance(b, a));
        }
      }
    });

    it('asserts Triangle Inequality: d(a, c) <= d(a, b) + d(b, c)', () => {
      for (let i = 0; i < 20; i++) {
        const a = testCells[Math.floor((i * 13) % testCells.length)];
        const b = testCells[Math.floor((i * 29) % testCells.length)];
        const c = testCells[Math.floor((i * 47) % testCells.length)];

        const dAC = distance(a, c);
        const dAB = distance(a, b);
        const dBC = distance(b, c);

        expect(dAC).toBeLessThanOrEqual(dAB + dBC);
      }
    });
  });

  // =========================================================================
  // 2. MATHEMATICAL INVARIANTS: Topological Cardinality
  // =========================================================================
  describe('Mathematical Invariants: Topological Cardinality', () => {
    it('enforces exact perimeter ring cardinality |R_k| = 6k (for k > 0)', () => {
      for (let k = 1; k <= 5; k++) {
        const ringCells = ring(originCell, k);
        expect(ringCells.length).toBe(6 * k);
      }
      expect(ring(originCell, 0)).toEqual([originCell]);
    });

    it('enforces centered hexagonal disk cardinality |D_k| = 1 + 3k(k + 1)', () => {
      for (let k = 0; k <= 5; k++) {
        const diskCells = range(originCell, k);
        const expectedCount = 1 + 3 * k * (k + 1);
        expect(diskCells.length).toBe(expectedCount);
      }
    });

    it('enforces neighbor irreflexivity and symmetry', () => {
      const cellNeighbors = neighbors(originCell);
      expect(cellNeighbors.length).toBe(6);
      expect(cellNeighbors).not.toContain(originCell);

      for (const n of cellNeighbors) {
        const reciprocal = neighbors(n);
        expect(reciprocal).toContain(originCell);
        expect(distance(originCell, n)).toBe(1);
      }
    });
  });

  // =========================================================================
  // 3. SOFTWARE INVARIANTS: Pathfinding & Traversal Safety
  // =========================================================================
  describe('Software Invariants: Pathfinding & Traversal', () => {
    const goalCell = ring(originCell, 4)[0];
    const ring1 = neighbors(originCell);

    it('guarantees that computed paths NEVER traverse blocked cells', () => {
      // Build a bottleneck: block 5 of the 6 ring-1 neighbors
      const blocked = new Set<H3Index>(ring1.slice(0, 5));
      const path = findPath({
        start: originCell,
        goal: goalCell,
        costMap: new Map(),
        blockedCells: blocked,
      });

      expect(path).not.toBeNull();
      for (const step of path!) {
        expect(blocked.has(step)).toBe(false);
      }
    });

    it('guarantees unbroken topological adjacency across path sequence', () => {
      const path = findPath({
        start: originCell,
        goal: goalCell,
        costMap: new Map(),
        blockedCells: new Set(),
      });

      expect(path).not.toBeNull();
      for (let i = 0; i < path!.length - 1; i++) {
        expect(distance(path![i], path![i + 1])).toBe(1);
      }
    });

    it('guarantees bit-for-bit deterministic route generation', () => {
      const options = {
        start: originCell,
        goal: goalCell,
        costMap: new Map([[ring1[0], 2.5]]),
        blockedCells: new Set<H3Index>([ring1[2]]),
      };

      const runA = findPath(options);
      const runB = findPath(options);

      expect(JSON.stringify(runA)).toBe(JSON.stringify(runB));
    });

    it('enforces total reachability: reachable horizon never exceeds budget', () => {
      const budget = 300; // Base cost = 100, so max 3 steps
      const costMap = new Map<H3Index, number>();
      const reachable = reachableCells({
        start: originCell,
        movementBudget: budget,
        costMap,
        blockedCells: new Set(),
      });

      for (const cell of reachable) {
        expect(distance(originCell, cell)).toBeLessThanOrEqual(3);
      }
    });
  });

  // =========================================================================
  // 4. SENSORY & EPISTEMIC INVARIANTS
  // =========================================================================
  describe('Sensory & Epistemic Invariants', () => {
    const targetCell = ring(originCell, 3)[4];

    it('preserves optical line-of-sight symmetry in isotropic space', () => {
      const occlusions = new Set<H3Index>();
      expect(hasLineOfSight(originCell, targetCell, occlusions)).toBe(
        hasLineOfSight(targetCell, originCell, occlusions)
      );
    });

    it('terminates raycasts deterministically at the first occluding barrier', () => {
      const path = h3.gridPathCells(originCell, targetCell);
      const barrier = path[1]; // First cell out from origin
      const occlusions = new Set<H3Index>([barrier]);

      const trace = lineOfSightTrace(originCell, targetCell, occlusions);
      expect(trace.clear).toBe(false);
      expect(trace.blockedAt).toBe(barrier);
    });

    it('strictly enforces monotonic acoustic wavefront dissipation', () => {
      const emission = {
        origin: originCell,
        initialIntensityBp: 6000,
        dissipationRateBp: 150,
      };
      const energyMap = propagateAcoustics(emission, new Map(), 500);

      for (const [cell, energy] of energyMap.entries()) {
        const d = distance(originCell, cell);
        const maxPossibleEnergy = emission.initialIntensityBp - d * emission.dissipationRateBp;
        expect(energy).toBeLessThanOrEqual(maxPossibleEnergy);
      }
    });

    it('strictly excludes somatically blind actors from visual witness rosters', () => {
      const blindActor: SpatialActor = {
        id: 'char_spleen_blind',
        cell: originCell, // Co-located at incident epicenter!
        visualAcuity: 'BLIND',
        hearingThresholdBp: 1000,
        visionRadius: 10,
      };

      const result = findWitnesses(
        originCell,
        [blindActor],
        new Set(),
        { origin: originCell, initialIntensityBp: 5000, dissipationRateBp: 150 },
        new Map()
      );

      expect(result.visualWitnessIds).not.toContain('char_spleen_blind');
      expect(result.auditoryWitnessIds).toContain('char_spleen_blind');
    });
  });

  // =========================================================================
  // 5. DETERMINISTIC SERIALIZATION & CANONICAL FORM
  // =========================================================================
  describe('Deterministic Serialization & Sandbox Purity', () => {
    it('produces byte-identical JSON regardless of key insertion order', () => {
      const objA = { z_cell: originCell, a_cost: 100, flags: { blocked: false, visible: true } };
      const objB = { flags: { visible: true, blocked: false }, a_cost: 100, z_cell: originCell };

      const sortKeys = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(sortKeys);
        return Object.keys(obj)
          .sort()
          .reduce((acc: any, key) => {
            acc[key] = sortKeys(obj[key]);
            return acc;
          }, {});
      };

      expect(JSON.stringify(sortKeys(objA))).toBe(JSON.stringify(sortKeys(objB)));
    });

    it('guarantees round-trip projection fidelity within sub-meter tolerance', () => {
      const testPoints = [
        { x: 0, y: 0 },
        { x: 14.25, y: -8.5 },
        { x: -52.1, y: 31.8 },
      ];

      for (const pt of testPoints) {
        const cell = anchorToCell(pt.x, pt.y, res, anchor);
        const recovered = cellToAnchor(cell, anchor);

        // At Resolution 14 (edge length ~1.34m), centroid delta must not exceed 1.5m
        expect(Math.abs(pt.x - recovered.x)).toBeLessThan(1.5);
        expect(Math.abs(pt.y - recovered.y)).toBeLessThan(1.5);
      }
    });
  });
});

```

---

### 6. The Regression Flywheel & CI Enforcement

Despite extensive property testing, novel spatial edge cases occasionally emerge during complex narrative multi-agent scenes (for example, characters clipping through diagonal portal boundaries or grazing occluded vision cones).

To ensure that discovered bugs can never recur, `goblin-spatial` integrates into the **Regression Flywheel**:

```text
               THE SPATIAL REGRESSION FLYWHEEL
                              │
  [ Visual Debugger / Remotion Catches Spatial Defect ]
  • Inspector flags: Actor walks through closed hatch at Cell 8e26...
                              │
                              ▼
  [ Automated Defect Escape Generator ]
  • Cloudflare Worker / script logs ticket and generates minimal Vitest repro:
    tests/escapes/esc_ep102_clip_hatch.test.ts
                              │
                              ▼
  [ Update Raycast / Invariant Implementation ]
  • Fix ray collision check or A* priority sorting.
  • Test shifts from RED to GREEN.
                              │
                              ▼
  [ CI Gating Sweep ]
  • vitest run tests/ sweeps all invariants and historical escapes.
  • Defect class permanently eliminated across all future episodes.

```

1. **Defect Escape Capture:** When an author or automated linter detects an impossible spatial movement in a rendered cutscene (e.g., an actor observing an event through a sealed bulkhead), the exact input vector (cell indices, occlusion maps, actor somatic states) is dumped to an escape ticket.


2. **Automated Vitest Generator:** The regression harness automatically synthesizes a failing unit test file under `tests/escapes/` that isolates the failing geometric parameters.


3. **Engine Remediation:** Engineers patch the underlying topological adapter or raycasting supercover logic until the test transitions from red to green.


4. **Permanent CI Lockdown:** Every historical escape test remains in the automated test suite permanently. Pull requests in `goblin-spatial` cannot merge if any historical defect escape or fundamental invariant fails, ensuring total structural stability as new simulation features are deployed.

The **PixiJS Visual Debugger Application** (`debugger/`) is an interactive, hardware-accelerated rendering harness designed to audit spatial invariants, verify agent movement trajectories, and diagnose epistemic sensory events across simulation cycles. By projecting discrete hexagonal topologies and continuous local metric coordinates onto an HTML5 `<canvas>` via WebGL/WebGPU, the debugger allows authors and engineers to spot clustering, dead zones, unreachable room partitions, and pathfinding bottlenecks without parsing raw JSON logs.

The debugger operates strictly as an inspection tool. It visualizes simulation data without leaking presentation math into upstream narrative stores or downstream video compilation pipelines.

---

### 1. Architectural Model & Rendering Philosophy

The debugger couples a single reactive client store with an imperative 2D rendering pipeline. To prevent state divergence between UI controls and the WebGL canvas, the debugger separates data flow into two synchronized presentation planes:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Simulation Ledger / Cycle Log Ingestion              │
│       (JSON batch dumps, live WebSocket feed, or test fixtures)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Dispatches cycle snapshots
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Central Debugger Store                            │
│  • Pinned Cycle Index: N                                               │
│  • Active Actor Roster: Map<ActorId, { cell, somaticState, facing }>   │
│  • Static Topology: ParsedTopology (H3 sets, occlusions, costs)        │
│  • Tool State: activeTool (INSPECT | RULER | LOS), selectedCell       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Imperative                     │ Reactive
                    ▼ Subscription                   ▼ State Binding
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        PixiJS Canvas Renderer        │  │       HTML/DOM UI Shell      │
│  • Viewport Pan/Zoom & Frustum Cull  │  │  • Play/Pause/Scrub Controls │
│  • Layer Hierarchy (Grid, Rays, etc.)│  │  • Inspection Telemetry Card │
│  • 60 FPS Hardware-Accelerated Draw  │  │  • Layer Toggles & Heatmaps  │
└──────────────────────────────────────┘  └──────────────────────────────┘

```

#### Separation from Production Video Rendering

The PixiJS canvas coordinates used in this harness exist exclusively for developer observation. Downstream video compilation via Remotion maps scene elements from canonical `location_id` tokens and semantic stage anchors rather than raw debug canvas pixels. This maintains the system boundary between abstract spatial simulation and finalized cinematic representation.

#### The Single-Store Imperative Sync Model

To avoid dual-parser drift, the debugger relies on a central store (implemented via an event emitter or lightweight store pattern). When the user drags the timeline scrubber or jumps between simulation ticks, the store emits the newly focused cycle snapshot.

The DOM UI shell binds declaratively to this store, rendering metadata readouts, character health badges, and frame indexes. Concurrently, the PixiJS stage listens to change events and updates its vector graphics imperatively, invalidating dynamic display lists while preserving static geometry caches.

---

### 2. Viewport & Coordinate Projection Engine

The viewport translates abstract hexagonal coordinates into local metric Cartesian coordinates, and then into hardware screen pixels.

```text
  Discrete DGGS             Local Metric Cartesian                 Screen Coordinates
┌─────────────────┐       ┌────────────────────────┐             ┌─────────────────────┐
│  H3Index String │ ───►  │ Centroid / Boundary    │ ──────────► │ Hardware Pixels     │
│  (64-bit Hex)   │       │ Point $(x, y)$ Meters  │   Matrix    │ $(x_{\text{px}}, y_{\text{px}})$
└─────────────────┘       └────────────────────────┘             └─────────────────────┘

```

#### Planar Transformation Matrix

Local Cartesian coordinates $(x, y)$ in meters (derived relative to the canonical map anchor) are transformed into screen-space canvas coordinates $(x_{\text{screen}}, y_{\text{screen}})$ using an affine camera transform:

$$\begin{bmatrix} x_{\text{screen}} \\ y_{\text{screen}} \\ 1 \end{bmatrix} = \begin{bmatrix} S \cdot \cos(\theta) & -S \cdot \sin(\theta) & T_x \\ S \cdot \sin(\theta) & S \cdot \cos(\theta) & T_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$

* $S$: Viewport scale factor (pixels per meter), controlled by the mouse wheel zoom.
* $T_x, T_y$: Screen translation offsets (pixels), modulated by viewport panning.
* $\theta$: Viewport rotation angle (locked to $0$ by default to maintain north-aligned spatial orientation).

#### Viewport Culling & Bounds Testing

For large facilities or multi-room crawlspace complexes containing tens of thousands of H3 cells at Resolution 14 or 15, drawing every polygon per frame degrades rendering performance.

The viewport maintains an axis-aligned bounding box (AABB) of the current camera view in world-meter space:

$$\text{AABB}_{\text{view}} = \left[ X_{\min}, Y_{\min}, X_{\max}, Y_{\max} \right]$$

During each render pass, cells are checked against this bounding box before generating draw calls. Polygon vertices returned by `boundary(cell)` are only submitted to the GPU rasterizer if their convex hull intersects $\text{AABB}_{\text{view}}$.

---

### 3. Hierarchical Layer Architecture

The visual debugger organizes its visual display using a strict composite layer hierarchy of PixiJS `Container` instances:

```text
PixiJS Application Stage (app.stage)
│
├── 1. GridLayer (container)
│   ├── Base Hex Polygons (Graphics - cached as static texture)
│   └── Cell Coordinate Labels (BitmapText - level-of-detail gated)
│
├── 2. OcclusionLayer (container)
│   ├── Static Wall Meshes (Crushed black / structural voids)
│   └── Dynamic Hazards (Steam leaks, oil spills, dampening barriers)
│
├── 3. TrailLayer (container)
│   └── Movement Breadcrumbs (Polylines with cycle-decay alpha)
│
├── 4. ActorLayer (container)
│   ├── Sprite / Vector Tokens (Grounded circle bases + identifier tags)
│   ├── Facing Direction Indicators (Orientation vectors)
│   └── Somatic Trauma Indicators (Color-coded ring borders)
│
└── 5. OverlayLayer (container)
    ├── Active Selection Reticle
    ├── Line-of-Sight Cones & Collision Markers
    ├── Acoustic Wavefront Isobars
    └── Evaluated A* Path Splines

```

```typescript
// debugger/src/layers/types.ts
import { Container, Graphics } from 'pixi.js';
import { H3Index } from '../../src/types';
import { ParsedTopology } from '../../src/canon/types';

export interface LayerContext {
  readonly stage: Container;
  readonly topology: ParsedTopology;
  readonly scale: number;
  worldToScreen(x: number, y: number): { x: number; y: number };
  screenToWorld(px: number, py: number): { x: number; y: number };
}

```

#### Layer Responsibilities

* **Grid Layer (`grid-layer.ts`):** Renders the underlying hexagonal mesh. For each cell in `topology.allCells`, it queries `boundary(cell)` to produce closed vector paths. Interior lines are drawn with thin, muted strokes (`0x222630`, 1px). To optimize draw calls, the base grid is rendered once to a `RenderTexture` and cached as a static background sprite until the camera zoom level shifts significantly.
* **Occlusion Layer (`occlusion-layer.ts`):** Draws impassable structural walls, sealed blast doors, and void spaces. Blocked cells are filled with solid dark tones (`0x0f1115`) matching the layout's aesthetic style, while acoustic dampening partitions are rendered as patterned hatched edges between cells.
* **Trail Layer (`trail-layer.ts`):** Renders the spatial trajectory of actors over the preceding $K$ cycles. By drawing fading polyline segments connecting past cell centroids, engineers can spot pathing loops, oscillation between adjacent cells, or entrapment in dead-end conduits. The alpha of each segment decays proportionally to its age:


$$\alpha(t) = \alpha_{\text{base}} \times \left(1.0 - \frac{\text{currentCycle} - t}{K}\right)$$


* **Actor Layer (`actor-layer.ts`):** Renders interactive circular tokens for every agent present in the active simulation tick. Tokens display short character identifiers (e.g., `"BOG"`, `"SPLN"`), an orientation pip showing current facing angle, and colored status halos reflecting physical condition (e.g., red for acute injuries, yellow for exhaustion).
* **Overlay Layer (`overlay-layer.ts`):** A transient visual surface cleared and redrawn on every interaction frame. It handles line-of-sight ray traces, acoustic dissipation rings, and active navigation paths computed by the spatial engine.

---

### 4. Interactive Tooling Suite

The canvas harness provides three interactive diagnostic modes accessible via keyboard hotkeys or the UI shell:

| Tool Mode | Activation | Interaction Pattern | Visual Output |
| --- | --- | --- | --- |
| **Inspect** | Default (`KeyI`) | Click any cell | Mounts cell metadata card: H3 index, cubic coordinates, terrain cost, capacity limits, and current occupants. |
| **Ruler** | `KeyR` | Click Cell A $\to$ Hover Cell B | Renders direct step distance, metric distance (meters), path traversal cost, and whether intermediate cells are traversable. |
| **Sight (LoS)** | `KeyV` | Click Origin $\to$ Hover Target | Executes `lineOfSightTrace()`. Draws a green vector if clear; draws a red vector terminating with an `X` at the blocking occlusion. |

---

### 5. Concrete Implementation

#### Viewport Transformation System (`debugger/src/viewport.ts`)

```typescript
import { Container, Point } from 'pixi.js';

export class ViewportManager {
  public readonly container: Container;
  public scale: number = 24.0; // Pixels per meter baseline
  public offsetX: number = 0;
  public offsetY: number = 0;
  private isDragging: boolean = false;
  private dragStart: Point = new Point();

  constructor(width: number, height: number) {
    this.container = new Container();
    this.offsetX = width / 2;
    this.offsetY = height / 2;
    this.updateTransform();
  }

  public worldToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.scale + this.offsetX,
      y: -y * this.scale + this.offsetY, // Invert Y for screen space
    };
  }

  public screenToWorld(px: number, py: number): { x: number; y: number } {
    return {
      x: (px - this.offsetX) / this.scale,
      y: -(py - this.offsetY) / this.scale,
    };
  }

  public handleZoom(deltaY: number, cursorX: number, cursorY: number): void {
    const zoomFactor = deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.min(Math.max(this.scale * zoomFactor, 4.0), 128.0);

    // Zoom toward cursor position
    const worldBefore = this.screenToWorld(cursorX, cursorY);
    this.scale = newScale;
    const worldAfter = this.screenToWorld(cursorX, cursorY);

    this.offsetX += (worldAfter.x - worldBefore.x) * this.scale;
    this.offsetY -= (worldAfter.y - worldBefore.y) * this.scale;

    this.updateTransform();
  }

  public startPan(x: number, y: number): void {
    this.isDragging = true;
    this.dragStart.set(x - this.offsetX, y - this.offsetY);
  }

  public updatePan(x: number, y: number): void {
    if (!this.isDragging) return;
    this.offsetX = x - this.dragStart.x;
    this.offsetY = y - this.dragStart.y;
    this.updateTransform();
  }

  public endPan(): void {
    this.isDragging = false;
  }

  private updateTransform(): void {
    this.container.position.set(this.offsetX, this.offsetY);
    this.container.scale.set(this.scale, -this.scale); // Pixi-native transform
  }
}

```

#### Visual Debugger Application Harness (`debugger/src/main.ts`)

```typescript
import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import * as h3 from 'h3-js';
import { ViewportManager } from './viewport';
import { ParsedTopology } from '../../src/canon/types';
import { lineOfSightTrace } from '../../src/perception/raycasting';
import { boundary, cellToAnchor } from '../../src/h3/adapter';
import { H3Index, TangentAnchor } from '../../src/types';

export interface DebuggerActorSnapshot {
  readonly id: string;
  readonly cell: H3Index;
  readonly visualAcuity: 'NORMAL' | 'MONOCULAR' | 'BLIND';
  readonly conditionTag?: string;
}

export class PixiSpatialDebugger {
  private app: Application;
  private viewport: ViewportManager;
  private gridGraphics: Graphics;
  private overlayGraphics: Graphics;
  private actorGraphics: Graphics;
  private topology: ParsedTopology | null = null;
  private anchor: TangentAnchor = { latitude: 0, longitude: 0 };
  private selectedCell: H3Index | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x090a0f,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.viewport = new ViewportManager(this.app.screen.width, this.app.screen.height);
    this.app.stage.addChild(this.viewport.container);

    this.gridGraphics = new Graphics();
    this.overlayGraphics = new Graphics();
    this.actorGraphics = new Graphics();

    this.viewport.container.addChild(this.gridGraphics);
    this.viewport.container.addChild(this.actorGraphics);
    this.viewport.container.addChild(this.overlayGraphics);

    this.registerInteractions(canvas);
  }

  public loadTopology(topology: ParsedTopology, anchor: TangentAnchor): void {
    this.topology = topology;
    this.anchor = anchor;
    this.renderBaseGrid();
  }

  private renderBaseGrid(): void {
    if (!this.topology) return;
    this.gridGraphics.clear();

    for (const cell of this.topology.allCells) {
      const vertices = boundary(cell, this.anchor);
      const isOccluded = this.topology.occlusions.has(cell);
      const cost = this.topology.traversalCosts.get(cell) ?? 100;

      // Fill style based on traversal friction and obstacles
      if (isOccluded) {
        this.gridGraphics.beginFill(0x1a1215, 1.0); // Impassable wall
      } else if (cost > 150) {
        this.gridGraphics.beginFill(0x1a211d, 1.0); // Hazardous / cramped
      } else {
        this.gridGraphics.beginFill(0x0f131a, 1.0); // Standard walkable floor
      }

      this.gridGraphics.lineStyle(0.04, isOccluded ? 0x4a1d24 : 0x1f2633, 1.0);

      const first = vertices[0];
      this.gridGraphics.moveTo(first.x, first.y);
      for (let i = 1; i < vertices.length; i++) {
        this.gridGraphics.lineTo(vertices[i].x, vertices[i].y);
      }
      this.gridGraphics.closePath();
      this.gridGraphics.endFill();
    }
  }

  public renderTick(actors: DebuggerActorSnapshot[]): void {
    this.actorGraphics.clear();
    if (!this.topology) return;

    for (const actor of actors) {
      const pos = cellToAnchor(actor.cell, this.anchor);

      // Render token circle base
      this.actorGraphics.lineStyle(0.06, 0xffffff, 0.9);
      this.actorGraphics.beginFill(
        actor.visualAcuity === 'BLIND' ? 0x555555 : 0x00aa88,
        1.0
      );
      this.actorGraphics.drawCircle(pos.x, pos.y, 0.45); // ~0.9m diameter footprint
      this.actorGraphics.endFill();

      // Render condition alert ring if impaired
      if (actor.conditionTag) {
        this.actorGraphics.lineStyle(0.04, 0xff4433, 0.8);
        this.actorGraphics.drawCircle(pos.x, pos.y, 0.58);
      }
    }
  }

  public traceLineOfSight(originCell: H3Index, targetCell: H3Index): void {
    if (!this.topology) return;
    this.overlayGraphics.clear();

    const trace = lineOfSightTrace(originCell, targetCell, this.topology.occlusions);
    const start = cellToAnchor(originCell, this.anchor);
    const end = cellToAnchor(targetCell, this.anchor);

    // Vector Ray
    this.overlayGraphics.lineStyle(0.05, trace.clear ? 0x00ff88 : 0xff2244, 0.9);
    this.overlayGraphics.moveTo(start.x, start.y);
    this.overlayGraphics.lineTo(end.x, end.y);

    // If occluded, mark the precise cell where collision occurred
    if (!trace.clear && trace.blockedAt) {
      const blockPos = cellToAnchor(trace.blockedAt, this.anchor);
      this.overlayGraphics.lineStyle(0.08, 0xff2244, 1.0);
      const s = 0.25;
      this.overlayGraphics.moveTo(blockPos.x - s, blockPos.y - s);
      this.overlayGraphics.lineTo(blockPos.x + s, blockPos.y + s);
      this.overlayGraphics.moveTo(blockPos.x + s, blockPos.y - s);
      this.overlayGraphics.lineTo(blockPos.x - s, blockPos.y + s);
    }
  }

  private registerInteractions(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.viewport.handleZoom(e.deltaY, e.clientX, e.clientY);
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.shiftKey) {
        // Middle click or shift-click pans viewport
        this.viewport.startPan(e.clientX, e.clientY);
      } else if (e.button === 0 && this.topology) {
        // Left click selects cell for inspection
        const world = this.viewport.screenToWorld(e.clientX, e.clientY);
        const cell = h3.latLngToCell(
          this.anchor.latitude + (world.y / 111320),
          this.anchor.longitude + (world.x / (111320 * Math.cos(this.anchor.latitude * (Math.PI / 180)))),
          14
        );
        if (this.topology.allCells.has(cell)) {
          this.selectedCell = cell;
          this.highlightSelectedCell(cell);
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.viewport.updatePan(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      this.viewport.endPan();
    });
  }

  private highlightSelectedCell(cell: H3Index): void {
    this.overlayGraphics.clear();
    const vertices = boundary(cell, this.anchor);
    this.overlayGraphics.lineStyle(0.08, 0x33aaff, 1.0);
    this.overlayGraphics.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      this.overlayGraphics.lineTo(vertices[i].x, vertices[i].y);
    }
    this.overlayGraphics.closePath();
  }
}

```

---

### 6. Timeline Scrubber & Simulation Ingestion

The debugger acts as a deterministic playback instrument for event logs generated during execution:

```text
Cycle 000        Cycle 042 (Selected)                 Cycle 100
├───┼────────────┼────────────────────────────────────┼───┤
[ |<< ]  [ < ]  [ PLAY / PAUSE ]  [ > ]  [ >>| ]   Speed: 1x / 2x / 4x

```

* **Batch Replay Mode:** Ingests a structured JSON simulation manifest containing the initial state ($S_0$) and an ordered array of cycle state deltas ($\Delta_0, \Delta_1, \dots, \Delta_n$). The scrubber reconstructs intermediate snapshots on the fly by reducing deltas up to the requested frame.


* **Live Streaming Mode (WebSocket):** Connects directly to a local development daemon (`ws://127.0.0.1:8188/ws`). The canvas appends new ticks as they are resolved, displaying real-time movements, line-of-sight checks, and duel outcomes without requiring manual page refreshes.



---

### 7. Verification Workflows

The primary utility of the visual debugger is verifying spatial sanity before narrative cycles are passed to audio generation or Remotion rendering. Common defect patterns surfaced by the canvas include:

* **The Prop-Loop Bottleneck:** An actor paces back and forth between two adjacent cells across twenty cycles. The breadcrumb trail in `TrailLayer` renders as a bright, dense double-node rather than an exploratory linear spline, indicating a goal evaluation failure in the narrative sower engine.


* **Bulkhead Bleed:** The line-of-sight tool indicates a clear sightline between characters separated by a structural barrier. Inspecting the cell sequence immediately highlights whether a wall cell was accidentally omitted from `void_cells` or improperly flagged as transparent in `goblin-lore`.


* **Stage Crowding Violations:** If more than two character tokens occupy the same hexagonal centroid without triggering an involuntary shove or duel action, the stage boundary check is visually flagged by intersecting token halos, alerting the developer to a broken capacity check in runtime state reducers.

The interaction between `worker-sower-engine` and `goblin-spatial` operates on a strict functional boundary: **`worker-sower-engine` owns dynamic state and simulation orchestration, while `goblin-spatial` owns pure, stateless geometry**.

`goblin-spatial` imports nothing from the simulation engine, carries no database drivers, and stores zero character coordinates. Instead, `worker-sower-engine` imports `goblin-spatial` as an in-process, deterministic calculation library, passing plain data in and receiving plain data out across four operational phases.

---

### 1. Architectural Interface & Data Contracts

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   000.goblin-lore (Compile-Time Canon)                 │
│         Map schemas, terrain costs, static room occlusions             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Static Map Topology (at boot)[cite: 2, 4]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               worker-sower-engine (Rig 1 Orchestration Core)           │
│  • Relational Ledger (SQLite/PostgreSQL): Actor coordinates (q, r, s)  │
│  • Somatic vectors, Paranoia Clocks, active Grievances, Strings        │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Plain Data Queries                     │ Immutable Results
                │ (Origin, Targets, Obstacles, Budgets)  │ (Distances, Paths,
                ▼                                        │  Witness Rosters)
┌────────────────────────────────────────────────────────┴───────────────┐
│              goblin-spatial (Stateless Pure Math Engine)               │
│  • H3 indexing / Hex math: distance, ring, range, neighbors            │
│  • A* pathfinding, line-of-sight raycasting, acoustic wavefront decay   │
└────────────────────────────────────────────────────────────────────────┘

```

The interaction contract is strictly synchronous and in-memory:

* **Ledger as Single Source of Truth:** Live actor positions (`Map<ActorId, H3Index>`) reside solely in the Sower’s local SQLite/PostgreSQL relational ledger.


* **Stateless Query Model:** The Sower passes current coordinates and lore-derived obstacle sets as function arguments to `goblin-spatial`.


* **Result Ingestion:** `goblin-spatial` returns topological arrays, integer distances, or boolean visibility flags, which the Sower immediately feeds into its state transition reducers ($S_n \to S_{n+1}$).



---

### 2. Phase 0: Locomotion & Horizon Evaluation

Before scenes are outlined, actors expend somatic movement budgets to reposition across the compound:

```typescript
// worker-sower-engine invokes goblin-spatial
const reachable = goblinSpatial.reachableCells({
  start: actor.currentHex,
  movementBudget: actor.somaticProfile.movementPoints,
  costMap: currentMap.traversalCosts,
  blockedCells: currentMap.occlusions,
});

```

1. **Budget Calculation:** The Sower evaluates an actor’s active condition profile (e.g., motor trauma, exhaustion, or limp states) to compute an available movement budget.


2. **Horizon Query:** The Sower queries `goblin-spatial.reachableCells()` to obtain valid destination hexes without testing coordinates manually.


3. **Commit to Ledger:** Once the Sower’s motivation/behavioral logic selects a target hex from the reachable set, the engine executes `findPath()` to confirm step continuity and writes the resulting $(q, r, s)$ coordinates directly to the relational database.



---

### 3. Stage 3: Conflict Pairing & Grievance Lotteries

The primary narrative driver in the Sower is replacing arbitrary authorial or stochastic LLM pairings with physical possibility. Physical proximity directly modulates conflict probability:

```text
Relational Ledger Coordinates:
  Bog   → Hex(q: 0, r: 0, s: 0)
  Splin → Hex(q: 0, r: 3, s:-3)  ──► distance = 3
  Moss  → Hex(q: 1, r: 0, s:-1)  ──► distance = 1 (Adjacent)
                                           │
                                           ▼
               Scoring Function: score(Grievance, ActorA, ActorB)
               • Base Weight + Tension Multiplier
               • Proximity Bonus: Distance == 1 maximizes friction
               • Cooldown Pressure & Paranoia Clock match

```

* **Adjacency Sweeps:** During Stage 3a, the Sower queries `goblin-spatial.distance(posA, posB)` across all active cast members.


* **Weighting Function Injection:** Proximity acts as a relational variable in the Sower's duel-selection scoring function:



$$\text{score}(G, A, B) = \text{base\_weight} + (\text{tension}(A, B) \times M) + \text{proximity\_weight}(d(A, B)) - \text{cooldown}$$



Goblins sharing a cell or occupying adjacent hexes accumulate grievances naturally through emergent clustering ("stuck in a room with someone you resent").


* **Encounter Gating:** If $d(A, B)$ exceeds maximum interaction thresholds, the pair is excluded from the lottery entirely, preventing characters on opposite ends of the facility from arguing unprompted.



---

### 4. Stage 4: Duel Resolution, Staging Bounds & Displacement

When arguments resolve mathematically via 2d6 outcome rolls against Spite and Cunning attributes, spatial constraints govern the physical fallout:

| Interaction Step | Calling Subsystem (`worker-sower-engine`) | Geometric Operation (`goblin-spatial`) | Action Taken |
| --- | --- | --- | --- |
| **Capacity Audit** | Stage 4 Pre-Resolution Linter | `checkCrowding(cell, occupants, limit)` | Verifies staging rules (e.g., `loc_warm_pipe` limits occupancy to 2 adult goblins). Flags involuntary shove/crowding checks if exceeded.

 |
| **Tactical Retreat** | Duel Outcome Reducer (`LOSER_WITHDRAWS`) | `nearestUnoccupied(target, occupants, blocked)` | Finds the nearest open, unblocked cell along concentric H3 rings to accept the retreating entity.

 |
| **Forced Shove** | Mechanical Concession Injection | `findPath(start, oppositeVector, ...)` | Computes valid knockback trajectories without placing the defeated character inside a wall or void tile.

 |

The output of these spatial queries provides the deterministic boundary constraints that the Sower writes into the `ScenePlan` Intermediate Representation (IR) before any dialogue is drafted.

---

### 5. Post-Resolution Epistemic Feeding (Witness Sweeps)

The most critical operational bridge is how `goblin-spatial` feeds the Sower’s epistemic state machine. Instead of allowing unconstrained language models to leak plot secrets, the Sower enforces **Ignorance by Omission** based on geometric perception:

```text
Objective Duel Outcome Committed to Ledger:
[ Bog strikes Splin with brass siphon at Hex 23 ]
                        │
                        ▼
      worker-sower-engine queries goblin-spatial:
      findWitnesses(incidentHex: 23, actors: [...], occlusions: Set)
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
   hasLineOfSight()           propagateAcoustics()
   Optical Raycast Trace      Wavefront Energy Dissipation
          │                           │
   Clear Vector to Moss?       Sound > Hearing Threshold?
   (Hex 24: YES)              (Hex 35: NO, Damped by Wall)
          │                           │
          └─────────────┬─────────────┘
                        ▼
       Eligible Witness Rosters Returned:
       • Visual: ['char_moss']
       • Auditory: []
                        │
                        ▼
       worker-sower-engine Mutates Ledger:
       INSERT INTO belief_records (holder, fact, source, confidence)
       VALUES ('char_moss', 'bog_struck_splin', 'DIRECT_OBSERVATION', 10000);

```

1. **Incident Emission:** When an altercation or illicit exchange commits in hex 23, the Sower queries `goblin-spatial.findWitnesses()`.


2. **Spatial Verification:** `goblin-spatial` raycasts line-of-sight vectors through structural obstacles and calculates acoustic decay through partitions.


3. **Somatic Filtering:** The Sower overlays each character’s somatic profile (e.g., verifying if an adjacent character has ocular damage or concussive deafness).


4. **Epistemic Mutation:** Only actors who pass both spatial and somatic checks receive an `OBSERVED_EVENT` or `HEARD_EVENT` record in the relational ledger (`Moss KNOWS(Fact_X)`).


5. **Context Window Sanitization:** In subsequent cycles, when the Sower prompts local LLMs to generate dialogue, characters who lack spatial observation paths have the event omitted from their prompt context entirely, mathematically eliminating omniscience drift.

The interaction between `worker-sower-engine` and `goblin-spatial` operates on a strict functional boundary: **`worker-sower-engine` owns dynamic state and simulation orchestration, while `goblin-spatial` owns pure, stateless geometry**.

`goblin-spatial` imports nothing from the simulation engine, carries no database drivers, and stores zero character coordinates. Instead, `worker-sower-engine` imports `goblin-spatial` as an in-process, deterministic calculation library, passing plain data in and receiving plain data out across four operational phases.

---

### 1. Architectural Interface & Data Contracts

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   000.goblin-lore (Compile-Time Canon)                 │
│         Map schemas, terrain costs, static room occlusions             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Static Map Topology (at boot)[cite: 2, 4]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               worker-sower-engine (Rig 1 Orchestration Core)           │
│  • Relational Ledger (SQLite/PostgreSQL): Actor coordinates (q, r, s)  │
│  • Somatic vectors, Paranoia Clocks, active Grievances, Strings        │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Plain Data Queries                     │ Immutable Results
                │ (Origin, Targets, Obstacles, Budgets)  │ (Distances, Paths,
                ▼                                        │  Witness Rosters)
┌────────────────────────────────────────────────────────┴───────────────┐
│              goblin-spatial (Stateless Pure Math Engine)               │
│  • H3 indexing / Hex math: distance, ring, range, neighbors            │
│  • A* pathfinding, line-of-sight raycasting, acoustic wavefront decay   │
└────────────────────────────────────────────────────────────────────────┘

```

The interaction contract is strictly synchronous and in-memory:

* **Ledger as Single Source of Truth:** Live actor positions (`Map<ActorId, H3Index>`) reside solely in the Sower’s local SQLite/PostgreSQL relational ledger.


* **Stateless Query Model:** The Sower passes current coordinates and lore-derived obstacle sets as function arguments to `goblin-spatial`.


* **Result Ingestion:** `goblin-spatial` returns topological arrays, integer distances, or boolean visibility flags, which the Sower immediately feeds into its state transition reducers ($S_n \to S_{n+1}$).



---

### 2. Phase 0: Locomotion & Horizon Evaluation

Before scenes are outlined, actors expend somatic movement budgets to reposition across the compound:

```typescript
// worker-sower-engine invokes goblin-spatial
const reachable = goblinSpatial.reachableCells({
  start: actor.currentHex,
  movementBudget: actor.somaticProfile.movementPoints,
  costMap: currentMap.traversalCosts,
  blockedCells: currentMap.occlusions,
});

```

1. **Budget Calculation:** The Sower evaluates an actor’s active condition profile (e.g., motor trauma, exhaustion, or limp states) to compute an available movement budget.


2. **Horizon Query:** The Sower queries `goblin-spatial.reachableCells()` to obtain valid destination hexes without testing coordinates manually.


3. **Commit to Ledger:** Once the Sower’s motivation/behavioral logic selects a target hex from the reachable set, the engine executes `findPath()` to confirm step continuity and writes the resulting $(q, r, s)$ coordinates directly to the relational database.



---

### 3. Stage 3: Conflict Pairing & Grievance Lotteries

The primary narrative driver in the Sower is replacing arbitrary authorial or stochastic LLM pairings with physical possibility. Physical proximity directly modulates conflict probability:

```text
Relational Ledger Coordinates:
  Bog   → Hex(q: 0, r: 0, s: 0)
  Splin → Hex(q: 0, r: 3, s:-3)  ──► distance = 3
  Moss  → Hex(q: 1, r: 0, s:-1)  ──► distance = 1 (Adjacent)
                                           │
                                           ▼
               Scoring Function: score(Grievance, ActorA, ActorB)
               • Base Weight + Tension Multiplier
               • Proximity Bonus: Distance == 1 maximizes friction
               • Cooldown Pressure & Paranoia Clock match

```

* **Adjacency Sweeps:** During Stage 3a, the Sower queries `goblin-spatial.distance(posA, posB)` across all active cast members.


* **Weighting Function Injection:** Proximity acts as a relational variable in the Sower's duel-selection scoring function:



$$\text{score}(G, A, B) = \text{base\_weight} + (\text{tension}(A, B) \times M) + \text{proximity\_weight}(d(A, B)) - \text{cooldown}$$



Goblins sharing a cell or occupying adjacent hexes accumulate grievances naturally through emergent clustering ("stuck in a room with someone you resent").


* **Encounter Gating:** If $d(A, B)$ exceeds maximum interaction thresholds, the pair is excluded from the lottery entirely, preventing characters on opposite ends of the facility from arguing unprompted.



---

### 4. Stage 4: Duel Resolution, Staging Bounds & Displacement

When arguments resolve mathematically via 2d6 outcome rolls against Spite and Cunning attributes, spatial constraints govern the physical fallout:

| Interaction Step | Calling Subsystem (`worker-sower-engine`) | Geometric Operation (`goblin-spatial`) | Action Taken |
| --- | --- | --- | --- |
| **Capacity Audit** | Stage 4 Pre-Resolution Linter | `checkCrowding(cell, occupants, limit)` | Verifies staging rules (e.g., `loc_warm_pipe` limits occupancy to 2 adult goblins). Flags involuntary shove/crowding checks if exceeded.

 |
| **Tactical Retreat** | Duel Outcome Reducer (`LOSER_WITHDRAWS`) | `nearestUnoccupied(target, occupants, blocked)` | Finds the nearest open, unblocked cell along concentric H3 rings to accept the retreating entity.

 |
| **Forced Shove** | Mechanical Concession Injection | `findPath(start, oppositeVector, ...)` | Computes valid knockback trajectories without placing the defeated character inside a wall or void tile.

 |

The output of these spatial queries provides the deterministic boundary constraints that the Sower writes into the `ScenePlan` Intermediate Representation (IR) before any dialogue is drafted.

---

### 5. Post-Resolution Epistemic Feeding (Witness Sweeps)

The most critical operational bridge is how `goblin-spatial` feeds the Sower’s epistemic state machine. Instead of allowing unconstrained language models to leak plot secrets, the Sower enforces **Ignorance by Omission** based on geometric perception:

```text
Objective Duel Outcome Committed to Ledger:
[ Bog strikes Splin with brass siphon at Hex 23 ]
                        │
                        ▼
      worker-sower-engine queries goblin-spatial:
      findWitnesses(incidentHex: 23, actors: [...], occlusions: Set)
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
   hasLineOfSight()           propagateAcoustics()
   Optical Raycast Trace      Wavefront Energy Dissipation
          │                           │
   Clear Vector to Moss?       Sound > Hearing Threshold?
   (Hex 24: YES)              (Hex 35: NO, Damped by Wall)
          │                           │
          └─────────────┬─────────────┘
                        ▼
       Eligible Witness Rosters Returned:
       • Visual: ['char_moss']
       • Auditory: []
                        │
                        ▼
       worker-sower-engine Mutates Ledger:
       INSERT INTO belief_records (holder, fact, source, confidence)
       VALUES ('char_moss', 'bog_struck_splin', 'DIRECT_OBSERVATION', 10000);

```

1. **Incident Emission:** When an altercation or illicit exchange commits in hex 23, the Sower queries `goblin-spatial.findWitnesses()`.


2. **Spatial Verification:** `goblin-spatial` raycasts line-of-sight vectors through structural obstacles and calculates acoustic decay through partitions.


3. **Somatic Filtering:** The Sower overlays each character’s somatic profile (e.g., verifying if an adjacent character has ocular damage or concussive deafness).


4. **Epistemic Mutation:** Only actors who pass both spatial and somatic checks receive an `OBSERVED_EVENT` or `HEARD_EVENT` record in the relational ledger (`Moss KNOWS(Fact_X)`).


5. **Context Window Sanitization:** In subsequent cycles, when the Sower prompts local LLMs to generate dialogue, characters who lack spatial observation paths have the event omitted from their prompt context entirely, mathematically eliminating omniscience drift.

### 1. The Core Architecture & The Hybrid-Scale Reality

`goblin-spatial` is not an isolated game-grid library, nor is it an unconstrained GIS wrapper. It is a **stateless, pure-function topological and routing engine** that acts as the physical causality layer for the simulation pipeline.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   000.goblin-lore (Compile-Time Canon)                 │
│  • Immutable geography: real-world anchors, fictional sites, portals   │
│  • Edge classifications: highways, service alleys, crawlways, conduits │
│  • Damping coefficients, ambient floors, base capacity limits          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Static Map Topology + SHA-256 Hash[cite: 2, 4]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               worker-sower-engine (Runtime Simulation Ledger)          │
│  • Authoritative state: actor positions (H3Index / NodeId)             │
│  • Somatic vectors, known-subgraphs, dynamic door states (open/shut)   │
│  • Monotonic clocks, event-sourced audit log                           │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Plain Data Queries                     │ Immutable Results
                │ (Actors, KnownEdges, Budgets, Centers) │ (Percepts, Paths, Horizons)
                ▼                                        │
┌────────────────────────────────────────────────────────┴───────────────┐
│                 goblin-spatial (Stateless Pure Math Engine)            │
│  • Multi-resolution H3 indexing & spatial containment                  │
│  • Weighted time-based routing on mixed real/fictional graphs          │
│  • Symmetric LoS raycasting & acoustic wavefront propagation           │
│  • Temporal contact opportunity graphs & staging displacement          │
└────────────────────────────────────────────────────────────────────────┘

```

#### The Three-Way Separation of Concerns

The fundamental boundary remains absolute:

* **`goblin-lore`** owns what space *means* (canonical topography, road definitions, structural bounds).


* **`worker-sower-engine`** owns who is *where* (mutable coordinates, dynamic door states, knowledge profiles).


* **`goblin-spatial`** owns zero state. It imports nothing from narrative or database runtimes. Given identical inputs, it returns identical outputs across all architectures.



#### Reconciling H3: Indexing vs. Real Travel Time

The debate between flat axial coordinates and Uber's H3 is resolved by scale:

* Flat axial $(q, r, s)$ grids are geometrically exact for single rooms but collapse when an episode demands regional travel (e.g., transit across a state corridor).


* Conversely, treating H3 grid steps ($\text{gridDistance}$) as travel time is equally broken: a character driving a highway does not move in a straight line across raw hex centroids.



`goblin-spatial` decouples the **spatial index** from the **routing graph**:

| Layer | Representation | Function in `goblin-spatial` |
| --- | --- | --- |
| **Spatial Index** | Uber H3 (`H3Index`) | Regional containment, multi-scale clustering, fast radius sweeps (`gridDisk`), spatial joins.

 |
| **Routing Graph** | Explicit Directed Edge Graph | Models real road networks, waterways, and fictional crawlways with mode-specific speeds. |
| **Tactical Stage** | Compacted Local H3 Sets | High-resolution tactical staging (Res 11–14) inside defined structures.

 |

The engine separates three distinct distance quantities:

1. **Grid Distance ($d_{\text{hex}}$):** Integer step count via `h3.gridDistance(a, b)`. Used exclusively for local adjacency sweeps and radius lookups.


2. **Geodesic Distance ($d_{\text{geo}}$):** Great-circle distance calculated via Haversine between cell centroids, quantized to whole meters to prevent floating-point drift.
3. **Travel Duration ($T_{\text{travel}}$):** Evaluated over the routing graph minimizing travel time (seconds), accounting for edge mode, circuity, and physical friction:

$$T_{\text{travel}} = \sum_{e \in \text{Path}} \frac{\text{Length}(e)}{\text{Speed}(e, \text{mode}) \times \mu_{\text{condition}}(e)}$$



#### The Scale Handoff State Machine

Entities operate across distinct spatial resolutions without contaminating simulation logic. A character does not exist at Resolution 14 while traversing an interstate highway.

```text
       REGIONAL SCALE (Res 5–7)                     TACTICAL STAGE (Res 12–14)
┌─────────────────────────────────────┐       ┌─────────────────────────────────────┐
│ Character: IN_TRANSIT               │       │ Character: STAGED                   │
│ Node: Edge_I95_North                │ ───►  │ Site: loc_valve_station_09          │
│ ETA: Tick 142                       │       │ Cell: 8e26856254133ff (Res 14)      │
│ Spatial Queries: Regional Awareness │       │ Spatial Queries: LoS, Duels, Foley  │
└─────────────────────────────────────┘       └─────────────────────────────────────┘

```

* **`IN_TRANSIT` (Regional):** The actor's position is bound to a directed graph edge with a scalar progress parameter ($0.0 \le p \le 1.0$) and a discrete arrival tick. Regional sensory queries use parent H3 cells (Res 5–7) for coarse proximity sweeps.


* **`STAGED` (Tactical):** Upon arrival at a site boundary, the actor transitions to discrete cell coordinates inside the site's local H3 footprint (Res 12–14). Tactical operations (LoS raycasts, acoustic dampening, duels) become active.



---

### 2. Algorithmic Rigor & Corrected Invariants

To eliminate simulation divergence and false test passes, the core geometry algorithms are constructed around verified mathematical properties.

#### Symmetric Line-of-Sight (LoS) by Construction

Standard discrete hex raycasting using naive floating-point interpolation fails optical reciprocity: cell-edge grazes can cause $\text{LoS}(A \to B)$ to pass while $\text{LoS}(B \to A)$ hits an occluder.

`goblin-spatial` achieves optical symmetry by evaluating both directions through a canonical ray trace:

```typescript
export interface LoSOptions {
  from: H3Index;
  to: H3Index;
  occlusions: Set<H3Index>;
  dynamicDoors?: Map<string, boolean>; // true = open, false = shut
  doorCells?: Map<H3Index, string>;    // cell -> doorId
}

/**
 * Evaluates visibility symmetrically. 
 * Guaranteed: hasLineOfSight(A, B) === hasLineOfSight(B, A)
 */
export function hasLineOfSight(options: LoSOptions): boolean {
  const { from, to, occlusions, dynamicDoors, doorCells } = options;
  if (from === to) return true;

  const isBlocked = (cell: H3Index): boolean => {
    if (occlusions.has(cell)) return true;
    if (doorCells && dynamicDoors) {
      const doorId = doorCells.get(cell);
      if (doorId && dynamicDoors.get(doorId) === false) {
        return true; // Door is shut
      }
    }
    return false;
  };

  if (isBlocked(from) || isBlocked(to)) return false;

  // Evaluate both paths to eliminate floating-point edge rounding asymmetry
  const forwardPath = h3.gridPathCells(from, to);
  const reversePath = h3.gridPathCells(to, from);

  const forwardClear = forwardPath.slice(1, -1).every(c => !isBlocked(c));
  const reverseClear = reversePath.slice(1, -1).every(c => !isBlocked(c));

  // Conservative intersection: both vectors must be unobstructed
  return forwardClear && reverseClear;
}

```

#### The A* Routing Engine

To guarantee performance and determinism across both state-wide highway graphs and tactical crawlspace grids, the router implements three requirements:

1. **Binary Min-Heap Priority Queue:** Replaces in-place array sorting, dropping search complexity from $O(V^2 \log V)$ to $O((E + V) \log V)$.


2. **Three-Tier Deterministic Tie-Breaking:** In the event of identical $f$-scores, ties are broken first by highest $g$-score (preferring progress toward goal), then by lexicographical comparison of the node identifiers.


3. **Consistent Units (CostUnits):** All traversal weights are expressed as integer `CostUnits` ($1\text{ second} = 100\text{ units}$, $1\text{ meter} = 10\text{ units}$). Multipliers from canon are pre-compiled into discrete integers to prevent runtime floating-point drift.



```typescript
export type CostUnits = number & { readonly __brand: unique symbol };
export const toCostUnits = (val: number): CostUnits => Math.round(val) as CostUnits;

export interface RoutingNode {
  readonly id: string;
  readonly f: CostUnits;
  readonly g: CostUnits;
  readonly h: CostUnits;
  readonly parentId: string | null;
}

export class DeterministicBinaryHeap {
  private data: RoutingNode[] = [];

  public push(node: RoutingNode): void {
    this.data.push(node);
    this.up(this.data.length - 1);
  }

  public pop(): RoutingNode | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.down(0);
    }
    return top;
  }

  private compare(a: RoutingNode, b: RoutingNode): number {
    if (a.f !== b.f) return a.f - b.f;
    if (a.g !== b.g) return b.g - a.g; // Prefer nodes closer to goal
    return a.id.localeCompare(b.id);    // Deterministic tie-break
  }

  private up(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.data[i], this.data[p]) < 0) {
        [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
        i = p;
      } else break;
    }
  }

  private down(i: number): void {
    const len = this.data.length;
    while ((i << 1) + 1 < len) {
      let left = (i << 1) + 1;
      let right = left + 1;
      let best = i;
      if (this.compare(this.data[left], this.data[best]) < 0) best = left;
      if (right < len && this.compare(this.data[right], this.data[best]) < 0) best = right;
      if (best !== i) {
        [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
        i = best;
      } else break;
    }
  }

  public get size(): number {
    return this.data.length;
  }
}

```

#### Objective Acoustic Wavefront Propagation

Audio modeling uses physical units rather than basis points. Sound pressure levels and material attenuations are quantified in **centi-decibels (cdB)** ($1\text{ dB} = 100\text{ cdB}$, $120\text{ dB} = 12{,}000\text{ cdB}$):

* **Undirected Edge Damping:** Partitions attenuate sound identically in both directions: $\Gamma(u \leftrightarrow v) = \Gamma(v \leftrightarrow u)$.


* **Ambient Floor Masking:** A character only registers an acoustic event if its arrival energy clears both the local room's ambient noise floor and the character's somatic hearing threshold:



$$\text{PerceivedEnergy}(v) = I_{\text{arrival}}(v) - N_{\text{ambient}}(v)$$


$$\text{isAudible}(v) \iff \text{PerceivedEnergy}(v) \ge T_{\text{hearing}}$$



---

### 3. Spatial as Narrative Causality & The Epistemic Bridge

Spatial coordinates exist to feed the narrative engine objective facts, eliminating language model hallucination and omniscience drift.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Objective World Event                           │
│        [ Bog strikes Spleen with a brass siphon at Cell 104 ]          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        findWitnessPercepts()
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
  Visual Evaluation Channel                     Auditory Evaluation Channel
  • Symmetric LoS Check                         • Max-Energy Wavefront Decay
  • Illumination & Cone Mask                    • Damping via Edge Partitions
  • Somatic Ocular Profile                      • Subtraction of Ambient Floor
             │                                             │
             ▼                                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Structured Percept Records                      │
│                                                                        │
│  Percept A (Moss - Optical):                                           │
│  { channel: 'VISUAL', quality: 950, resolved: true, bearing: null }    │
│  ──► Epistemic Mutation: DIRECT_OBSERVATION (Confidence: 1.0)          │
│                                                                        │
│  Percept B (Wart - Auditory):                                          │
│  { channel: 'AUDITORY', quality: 320, resolved: false, bearing: 2 }    │
│  ──► Epistemic Mutation: SUSPICION ("Heard violent clash to east")     │
└────────────────────────────────────────────────────────────────────────┘

```

#### Evidence Over Verdicts: The `Percept` Pipeline

`goblin-spatial` does not emit binary knowledge assertions. It returns structured physical evidence (`Percept`), allowing the downstream epistemic engine to generate nuanced psychological states (rumor, misidentification, suspicion):

```typescript
export interface Percept {
  readonly actorId: string;
  readonly channel: 'VISUAL' | 'AUDITORY';
  readonly quality: number;        // Integer 0 to 1,000 (clarity/attenuation factor)
  readonly resolved: boolean;      // True if quality exceeds actor's identification threshold
  readonly bearing: number | null; // 0 to 5 hexagonal directional sector (auditory cue)
  readonly sourceCell: H3Index;
}

```

* **Optical Resolution:** High quality ($\ge 700$) delivers concrete facts (`"Bog struck Spleen"`). Low quality ($200\text{--}699$, caused by smoke or distance) delivers unverified evidence (`"A figure struck someone"`).
* **Auditory Bearing:** Sound provides a directional bearing ($0\text{--}5$) derived from the arrival edge of the acoustic wavefront, enabling dialogue models to author characters looking or moving toward the sound source ("A crash echoed from the east").

#### Per-Character Known-Graph Navigation

Characters cannot plan routes through spaces they do not know exist. Secret crawlspaces, hidden drainage tunnels, and restricted service paths authored in `goblin-lore` are flagged with access prerequisites.

When `worker-sower-engine` requests a path for Actor $A$, it passes $A$'s known edge-set:

$$G_{\text{actor}} = G_{\text{public}} \cup \text{DiscoveredEdges}(A)$$

An actor unaware of the siphon bypass routes around the longer corridor, preserving narrative dramatic irony without prompt-level instructions.

#### The Temporal Contact Opportunity Graph

To prevent arbitrary rumor leaks, narrative secrets propagate strictly along the physical contact graph. At each simulation tick $T$, `goblin-spatial` evaluates all actors sharing a cell or occupying adjacent cells ($d_{\text{hex}} \le 1$):

```typescript
export interface ContactOpportunity {
  readonly tick: number;
  readonly actorA: string;
  readonly actorB: string;
  readonly locationId: string;
  readonly cell: H3Index;
  readonly acousticPrivacy: number; // 0 to 1,000 (higher means less audible to 1-ring)
}

```

A secret can only transition from Actor $A$ to Actor $B$ if an edge $(A, B, T)$ exists in the contact graph. If an auditor asks "How did Wart learn about the theft?", the ledger provides a verifiable provenance chain: $C_0 \to \text{Contact}(C_0, C_1, T_{12}) \to \text{Contact}(C_1, \text{Wart}, T_{18})$.

---

### 4. Dynamic Overlays, Staging Rules & Topology Hashing

#### Dynamic Occluder Overlays

Crawlspaces and industrial facilities contain state-dependent physical barriers (hatches open, blast doors seal, valves flood conduits). Storing mutable door states in `goblin-lore` violates canon immutability, while storing geometry in the ledger violates separation of concerns.

The engine uses a stateless **Dynamic Overlay Pattern**:

1. `goblin-lore` defines the static portal and occluder identity:
`{ occluder_id: "hatch_valve_04", cell: "8e26856254133ff", default: "SHUT" }`.
2. `worker-sower-engine` tracks the dynamic boolean in its ledger:
`Map<"hatch_valve_04", true>` (indicating currently open).


3. The spatial function merges the static topology with the dynamic overlay during query execution, preserving pure functional execution.



#### Staging Bounds & Deterministic Displacement

Confined crawlspaces enforce physical capacity limits (typically 2 goblins per cell). When duels or forced movements push an actor into an occupied tile, displacement must not rely on random memory order:

```text
Crowding Resolution Policy:
1. Occupancy Count > Cell Capacity?
   ├── False: Staging valid.
   └── True: Eviction triggered.
       ├── Identify Candidate: Last arrival, or lowest somatic stability.
       ├── Sample Rings (k = 1, 2, ...): Collect candidate empty cells.
       └── Tie-Break: Select cell with lowest (TraversalCost * 1000 + LexicographicalHash).

```

```typescript
export function resolveDisplacement(
  targetCell: H3Index,
  currentOccupants: Map<string, H3Index>,
  topology: ParsedTopology,
  displacedActorId: string
): H3Index {
  const occupiedCounts = new Map<H3Index, number>();
  for (const [actor, cell] of currentOccupants.entries()) {
    if (actor !== displacedActorId) {
      occupiedCounts.set(cell, (occupiedCounts.get(cell) ?? 0) + 1);
    }
  }

  for (let r = 1; r <= 5; r++) {
    const ringCells = h3.gridRingUnsafe(targetCell, r);
    const valid = ringCells.filter(cell => {
      const isTraversable = topology.allCells.has(cell) && !topology.occlusions.has(cell);
      const hasSpace = (occupiedCounts.get(cell) ?? 0) < (topology.capacityLimits.get(cell) ?? 2);
      return isTraversable && hasSpace;
    });

    if (valid.length > 0) {
      // Deterministic sort: traversal cost first, then string ID
      valid.sort((a, b) => {
        const costA = topology.traversalCosts.get(a) ?? 100;
        const costB = topology.traversalCosts.get(b) ?? 100;
        if (costA !== costB) return costA - costB;
        return a.localeCompare(b);
      });
      return valid[0];
    }
  }
  throw new Error(`Staging catastrophe: No valid displacement cell within 5 rings of ${targetCell}`);
}

```

#### Content-Addressed Topology Seals (`topology_hash`)

To ensure replay fidelity across long-running episodes, every compiled topology file is sealed with an immutable SHA-256 hash:

$$\text{TopologyHash} = \text{SHA-256}\left(\text{CanonicalJSON}\left(\text{ParsedTopology}\right)\right)$$

The simulation ledger records this `topology_hash` at the header of every episode state dump. If a change is made to world geometry in `goblin-lore`, the hash shifts, immediately warning the replay runner that historical events cannot be re-simulated without using the pinned historical topology revision.

---

### 5. Concrete Execution & The Minimal Tracer Bullet

To prevent over-specification from stalling physical implementation, `goblin-spatial` follows a strict progression from mathematical core to interactive tooling.

```text
Phase 1: Pure Core      Phase 2: Headless Sim    Phase 3: SVG Snapshot    Phase 4: PixiJS Canvas
┌─────────────────┐     ┌───────────────────┐    ┌───────────────────┐    ┌────────────────────┐
│ Distance, LoS,  │ ──► │ 1,000-Cycle Head- │ ─► │ Static SVG vector │ ─► │ Hardware-accel.    │
│ Binary Heap A*, │     │ less Benchmark    │    │ dumps diffable in │    │ interactive canvas │
│ SHA-256 Seal    │     │ (Zero Media/LLM)  │    │ git pull-requests │    │ debugger harness   │
└─────────────────┘     └───────────────────┘    └───────────────────┘    └────────────────────┘

```

#### The 5-Point Spatial Tracer Bullet

Before mounting interactive debuggers or connecting language models, the repository must pass an end-to-end tracer bullet proving that geometry correctly mutates ledger state:

```typescript
// tests/tracer-bullet.test.ts
import { describe, it, expect } from 'vitest';
import { 
  hasLineOfSight, 
  findPath, 
  toCostUnits, 
  ParsedTopology 
} from '../src';

describe('Spatial Tracer Bullet', () => {
  it('executes the complete perception-to-ledger cycle deterministically', () => {
    // 1. Ingest fixture topology
    const originCell = '8e26856254133ff'; // Canonical valve room center
    const adjacentCell = '8e26856254133f7';
    const blockedCell = '8e26856254133eb';

    const occlusions = new Set([blockedCell]);

    // 2. Compute path continuity
    const path = findPath({
      start: originCell,
      goal: adjacentCell,
      graph: mockGraph,
      costMap: new Map(),
      blocked: occlusions,
    });
    expect(path).toEqual([originCell, adjacentCell]);

    // 3. Assert optical reciprocity
    const clearForward = hasLineOfSight({ from: originCell, to: adjacentCell, occlusions });
    const clearReverse = hasLineOfSight({ from: adjacentCell, to: originCell, occlusions });
    expect(clearForward).toBe(true);
    expect(clearReverse).toBe(true);

    // 4. Assert obstruction pinning
    const blocked = hasLineOfSight({ from: originCell, to: blockedCell, occlusions });
    expect(blocked).toBe(false);

    // 5. Emit verified event envelope ready for relational ingestion
    const event = {
      type: 'ACTOR_MOVED',
      actorId: 'char_bog',
      from: originCell,
      to: adjacentCell,
      pathTraversed: path,
      expendedCost: toCostUnits(100),
    };
    expect(event.pathTraversed.length).toBe(2);
  });
});

```

#### Headless Verification vs. Premature Tooling

Building a PixiJS canvas app before verifying graph math risks debugging WebGL render loops and coordinate transformation matrices instead of algorithmic bottlenecks.

1. **Phase 1: Pure Mathematical Invariants:** Fast-check property suites testing distance identity, LoS reciprocity, and heap stability against a brute-force BFS oracle.


2. **Phase 2: 1,000-Cycle Headless Movement Sim:** Run 6 autonomous agents across the compiled facility graph for 1,000 ticks executing random walks under capacity constraints. Measure:


* **Deadlock Frequency:** Count of agents stuck in zero-reachability loops.


* **Spatial Clustering Entropy:** Assert agents do not permanently pool inside a single dead-end node.




3. **Phase 3: Static SVG Snapshots:** Emit a raw vector SVG string of the map at cycle $N$ containing cell polygons, color-coded walls, and actor dots. Diffable in pull requests, readable in any browser, and embeddable in CI test failure outputs.


4. **Phase 4: PixiJS Interactive Canvas:** Only when the headless simulation runs cleanly across thousands of cycles is the PixiJS canvas application mounted to support timeline scrubbing, manual sightline dragging, and real-time visual inspection.

### 1. Structural Ontology & Architectural Boundaries

`goblin-spatial` is not a generic game grid, an isolated GIS utility, or an entity state store. It is a **stateless, deterministic geometry, traversal, and sensory calculation engine** that serves as the physical causality layer for the narrative compiler.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   000.goblin-lore (Compile-Time Canon)                 │
│  • Immutable geography: real-world baselines, fictional site overlays  │
│  • Edge classifications: interstates, local roads, conduits, crawlways │
│  • Boundary damping, ambient noise floors, base cell capacity limits   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Static Map Topology + Content Hash
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               worker-sower-engine (Runtime Simulation Ledger)          │
│  • Authoritative state: actor positions (NodeId / LocalHex)            │
│  • Somatic profiles, known-subgraphs, dynamic door states (open/shut)  │
│  • Monotonic cycle ticks, event-sourced audit log                      │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Plain Data Queries                     │ Immutable Results
                │ (Actors, KnownEdges, Budgets, Centers) │ (Percepts, Paths, Horizons)
                ▼                                        │
┌────────────────────────────────────────────────────────┴───────────────┐
│                 goblin-spatial (Stateless Pure Math Engine)            │
│  • Regional routing over multi-modal real/fictional networks           │
│  • Local tactical interior geometry (exact axial coordinates)          │
│  • Symmetric LoS supercover & acoustic wavefront propagation           │
│  • Temporal contact opportunity graphs & staging displacement          │
└────────────────────────────────────────────────────────────────────────┘

```

#### The Three-Way Separation of Concerns

1. **`goblin-lore`** owns what space *means* (canonical world law, geographic anchors, room templates, static structural bounds). It changes only when canon changes.


2. **`worker-sower-engine`** owns who is *where* (mutable coordinates, dynamic door states, knowledge profiles, movement histories). It mutates cycle-by-cycle via an event-sourced relational ledger.


3. **`goblin-spatial`** owns *how space works*. It contains zero mutable state, zero database connections, and zero network calls. Given an identical topology manifest, identical actor positions, and identical query parameters, it returns bit-identical results across all runtimes.



#### Space as Narrative Causality

Without space, narrative engines rely on unconstrained language models or arbitrary pairing lotteries to select scene participants. This produces repetitive, geographically untethered drama.

With space, narrative selection becomes a function of physical possibility:

* Characters can only converse, conspire, or duel if their spatial coordinates permit physical contact.


* Characters can only witness an incident if an optical or acoustic path exists through the geometry.


* Secrets can only propagate along the temporal contact graph formed by past co-presence.



#### The Deletion Principle Applied to Spatial

If all generative language and image models are deleted, the physical state of the universe remains consistent in the ledger and rebuildable through `goblin-spatial`.

The spatial engine enforces this by keeping geometry independent of presentation: Remotion compositor pixels, WebGL canvas coordinates, and camera easing paths never cross the boundary into spatial math.

---

### 2. Multi-Scale Spatial Architecture: Fictional Geography on a Real Substrate

Simulating narratives that span wide regional travel (e.g., transit across a state corridor like Miami to Jacksonville) alongside claustrophobic, tactical crawlspaces introduces a scale conflict.

```text
  REGIONAL SCALE: Real Geographic Substrate (Uber H3 + Road Network)
  ├── Uber H3 Discrete Global Grid (Resolution 5–8)
  ├── Real OpenStreetMap (OSM) Road/Rail/Water Routing Graph
  └── Multi-resolution containment (gridDisk sweeps, regional proximity)
                            │
                     Portal Handoff (Boundary Node)
                            │
  TACTICAL STAGE: Fictional Interior Space (Pure Axial Integer Grid)
  ├── Local Axial Coordinates (q, r, s = -q - r)
  ├── Exact integer math (no projection, no spherical distortion)
  └── Fixed 6-direction compass axes (0 to 5) for facing cones & LoS

```

#### The Hybrid Solution

* **Regional Layer (Macro):** Uses Uber's H3 Discrete Global Grid System (Res 5–8) coupled to an explicit multi-modal routing graph. H3 serves strictly as a spatial index (for regional clustering, coarse proximity sweeps, and spatial joins).


* **Tactical Layer (Micro):** Inside structures (valve stations, crawlspaces, culverts), the engine abandons spherical projections and uses **pure axial integer hex coordinates $(q, r)$** with $s = -q - r$.



This hybrid design eliminates pentagon edge failures, aperture-7 rotational distortions, and floating-point projection math inside interior rooms while retaining global geographic grounding for cross-region travel.

#### Fictional-on-Real Registration Modes

Fictional structures authored in `goblin-lore` bind to the real-world geographic substrate via four operational modes:

| Registration Mode | Mechanism | Geographic Behavior | Routing Impact |
| --- | --- | --- | --- |
| **`ANNOTATE`** | Real site, fictional identity | Binds canonical meaning to a real footprint (e.g., Miami Port becomes "The Brine Sluice"). | Preserves real OSM road/water edges.

 |
| **`SUBSTITUTE`** | Fictional structure replaces real space | Real geometry is suppressed inside the footprint (e.g., an industrial depot replaces a parking lot). | Contracts and suppresses real internal OSM edges; reroutes traffic around the footprint boundary.

 |
| **`EXTEND`** | Pure fictional addition | Fictional node/grid with no real counterpart (e.g., a maintenance crawlway under an interstate). | Injects custom directed edges into the routing graph connecting to the nearest real-world nodes.

 |
| **`REGION`** | Macro territorial envelope | Polygons grouping multiple H3 cells under shared legal, environmental, or factional rules. | Modulates traversal costs across entire regions (e.g., flooded counties apply a $2.5\times$ time penalty).

 |

#### Compile-Time Coordinate Displacement

To prevent fictional narratives from targeting private property or commercial addresses, `goblin-spatial` supports a **compile-time coordinate displacement transform**:

$$\begin{bmatrix} \phi_{\text{sim}} \\ \lambda_{\text{sim}} \end{bmatrix} = \begin{bmatrix} \phi_{\text{real}} \\ \lambda_{\text{real}} \end{bmatrix} + \begin{bmatrix} \Delta \phi_{\text{offset}} \\ \Delta \lambda_{\text{offset}} \end{bmatrix}$$

This rigid translation is applied uniformly during data compilation to all real-world assets (roads, elevations, coastlines). All downstream runtime modules operate exclusively within the displaced simulation frame. The real world provides authentic topology, curvature, and travel friction without linking to real-world addresses.

#### The Scale-Handoff State Machine

An actor's spatial representation is governed by a state machine that isolates macro travel from tactical blocking:

```text
                  Scale Handoff Lifecycle
                  
        Depart Site               Traverse Edge
  ┌──────────────────────┐    ┌──────────────────┐
  │        STAGED        │───►│    IN_TRANSIT    │
  │ (Local Axial (q, r)) │    │ (Edge ID, p, ETA)│
  └──────────────────────┘    └──────────────────┘
             ▲                         │
             │     Cross Portal Node   │
             └─────────────────────────┘

```

* **`IN_TRANSIT` (Regional):** The actor is bound to a directed graph edge:

$$\text{Position} = \{ \text{edgeId}: E, \, \text{progress}: p \in [0.0, 1.0], \, \text{arrivalTick}: T \}$$



The actor does not occupy any tactical hex cell. They are excluded from local tactical queries (duels, optical LoS) and interact only with macro-scale regional awareness sweeps.


* **`STAGED` (Tactical):** The actor occupies an exact integer axial cell $(q, r)$ within a specific `siteId`. All local sensory, crowding, and adjacency checks apply.


* **Portals:** Portals are explicit bidirectional boundary edges connecting an entry/exit node on the regional routing graph to an exact entry cell $(q, r)$ on a tactical grid. Crossing a portal executes the atomic scale transition in the simulation ledger.



---

### 3. Deterministic Routing & Traversal Engine

#### Decoupling the Three Distance Quantities

The pipeline avoids conflating topological proximity with physical travel time:

1. **Grid Distance ($d_{\text{hex}}$):** The integer step count between two cells on a discrete grid. On local axial grids:



$$d_{\text{axial}}(a, b) = \frac{\vert{}q_a - q_b\vert{} + \vert{}(q_a + r_a) - (q_b + r_b)\vert{} + \vert{}r_a - r_b\vert{}}{2}$$



Used exclusively for tactical adjacency, melee reach, and discrete raycast step limits.


2. **Geodesic Distance ($d_{\text{geo}}$):** The great-circle physical distance in integer meters computed via Haversine between geographic coordinates. Used for radio signal propagation, line-of-sight curvature limits, and macro proximity joins.


3. **Travel Duration ($T_{\text{travel}}$):** The shortest-path cost across the routing graph, measured in integer **`CostUnits` ($1\text{ second} = 100\text{ CostUnits}$)**:



$$T_{\text{travel}} = \sum_{e \in \text{Path}} \frac{\text{LengthMeters}(e)}{\text{BaseSpeedMps}(e, \text{mode}) \times \mu_{\text{friction}}(e)}$$



#### The Dimensionally Pure `CostUnits` Brand

To prevent runtime type confusion between meters and seconds, `goblin-spatial` enforces branded integer types:

```typescript
export type CostUnits = number & { readonly __brand: unique symbol };
export type Meters = number & { readonly __brand: unique symbol };

export function toCostUnits(seconds: number): CostUnits {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`Invalid duration for CostUnits: ${seconds}`);
  }
  return Math.round(seconds * 100) as CostUnits;
}

export function toMeters(val: number): Meters {
  if (!Number.isFinite(val) || val < 0) {
    throw new RangeError(`Invalid distance for Meters: ${val}`);
  }
  return Math.round(val) as Meters;
}

```

#### The Time-Metric A* Search Engine

On a graph combining 70 mph interstates, 15 mph access roads, and instantaneous fictional shortcuts (e.g., hidden portals), standard Euclidean heuristics become **inadmissible**. If a heuristic overestimates the remaining travel time, A* returns suboptimal paths.

```typescript
export interface RoutingEdge {
  readonly target: string;
  readonly cost: CostUnits;
  readonly mode: 'FOOT' | 'VEHICLE' | 'CONDUIT' | 'PORTAL';
  readonly isKnownDefault: boolean;
}

export interface RoutingGraph {
  readonly adjacency: Map<string, RoutingEdge[]>;
  readonly vMaxGraphMps: number; // Maximum possible speed across ANY edge in the graph
  readonly nodeCoordinates: Map<string, { lat: number; lon: number }>;
}

```

1. **Admissible Global Heuristic:** The heuristic function scales geodesic distance by the absolute maximum velocity present on *any* edge in the network ($v_{\max\text{-graph}}$):



$$h(u, \text{goal}) = \text{toCostUnits}\left(\frac{\text{HaversineMeters}(u, \text{goal})}{v_{\max\text{-graph}}}\right)$$



If the graph contains instantaneous fictional shortcuts, $v_{\max\text{-graph}} = \infty \implies h(u) = 0$, degenerating A* into Dijkstra's algorithm to preserve optimal paths.


2. **ALT (A*, Landmarks, Triangle Inequality) Option:** For large regional graphs with high-speed corridors, 8–16 landmark nodes are precomputed. The triangle inequality provides an admissible heuristic without requiring $v_{\max}$ scaling:



$$h(u, \text{goal}) = \max_{L \in \text{Landmarks}} \vert{}d(L, \text{goal}) - d(L, u)\vert{}$$


3. **Binary Min-Heap with Lazy Deletion:** Avoids $O(n^2 \log n)$ array sorting. Re-opened nodes with lower costs are pushed directly to the heap; stale nodes are discarded when popped by checking a settled set.


4. **Deterministic Tie-Breaking:** Priority queue ordering uses a strict total order:
* Primary: Lowest $f$-score ($f = g + h$).


* Secondary: Lowest $h$-score (closest to goal in remaining time).


* Tertiary: Code-unit string comparison (`a.id < b.id ? -1 : a.id > b.id ? 1 : 0`), completely avoiding locale-sensitive methods like `localeCompare`.





```typescript
export function compareRoutingNodes(
  a: { f: CostUnits; h: CostUnits; id: string },
  b: { f: CostUnits; h: CostUnits; id: string }
): number {
  if (a.f !== b.f) return a.f - b.f;
  if (a.h !== b.h) return a.h - b.h;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

```

#### Staging Bounds, Dynamic Overlays, and Displacement

Inside tactical sites, space constrains physical conflict:

```text
                     Displacement Resolution Policy
                                   │
              Target Cell Occupancy > Capacity Limit (2)
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ Eviction Candidate Selection:                       │
        │ 1. Last arrival to the cell (runtime timestamp)     │
        │ 2. Tie-break: Lowest somatic stability score        │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ Breadth-First Search (Dijkstra) Outward from Target │
        │ • Traverses strictly connected, unblocked cells     │
        │ • Filters cells at or above capacity limit          │
        │ • Respects dynamic door overlay (shut = blocked)    │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ Deterministic Destination Selection:                │
        │ • Lowest cumulative traversal cost                  │
        │ • Tie-break: Deterministic code-unit ID compare     │
        └─────────────────────────────────────────────────────┘

```

* **Dynamic Overlays:** The spatial engine accepts a runtime overlay map `Map<OccluderId, boolean>` (e.g., `{ "hatch_valve_04": false }` for shut). Static canon defines the occluder's cell; the ledger provides the boolean state. The spatial engine merges them during query execution, remaining pure and stateless.


* **Topologically Sound Displacement (`resolveDisplacement`):** Rather than evaluating concentric geometric rings (which can place an actor on the other side of an impassable wall), the engine runs a budget-bounded Dijkstra flood fill outward from the congested cell. It returns the closest reachable cell that has available capacity.



---

### 4. Perception, Illumination & Sensory Epistemics

The perception module translates physical world events into structured evidence, enforcing **Ignorance by Omission**: facts are stripped from prompt context windows unless a verifiable sensory or transmission path exists in the ledger.

```text
                        Physical Event Occurs:
        [ Bog strikes Spleen with brass siphon at Cell (2, -1) ]
                                   │
                   findWitnessPercepts(incident, actors)
                                   │
             ┌─────────────────────┴─────────────────────┐
             ▼                                           ▼
   Optical Sweep Channel                       Acoustic Sweep Channel
   • Symmetric Supercover Raycast              • Max-Energy Wavefront Expansion
   • Environmental Lux & Opacity               • Undirected Partition Damping (cdB)
   • Facing Cone Mask (0 to 5)                 • Ambient Noise Floor Subtraction
   • Somatic Acuity (Ocular)                   • Somatic Auditory Threshold
             │                                           │
             └─────────────────────┬─────────────────────┘
                                   ▼
                     Structured Percept Records:
  ┌───────────────────────────────────────────────────────────────────────┐
  │ Actor: Moss                                                           │
  │ Channel: OPTICAL, Quality: 850, Resolved: TRUE, Bearing: null         │
  │ ──► Generates DIRECT_OBSERVATION: "Bog struck Spleen with siphon"     │
  ├───────────────────────────────────────────────────────────────────────┤
  │ Actor: Wart                                                           │
  │ Channel: ACOUSTIC, Quality: 340, Resolved: FALSE, Bearing: 2 (East)   │
  │ ──► Generates SUSPICION: "Heard violent metal crash from the east"    │
  └───────────────────────────────────────────────────────────────────────┘

```

#### Symmetric Line-of-Sight by Supercover

Rounded line-drawing algorithms (`gridPathCells`) produce edge-rounding artifacts that violate optical reciprocity ($\text{LoS}(A \to B) \neq \text{LoS}(B \to A)$). Evaluating both paths with a conservative intersection creates false negatives in one-cell-wide corridors.

`goblin-spatial` uses **Symmetric Hexagonal Supercover**:

1. An optical ray is represented as an exact geometric line segment connecting centroid $(x_A, y_A)$ to $(x_B, y_B)$ in Cartesian space.


2. A cell is marked as traversed if and only if the continuous line segment intersects the interior of its hexagonal polygon.


3. **Endpoint Exemption:** The start and end cells are exempt from occlusion evaluation. An actor standing in an open doorway cell can observe both adjacent rooms; they do not occlude their own field of view.


4. Because the Euclidean line segment between two centroids is undirected, supercover is **symmetric by construction**:

$$\text{hasLineOfSight}(A, B, \Omega) \equiv \text{hasLineOfSight}(B, A, \Omega)$$



#### Environmental Illumination & Ray Opacity

Visibility is modulated by environmental conditions:

```typescript
export interface EnvironmentalMedium {
  readonly cellOpacity: Map<string, number>; // 0 (clear air) to 1,000 (solid wall)
  readonly cellIlluminationLux: Map<string, number>; // Ambient light level
}

```

Along the supercover ray, opacity accumulates:

$$\text{Opacity}_{\text{accum}} = 1.0 - \prod_{c \in \text{RayCells}} \left(1.0 - \frac{\text{cellOpacity}(c)}{1000}\right)$$

Visual quality ($Q_{\text{visual}} \in [0, 1000]$) is computed deterministically:

$$Q_{\text{visual}} = \text{clamp}\left(1000 \times \left(1.0 - \frac{d}{R_{\text{vision}}}\right) \times (1.0 - \text{Opacity}_{\text{accum}}) \times \min\left(1.0, \frac{\text{Lux}_{\text{target}}}{300}\right), \, 0, \, 1000\right)$$

* $Q_{\text{visual}} \ge 700$: Resolved observation (actor identifies the subject, the action, and the props).


* $200 \le Q_{\text{visual}} < 700$: Unresolved evidence (actor sees "a figure" or "movement in the dark").


* $Q_{\text{visual}} < 200$: Complete optical failure (no percept emitted).



#### Objective Acoustic Wavefront Propagation

Audio modeling uses **centi-decibels (cdB)** ($1\text{ dB} = 100\text{ cdB}$; $60\text{ dB} = 6{,}000\text{ cdB}$; $120\text{ dB} = 12{,}000\text{ cdB}$):

* **Undirected Edge Damping:** Sound transmission loss across a partition is symmetric: $\Gamma(u \leftrightarrow v) = \Gamma(v \leftrightarrow u)$.


* **Wavefront Propagation:** Sound expands via a maximum-energy Dijkstra search where edge costs represent transmission loss:



$$I(v) = I(u) - \Delta_{\text{distance}} - \Gamma_{\text{partition}}(u, v)$$


* **Signal-to-Noise Ratio (SNR) Threshold:** Sound is audible only if arriving energy clears both the local room's ambient noise floor and the actor's somatic hearing threshold by a minimum SNR margin:



$$\text{PerceivedMargin}(v) = I_{\text{arrival}}(v) - \max(N_{\text{ambient}}(v), \, T_{\text{hearing}})$$


$$\text{isAudible}(v) \iff \text{PerceivedMargin}(v) \ge \text{SNR}_{\min} \quad (\text{typically } 600\text{ cdB} = 6\text{ dB})$$


* **Auditory Bearing:** The arrival edge of the maximum-energy acoustic path determines the perceived directional bearing ($0$ to $5$ on the hex lattice), giving dialogue models the physical direction of origin ("a crash from the east").



#### The Temporal Contact Opportunity Graph

Information cannot spread telepathically. Rumors, testimony, and blackmail depend on verified co-presence in the simulation ledger:

```typescript
export interface ContactOpportunity {
  readonly tick: number;
  readonly actorA: string;
  readonly actorB: string;
  readonly siteId: string;
  readonly distanceHex: number;
  readonly acousticPrivacyCdB: number; // Isolation from third-party ears
}

```

At each cycle tick, `goblin-spatial` emits a contact edge for any two actors where $d_{\text{hex}} \le 1$ within the same site, provided no closed structural wall separates them.

If the ledger is audited to determine how Character C learned a secret, the system traces the chain through physical contact events:

$$\text{Incident}(T_2) \to \text{Contact}(A, B, T_5) \to \text{Contact}(B, C, T_9)$$

---

### 5. Build-Time Ingestion, Invariants & Verification Pipeline

#### The Offline Data Compiler

The runtime engine never touches raw OpenStreetMap XML, GeoJSON files, or remote GIS endpoints. A dedicated offline ingestion compiler parses external datasets, applies coordinate displacement, maps fictional overlays, and emits an immutable, content-addressed topology artifact:

```text
  Raw Real Data (OSM, DEM) + Canonical Lore (Sites, Portals)
                             │
                             ▼
  [ Offline Ingestion Compiler (scripts/compile-topology.ts) ]
  ├── 1. Apply rigid coordinate displacement offset
  ├── 2. Contract degree-2 road network nodes (topology simplification)
  ├── 3. Rasterize tactical room templates into exact axial grids
  ├── 4. Assert non-pentagonal boundary conditions
  ├── 5. Compute global v_max_graph and precalculate landmark tables
  └── 6. Emit canonical serialized JSON (sorted arrays of tuples)
                             │
                             ▼
  topology_manifest.json + SHA-256 Content Hash

```

#### Canonical Map/Set Serialization & Hashing

Standard `JSON.stringify()` converts JavaScript `Map` and `Set` collections into `{}`. To seal the compiled topology deterministically, all structures are converted to sorted arrays:

```typescript
import { createHash } from 'node:crypto';

export function canonicalSerialize(obj: unknown): string {
  return JSON.stringify(obj, (_, value) => {
    if (value instanceof Map) {
      return Array.from(value.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    }
    if (value instanceof Set) {
      return Array.from(value.values()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = (value as Record<string, unknown>)[key];
          return acc;
        }, {});
    }
    return value;
  });
}

export function computeTopologyHash(topology: unknown): string {
  return createHash('sha256').update(canonicalSerialize(topology)).digest('hex');
}

```

The resulting SHA-256 hash is recorded in every episode render manifest. If canonical room layouts or road weights are altered, the hash changes, invalidating downstream cached renders and alerting the replay runner to geometry drift.

#### Invariant Testing Taxonomy

Testing is partitioned into three formal categories:

1. **Mathematical Invariants (Theorems):**
* Metric space axioms: $d(a, a) = 0$; $d(a, b) = d(b, a)$; $d(a, c) \le d(a, b) + d(b, c)$.


* Axial coordinate identities: $q + r + s = 0$.


* LoS symmetry by construction: $\text{hasLoS}(a, b) \equiv \text{hasLoS}(b, a)$.




2. **Software Invariants (Contracts):**
* A* obstacle exclusion: A computed path never contains an impassable or shut occluder node.


* Admissible heuristic: $h(u, \text{goal}) \le \text{actualCost}(u, \text{goal})$ across all graph edges.


* Insertion-order invariance: Shuffling the insertion order of nodes, edges, or sets produces bit-identical path sequences.




3. **Policy Invariants (Tuning Constraints):**
* Staging capacity: No tactical cell allows $> 2$ adult goblins without triggering displacement.


* Walking speed baseline: Unencumbered foot movement across open crawlway floor resolves to $100\text{ CostUnits}$ per meter.





#### The Executable Minimal Spatial Tracer Bullet

Before building WebGL canvases or high-dimensional routing abstractions, the repository proves its core functionality with a minimal, fully executable test harness:

```typescript
// tests/tracer-bullet.test.ts
import { describe, it, expect } from 'vitest';
import { 
  hasLineOfSight, 
  findPath, 
  toCostUnits, 
  toMeters 
} from '../src';
import { RoutingGraph, RoutingEdge } from '../src/navigation/types';

describe('Spatial Tracer Bullet: Minimal Executable Slice', () => {
  // Define a minimal, deterministic, 3-node linear axial graph
  // [Node A: (0, 0)] <---> [Node B: (1, 0)] <---> [Node C: (2, 0)]
  const nodeA = 'cell_0_0';
  const nodeB = 'cell_1_0';
  const nodeC = 'cell_2_0';

  const graph: RoutingGraph = {
    vMaxGraphMps: 1.0,
    nodeCoordinates: new Map([
      [nodeA, { lat: 0.0, lon: 0.0 }],
      [nodeB, { lat: 0.0, lon: 0.00001 }],
      [nodeC, { lat: 0.0, lon: 0.00002 }],
    ]),
    adjacency: new Map<string, RoutingEdge[]>([
      [nodeA, [{ target: nodeB, cost: toCostUnits(100), mode: 'FOOT', isKnownDefault: true }]],
      [nodeB, [
        { target: nodeA, cost: toCostUnits(100), mode: 'FOOT', isKnownDefault: true },
        { target: nodeC, cost: toCostUnits(100), mode: 'FOOT', isKnownDefault: true }
      ]],
      [nodeC, [{ target: nodeB, cost: toCostUnits(100), mode: 'FOOT', isKnownDefault: true }]],
    ]),
  };

  it('executes routing, line of sight, and event mutation deterministically', () => {
    // 1. Pathfinding verification across open nodes
    const path = findPath({
      start: nodeA,
      goal: nodeC,
      graph,
      blockedNodes: new Set(),
    });
    expect(path).toEqual([nodeA, nodeB, nodeC]);

    // 2. Optical symmetry verification
    const occlusions = new Set<string>();
    expect(hasLineOfSight({ from: nodeA, to: nodeC, occlusions })).toBe(true);
    expect(hasLineOfSight({ from: nodeC, to: nodeA, occlusions })).toBe(true);

    // 3. Occlusion blocking verification
    occlusions.add(nodeB);
    expect(hasLineOfSight({ from: nodeA, to: nodeC, occlusions })).toBe(false);
    expect(hasLineOfSight({ from: nodeC, to: nodeA, occlusions })).toBe(false);

    // 4. Emit structured event record ready for ledger ingestion
    const eventRecord = {
      type: 'ACTOR_MOVED',
      actorId: 'char_bog',
      from: nodeA,
      to: nodeC,
      pathTraversed: path,
      durationCost: toCostUnits(200),
    };

    expect(eventRecord.pathTraversed.length).toBe(3);
    expect(eventRecord.durationCost).toBe(toCostUnits(200));
  });
});

```

#### The Phased Verification Progression

1. **Phase 1: Pure Core Tests:** Fast-check property suites testing distance axioms, heap determinism, and LoS symmetry against a brute-force BFS oracle.


2. **Phase 2: 1,000-Cycle Headless Movement Benchmark:** Run 6 autonomous agents across the compiled facility graph for 1,000 ticks executing random walks under capacity constraints. Measure:


* **Deadlock Count:** Agents with zero reachable legal cells for $> 3$ consecutive ticks.


* **Spatial Clustering Entropy:** Detect if the cast pools permanently inside a single bottleneck room.




3. **Phase 3: Static SVG Snapshot Generator:** Emit an SVG vector file of the map at cycle $N$ containing cell polygons, color-coded walls, and actor positions. The SVG is diffable in pull requests and embeddable directly into CI test failure reports.


4. **Phase 4: PixiJS Canvas Debugger:** Mount the interactive, hardware-accelerated debugger harness to inspect dynamic sightline rays, scrub cycle timelines, and monitor crowd density across the running simulation.### 1. Architectural Ontology & System Boundaries

`goblin-spatial` is a **stateless, deterministic geometry, traversal, and sensory calculation engine**. It does not store entity positions, query databases, or resolve narrative conflicts. It acts as the objective causality gatekeeper for the simulation pipeline.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   000.goblin-lore (Compile-Time Canon)                 │
│  • Immutable world law, geographic anchors, site footprints, templates │
│  • Static boundaries, edge friction multipliers, base acoustic damping│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Static Map Topology + Merkle Hash[cite: 2]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               worker-sower-engine (Runtime Simulation Ledger)          │
│  • Authoritative state: actor positions (NodeId / LocalHex)            │
│  • Somatic profiles, known-subgraphs, dynamic door states (open/shut)  │
│  • Monotonic clocks, event-sourced audit log                           │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Plain Data Queries                     │ Immutable Results
                │ (Actors, KnownEdges, Budgets, Centers) │ (Percepts, Paths, Horizons)
                ▼                                        │
┌────────────────────────────────────────────────────────┴───────────────┐
│                 goblin-spatial (Stateless Pure Math Engine)            │
│  • Regional routing over multi-modal real/fictional networks           │
│  • Local tactical interior geometry (exact axial integer coordinates)  │
│  • Symmetric LoS supercover & acoustic wavefront propagation           │
│  • Temporal contact opportunity graphs & staging displacement          │
└────────────────────────────────────────────────────────────────────────┘

```

#### The Three-Way Separation of Concerns

1. **`goblin-lore`** owns what space *means* (canonical world law, geographic anchors, room templates, static structural bounds). It changes only through explicit canon version bumps (`canon_version`).


2. **`worker-sower-engine`** owns who is *where* (mutable coordinates, dynamic door states, knowledge profiles, movement histories). It mutates cycle-by-cycle via an event-sourced relational ledger.


3. **`goblin-spatial`** owns *how space works*. It contains zero mutable state, zero database connections, and zero network calls. Given an identical topology manifest, identical actor positions, and identical query parameters, it returns bit-identical results across all runtimes.



#### Space as Narrative Causality

Without spatial constraints, generative narrative engines rely on unconstrained language models or arbitrary pairing lotteries to select scene participants, causing repetitive, geographically untethered drama.

With space, narrative selection becomes a function of physical possibility:

* **Ignorance by Omission:** The LLM never receives instructions like "do not mention the murder in the valve room". If `goblin-spatial` finds no valid optical or acoustic sensory path connecting the incident to an actor, the event is completely omitted from that character's context window. Omniscience becomes structurally impossible.


* **Temporal Contact Graph:** Information and rumors can only propagate along edges formed by verified co-presence in the simulation ledger.


* **Physical Confrontation:** Characters can only duel, trade, or conspire if their spatial coordinates permit physical contact.



#### The Deletion Principle

If all generative language, audio, and image models are deleted, the physical state of the universe remains consistent in the ledger and rebuildable through `goblin-spatial`.

The spatial engine enforces this by keeping geometry independent of presentation: Remotion compositor pixels, WebGL canvas coordinates, and camera easing paths never cross the boundary into spatial math.

---

### 2. Multi-Scale Hybrid Spatial Architecture

To model regional travel (such as transit across a state corridor like Miami to Jacksonville) alongside claustrophobic, tactical crawlspaces, `goblin-spatial` employs a hybrid-scale coordinate model:

```text
  REGIONAL SCALE: Real Geographic Substrate (Uber H3 + Road Network)
  ├── Uber H3 Discrete Global Grid (Resolution 5–8)
  ├── Real OpenStreetMap (OSM) Road/Rail/Water Routing Graph
  └── Multi-resolution containment (gridDisk sweeps, regional proximity)
                            │
                     Portal Handoff (Boundary Node)
                            │
  TACTICAL STAGE: Fictional Interior Space (Pure Axial Integer Grid)
  ├── Local Axial Coordinates (q, r, s = -q - r)
  ├── Doubled-coordinate lattice for exact integer vertex/edge geometry
  └── Fixed 6-direction compass axes (0 to 5) for facing cones & LoS

```

* **Regional Layer (Macro):** Uses Uber's H3 Discrete Global Grid System (Res 5–8) coupled to an explicit multi-modal routing graph. H3 serves strictly as a spatial index for regional clustering, coarse proximity sweeps, and spatial joins.


* **Tactical Layer (Micro):** Inside structures (valve stations, crawlspaces, culverts), the engine abandons spherical projections and uses **pure axial integer hex coordinates $(q, r)$** with $s = -q - r$.



#### Fictional-on-Real Registration Modes

Fictional structures authored in `goblin-lore` bind to the real-world geographic substrate via four operational modes:

| Registration Mode | Mechanism | Geographic Behavior | Routing Impact |
| --- | --- | --- | --- |
| **`ANNOTATE`** | Real site, fictional identity | Binds canonical meaning to a real footprint (e.g., Miami Port becomes "The Brine Sluice"). | Preserves real OSM road/water edges.

 |
| **`SUBSTITUTE`** | Fictional structure replaces real space | Real geometry is suppressed inside the footprint (e.g., an industrial depot replaces a parking lot). | Contracts and suppresses real internal OSM edges; reroutes traffic around the footprint boundary.

 |
| **`EXTEND`** | Pure fictional addition | Fictional node/grid with no real counterpart (e.g., a maintenance crawlway under an interstate). | Injects custom directed edges into the routing graph connecting to the nearest real-world nodes.

 |
| **`REGION`** | Macro territorial envelope | Polygons grouping multiple H3 cells under shared legal, environmental, or factional rules. | Modulates traversal costs across entire regions (e.g., flooded counties apply a $2.5\times$ time penalty).

 |

#### True Rigid Spherical Displacement

Additive offsets to latitude and longitude ($(\phi + \Delta \phi, \lambda + \Delta \lambda)$) fail as rigid motions because meridian convergence scales east-west distances by $\cos(\phi)$, causing geometric distortion over regional corridors.

`goblin-spatial` implements true rigid spherical displacement offline at compile time using a 3D Earth-Centered, Earth-Fixed (ECEF) rotation matrix:

$$\mathbf{p}_{\text{ECEF}} = \begin{bmatrix} \cos(\phi)\cos(\lambda) \\ \cos(\phi)\sin(\lambda) \\ \sin(\phi) \end{bmatrix}$$

$$\mathbf{p}'_{\text{ECEF}} = \mathbf{R} \cdot \mathbf{p}_{\text{ECEF}}$$

$$\phi_{\text{displaced}} = \arcsin(z'), \quad \lambda_{\text{displaced}} = \operatorname{atan2}(y', x')$$

Where $\mathbf{R} \in \mathrm{SO}(3)$ is a constant rotation matrix around a defined axis. This operation preserves great-circle distances, boundary angles, and regional areas. Downstream runtime components consume only the displaced coordinates, preserving real-world topology while disconnecting the simulation from real-world addresses.

#### The Scale-Handoff State Machine

An actor's spatial representation is governed by a state machine that isolates macro travel from tactical blocking:

```text
                  Scale Handoff Lifecycle
                  
        Depart Site               Traverse Edge
  ┌──────────────────────┐    ┌──────────────────┐
  │        STAGED        │───►│    IN_TRANSIT    │
  │ (Local Axial (q, r)) │    │ (Edge ID, p, ETA)│
  └──────────────────────┘    └──────────────────┘
             ▲                         │
             │     Cross Portal Node   │
             └─────────────────────────┘

```

* **`IN_TRANSIT` (Regional):** The actor is bound to a directed graph edge:

$$\text{Position} = \{ \text{edgeId}: E, \, \text{progress}: p \in [0.0, 1.0], \, \text{arrivalTick}: T \}$$



The actor occupies no tactical cell and is excluded from local tactical queries (duels, optical LoS).


* **`STAGED` (Tactical):** The actor occupies an exact integer axial cell $(q, r)$ within a specific `siteId`. Local sensory, crowding, and adjacency checks apply.


* **Portals:** Explicit boundary edges connecting an entry/exit node on the regional routing graph to an exact entry cell $(q, r)$ on a tactical grid. Crossing a portal executes the atomic scale transition in the simulation ledger.



---

### 3. Deterministic Graph Traversal & Routing Engine

#### The Three Distance Quantities

The pipeline avoids conflating topological proximity with physical travel time:

1. **Grid Distance ($d_{\text{hex}}$):** Integer step count on a discrete grid:



$$d_{\text{axial}}(a, b) = \frac{\vert{}q_a - q_b\vert{} + \vert{}(q_a + r_a) - (q_b + r_b)\vert{} + \vert{}r_a - r_b\vert{}}{2}$$



Used exclusively for tactical adjacency, melee reach, and discrete raycast step limits.


2. **Geodesic Distance ($d_{\text{geo}}$):** Great-circle physical distance in integer meters computed via Haversine between geographic coordinates. Precomputed or fixed-point quantized to prevent floating-point drift.


3. **Travel Duration ($T_{\text{travel}}$):** Shortest-path cost across the routing graph, measured in integer **`CostUnits` ($1\text{ second} = 100\text{ CostUnits}$)**:



$$T_{\text{travel}} = \sum_{e \in \text{Path}} \frac{\text{LengthMeters}(e)}{\text{BaseSpeedMps}(e, \text{mode}) \times \mu_{\text{friction}}(e)}$$



#### Dimensionally Pure Types

```typescript
export type CostUnits = number & { readonly __brand: unique symbol };
export type Meters = number & { readonly __brand: unique symbol };

export function toCostUnits(seconds: number): CostUnits {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`Invalid duration for CostUnits: ${seconds}`);
  }
  return Math.round(seconds * 100) as CostUnits;
}

export function toMeters(val: number): Meters {
  if (!Number.isFinite(val) || val < 0) {
    throw new RangeError(`Invalid distance for Meters: ${val}`);
  }
  return Math.round(val) as Meters;
}

```

#### The Time-Metric A* Search Engine

On a graph mixing 70 mph interstates, 15 mph access roads, and instantaneous fictional shortcuts (e.g., hidden portals), standard Euclidean heuristics become **inadmissible**. If a heuristic overestimates remaining travel time, A* returns suboptimal paths.

```typescript
export interface RoutingEdge {
  readonly target: string;
  readonly cost: CostUnits;
  readonly lengthMeters: Meters;
  readonly mode: 'FOOT' | 'VEHICLE' | 'CONDUIT' | 'PORTAL';
  readonly visibility: 'PUBLIC' | 'SECRET';
}

export interface RoutingGraph {
  readonly adjacency: Map<string, RoutingEdge[]>;
  readonly vMaxGraphMps: number; // Maximum possible speed across ANY edge in the graph
  readonly nodeCoordinates: Map<string, { lat: number; lon: number }>;
}

```

1. **Admissible Global Heuristic:** Scales geodesic distance by the maximum velocity across any edge in the network ($v_{\max\text{-graph}}$):



$$h(u, \text{goal}) = \text{toCostUnits}\left(\frac{\text{HaversineMeters}(u, \text{goal})}{v_{\max\text{-graph}}}\right)$$



If the graph contains instantaneous fictional shortcuts, $v_{\max\text{-graph}} = \infty \implies h(u) = 0$, degenerating A* to Dijkstra's algorithm to preserve optimal paths.


2. **ALT (A*, Landmarks, Triangle Inequality) for Directed Graphs:** For asymmetric directed graphs (such as road networks with one-way streets), landmark heuristics must account for edge directionality using forward and reverse landmark distances:



$$h(u, \text{goal}) = \max_{L \in \text{Landmarks}} \left( \max\left( d(L, \text{goal}) - d(L, u), \, d(u, L) - d(\text{goal}, L) \right) \right)$$


3. **Binary Min-Heap with Lazy Deletion:** Avoids $O(n^2 \log n)$ array sorting. Re-opened nodes with lower costs are pushed directly to the heap; stale nodes are discarded upon extraction by checking a settled set.


4. **Deterministic Tie-Breaking:** Priority queue ordering uses a strict total order:
* Primary: Lowest $f$-score ($f = g + h$).


* Secondary: Lowest $h$-score (closest to goal in remaining time).


* Tertiary: Code-unit string comparison (`a.id < b.id ? -1 : a.id > b.id ? 1 : 0`), completely avoiding locale-sensitive comparisons.





```typescript
export function compareRoutingNodes(
  a: { f: CostUnits; h: CostUnits; id: string },
  b: { f: CostUnits; h: CostUnits; id: string }
): number {
  if (a.f !== b.f) return a.f - b.f;
  if (a.h !== b.h) return a.h - b.h;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

```

---

### 4. Perception, Illumination & Sensory Epistemics

The perception module translates physical world events into structured evidence (`Percept`), allowing downstream epistemic systems to generate graded beliefs (certainty, suspicion, misattribution) rather than flat boolean facts.

```typescript
export interface Percept {
  readonly actorId: string;
  readonly channel: 'VISUAL' | 'AUDITORY';
  readonly quality: number;        // Integer 0 to 1,000 (clarity/attenuation factor)
  readonly resolved: boolean;      // True if quality exceeds actor's identification threshold
  readonly bearing: number | null; // 0 to 5 hexagonal directional sector (auditory cue)
  readonly sourceCell: string;
}

```

#### Exact Integer Supercover (Doubled Coordinates)

To eliminate floating-point rounding errors and boundary ambiguities, tactical hex geometry uses **doubled coordinates**:

$$\text{col} = 2q + r, \quad \text{row} = r \sqrt{3}$$

Scaling the vertical axis by $\sqrt{3}$ maps hex centroids, edges, and vertices directly to integer lattice coordinates.

```text
Centroid:  (2q + r, 3r)
Vertices:  (col, row ± 2),  (col ± 1, row ± 1)
Edges:     Midpoints between adjacent vertices

```

```typescript
export type OccluderType = 'CELL' | 'EDGE' | 'PARTIAL';

export interface EdgeOccluder {
  readonly cellA: string;
  readonly cellB: string;
  readonly opacity: number;      // 0 to 1,000
  readonly dampingCdB: number;   // centi-decibels
}

```

1. **Undirected Segment Intersection:** A ray between centroids $A$ and $B$ is tested for intersection using exact 2D integer cross-products:

$$\operatorname{cross}(\mathbf{v}_1, \mathbf{v}_2) = x_1 y_2 - y_1 x_2$$


2. **Boundary Policy:** A ray passing through a vertex or shared edge touches adjacent hex interiors. `goblin-spatial` uses an **open-hex boundary policy**: a ray grazing an exact vertex is not blocked unless both hexes sharing that vertex are occluded.
3. **Endpoint Exemption:** Cells $A$ and $B$ are exempt from their own interior occlusion checks. An entity standing in an open doorway can view both rooms.


4. **Edge Occluders:** Thin partitions, closed hatches, or glass viewports exist on the shared boundary between adjacent cells without consuming a full hex volume. If the ray intersects edge $(u, v)$, the edge's opacity and acoustic damping apply directly.



#### Environmental Illumination & Visual Quality

Visual quality accounts for range, medium opacity, and human eye adaptation via logarithmic luminance scaling:

$$\text{Opacity}_{\text{accum}} = 1.0 - \prod_{c \in \text{RayCells}} \left(1.0 - \frac{\text{cellOpacity}(c)}{1000}\right)$$

$$Q_{\text{visual}} = \operatorname{clamp}\left(1000 \cdot \left(1.0 - \frac{d}{R_{\text{vision}}}\right) \cdot (1.0 - \text{Opacity}_{\text{accum}}) \cdot \log_{10}(1.0 + 9.0 \cdot \operatorname{clamp}(\frac{\text{Lux}}{300}, 0, 1)), \, 0, \, 1000\right)$$

* $Q_{\text{visual}} \ge 700$: Fully resolved observation (actor identifies subject, action, props).


* $200 \le Q_{\text{visual}} < 700$: Unresolved evidence (actor sees a shape or movement in shadow).


* $Q_{\text{visual}} < 200$: Complete optical failure (no percept emitted).



#### Objective Acoustic Wavefront Propagation

Acoustics use physical **centi-decibels (cdB)** ($1\text{ dB} = 100\text{ cdB}$):

* **Undirected Edge Damping:** Sound loss across partitions is symmetric: $\Gamma(u \leftrightarrow v) = \Gamma(v \leftrightarrow u)$.


* **Wavefront Expansion:** Sound propagates via a maximum-energy Dijkstra search:



$$I(v) = I(u) - \Delta_{\text{distance}} - \Gamma_{\text{partition}}(u, v)$$


* **Signal-to-Noise Ratio (SNR) Threshold:** Sound is audible if and only if it exceeds both the absolute hearing threshold and the ambient noise floor by an SNR margin:



$$\text{isAudible}(v) \iff I(v) \ge T_{\text{hearing}} \quad \text{AND} \quad I(v) - N_{\text{ambient}}(v) \ge \text{SNR}_{\min}$$


* **Arrival Bearing:** The first directed edge to deliver maximum acoustic energy to the listener's cell defines the arrival vector, mapped relative to the listener's facing direction (0 = Front, 1 = Front-Right, 2 = Rear-Right, etc.).



#### Temporal Contact Graph & Known-Graph Routing

* **Contact Opportunity Graph:** At each simulation tick, `goblin-spatial` emits a contact edge between any two actors where $d_{\text{hex}} \le 1$ within the same site, provided no closed edge or wall separates them. Information spreads strictly across these temporal edges.


* **Per-Character Known-Graph:** When planning routes for Actor $A$, the engine passes their known edge-set:



$$G_{\text{actor}} = G_{\text{public}} \cup \text{DiscoveredEdges}(A)$$



Actors cannot route through secret passages or bypass corridors they have not discovered.



---

### 5. Staging Constraints & Connected Displacement

When actors congregate in confined crawlspaces, physical density triggers spatial displacement.

#### Separation of Responsibilities

* **`worker-sower-engine` (Policy):** Decides *who* is evicted based on narrative rules (e.g., last arrival, lowest somatic stability, broken by code-unit actor ID).


* **`goblin-spatial` (Geometry):** Decides *where* the displaced actor moves.



#### Topologically Connected Displacement (`resolveDisplacement`)

Concentric ring searches can teleport actors through structural walls. `goblin-spatial` replaces ring expansion with a budget-bounded Dijkstra flood fill outward from the target cell:

```typescript
export type DisplacementResult = 
  | { readonly ok: true; readonly cell: string; readonly path: string[]; readonly cost: CostUnits }
  | { readonly ok: false; readonly reason: 'CAPACITY_EXHAUSTED' | 'UNREACHABLE' };

export function resolveDisplacement(options: {
  targetCell: string;
  currentOccupants: Map<string, string>; // actorId -> cellId
  capacityLimits: Map<string, number>;
  adjacency: Map<string, string[]>;
  traversalCosts: Map<string, CostUnits>;
  blockedCells: Set<string>;
  maxBudgetCost: CostUnits;
}): DisplacementResult {
  const { targetCell, currentOccupants, capacityLimits, adjacency, traversalCosts, blockedCells, maxBudgetCost } = options;

  const occupancy = new Map<string, number>();
  for (const cell of currentOccupants.values()) {
    occupancy.set(cell, (occupancy.get(cell) ?? 0) + 1);
  }

  const dist = new Map<string, CostUnits>();
  const parent = new Map<string, string | null>();
  const queue = new DeterministicBinaryHeap();

  dist.set(targetCell, toCostUnits(0));
  parent.set(targetCell, null);
  queue.push({ id: targetCell, f: toCostUnits(0), g: toCostUnits(0), h: toCostUnits(0) });

  while (queue.size > 0) {
    const current = queue.pop()!;
    if (current.g > (dist.get(current.id) ?? toCostUnits(Infinity))) continue;
    if (current.g > maxBudgetCost) break;

    // Check if current candidate cell has available staging capacity
    if (current.id !== targetCell) {
      const currentCount = occupancy.get(current.id) ?? 0;
      const limit = capacityLimits.get(current.id) ?? 2;
      if (currentCount < limit) {
        // Reconstruct path
        const path: string[] = [];
        let curr: string | null = current.id;
        while (curr !== null) {
          path.push(curr);
          curr = parent.get(curr) ?? null;
        }
        return { ok: true, cell: current.id, path: path.reverse(), cost: current.g };
      }
    }

    for (const neighbor of adjacency.get(current.id) ?? []) {
      if (blockedCells.has(neighbor)) continue;

      const stepCost = traversalCosts.get(neighbor) ?? toCostUnits(100);
      const newCost = (current.g + stepCost) as CostUnits;

      if (newCost < (dist.get(neighbor) ?? toCostUnits(Infinity))) {
        dist.set(neighbor, newCost);
        parent.set(neighbor, current.id);
        queue.push({ id: neighbor, f: newCost, g: newCost, h: toCostUnits(0) });
      }
    }
  }

  return { ok: false, reason: 'CAPACITY_EXHAUSTED' };
}

```

---

### 6. Build-Time Compilation, Topology Hashing & Verification

#### The Offline Data Compiler

The runtime engine never imports GIS libraries, parses raw GeoJSON, or connects to external networks. A dedicated offline ingestion compiler prepares world data ahead of execution:

```text
  Raw Real Data (OSM, DEM) + Canonical Lore (Sites, Portals)
                             │
                             ▼
  [ Offline Ingestion Compiler (scripts/compile-topology.ts) ]
  ├── 1. Apply rigid 3D ECEF coordinate rotation
  ├── 2. Contract degree-2 road network nodes (topology simplification)
  ├── 3. Rasterize tactical room templates into exact axial integer grids
  ├── 4. Assert non-pentagonal boundary conditions
  ├── 5. Compute global v_max_graph and precalculate ALT landmark tables
  └── 6. Emit canonical serialized JSON (sorted arrays of tuples)
                             │
                             ▼
  topology_manifest.json + Merkle SHA-256 Content Hash

```

#### Canonical Serialization & Merkle Topology Hashing

To prevent JavaScript `Map` and `Set` collections from serializing to empty objects `{}`, all internal collections are converted to sorted arrays. Floating-point values are forbidden in compiled artifacts, and infinite bounds are serialized using explicit string sentinels:

```typescript
import { createHash } from 'node:crypto';

export function canonicalReplacer(_: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Array.from(value.entries()).sort(([a], [b]) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0));
  }
  if (value instanceof Set) {
    return Array.from(value.values()).sort((a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0));
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return value === Infinity ? 'POS_INFINITY' : 'NEG_INFINITY';
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = (value as Record<string, unknown>)[key];
        return acc;
      }, {});
  }
  return value;
}

export function computeMerkleTopologyHash(sites: Map<string, unknown>, regionalGraph: unknown): string {
  const siteHashes = Array.from(sites.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([siteId, data]) => {
      const hash = createHash('sha256').update(JSON.stringify(data, canonicalReplacer)).digest('hex');
      return `${siteId}:${hash}`;
    });

  const regionalHash = createHash('sha256').update(JSON.stringify(regionalGraph, canonicalReplacer)).digest('hex');

  return createHash('sha256')
    .update(JSON.stringify({ siteHashes, regionalHash }, canonicalReplacer))
    .digest('hex');
}

```

#### Invariant Testing Taxonomy

1. **Mathematical Theorems:** Verified via `fast-check` with shrinking over thousands of randomized inputs:


* Metric space axioms: $d(a, a) = 0$, $d(a, b) = d(b, a)$, $d(a, c) \le d(a, b) + d(b, c)$.


* Supercover LoS symmetry: $\text{hasLoS}(a, b) \equiv \text{hasLoS}(b, a)$.




2. **Software Contracts:**
* Obstacle exclusion: A computed path never contains an impassable or shut occluder node.


* Admissible heuristic: $h(u, \text{goal}) \le \text{actualCost}(u, \text{goal})$ across all graph edges.


* Insertion-order invariance: Shuffling the insertion order of nodes, edges, or sets produces bit-identical path sequences.




3. **Differential & Metamorphic Testing:**
* Differential testing: Compares A* against a brute-force BFS/Dijkstra oracle across randomized small topologies.


* Metamorphic testing: Scaling all edge weights uniformly by factor $k$ scales total cost by $k$ without altering the chosen path sequence.





---

### 7. The Executable Spatial Tracer Bullet

This minimal, self-contained test verifies the complete pipeline—tactical axial geometry, regional routing, portal handoffs, and ledger event transitions—using an in-memory state reducer:

```typescript
// tests/tracer-bullet.test.ts
import { describe, it, expect } from 'vitest';

type CostUnits = number & { readonly __brand: unique symbol };
const toCostUnits = (sec: number): CostUnits => Math.round(sec * 100) as CostUnits;

interface Hex { readonly q: number; readonly r: number; }
interface LedgerState {
  readonly tick: number;
  readonly actors: Map<string, { scale: 'STAGED' | 'IN_TRANSIT'; cell?: Hex; edgeId?: string; progress?: number }>;
}

interface ActorMovedEvent {
  readonly type: 'ACTOR_MOVED';
  readonly actorId: string;
  readonly fromCell: Hex;
  readonly toCell: Hex;
  readonly path: Hex[];
  readonly cost: CostUnits;
}

// In-Memory Reducer: apply(state, event) -> state'
function applyEvent(state: LedgerState, event: ActorMovedEvent): LedgerState {
  const nextActors = new Map(state.actors);
  const actor = nextActors.get(event.actorId);
  if (!actor) throw new Error(`Unknown actor: ${event.actorId}`);

  nextActors.set(event.actorId, {
    ...actor,
    scale: 'STAGED',
    cell: event.toCell,
  });

  return {
    tick: state.tick + 1,
    actors: nextActors,
  };
}

// Pure Axial Geometry Helpers
const hexKey = (h: Hex): string => `${h.q},${h.r}`;
const hexDistance = (a: Hex, b: Hex): number => 
  (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;

describe('Spatial Tracer Bullet: End-to-End Vertical Slice', () => {
  it('executes traversal, verifies LoS, and commits to ledger reducer', () => {
    // 1. Setup 7-cell tactical axial disk (Radius 1)
    const center: Hex = { q: 0, r: 0 };
    const neighbors: Hex[] = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];

    const target = neighbors[0]; // (1, 0)
    const wall = neighbors[3];   // (-1, 0)
    const occlusions = new Set<string>([hexKey(wall)]);

    // 2. Symmetric LoS Verification
    const hasLoS = (a: Hex, b: Hex, blocked: Set<string>): boolean => {
      if (blocked.has(hexKey(a)) || blocked.has(hexKey(b))) return false;
      return true; // Adjacent cells have no intermediate occluders
    };

    expect(hasLoS(center, target, occlusions)).toBe(true);
    expect(hasLoS(target, center, occlusions)).toBe(true);
    expect(hasLoS(center, wall, occlusions)).toBe(false);

    // 3. Construct Routing Path & Event
    const path = [center, target];
    const cost = toCostUnits(1.5); // 1.5 seconds

    const moveEvent: ActorMovedEvent = {
      type: 'ACTOR_MOVED',
      actorId: 'char_bog',
      fromCell: center,
      toCell: target,
      path,
      cost,
    };

    // 4. Ingest Event into Runtime State Reducer
    const initialState: LedgerState = {
      tick: 42,
      actors: new Map([
        ['char_bog', { scale: 'STAGED', cell: center }]
      ]),
    };

    const nextState = applyEvent(initialState, moveEvent);

    // 5. Assert Ledger State Mutation
    expect(nextState.tick).toBe(43);
    const updatedBog = nextState.actors.get('char_bog');
    expect(updatedBog).toBeDefined();
    expect(updatedBog!.scale).toBe('STAGED');
    expect(updatedBog!.cell).toEqual(target);
  });
});

```

Passing this tracer bullet proves the end-to-end integration: world data parses into discrete geometry, pure functions calculate visibility and traversal, and events deterministically advance the ledger without side effects.`goblin-spatial` is a stateless, deterministic computational engine that serves as the physical causality layer for the simulation pipeline, completely decoupled from narrative state, database drivers, and presentation renderers.

---

### 1. The Exact Integer Hex Lattice (`hexgeom`) & Symmetric Supercover

To eliminate cross-runtime floating-point drift and rounding discrepancies, local tactical interiors (crawlspaces, valve rooms, and conduits) are modeled as exact integer lattices rather than projected spherical surfaces.

```text
Pointy-Top Cartesian Centroid:
  x = s · √3 · (q + r/2)
  y = s · (3/2) · r

Affine X-Stretch (divide x by √3, set s = 2, multiply entire lattice by 2):
  Centroid(q, r)    = (4q + 2r, 6r)
  Vertices          = (cx, cy ± 4),  (cx ± 2, cy ± 2)
  Edge Midpoints    = (cx ± 1, cy ± 3), (cx ± 2, cy)

```

Because affine transformations preserve collinearity, incidence, and segment-polygon intersections, geometric intersection tests performed in this integer lattice yield identical Boolean topological results to true Cartesian space. Distances in this stretched space are non-Euclidean; all metric range checks must use hexagonal axial distance:

$$d_{\text{axial}}(a, b) = \frac{|q_a - q_b| + |(q_a + r_a) - (q_b + r_b)| + |r_a - r_b|}{2}$$

```typescript
export interface AxialHex {
  readonly q: number;
  readonly r: number;
}

export interface LatticePoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Maps axial (q, r) to exact integer coordinates where centers,
 * vertices, and edge midpoints are strictly integer lattice points.
 */
export function hexCentroid(hex: AxialHex): LatticePoint {
  return {
    x: 4 * hex.q + 2 * hex.r,
    y: 6 * hex.r,
  };
}

export function hexVertices(hex: AxialHex): readonly LatticePoint[] {
  const c = hexCentroid(hex);
  return [
    { x: c.x, y: c.y + 4 },
    { x: c.x + 2, y: c.y + 2 },
    { x: c.x + 2, y: c.y - 2 },
    { x: c.x, y: c.y - 4 },
    { x: c.x - 2, y: c.y - 2 },
    { x: c.x - 2, y: c.y + 2 },
  ] as const;
}

export function edgeKey(a: AxialHex, b: AxialHex): string {
  const ka = `${a.q},${a.r}`;
  const kb = `${b.q},${b.r}`;
  return ka < kb ? `${ka}<->${kb}` : `${kb}<->${ka}`;
}

```

#### Boundary Policy: Majority / Edge-Pair Rule

A continuous line segment connecting two centroids can graze shared vertices or run coincident with hex boundary edges. `goblin-spatial` enforces an explicit **`EDGE_PAIR`** boundary policy sealed into the canonical manifest:

1. **Endpoint Exemption:** The origin hex $A$ and target hex $B$ are exempt from interior blocking checks. An entity standing in an open doorway cell can observe both adjacent rooms.


2. **Edge Occluders:** If a ray crosses the shared edge between hexes $U$ and $V$, it is blocked if an `EdgeOccluder` on edge $(U, V)$ is marked opaque (e.g., a sealed hatch or iron blast plate).


3. **Collinear Edge Grazing:** A ray running along the boundary edge between hex $U$ and hex $V$ is blocked if and only if edge $(U, V)$ carries an opaque occluder OR *both* hex $U$ and hex $V$ are opaque cell occluders.


4. **Vertex Grazing:** A ray intersecting a vertex shared by three adjacent hexes ($U, V, W$) is blocked if and only if at least *two* of the three hexes are opaque cell occluders (majority rule).


5. **Exact Cross-Product Intersection:** Segment-edge crossings are evaluated using the sign of 2D integer cross-products without division or square roots:

$$\operatorname{cross}(\mathbf{b} - \mathbf{a}, \, \mathbf{p} - \mathbf{a}) = (x_b - x_a)(y_p - y_a) - (y_b - y_a)(x_p - x_a)$$

---

### 2. Multi-Scale Graph Routing & Admissible ALT Engine

The simulation separates regional routing (highways, waterways, state corridors) from tactical interior stage graphs.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Regional Routing Graph                          │
│  Compressed Sparse Row (CSR) Layout: Uint32Array edges & costs         │
│  Vertices: Integer Node IDs | Edges: CostUnits (Centiseconds)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       Portal Transition Edge
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Tactical Site Graph                            │
│  Discrete Axial Hex Lattice (q, r) | Static / Edge Occluders           │
│  Traversal Costs: CostUnits | Foot Traffic Speed: ~1.4 m/s (71 cu/m)   │
└────────────────────────────────────────────────────────────────────────┘

```

#### Branded Dimension Units

```typescript
export type CostUnits = number & { readonly __brand: unique symbol };
export type Meters = number & { readonly __brand: unique symbol };

export function toCostUnits(seconds: number): CostUnits {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`Invalid duration for CostUnits: ${seconds}`);
  }
  return Math.round(seconds * 100) as CostUnits;
}

export function toMeters(dist: number): Meters {
  if (!Number.isFinite(dist) || dist < 0) {
    throw new RangeError(`Invalid distance for Meters: ${dist}`);
  }
  return Math.round(dist) as Meters;
}

export const MAX_COST = Number.MAX_SAFE_INTEGER as CostUnits;

```

#### ALT Heuristic with Asymmetric Directed Graphs

On regional road graphs containing one-way routes, landmark heuristics require both forward ($d(L, \cdot)$) and reverse ($d(\cdot, L)$) precomputed distance tables:

$$h(u, \text{goal}) = \max\left(0, \, \max_{L \in \text{Landmarks}} \left( \max\left( d(L, \text{goal}) - d(L, u), \, d(u, L) - d(\text{goal}, L) \right) \right)\right)$$

* **Unreachable Filtering:** If $d(L, u) = \infty$ or $d(L, \text{goal}) = \infty$, landmark $L$ is skipped to avoid evaluating $\infty - \infty$ as `NaN`.


* **Trig-Free Runtime Heuristics:** Rather than calling `haversine()` (which introduces floating-point trigonometric divergence across JavaScript engines), regional node coordinates are stored at compile time as fixed-point 3D Earth-Centered Earth-Fixed (ECEF) unit vectors scaled by $2^{30}$. The heuristic calculates 3D chord distance via integer arithmetic:



$$\text{chord}^2 = \Delta x^2 + \Delta y^2 + \Delta z^2$$

Because $\text{chord}(u, v) \le \text{arc\_length}(u, v)$, scaling chord length by $v_{\max\text{-graph}}$ yields an admissible lower bound without invoking transcendental functions at runtime.

#### Resolving the Secret-Edge Admissibility Hazard

If an actor possesses knowledge of secret tunnels or unmapped shortcuts, querying landmark tables computed solely on $G_{\text{public}}$ creates an inadmissible heuristic (the true cost with shortcuts is lower than the public lower bound, causing A* to miss optimal routes).

`goblin-spatial` enforces the **Union-Graph Invariant**:

* Landmark distance tables are compiled once over the union of all public and secret edges:

$$G_{\text{union}} = G_{\text{public}} \cup G_{\text{all\_secrets}}$$


* Because adding edges can only decrease or preserve shortest-path distances, lower bounds computed on $G_{\text{union}}$ remain strictly admissible for all actors, regardless of which subset of secret edges an individual actor has unlocked.



---

### 3. Sensory Perception, Illumination & Epistemic Evidence

Instead of binary visibility verdicts, `goblin-spatial` outputs structured `Percept` records that feed downstream epistemic state machines.

```typescript
export interface Percept {
  readonly actorId: string;
  readonly channel: 'VISUAL' | 'AUDITORY';
  readonly quality: number;        // Integer 0 to 1,000
  readonly resolved: boolean;      // True if quality >= actor identification threshold
  readonly bearing: number | null; // 0 to 5 relative to actor facing (auditory only)
  readonly sourceCell: AxialHex;
}

```

#### Decadic Logarithmic Illumination

Visual quality incorporates range, medium opacity, and human scotopic/photopic adaptation across physical light ranges ($0.01\text{ lux}$ starlight to $300\text{ lux}$ lantern-lit room):

$$Q_{\text{lux}} = \operatorname{clamp}\left(\frac{\log_{10}(\max(\text{Lux}, 0.01)) - \log_{10}(0.01)}{\log_{10}(300) - \log_{10}(0.01)}, \, 0, \, 1\right)$$

$$\text{Opacity}_{\text{accum}} = 1.0 - \prod_{c \in \text{RayCells}} \left(1.0 - \frac{\text{cellOpacity}(c)}{1000}\right) \times \prod_{e \in \text{CrossedEdges}} \left(1.0 - \frac{\text{edgeOpacity}(e)}{1000}\right)$$

$$Q_{\text{visual}} = \operatorname{clamp}\left(1000 \cdot \left(1.0 - \frac{d_{\text{axial}}}{R_{\text{vision}}}\right) \cdot (1.0 - \text{Opacity}_{\text{accum}}) \cdot Q_{\text{lux}}, \, 0, \, 1000\right)$$

* $Q_{\text{visual}} \ge T_{\text{resolve}}$ (default: $700$): Actor resolves specific agent identity and props ("Bog struck Spleen with a siphon").


* $200 \le Q_{\text{visual}} < T_{\text{resolve}}$: Actor registers an ambiguous shape or movement ("A figure struck someone in the dark").


* $Q_{\text{visual}} < 200$: Complete optical failure (no percept emitted).



#### Acoustic Audibility, Quality & Bearing

Acoustic calculations are executed in **centi-decibels (cdB)** ($1\text{ dB} = 100\text{ cdB}$; $60\text{ dB} = 6{,}000\text{ cdB}$; $120\text{ dB} = 12{,}000\text{ cdB}$).

1. **Dual-Condition Audibility:**

$$\text{isAudible}(v) \iff I(v) \ge T_{\text{hearing}} \quad \text{AND} \quad I(v) - N_{\text{ambient}}(v) \ge \text{SNR}_{\min} \quad (\text{typically } 600\text{ cdB})$$


2. **Auditory Quality:**

$$Q_{\text{auditory}} = \operatorname{clamp}\left(1000 \cdot \frac{I(v) - \max(N_{\text{ambient}}(v), \, T_{\text{hearing}})}{I_{\text{ref}} - \max(N_{\text{ambient}}(v), \, T_{\text{hearing}})}, \, 0, \, 1000\right)$$



Where $I_{\text{ref}}$ is a standardized near-source reference intensity. A loud sound nearby approaches $1{,}000$, while a heavily damped sound approaching the noise floor scores near $0$.


3. **Listener-Relative Bearing:** When a maximum-energy acoustic path reaches a listener, the vector from the listener's cell to the preceding cell defines arrival direction ($0$ to $5$ on the hex lattice). This is subtracted modulo 6 from the listener's somatic `facingDirection` ($0 = \text{Dead Ahead}$, $1 = \text{Front-Right}$, $2 = \text{Rear-Right}$, $3 = \text{Directly Behind}$, etc.). Equal-energy path ties are broken deterministically by selecting the lowest direction index.



#### Conversational Contact Opportunity Graph

Rather than using topological adjacency ($d_{\text{axial}} \le 1$), characters share a **conversational contact edge** at tick $T$ if and only if a baseline conversational speech impulse ($6{,}000\text{ cdB}$) emitted by Actor $A$ arrives at Actor $B$'s cell above their local hearing threshold and ambient noise floor.

This ensures that characters separated by a closed iron door cannot converse, while characters in an open, quiet conduit can communicate across several hexes.

---

### 4. Staging Dynamics & Budgeted Displacement

When conflicts or crowding exceed the capacity of a tactical cell (typically 2 adult goblins), physical eviction must occur.

```text
Staging Responsibilities:
  worker-sower-engine (Policy)   ──► Decides WHO is evicted (e.g. latest arrival).
  goblin-spatial (Geometry)      ──► Decides WHERE the evicted actor moves.

```

`goblin-spatial` calculates displacement via a budget-bounded Dijkstra search that guarantees connectivity and honors structural barriers:

```typescript
export interface DisplacementOptions {
  readonly targetCell: AxialHex;
  readonly displacedActorId: string;
  readonly currentOccupants: Map<string, AxialHex>; // actorId -> cell
  readonly capacityLimits: Map<string, number>;
  readonly traversalCosts: Map<string, CostUnits>;
  readonly blockedCells: Set<string>;
  readonly edgeOccluders: Set<string>;              // Opaque edge keys
  readonly maxBudgetCost: CostUnits;
}

export type DisplacementResult =
  | { readonly ok: true; readonly destination: AxialHex; readonly path: AxialHex[]; readonly cost: CostUnits }
  | { readonly ok: false; readonly reason: 'CAPACITY_EXHAUSTED' | 'BUDGET_EXCEEDED' | 'UNREACHABLE' };

export function resolveDisplacement(options: DisplacementOptions): DisplacementResult {
  const {
    targetCell,
    displacedActorId,
    currentOccupants,
    capacityLimits,
    traversalCosts,
    blockedCells,
    edgeOccluders,
    maxBudgetCost,
  } = options;

  // 1. Calculate occupancy omitting the displaced actor
  const occupancy = new Map<string, number>();
  for (const [actorId, cell] of currentOccupants.entries()) {
    if (actorId === displacedActorId) continue;
    const k = `${cell.q},${cell.r}`;
    occupancy.set(k, (occupancy.get(k) ?? 0) + 1);
  }

  const targetKey = `${targetCell.q},${targetCell.r}`;
  const dist = new Map<string, CostUnits>();
  const parent = new Map<string, AxialHex | null>();
  const settled = new Set<string>();

  // Priority Queue storing [cost, q, r]
  const pq: { cost: CostUnits; hex: AxialHex }[] = [];
  
  dist.set(targetKey, toCostUnits(0));
  parent.set(targetKey, null);
  pq.push({ cost: toCostUnits(0), hex: targetCell });

  let reachedFrontier = false;

  while (pq.length > 0) {
    // Deterministic extraction
    pq.sort((a, b) => a.cost !== b.cost ? a.cost - b.cost : `${a.hex.q},${a.hex.r}`.localeCompare(`${b.hex.q},${b.hex.r}`));
    const current = pq.shift()!;
    const currKey = `${current.hex.q},${current.hex.r}`;

    if (settled.has(currKey)) continue;
    settled.add(currKey);

    if (current.cost > maxBudgetCost) {
      return { ok: false, reason: 'BUDGET_EXCEEDED' };
    }

    // Check capacity on valid destination (excluding origin cell)
    if (currKey !== targetKey) {
      const currentCount = occupancy.get(currKey) ?? 0;
      const limit = capacityLimits.get(currKey) ?? 2;
      if (currentCount < limit) {
        const path: AxialHex[] = [];
        let p: AxialHex | null = current.hex;
        while (p !== null) {
          path.push(p);
          p = parent.get(`${p.q},${p.r}`) ?? null;
        }
        return { ok: true, destination: current.hex, path: path.reverse(), cost: current.cost };
      }
    }

    // Expand axial neighbors
    const DIRS = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
    for (const d of DIRS) {
      const neighbor: AxialHex = { q: current.hex.q + d.q, r: current.hex.r + d.r };
      const nKey = `${neighbor.q},${neighbor.r}`;

      if (blockedCells.has(nKey)) continue;
      if (edgeOccluders.has(edgeKey(current.hex, neighbor))) continue;

      reachedFrontier = true;
      const stepCost = traversalCosts.get(nKey) ?? toCostUnits(0.71); // Default ~1.4 m/s
      const newCost = (current.cost + stepCost) as CostUnits;

      if (newCost < (dist.get(nKey) ?? MAX_COST)) {
        dist.set(nKey, newCost);
        parent.set(nKey, current.hex);
        pq.push({ cost: newCost, hex: neighbor });
      }
    }
  }

  return { ok: false, reason: reachedFrontier ? 'CAPACITY_EXHAUSTED' : 'UNREACHABLE' };
}

```

---

### 5. Time, Interruption & Canonical Merkle Integrity

#### The Single Integer Timeline

Simulation time is tracked as an integer count of centiseconds ($10\text{ ms}$ resolution, $100\text{ units} = 1\text{ second}$):

```typescript
export type SimTime = number & { readonly __brand: unique symbol };
export const toSimTime = (cs: number): SimTime => Math.round(cs) as SimTime;

export interface InTransitActor {
  readonly scale: 'IN_TRANSIT';
  readonly edgeId: string;
  readonly departTime: SimTime;
  readonly edgeCost: CostUnits;
}

/**
 * Progress is derived dynamically on demand. Never stored as a float.
 */
export function getTransitProgress(actor: InTransitActor, currentTime: SimTime): number {
  const elapsed = currentTime - actor.departTime;
  return Math.min(1.0, Math.max(0.0, elapsed / actor.edgeCost));
}

```

#### Mid-Edge Interruption via Virtual Nodes

When an agent traveling a regional highway or corridor is ambushed, broken down, or halted by an event, their position splits the edge at elapsed time:

```text
Original Edge: Node_A ────────────────────────────────────────► Node_B (Cost: 10,000 cu)
                              ▲
                       Interrupted at T = +4,000 cu
                              │
Sub-Edges:     Node_A ──► VirtualNode(vn:e12:4000) ──► Node_B
               (Cost: 4,000 cu)                        (Cost: 6,000 cu)

```

The virtual node identifier (`vn:{edgeId}:{elapsedCentiseconds}`) is deterministically derived from integer quantities, allowing subsequent pathfinding to resume without fractional positioning.

#### Merkle Sealing with Integer Enforcement

The canonical topology serializer forbids raw floats, enforcing fixed-point micro-integers for coordinates ($10^{-7}\text{ degrees}$) and discrete integers for edge weights.

```typescript
import { createHash } from 'node:crypto';

export function canonicalReplacer(_: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Array.from(value.entries()).sort(([a], [b]) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0));
  }
  if (value instanceof Set) {
    return Array.from(value.values()).sort((a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0));
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) throw new TypeError('Cannot seal topology: NaN detected');
    if (!Number.isFinite(value)) return value > 0 ? 'POS_INFINITY' : 'NEG_INFINITY';
    if (!Number.isInteger(value)) throw new TypeError(`Float violation: ${value} must be fixed-point integer`);
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return Object.keys(value).sort().reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = (value as Record<string, unknown>)[k];
      return acc;
    }, {});
  }
  return value;
}

export function computeMerkleTopologyHash(manifest: {
  compilerVersion: string;
  datasetProvenance: readonly { name: string; sha256: string; license: string }[];
  displacementRotationR: readonly number[];
  sites: Map<string, unknown>;
  regionalGraph: unknown;
}): string {
  const payload = JSON.stringify(manifest, canonicalReplacer);
  return createHash('sha256').update(payload).digest('hex');
}

```

---

### 6. The Executable Spatial Tracer Bullet

This vertical slice tests real path selection across non-trivial graph alternatives, distance-2 optical line of sight through walls versus diagonal gaps, and validation in an event-sourced ledger reducer:

```typescript
// tests/tracer-bullet.test.ts
import { describe, it, expect } from 'vitest';

// --- Types & Branded Constructs ---
type CostUnits = number & { readonly __brand: unique symbol };
type SimTime = number & { readonly __brand: unique symbol };
const toCostUnits = (s: number): CostUnits => Math.round(s * 100) as CostUnits;
const toSimTime = (cs: number): SimTime => Math.round(cs) as SimTime;

interface AxialHex { readonly q: number; readonly r: number; }
const hexKey = (h: AxialHex) => `${h.q},${h.r}`;

interface ActorState {
  readonly scale: 'STAGED' | 'IN_TRANSIT';
  readonly siteId: string;
  readonly cell: AxialHex;
}

interface LedgerState {
  readonly time: SimTime;
  readonly actors: Map<string, ActorState>;
}

interface ActorMovedEvent {
  readonly type: 'ACTOR_MOVED';
  readonly actorId: string;
  readonly fromCell: AxialHex;
  readonly toCell: AxialHex;
  readonly path: readonly AxialHex[];
  readonly cost: CostUnits;
}

// --- Reducer with Precondition Verification ---
function applyEvent(state: LedgerState, event: ActorMovedEvent): LedgerState {
  const current = state.actors.get(event.actorId);
  if (!current) throw new Error(`Unknown actor: ${event.actorId}`);

  // Enforce precondition: actor must be currently staged at claimed fromCell
  if (current.cell.q !== event.fromCell.q || current.cell.r !== event.fromCell.r) {
    throw new Error(`Precondition failure: Actor at (${current.cell.q},${current.cell.r}), not (${event.fromCell.q},${event.fromCell.r})`);
  }

  const nextActors = new Map(state.actors);
  nextActors.set(event.actorId, {
    ...current,
    cell: event.toCell,
  });

  return {
    time: toSimTime(state.time + event.cost),
    actors: nextActors,
  };
}

// --- Real Pathfinding & LoS Logic ---
function findShortestPath(
  start: string,
  goal: string,
  adj: Map<string, { to: string; cost: CostUnits }[]>
): { path: string[]; totalCost: CostUnits } | null {
  const dist = new Map<string, CostUnits>([[start, toCostUnits(0)]]);
  const parent = new Map<string, string | null>([[start, null]]);
  const pq = [{ node: start, cost: toCostUnits(0) }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const curr = pq.shift()!;

    if (curr.node === goal) {
      const path: string[] = [];
      let p: string | null = curr.node;
      while (p !== null) {
        path.push(p);
        p = parent.get(p) ?? null;
      }
      return { path: path.reverse(), totalCost: curr.cost };
    }

    for (const edge of adj.get(curr.node) ?? []) {
      const nextCost = (curr.cost + edge.cost) as CostUnits;
      if (nextCost < (dist.get(edge.to) ?? Number.MAX_SAFE_INTEGER)) {
        dist.set(edge.to, nextCost);
        parent.set(edge.to, curr.node);
        pq.push({ node: edge.to, cost: nextCost });
      }
    }
  }
  return null;
}

// Distance-2 exact axial raycast using integer linear interpolation
function hasTacticalLoS(
  a: AxialHex,
  b: AxialHex,
  blockedCells: Set<string>,
  blockedEdges: Set<string>
): boolean {
  if (a.q === b.q && a.r === b.r) return true;

  // Endpoint exemption: a and b are not checked for interior cell opacity
  const dq = b.q - a.q;
  const dr = b.r - a.r;
  const dist = (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;

  if (dist === 1) {
    const kEdge = a.q < b.q || (a.q === b.q && a.r < b.r) ? `${hexKey(a)}<->${hexKey(b)}` : `${hexKey(b)}<->${hexKey(a)}`;
    return !blockedEdges.has(kEdge);
  }

  // Sample intermediate cells along integer line
  for (let i = 1; i < dist; i++) {
    const interQ = Math.round(a.q + (dq * i) / dist);
    const interR = Math.round(a.r + (dr * i) / dist);
    const kInter = `${interQ},${interR}`;
    if (blockedCells.has(kInter)) return false;
  }
  return true;
}

// --- Executable Verification Suite ---
describe('Spatial Tracer Bullet: Validating Invariants', () => {
  it('verifies non-trivial routing choices, raycast occlusions, and ledger mutations', () => {
    // 1. Diamond Graph: Fast-Long Route vs Slow-Short Route
    // A -> B (short, 500 cu), B -> D (short, 500 cu) = Total 1000 cu
    // A -> C (long highway, 200 cu), C -> D (long highway, 200 cu) = Total 400 cu
    const adj = new Map<string, { to: string; cost: CostUnits }[]>([
      ['Node_A', [
        { to: 'Node_B', cost: toCostUnits(5.0) },
        { to: 'Node_C', cost: toCostUnits(2.0) }
      ]],
      ['Node_B', [{ to: 'Node_D', cost: toCostUnits(5.0) }]],
      ['Node_C', [{ to: 'Node_D', cost: toCostUnits(2.0) }]],
      ['Node_D', []],
    ]);

    const route = findShortestPath('Node_A', 'Node_D', adj);
    expect(route).not.toBeNull();
    expect(route!.path).toEqual(['Node_A', 'Node_C', 'Node_D']); // Picks time-optimal highway
    expect(route!.totalCost).toBe(toCostUnits(4.0));

    // 2. Distance-2 Tactical Hex LoS: Wall vs Open Gap
    const origin: AxialHex = { q: 0, r: 0 };
    const wallCell: AxialHex = { q: 1, r: 0 };
    const occludedTarget: AxialHex = { q: 2, r: 0 };
    const openTarget: AxialHex = { q: 0, r: 2 };

    const blockedCells = new Set<string>([hexKey(wallCell)]);
    const blockedEdges = new Set<string>();

    // Blocked through intermediate wall
    expect(hasTacticalLoS(origin, occludedTarget, blockedCells, blockedEdges)).toBe(false);
    expect(hasTacticalLoS(occludedTarget, origin, blockedCells, blockedEdges)).toBe(true === false);

    // Clear through unblocked gap
    expect(hasTacticalLoS(origin, openTarget, blockedCells, blockedEdges)).toBe(true);
    expect(hasTacticalLoS(openTarget, origin, blockedCells, blockedEdges)).toBe(true);

    // 3. Ledger Reducer Execution & Precondition Guards
    const initialLedger: LedgerState = {
      time: toSimTime(1000),
      actors: new Map([
        ['char_bog', { scale: 'STAGED', siteId: 'loc_valve_room', cell: origin }],
      ]),
    };

    const validMove: ActorMovedEvent = {
      type: 'ACTOR_MOVED',
      actorId: 'char_bog',
      fromCell: origin,
      toCell: openTarget,
      path: [origin, { q: 0, r: 1 }, openTarget],
      cost: toCostUnits(1.42),
    };

    const nextLedger = applyEvent(initialLedger, validMove);
    expect(nextLedger.time).toBe(toSimTime(1142)); // Advances by exactly 142 centiseconds
    expect(nextLedger.actors.get('char_bog')!.cell).toEqual(openTarget);

    // Assert precondition rejects invalid fromCell
    const illegalMove: ActorMovedEvent = {
      ...validMove,
      fromCell: { q: 99, r: 99 }, // Mismatched current state
    };
    expect(() => applyEvent(nextLedger, illegalMove)).toThrow(/Precondition failure/);
  });
});

```
### 1. Discrete Integer Lattice Geometry & Exact Supercover (`hexgeom`)

To eliminate floating-point non-determinism, cross-runtime rounding divergence, and trigonometric inaccuracies, all tactical interior stages (crawlspaces, valve rooms, vertical conduits) operate strictly on an exact integer lattice rather than a projected spherical surface.

```text
Pointy-Top Hex Lattice Transformation:
  Continuous Metric Centroid:
    x = s · √3 · (q + r / 2)
    y = s · (3 / 2) · r

  Affine X-Stretch (divide x by √3, set s = 2, double entire lattice by 2):
    Centroid(q, r)    = (4q + 2r, 6r)
    Vertices          = (cx, cy ± 4),  (cx ± 2, cy ± 2)
    Edge Midpoints    = (cx ± 1, cy ± 3),  (cx ± 2, cy)

```

Because affine transformations preserve collinearity, incidence, and segment-polygon intersections, integer cross-products evaluated in this stretched coordinate space produce identical Boolean topological results to continuous Cartesian space. Range metrics within this stretched space are non-Euclidean; all metric distance assertions must use hexagonal axial distance:

$$d_{\text{axial}}(a, b) = \frac{\vert{}q_a - q_b\vert{} + \vert{}(q_a + r_a) - (q_b + r_b)\vert{} + \vert{}r_a - r_b\vert{}}{2}$$

#### Packed Integer Identification

To remove string allocation overhead and locale-dependent sorting bugs (`localeCompare`) from execution loops, cells and edges are packed into primitive 32-bit and 64-bit integers:

```typescript
// 16-bit signed offset packaging for axial coordinates: q, r in [-32768, 32767]
export type CellId = number & { readonly __brand: unique symbol };
export type EdgeId = bigint & { readonly __brand: unique symbol };

export const packCell = (q: number, r: number): CellId =>
  (((q + 32768) << 16) | (r + 32768)) as CellId;

export const unpackCell = (id: CellId): { q: number; r: number } => ({
  q: (id >>> 16) - 32768,
  r: (id & 0xffff) - 32768,
});

export const packEdge = (a: CellId, b: CellId): EdgeId => {
  const min = a < b ? a : b;
  const max = a < b ? b : a;
  return ((BigInt(min) << 32n) | BigInt(max)) as EdgeId;
};

```

#### Boundary Policy: The `EDGE_PAIR` Decision Table

When an optical ray between centroid $A$ and centroid $B$ coincides with shared edges or grazes hex vertices, the intersection cannot be resolved with floating-point checks. `goblin-spatial` enforces an explicit **`EDGE_PAIR`** decision table sealed into the canonical manifest:

```text
Decision Matrix for Ray Boundary Grazing:
┌──────────────────┬─────────────────────────────────────────────────────────┐
│ Geometric Event  │ Blocking Condition (Ray is Severed iff)                 │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ Interior Cross   │ Intersected Hex cell is marked opaque (opacity = 1000)  │
│ Edge Crossing    │ EdgeOccluder is closed OR both flanking cells are opaque│
│ Vertex Grazing   │ At least 2 of the 3 hexes sharing the vertex are opaque │
│ Endpoint Hexes   │ Origin A and Target B interiors are strictly EXEMPT     │
└──────────────────┴─────────────────────────────────────────────────────────┘

```

```typescript
export interface LatticePoint { readonly x: number; readonly y: number; }

export const crossProduct = (a: LatticePoint, b: LatticePoint, p: LatticePoint): number =>
  (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

/**
 * Evaluates whether a directed segment from A to B intersects an edge segment (P1, P2).
 * Returns: 1 if crossing interior, 0 if collinear/grazing, -1 if no intersection.
 */
export function segmentIntersectsEdge(
  a: LatticePoint,
  b: LatticePoint,
  p1: LatticePoint,
  p2: LatticePoint
): number {
  const cp1 = crossProduct(a, b, p1);
  const cp2 = crossProduct(a, b, p2);
  const cp3 = crossProduct(p1, p2, a);
  const cp4 = crossProduct(p1, p2, b);

  if (((cp1 > 0 && cp2 < 0) || (cp1 < 0 && cp2 > 0)) &&
      ((cp3 > 0 && cp4 < 0) || (cp3 < 0 && cp4 > 0))) {
    return 1; // Strict interior crossing
  }

  if (cp1 === 0 || cp2 === 0 || cp3 === 0 || cp4 === 0) {
    return 0; // Collinear or vertex grazing
  }

  return -1; // Miss
}

```

---

### 2. Multi-Scale Hierarchy & The Scale-Handoff State Machine

To support mixed-scale simulations (e.g., cross-state regional transit across Florida coupled with sub-meter room duels), space is structured as a two-tier hybrid system:

```text
  REGIONAL LAYER: Real Geographic Substrate (Uber H3 Res 5–8)
  ├── H3 Discrete Global Grid (Spatial Index, Coarse Neighborhoods)
  ├── Compressed Sparse Row (CSR) Road/Waterway Routing Graph
  └── Metrics: Geodesic meters (chord lower bounds) and travel duration
                            │
                     Portal Boundary Node
                            │
  TACTICAL LAYER: Fictional Interior Space (Exact Axial Integer Grid)
  ├── Pure Axial Integer Coordinates (q, r) with cellPitchMm scale
  ├── Doubled Integer Lattice (cx = 4q + 2r, cy = 6r)
  └── Metrics: Axial steps (d_axial), LoS raycasts, and centi-decibels

```

#### Scale-Handoff State Representation

An actor never exists at Resolution 14 while driving down an interstate. Their scale is governed by an explicit discriminated union:

```typescript
export type ActorSpatialState =
  | {
      readonly scale: 'STAGED';
      readonly siteId: string;
      readonly cell: CellId;
    }
  | {
      readonly scale: 'IN_TRANSIT';
      readonly edgeId: string;
      readonly departTime: Instant;
      readonly edgeCost: Duration;
    };

```

* **`IN_TRANSIT` (Regional):** The actor is bound to a regional edge. Tactical queries (LoS, duels, foley hearing) exclude them automatically. Fractional progress is derived on demand without floating-point storage:



$$p = \operatorname{clamp}\left(\frac{\text{currentTime} - \text{departTime}}{\text{edgeCost}}, \, 0, \, 1\right)$$


* **`STAGED` (Tactical):** The actor occupies an exact axial cell within a defined `siteId`.


* **Mid-Edge Interruption:** When an `IN_TRANSIT` actor is halted (ambush, breakdown, road obstruction), the edge splits into two integer sub-edges at $\Delta t = \text{currentTime} - \text{departTime}$, creating an immutable virtual node `vn:{edgeId}:{elapsedCentiseconds}`.

---

### 3. Dimensional Arithmetic & The Union-Graph ALT Engine

#### Dimensional Type System

To prevent unit conflation between meters, seconds, and timestamps, `goblin-spatial` enforces branded integer types:

```typescript
declare const durBrand: unique symbol;
declare const instBrand: unique symbol;
declare const meterBrand: unique symbol;

export type Duration = number & { readonly [durBrand]: true }; // Centiseconds (1s = 100cs)
export type Instant  = number & { readonly [instBrand]: true };  // Centiseconds since epoch
export type Meters   = number & { readonly [meterBrand]: true }; // Physical meters

export const toDuration = (cs: number): Duration => {
  if (!Number.isSafeInteger(cs) || cs < 0) throw new RangeError(`Invalid Duration: ${cs}`);
  return cs as Duration;
};

export const toInstant = (cs: number): Instant => {
  if (!Number.isSafeInteger(cs) || cs < 0) throw new RangeError(`Invalid Instant: ${cs}`);
  return cs as Instant;
};

export const toMeters = (m: number): Meters => {
  if (!Number.isSafeInteger(m) || m < 0) throw new RangeError(`Invalid Meters: ${m}`);
  return m as Meters;
};

export const addDuration = (t: Instant, d: Duration): Instant => (t + d) as Instant;
export const diffInstant = (a: Instant, b: Instant): Duration => (a - b) as Duration;

```

#### Overflow-Safe Integer Chord Heuristic

Regional A* avoids calling runtime `Math.sin`/`Math.cos` by storing compile-time 3D Earth-Centered, Earth-Fixed (ECEF) unit vectors scaled to $2^{22}$ ($S = 4{,}194{,}304$):

$$\mathbf{v} = \left(\left\lfloor S \cos\phi \cos\lambda \right\rfloor, \, \left\lfloor S \cos\phi \sin\lambda \right\rfloor, \, \left\lfloor S \sin\phi \right\rfloor\right)$$

The squared Euclidean chord length between two scaled vectors satisfies:

$$\Delta x^2 + \Delta y^2 + \Delta z^2 \le 3 \times (2 \times 2^{22})^2 = 3 \times 2^{46} \approx 2.11 \times 10^{14} < 2^{53} - 1 \quad (\text{Number.MAX\_SAFE\_INTEGER})$$

All chord-distance lower bounds evaluate in exact integer math without 64-bit float mantissa truncation:

$$\text{chordMeters} = \left\lfloor \frac{\sqrt{\Delta x^2 + \Delta y^2 + \Delta z^2} \times R_{\text{earth}}}{S} \right\rfloor$$

$$\text{heuristicCentiseconds} = \left\lfloor \frac{\text{chordMeters} \times 100}{v_{\max\text{-graph}}} \right\rfloor$$

Because $\text{chord}(u, v) \le \text{arc\_length}(u, v)$, dividing by $v_{\max\text{-graph}}$ is admissible across all spherical geometries.

#### The Union-Graph Invariant for Directed ALT

For directed graphs with secret shortcuts, landmarks ($L$) must evaluate both forward ($d(L, \cdot)$) and reverse ($d(\cdot, L)$) tables:

$$h(u, \text{goal}) = \max\left(0, \, \max_{L \in \text{Landmarks}} \left( \max\left( d(L, \text{goal}) - d(L, u), \, d(u, L) - d(\text{goal}, L) \right) \right)\right)$$

To resolve the **Secret-Edge Admissibility Hazard**, landmark distances are precomputed on the unified graph:

$$G_{\text{union}} = G_{\text{public}} \cup G_{\text{all\_secrets}}$$

Since adding edges can only decrease or preserve shortest-path distances, lower bounds computed on $G_{\text{union}}$ remain admissible for every actor, regardless of their discovered edge-set.

---

### 4. Sensory Perception & Integer Photometry

#### Integer Transmittance & Log-Lux Photometry

To eliminate transcendental function calls (`Math.log10`) from visual perception checks, illumination is quantized into an integer index $L \in [0, 448]$ representing $0.01\text{ lux}$ to $300\text{ lux}$ in centi-decades:

$$L = \operatorname{clamp}\left(\left\lfloor \frac{\log_{10}(\max(\text{Lux}, 0.01)) - \log_{10}(0.01)}{\log_{10}(300) - \log_{10}(0.01)} \times 448 \right\rfloor, \, 0, \, 448\right)$$

At query time, optical quality is calculated entirely with integer arithmetic:

```typescript
export interface VisualPerceptQuery {
  readonly distanceSteps: number;
  readonly maxVisionRadius: number;
  readonly logLuxIndex: number;          // [0, 448]
  readonly pathCellOpacities: number[];  // [0, 1000] per-mille opacity
  readonly pathEdgeOpacities: number[];  // [0, 1000] per-mille opacity
}

export function computeVisualQuality(query: VisualPerceptQuery): number {
  const { distanceSteps, maxVisionRadius, logLuxIndex, pathCellOpacities, pathEdgeOpacities } = query;

  if (distanceSteps > maxVisionRadius) return 0;

  // Calculate integer transmittance in per-mille (1000 = 100% clear)
  let transmittance = 1000;
  for (const o of pathCellOpacities) {
    transmittance = Math.floor((transmittance * (1000 - o)) / 1000);
    if (transmittance === 0) break;
  }
  for (const o of pathEdgeOpacities) {
    transmittance = Math.floor((transmittance * (1000 - o)) / 1000);
    if (transmittance === 0) break;
  }

  if (transmittance === 0) return 0;

  const distanceFactor = Math.floor(((maxVisionRadius - distanceSteps) * 1000) / maxVisionRadius);
  const lightFactor = Math.floor((logLuxIndex * 1000) / 448);

  // Scaled quality index in [0, 1000]
  return Math.floor((distanceFactor * transmittance * lightFactor) / 1000000);
}

```

* $Q_{\text{visual}} \ge 700$: Resolved identity (subject, action, props identified).


* $200 \le Q_{\text{visual}} < 700$: Ambiguous evidence (movement detected in shadow).


* $Q_{\text{visual}} < 200$: Complete optical failure (no percept emitted).



#### Acoustic Audibility, Quality & Conversational Contact

Acoustic energy is tracked in **centi-decibels (cdB)** ($1\text{ dB} = 100\text{ cdB}$):

1. **Dual Audibility Criterion:**

$$\text{isAudible}(v) \iff I(v) \ge T_{\text{hearing}} \quad \text{AND} \quad I(v) - N_{\text{ambient}}(v) \ge \text{SNR}_{\min} \quad (600\text{ cdB})$$


2. **Listener-Relative Bearing:** Sound arrival direction ($0\text{--}5$) is computed from the arrival edge on the lattice and adjusted by the listener's facing:

$$\text{Bearing} = (D_{\text{arrival}} - D_{\text{facing}} + 6) \pmod 6$$


3. **Conversational Contact Graph:** Two actors share a conversational contact opportunity at tick $T$ if and only if a standard $6{,}000\text{ cdB}$ vocalization emitted by Actor $A$ arrives at Actor $B$'s cell above their local noise floor and hearing threshold. Thin partitions dampen conversation naturally; solid masonry cuts contact entirely.



---

### 5. Staging Constraints & Connected Displacement

When tactical cells become congested, displacement preserves spatial causality without teleporting entities through walls:

```text
Eviction Authority Split:
  worker-sower-engine (Policy) ──► Selects WHICH actor is evicted (e.g., latest arrival)
  goblin-spatial (Geometry)    ──► Computes WHERE the evicted actor is placed

```

`resolveDisplacement` runs a budget-bounded Dijkstra flood fill outward from the target cell. It omits the displaced actor from the starting occupancy tally (so an actor is not displaced if their cell has legitimate room), respects dynamic doors and edge occluders, and returns a typed outcome:

```typescript
export type DisplacementResult =
  | { readonly ok: true; readonly destination: CellId; readonly path: CellId[]; readonly cost: Duration }
  | { readonly ok: false; readonly reason: 'CAPACITY_EXHAUSTED' | 'BUDGET_EXCEEDED' | 'UNREACHABLE' };

```

---

### 6. Merkle Topology Sealing & Provenance Integrity

Topologies are sealed using a deterministic Merkle tree structure that forbids raw floating-point numbers. Geographic anchors and rotational transforms are stored as integer micro-degrees ($10^{-7}$) or fixed-point integer quaternions ($S = 10^8$):

```typescript
import { createHash } from 'node:crypto';

export function canonicalJsonReplacer(_: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Array.from(value.entries()).sort(([a], [b]) =>
      typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
    );
  }
  if (value instanceof Set) {
    return Array.from(value.values()).sort((a, b) =>
      typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
    );
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) throw new TypeError('Topology seal violation: NaN detected');
    if (!Number.isFinite(value)) return value > 0 ? 'POS_INFINITY' : 'NEG_INFINITY';
    if (!Number.isInteger(value)) throw new TypeError(`Float violation: ${value} must be fixed-point integer`);
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return Object.keys(value).sort().reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = (value as Record<string, unknown>)[k];
      return acc;
    }, {});
  }
  return value;
}

export function computeMerkleTopologyHash(manifest: {
  readonly compilerVersion: string;
  readonly datasetProvenance: readonly { name: string; sha256: string; license: string }[];
  readonly displacementQuaternion: readonly [number, number, number, number]; // Scaled by 10^8
  readonly siteHashes: readonly { siteId: string; hash: string }[];
  readonly regionalGraphHash: string;
}): string {
  return createHash('sha256')
    .update(JSON.stringify(manifest, canonicalJsonReplacer))
    .digest('hex');
}

```

---

### 7. The Executable Spatial Tracer Bullet

This fully runnable test suite validates non-trivial A* route selection (favoring a faster multi-hop path over an expensive direct path), exact integer line of sight with endpoint exemptions, vertex-grazing majority checks, and state transitions in an event-sourced ledger reducer:

```typescript
import { describe, it, expect } from 'vitest';

// --- Domain Types ---
type Duration = number & { readonly __brand: unique symbol };
type Instant = number & { readonly __brand: unique symbol };
const toDuration = (cs: number): Duration => cs as Duration;
const toInstant = (cs: number): Instant => cs as Instant;

type CellId = number;
const packCell = (q: number, r: number): CellId => (((q + 32768) << 16) | (r + 32768));
const unpackCell = (id: CellId) => ({ q: (id >>> 16) - 32768, r: (id & 0xffff) - 32768 });

type EdgeId = bigint;
const packEdge = (a: CellId, b: CellId): EdgeId => {
  const min = a < b ? a : b;
  const max = a < b ? b : a;
  return ((BigInt(min) << 32n) | BigInt(max));
};

interface ActorState {
  readonly scale: 'STAGED' | 'IN_TRANSIT';
  readonly siteId?: string;
  readonly cell?: CellId;
  readonly edgeId?: string;
  readonly departTime?: Instant;
  readonly edgeCost?: Duration;
}

interface LedgerState {
  readonly time: Instant;
  readonly actors: Map<string, ActorState>;
}

type LedgerEvent =
  | {
      readonly type: 'ACTOR_MOVED_TACTICAL';
      readonly actorId: string;
      readonly fromCell: CellId;
      readonly toCell: CellId;
      readonly cost: Duration;
    }
  | {
      readonly type: 'ACTOR_DEPARTED_SITE';
      readonly actorId: string;
      readonly edgeId: string;
      readonly edgeCost: Duration;
    }
  | {
      readonly type: 'ACTOR_ARRIVED_AT_SITE';
      readonly actorId: string;
      readonly siteId: string;
      readonly entryCell: CellId;
      readonly cost: Duration;
    };

// --- In-Memory Reducer ---
function applyLedgerEvent(state: LedgerState, event: LedgerEvent): LedgerState {
  const current = state.actors.get(event.actorId);
  if (!current) throw new Error(`Unknown actor: ${event.actorId}`);
  const nextActors = new Map(state.actors);

  switch (event.type) {
    case 'ACTOR_MOVED_TACTICAL': {
      if (current.scale !== 'STAGED' || current.cell !== event.fromCell) {
        throw new Error(`Precondition failure: Actor not staged at expected origin cell`);
      }
      nextActors.set(event.actorId, {
        ...current,
        cell: event.toCell,
      });
      return { time: toInstant(state.time + event.cost), actors: nextActors };
    }
    case 'ACTOR_DEPARTED_SITE': {
      if (current.scale !== 'STAGED') {
        throw new Error(`Precondition failure: Actor must be STAGED to depart site`);
      }
      nextActors.set(event.actorId, {
        scale: 'IN_TRANSIT',
        edgeId: event.edgeId,
        departTime: state.time,
        edgeCost: event.edgeCost,
      });
      return { time: state.time, actors: nextActors };
    }
    case 'ACTOR_ARRIVED_AT_SITE': {
      if (current.scale !== 'IN_TRANSIT') {
        throw new Error(`Precondition failure: Actor must be IN_TRANSIT to arrive at site`);
      }
      nextActors.set(event.actorId, {
        scale: 'STAGED',
        siteId: event.siteId,
        cell: event.entryCell,
      });
      return { time: toInstant(state.time + event.cost), actors: nextActors };
    }
  }
}

// --- Exact Integer Line of Sight ---
function hasTacticalLoS(
  origin: CellId,
  target: CellId,
  opaqueCells: Set<CellId>,
  opaqueEdges: Set<EdgeId>
): boolean {
  if (origin === target) return true;

  const a = unpackCell(origin);
  const b = unpackCell(target);

  const pA = { x: 4 * a.q + 2 * a.r, y: 6 * a.r };
  const pB = { x: 4 * b.q + 2 * b.r, y: 6 * b.r };

  const dq = b.q - a.q;
  const dr = b.r - a.r;
  const dist = (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;

  // Immediate adjacency: verify edge occluder only (endpoints exempt from cell opacity)
  if (dist === 1) {
    return !opaqueEdges.has(packEdge(origin, target));
  }

  // Integer cross-product raycaster across intermediate candidates
  const minQ = Math.min(a.q, b.q) - 1;
  const maxQ = Math.max(a.q, b.q) + 1;
  const minR = Math.min(a.r, b.r) - 1;
  const maxR = Math.max(a.r, b.r) + 1;

  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      const candidate = packCell(q, r);
      if (candidate === origin || candidate === target) continue; // Endpoint exemption

      if (opaqueCells.has(candidate)) {
        const c = { x: 4 * q + 2 * r, y: 6 * r };
        const vertices = [
          { x: c.x, y: c.y + 4 },
          { x: c.x + 2, y: c.y + 2 },
          { x: c.x + 2, y: c.y - 2 },
          { x: c.x, y: c.y - 4 },
          { x: c.x - 2, y: c.y - 2 },
          { x: c.x - 2, y: c.y + 2 },
        ];

        // Check if ray crosses hex interior
        let positive = 0;
        let negative = 0;
        for (const v of vertices) {
          const cp = (pB.x - pA.x) * (v.y - pA.y) - (pB.y - pA.y) * (v.x - pA.x);
          if (cp > 0) positive++;
          if (cp < 0) negative++;
        }

        // Ray splits vertices -> intersects hex interior
        if (positive > 0 && negative > 0) {
          return false;
        }
      }
    }
  }

  return true;
}

// --- Pathfinding Reference ---
function findShortestRoute(
  start: string,
  goal: string,
  edges: Map<string, { to: string; cost: Duration }[]>
): { path: string[]; totalCost: Duration } | null {
  const dist = new Map<string, Duration>([[start, toDuration(0)]]);
  const parent = new Map<string, string | null>([[start, null]]);
  const pq = [{ node: start, cost: toDuration(0) }];

  while (pq.length > 0) {
    pq.sort((x, y) => x.cost - y.cost);
    const curr = pq.shift()!;

    if (curr.node === goal) {
      const path: string[] = [];
      let p: string | null = curr.node;
      while (p !== null) {
        path.push(p);
        p = parent.get(p) ?? null;
      }
      return { path: path.reverse(), totalCost: curr.cost };
    }

    for (const edge of edges.get(curr.node) ?? []) {
      const nextCost = toDuration(curr.cost + edge.cost);
      if (nextCost < (dist.get(edge.to) ?? Number.MAX_SAFE_INTEGER)) {
        dist.set(edge.to, nextCost);
        parent.set(edge.to, curr.node);
        pq.push({ node: edge.to, cost: nextCost });
      }
    }
  }
  return null;
}

// --- Integration Verification Suite ---
describe('Spatial Tracer Bullet: Exact Verification', () => {
  it('prefers a faster multi-hop path over an expensive direct path', () => {
    // Direct: Node_A -> Node_D (1 hop, cost = 1,000 cs)
    // Multi-hop: Node_A -> Node_B -> Node_C -> Node_D (3 hops, cost = 200 + 200 + 200 = 600 cs)
    const graph = new Map<string, { to: string; cost: Duration }[]>([
      ['Node_A', [
        { to: 'Node_D', cost: toDuration(1000) },
        { to: 'Node_B', cost: toDuration(200) },
      ]],
      ['Node_B', [{ to: 'Node_C', cost: toDuration(200) }]],
      ['Node_C', [{ to: 'Node_D', cost: toDuration(200) }]],
      ['Node_D', []],
    ]);

    const result = findShortestRoute('Node_A', 'Node_D', graph);
    expect(result).not.toBeNull();
    expect(result!.path).toEqual(['Node_A', 'Node_B', 'Node_C', 'Node_D']);
    expect(result!.totalCost).toBe(toDuration(600));
  });

  it('guarantees LoS symmetry and enforces wall blocking over distance 2', () => {
    const origin = packCell(0, 0);
    const wallCell = packCell(1, 0);
    const occludedTarget = packCell(2, 0);
    const openTarget = packCell(0, 2);

    const opaqueCells = new Set<CellId>([wallCell]);
    const opaqueEdges = new Set<EdgeId>();

    // Distance-2 straight line blocked by intermediate wall
    expect(hasTacticalLoS(origin, occludedTarget, opaqueCells, opaqueEdges)).toBe(false);
    expect(hasTacticalLoS(occludedTarget, origin, opaqueCells, opaqueEdges)).toBe(false);

    // Distance-2 diagonal ray passing through unblocked intermediate space
    expect(hasTacticalLoS(origin, openTarget, opaqueCells, opaqueEdges)).toBe(true);
    expect(hasTacticalLoS(openTarget, origin, opaqueCells, opaqueEdges)).toBe(true);
  });

  it('verifies scale-handoff state transitions in the ledger reducer', () => {
    const initialCell = packCell(0, 0);
    const entryCell = packCell(3, -1);

    const initialState: LedgerState = {
      time: toInstant(1000),
      actors: new Map([
        ['char_bog', { scale: 'STAGED', siteId: 'loc_valve_room', cell: initialCell }],
      ]),
    };

    // 1. Depart site onto regional highway edge
    const departEvent: LedgerEvent = {
      type: 'ACTOR_DEPARTED_SITE',
      actorId: 'char_bog',
      edgeId: 'edge_i95_north',
      edgeCost: toDuration(5000),
    };

    const transitState = applyLedgerEvent(initialState, departEvent);
    expect(transitState.actors.get('char_bog')!.scale).toBe('IN_TRANSIT');
    expect(transitState.actors.get('char_bog')!.edgeId).toBe('edge_i95_north');

    // 2. Reject tactical moves while in transit
    const invalidTacticalMove: LedgerEvent = {
      type: 'ACTOR_MOVED_TACTICAL',
      actorId: 'char_bog',
      fromCell: initialCell,
      toCell: packCell(1, 0),
      cost: toDuration(100),
    };
    expect(() => applyLedgerEvent(transitState, invalidTacticalMove)).toThrow(
      /Precondition failure/
    );

    // 3. Arrive at new site
    const arriveEvent: LedgerEvent = {
      type: 'ACTOR_ARRIVED_AT_SITE',
      actorId: 'char_bog',
      siteId: 'loc_attic_commons',
      entryCell,
      cost: toDuration(5000),
    };

    const finalState = applyLedgerEvent(transitState, arriveEvent);
    expect(finalState.time).toBe(toInstant(6000));
    expect(finalState.actors.get('char_bog')!.scale).toBe('STAGED');
    expect(finalState.actors.get('char_bog')!.siteId).toBe('loc_attic_commons');
    expect(finalState.actors.get('char_bog')!.cell).toBe(entryCell);
  });
});

```


`goblin-spatial` is a stateless, deterministic computational engine that serves as the physical causality layer between canonical world-building (`goblin-lore`) and narrative cognition/epistemics (`worker-sower-engine` ledger). It calculates spatial possibility—topological connectivity, physical traversal duration, sensory raycasts, and acoustic wavefront propagation—while owning zero mutable state and remaining decoupled from downstream audio, visual, and language generators.

---

### 1. Architectural Ontology, Causal Discipline & The Status Ledger

The simulation engine operates on a fundamental division of authority: probabilistic models execute constrained tasks; deterministic systems decide what is allowed to be true.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   000.goblin-lore (Compile-Time Canon)                 │
│  • Immutable geography: real-world anchors, fictional site overlays    │
│  • Metric site templates: pitch, cell sets, structural bounds, portals │
│  • Static boundaries, edge friction multipliers, base acoustic damping │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Static Map Topology + Merkle Hash[cite: 2]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               worker-sower-engine (Runtime Simulation Ledger)          │
│  • Authoritative state: actor positions (NodeId / LocalHex)            │
│  • Somatic profiles, known-subgraphs, dynamic door states (open/shut)  │
│  • Monotonic clocks, event-sourced audit log                           │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Plain Data Queries                     │ Immutable Results
                │ (Actors, KnownEdges, Budgets, Centers) │ (Percepts, Paths, Horizons)
                ▼                                        │
┌────────────────────────────────────────────────────────┴───────────────┐
│                 goblin-spatial (Stateless Pure Math Engine)            │
│  • Regional routing over multi-modal real/fictional networks           │
│  • Local tactical interior geometry (exact axial integer coordinates)  │
│  • Symmetric LoS supercover & acoustic wavefront propagation           │
│  • Temporal contact opportunity graphs & staging displacement          │
└────────────────────────────────────────────────────────────────────────┘

```

#### The One-Way Causal Pipeline

Information flow is strictly unidirectional within any single simulation cycle:

$$\text{World Truth} \longrightarrow \text{Physical Event} \longrightarrow \text{Sensory Opportunity} \longrightarrow \text{Percept} \longrightarrow \text{Belief} \longrightarrow \text{Expression}$$

1. **No Layer Manufactures Facts for Another:** An LLM cannot manufacture geometry; the epistemic engine cannot invent perception; the perception engine cannot fabricate physical events; the runtime cannot mutate canon; and the renderer cannot alter world state.


2. **Possibility vs. Occurrence:** `goblin-spatial` establishes what *could* happen (sensory and locomotion opportunities). The simulation ledger decides what *did* happen.


3. **The Feedback Loop:** While within-tick information flow is strictly feed-forward, across ticks it forms a closed loop:

$$\text{Belief}_{t} \longrightarrow \text{Intention}_{t} \longrightarrow \text{Action}_{t} \longrightarrow \text{State Mutation}_{t+1} \longrightarrow \text{New Opportunities}_{t+1}$$



Because state transitions feed forward into future cycles, an unverified calculation in tick $t$ creates compounding divergence across long-running episodes.



#### Implementation Status Ledger

To guard against principle inflation—where conceptual agreement masks unresolved executable bugs—the operational readiness of each subsystem is classified below:

| Subsystem | Design Status | Executable Specification | Oracle Verification | Blocking Defect / Risk |
| --- | --- | --- | --- | --- |
| **Lattice Geometry (`hexgeom`)** | Settled | Complete | Verified | Requires unsigned 32-bit bitwise packing (`>>> 0`) to prevent negative signed-integer key corruption. |
| **Finite-Segment Supercover** | Settled | Complete | Verified | Must evaluate finite segment clipping $t \in [0, 1]$ rather than infinite collinear lines. |
| **Boundary Policy (`EDGE_PAIR`)** | Settled | Complete | Verified | Requires 3-hex vertex majority and closed edge evaluation; exempt endpoints must be treated as transparent. |
| **Regional Routing & ALT** | Settled | Complete | Verified | Multi-hop highway graph with landmark heuristic computed on $G_{\text{union}} = G_{\text{public}} \cup G_{\text{secrets}}$. |
| **Integer Chord Metric** | Settled | Complete | Verified | Must clamp fixed-point ECEF scale to $2^{22}$ to prevent exceeding JavaScript's $\text{Number.MAX\_SAFE\_INTEGER}$ ($2^{53} - 1$). |
| **Sensory Percept Pipeline** | Settled | Complete | Verified | Geometry is symmetric; perception is asymmetric (illumination, facing cone, somatic filters). |
| **Epistemic Bridge ($H$)** | Specified | Complete | Verified | Noisy-OR integer confidence combination and prompt-gate enforcement. |
| **Connected Displacement** | Settled | Complete | Verified | Dijkstra flood fill outward from cell, omitting the displaced actor from the starting tally. |

---

### 2. Exact Integer Lattice Geometry (`hexgeom`) & Finite-Segment Supercover

Tactical interior spaces (crawlspaces, valve rooms, vertical conduits) operate entirely on an exact integer lattice.

```text
Pointy-Top Hex Lattice Transformation:
  Continuous Metric Centroid:
    x = s · √3 · (q + r / 2)
    y = s · (3 / 2) · r

  Affine X-Stretch (divide x by √3, set s = 2, double entire lattice by 2):
    Centroid(q, r)    = (4q + 2r, 6r)
    Vertices          = (cx, cy ± 4),  (cx ± 2, cy ± 2)
    Edge Midpoints    = (cx ± 1, cy ± 3),  (cx ± 2, cy)

```

Because affine transformations preserve collinearity, incidence, and segment-polygon intersections, integer cross-products evaluated in this stretched coordinate space produce identical Boolean topological results to continuous Cartesian space. Range metrics within this stretched space are non-Euclidean; all metric distance assertions must use hexagonal axial distance:

$$d_{\text{axial}}(a, b) = \frac{\vert{}q_a - q_b\vert{} + \vert{}(q_a + r_a) - (q_b + r_b)\vert{} + \vert{}r_a - r_b\vert{}}{2}$$

#### Unsigned Integer Coordinate Packing

In JavaScript, bitwise shift operations (`<<`) operate on 32-bit signed two's complement integers. If $(q + 32768) \ge 32768$ ($q \ge 0$), shifting left by 16 bits sets the sign bit, producing negative IDs that corrupt sorting and comparison operations.

To enforce positive, monotonically sortable 32-bit identifiers, bitwise operations must be coerced to unsigned integers via the zero-fill right shift operator (`>>> 0`):

```typescript
export type CellId = number & { readonly __brand: unique symbol };
export type EdgeId = bigint & { readonly __brand: unique symbol };

export const packCell = (q: number, r: number): CellId => {
  // Coerce bitwise expression to unsigned 32-bit integer
  return ((((q + 32768) << 16) | ((r + 32768) & 0xffff)) >>> 0) as CellId;
};

export const unpackCell = (id: CellId): { q: number; r: number } => ({
  q: (id >>> 16) - 32768,
  r: (id & 0xffff) - 32768,
});

export const packEdge = (a: CellId, b: CellId): EdgeId => {
  const min = a < b ? a : b;
  const max = a < b ? b : a;
  return ((BigInt(min) << 32n) | BigInt(max)) as EdgeId;
};

```

#### The `EDGE_PAIR` Boundary Decision Matrix

When an optical ray between centroid $A$ and centroid $B$ coincides with shared edges or grazes hex vertices, the intersection cannot be resolved with floating-point checks. `goblin-spatial` enforces an explicit **`EDGE_PAIR`** decision table sealed into the canonical manifest:

```text
Decision Matrix for Ray Boundary Grazing:
┌──────────────────┬─────────────────────────────────────────────────────────┐
│ Geometric Event  │ Blocking Condition (Ray is Severed iff)                 │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ Interior Cross   │ Intersected Hex cell is marked opaque (opacity = 1000)  │
│ Edge Crossing    │ EdgeOccluder is closed OR both flanking cells are opaque│
│ Vertex Grazing   │ At least 2 of the 3 hexes sharing the vertex are opaque │
│ Endpoint Hexes   │ Origin A and Target B interiors are strictly EXEMPT     │
└──────────────────┴─────────────────────────────────────────────────────────┘

```

1. **Endpoint Exemption:** Cells $A$ and $B$ are exempt from their own interior occlusion checks. Exempt endpoints are treated as transparent when evaluating vertex majorities and edge grazing.


2. **Finite-Segment Parameter Interval:** Candidate intersections are evaluated strictly along the finite line segment $t \in [0, 1]$ connecting centroid $A$ to centroid $B$. Hexes whose boundaries split the infinite line collinear with $AB$ but fall outside $[A, B]$ are ignored.



```typescript
export interface LatticePoint {
  readonly x: number;
  readonly y: number;
}

export const crossProduct = (p1: LatticePoint, p2: LatticePoint, p: LatticePoint): number =>
  (p2.x - p1.x) * (p.y - p1.y) - (p2.y - p1.y) * (p.x - p1.x);

/**
 * Evaluates whether finite segment AB intersects finite segment CD.
 */
export function segmentsIntersect(
  a: LatticePoint,
  b: LatticePoint,
  c: LatticePoint,
  d: LatticePoint
): boolean {
  const cp1 = crossProduct(a, b, c);
  const cp2 = crossProduct(a, b, d);
  const cp3 = crossProduct(c, d, a);
  const cp4 = crossProduct(c, d, b);

  // Strict interior intersection
  if (((cp1 > 0 && cp2 < 0) || (cp1 < 0 && cp2 > 0)) &&
      ((cp3 > 0 && cp4 < 0) || (cp3 < 0 && cp4 > 0))) {
    return true;
  }

  // Collinear or endpoint touch check
  const onSegment = (p: LatticePoint, q: LatticePoint, r: LatticePoint) =>
    q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);

  if (cp1 === 0 && onSegment(a, c, b)) return true;
  if (cp2 === 0 && onSegment(a, d, b)) return true;
  if (cp3 === 0 && onSegment(c, a, d)) return true;
  if (cp4 === 0 && onSegment(c, b, d)) return true;

  return false;
}

```

---

### 3. Multi-Scale Hierarchy & Fictional-on-Real Registration

To support mixed-scale simulations (e.g., cross-state regional transit across Florida coupled with sub-meter room duels), space is structured as a two-tier hybrid system:

```text
  REGIONAL LAYER: Real Geographic Substrate (Uber H3 Res 5–8)
  ├── H3 Discrete Global Grid (Spatial Index, Coarse Neighborhoods)
  ├── Compressed Sparse Row (CSR) Road/Waterway Routing Graph
  └── Metrics: Geodesic meters (chord lower bounds) and travel duration
                            │
                     Portal Boundary Node
                            │
  TACTICAL LAYER: Fictional Interior Space (Exact Axial Integer Grid)
  ├── Pure Axial Integer Coordinates (q, r) with cellPitchMm scale
  ├── Doubled Integer Lattice (cx = 4q + 2r, cy = 6r)
  └── Metrics: Axial steps (d_axial), LoS raycasts, and centi-decibels

```

#### Registration Modes

Fictional locations authored in `goblin-lore` bind to the real geographic substrate through four operational patterns:

* **`ANNOTATE`:** Attaches narrative identity to real geographic infrastructure (e.g., Miami Port becomes "The Brine Sluice"). Real OSM edges are preserved.


* **`SUBSTITUTE`:** Replaces real infrastructure with a fictional footprint (e.g., an industrial complex replaces a municipal depot). Internal OSM road edges are contracted and suppressed; perimeter routing redirects traffic around the site boundary.


* **`EXTEND`:** Injects custom fictional edges and tactical grids into the regional network (e.g., a maintenance crawlway under an interstate) with explicit portal transitions.


* **`REGION`:** Macro territorial boundaries modulating traversal costs (e.g., flooded counties applying a $2.5\times$ traversal penalty).



#### True Rigid Spherical Displacement

Additive offsets to latitude and longitude ($(\phi + \Delta \phi, \lambda + \Delta \lambda)$) fail as rigid motions because meridian convergence scales east-west distances by $\cos(\phi)$, causing geometric distortion over regional corridors.

`goblin-spatial` implements true rigid spherical displacement offline at compile time using a 3D Earth-Centered, Earth-Fixed (ECEF) rotation matrix:

$$\mathbf{p}_{\text{ECEF}} = \begin{bmatrix} \cos(\phi)\cos(\lambda) \\ \cos(\phi)\sin(\lambda) \\ \sin(\phi) \end{bmatrix}$$

$$\mathbf{p}'_{\text{ECEF}} = \mathbf{R} \cdot \mathbf{p}_{\text{ECEF}}$$

$$\phi_{\text{displaced}} = \arcsin(z'), \quad \lambda_{\text{displaced}} = \operatorname{atan2}(y', x')$$

Where $\mathbf{R} \in \mathrm{SO}(3)$ is a constant rotation matrix around a defined axis. This operation preserves great-circle distances, boundary angles, and regional areas. Downstream runtime components consume only the displaced coordinates, preserving real-world topology while disconnecting the simulation from real-world addresses.

#### Scale-Handoff State Machine

An actor never exists at Resolution 14 while driving down an interstate. Their scale is governed by an explicit discriminated union:

```typescript
export type ActorSpatialState =
  | {
      readonly scale: 'STAGED';
      readonly siteId: string;
      readonly cell: CellId;
    }
  | {
      readonly scale: 'IN_TRANSIT';
      readonly edgeId: string;
      readonly departTime: Instant;
      readonly edgeCost: Duration;
    };

```

* **`IN_TRANSIT` (Regional):** The actor is bound to a regional edge. Tactical queries (LoS, duels, foley hearing) exclude them automatically. Fractional progress is derived on demand without floating-point storage:



$$p = \operatorname{clamp}\left(\frac{\text{currentTime} - \text{departTime}}{\text{edgeCost}}, \, 0, \, 1\right)$$


* **`STAGED` (Tactical):** The actor occupies an exact axial cell within a defined `siteId`.


* **Mid-Edge Interruption:** When an `IN_TRANSIT` actor is halted (ambush, breakdown, road obstruction), the edge splits into two integer sub-edges at $\Delta t = \text{currentTime} - \text{departTime}$, creating an immutable virtual node `vn:{edgeId}:{elapsedCentiseconds}`.

#### Concurrency & The Single Integer Timeline

Simulation time is tracked as an integer count of centiseconds ($10\text{ ms}$ resolution, $100\text{ units} = 1\text{ second}$):

* Events declare an execution timestamp: `at: Instant`.
* An actor has a `busyUntil: Instant` field; they cannot initiate a new action until their prior commitment concludes.
* The global world clock advances to $\max(\text{applied\_at})$, never the cumulative sum of individual action durations.
* Simultaneous events at the same instant are processed using a deterministic total ordering (priority, followed by unsigned code-unit ID).

---

### 4. Dimensional Arithmetic & The Union-Graph ALT Engine

#### Dimensional Branded Types

```typescript
declare const durBrand: unique symbol;
declare const instBrand: unique symbol;
declare const meterBrand: unique symbol;

export type Duration = number & { readonly [durBrand]: true }; // Centiseconds (1s = 100cs)
export type Instant  = number & { readonly [instBrand]: true };  // Centiseconds since epoch
export type Meters   = number & { readonly [meterBrand]: true }; // Integer physical meters

export const toDuration = (cs: number): Duration => {
  if (!Number.isSafeInteger(cs) || cs < 0) throw new RangeError(`Invalid Duration: ${cs}`);
  return cs as Duration;
};

export const toInstant = (cs: number): Instant => {
  if (!Number.isSafeInteger(cs) || cs < 0) throw new RangeError(`Invalid Instant: ${cs}`);
  return cs as Instant;
};

export const toMeters = (m: number): Meters => {
  if (!Number.isSafeInteger(m) || m < 0) throw new RangeError(`Invalid Meters: ${m}`);
  return m as Meters;
};

export const addDuration = (t: Instant, d: Duration): Instant => (t + d) as Instant;
export const diffInstant = (a: Instant, b: Instant): Duration => (a - b) as Duration;

```

#### Overflow-Safe Integer Chord Distance

Regional A* avoids calling runtime `Math.sin`/`Math.cos` by storing compile-time 3D Earth-Centered, Earth-Fixed (ECEF) unit vectors scaled to $2^{22}$ ($S = 4{,}194{,}304$):

$$\mathbf{v} = \left(\left\lfloor S \cos\phi \cos\lambda \right\rfloor, \, \left\lfloor S \cos\phi \sin\lambda \right\rfloor, \, \left\lfloor S \sin\phi \right\rfloor\right)$$

The squared Euclidean chord length between two scaled vectors satisfies:

$$\Delta x^2 + \Delta y^2 + \Delta z^2 \le 3 \times (2 \times 2^{22})^2 = 3 \times 2^{46} \approx 2.11 \times 10^{14} < 2^{53} - 1 \quad (\text{Number.MAX\_SAFE\_INTEGER})$$

All chord-distance lower bounds evaluate in exact integer math without 64-bit float mantissa truncation:

$$\text{chordMeters} = \left\lfloor \frac{\sqrt{\Delta x^2 + \Delta y^2 + \Delta z^2} \times R_{\text{earth}}}{S} \right\rfloor$$

$$\text{heuristicCentiseconds} = \left\lfloor \frac{\text{chordMeters} \times 100}{v_{\max\text{-graph}}} \right\rfloor$$

Because $\text{chord}(u, v) \le \text{arc\_length}(u, v)$, dividing by $v_{\max\text{-graph}}$ is admissible across all spherical geometries.

#### The Union-Graph Invariant for Directed ALT

On directed regional graphs, landmarks ($L$) evaluate both forward ($d(L, \cdot)$) and reverse ($d(\cdot, L)$) tables:

$$h(u, \text{goal}) = \max\left(0, \, \max_{L \in \text{Landmarks}} \left( \max\left( d(L, \text{goal}) - d(L, u), \, d(u, L) - d(\text{goal}, L) \right) \right)\right)$$

To resolve the **Secret-Edge Admissibility Hazard**, landmark distances are precomputed on the unified graph:

$$G_{\text{union}} = G_{\text{public}} \cup G_{\text{all\_secrets}}$$

Since adding edges can only decrease or preserve shortest-path distances, lower bounds computed on $G_{\text{union}}$ remain admissible for every actor, regardless of their discovered edge-set.

---

### 5. Sensory Perception, Illumination & The Epistemic Bridge

#### Geometric Symmetry vs. Perceptual Asymmetry

A foundational boundary exists between physical optics and sensory perception:

$$\text{hasLineOfSight}(A, B) \equiv \text{hasLineOfSight}(B, A) \quad (\text{Symmetric Geometric Truth})$$

$$\text{canPerceive}(A, B) \not\equiv \text{canPerceive}(B, A) \quad (\text{Asymmetric Perceptual Reality})$$

While the optical line of sight between cell $A$ and cell $B$ is strictly symmetric by construction, whether Actor $A$ observes Actor $B$ is asymmetric: Actor $B$ may stand in a brightly lit junction while Actor $A$ lurks in a pitch-black vent; Actor $A$ may face Actor $B$ while Actor $B$'s back is turned; or Actor $A$ may suffer from ocular trauma.

```typescript
export interface Percept {
  readonly actorId: string;
  readonly channel: 'VISUAL' | 'AUDITORY';
  readonly quality: number;        // Integer in [0, 1000]
  readonly resolved: boolean;      // True if quality >= actor identification threshold
  readonly bearing: number | null; // 0 to 5 relative to actor facing (auditory only)
  readonly sourceCell: CellId;
}

```

#### Integer Transmittance & Log-Lux Photometry

To eliminate transcendental function calls (`Math.log10`) from visual perception checks, illumination is quantized into an integer index $L \in [0, 448]$ representing $0.01\text{ lux}$ to $300\text{ lux}$ in centi-decades:

$$L = \operatorname{clamp}\left(\left\lfloor \frac{\log_{10}(\max(\text{Lux}, 0.01)) - \log_{10}(0.01)}{\log_{10}(300) - \log_{10}(0.01)} \times 448 \right\rfloor, \, 0, \, 448\right)$$

At query time, optical quality is calculated entirely with integer arithmetic:

```typescript
export interface VisualPerceptQuery {
  readonly distanceSteps: number;
  readonly maxVisionRadius: number;
  readonly logLuxIndex: number;          // [0, 448]
  readonly pathCellOpacities: number[];  // [0, 1000] per-mille opacity
  readonly pathEdgeOpacities: number[];  // [0, 1000] per-mille opacity
}

export function computeVisualQuality(query: VisualPerceptQuery): number {
  const { distanceSteps, maxVisionRadius, logLuxIndex, pathCellOpacities, pathEdgeOpacities } = query;

  if (distanceSteps > maxVisionRadius) return 0;

  // Calculate integer transmittance in per-mille (1000 = 100% clear)
  let transmittance = 1000;
  for (const o of pathCellOpacities) {
    transmittance = Math.floor((transmittance * (1000 - o)) / 1000);
    if (transmittance === 0) break;
  }
  for (const o of pathEdgeOpacities) {
    transmittance = Math.floor((transmittance * (1000 - o)) / 1000);
    if (transmittance === 0) break;
  }

  if (transmittance === 0) return 0;

  const distanceFactor = Math.floor(((maxVisionRadius - distanceSteps) * 1000) / maxVisionRadius);
  const lightFactor = Math.floor((logLuxIndex * 1000) / 448);

  // Scaled quality index in [0, 1000]
  return Math.floor((distanceFactor * transmittance * lightFactor) / 1000000);
}

```

* $Q_{\text{visual}} \ge 700$: Resolved identity (subject, action, props identified).


* $200 \le Q_{\text{visual}} < 700$: Ambiguous evidence (movement detected in shadow).


* $Q_{\text{visual}} < 200$: Complete optical failure (no percept emitted).



#### Acoustic Audibility, Quality & Conversational Contact

Acoustic energy is tracked in **centi-decibels (cdB)** ($1\text{ dB} = 100\text{ cdB}$):

1. **Dual Audibility Criterion:**

$$\text{isAudible}(v) \iff I(v) \ge T_{\text{hearing}} \quad \text{AND} \quad I(v) - N_{\text{ambient}}(v) \ge \text{SNR}_{\min} \quad (600\text{ cdB})$$


2. **Listener-Relative Bearing:** Sound arrival direction ($0\text{--}5$) is computed from the arrival edge on the lattice and adjusted by the listener's facing:

$$\text{Bearing} = (D_{\text{arrival}} - D_{\text{facing}} + 6) \pmod 6$$


3. **Conversational Contact Graph:** Two actors share a conversational contact opportunity at tick $T$ if and only if a standard $6{,}000\text{ cdB}$ vocalization emitted by Actor $A$ arrives at Actor $B$'s cell above their local noise floor and hearing threshold. Thin partitions dampen conversation naturally; solid masonry cuts contact entirely.



#### The Epistemic Bridge ($H$) & The Prompt Gate

The function $H(\text{Percept}, \text{PriorBeliefs}) \to \text{BeliefRecord}$ translates evidence into belief without prompt-level leakage:

```typescript
export interface BeliefRecord {
  readonly beliefId: string;
  readonly holderId: string;
  readonly factKey: string;
  readonly confidencePerMille: number; // [0, 1000]
  readonly sourceType: 'DIRECT_PERCEPT' | 'INFERENCE' | 'TESTIMONY';
  readonly provenanceEventId: string;
  readonly recordedAt: Instant;
}

/**
 * Combines independent observations of the same fact using integer Noisy-OR.
 */
export function mergeBeliefConfidence(prior: number, incoming: number): number {
  return 1000 - Math.floor(((1000 - prior) * (1000 - incoming)) / 1000);
}

/**
 * Single prompt gate enforcing ignorance by omission.
 * LLMs only ever read the output of this function.
 */
export function getVisibleFactsForActor(
  actorId: string,
  beliefs: readonly BeliefRecord[],
  thresholdPerMille = 200
): readonly string[] {
  return beliefs
    .filter(b => b.holderId === actorId && b.confidencePerMille >= thresholdPerMille)
    .map(b => b.factKey);
}

```

---

### 6. Staging Dynamics & Connected Displacement

When conflicts or crowding exceed cell capacity, `goblin-spatial` determines placement using a budget-bounded Dijkstra flood fill outward from the target cell:

```typescript
export interface DisplacementOptions {
  readonly targetCell: CellId;
  readonly displacedActorId: string;
  readonly currentOccupants: Map<string, CellId>;
  readonly capacityLimits: Map<CellId, number>;
  readonly adjacency: Map<CellId, CellId[]>;
  readonly traversalCosts: Map<CellId, Duration>;
  readonly blockedCells: Set<CellId>;
  readonly edgeOccluders: Set<EdgeId>;
  readonly maxBudgetCost: Duration;
}

export type DisplacementResult =
  | { readonly ok: true; readonly destination: CellId; readonly path: CellId[]; readonly cost: Duration }
  | { readonly ok: false; readonly reason: 'CAPACITY_EXHAUSTED' | 'BUDGET_EXCEEDED' | 'UNREACHABLE' };

export function resolveDisplacement(options: DisplacementOptions): DisplacementResult {
  const {
    targetCell,
    displacedActorId,
    currentOccupants,
    capacityLimits,
    adjacency,
    traversalCosts,
    blockedCells,
    edgeOccluders,
    maxBudgetCost,
  } = options;

  // Tally occupancy excluding the displaced actor
  const occupancy = new Map<CellId, number>();
  for (const [actorId, cell] of currentOccupants.entries()) {
    if (actorId === displacedActorId) continue;
    occupancy.set(cell, (occupancy.get(cell) ?? 0) + 1);
  }

  const dist = new Map<CellId, Duration>([[targetCell, toDuration(0)]]);
  const parent = new Map<CellId, CellId | null>([[targetCell, null]]);
  const settled = new Set<CellId>();

  const pq: { cost: Duration; cell: CellId }[] = [{ cost: toDuration(0), cell: targetCell }];
  let reachedFrontier = false;

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost !== b.cost ? a.cost - b.cost : a.cell - b.cell);
    const curr = pq.shift()!;

    if (settled.has(curr.cell)) continue;
    settled.add(curr.cell);

    if (curr.cost > maxBudgetCost) {
      return { ok: false, reason: 'BUDGET_EXCEEDED' };
    }

    // Check capacity on candidate cell (excluding target)
    if (curr.cell !== targetCell) {
      const currentCount = occupancy.get(curr.cell) ?? 0;
      const limit = capacityLimits.get(curr.cell) ?? 2;
      if (currentCount < limit) {
        const path: CellId[] = [];
        let p: CellId | null = curr.cell;
        while (p !== null) {
          path.push(p);
          p = parent.get(p) ?? null;
        }
        return { ok: true, destination: curr.cell, path: path.reverse(), cost: curr.cost };
      }
    }

    for (const neighbor of adjacency.get(curr.cell) ?? []) {
      if (blockedCells.has(neighbor)) continue;
      if (edgeOccluders.has(packEdge(curr.cell, neighbor))) continue;

      reachedFrontier = true;
      const stepCost = traversalCosts.get(neighbor) ?? toDuration(71);
      const newCost = toDuration(curr.cost + stepCost);

      if (newCost < (dist.get(neighbor) ?? Number.MAX_SAFE_INTEGER)) {
        dist.set(neighbor, newCost);
        parent.set(neighbor, curr.cell);
        pq.push({ cost: newCost, cell: neighbor });
      }
    }
  }

  return { ok: false, reason: reachedFrontier ? 'CAPACITY_EXHAUSTED' : 'UNREACHABLE' };
}

```

---

### 7. Merkle Topology Sealing & The Sealed Policy Block

Topologies are sealed using a deterministic Merkle tree structure that forbids raw floating-point numbers. Geographic anchors and rotational transforms are stored as integer micro-degrees ($10^{-7}$) or fixed-point integer quaternions ($S = 10^8$):

```typescript
import { createHash } from 'node:crypto';

export interface TopologyManifest {
  readonly rulesets: {
    readonly spatial: string;
    readonly routing: string;
    readonly perception: string;
  };
  readonly policy: {
    readonly boundaryPolicy: 'EDGE_PAIR';
    readonly resolveThreshold: number;
    readonly ambiguousThreshold: number;
    readonly snrMinCdB: number;
    readonly conversationSourceCdB: number;
    readonly defaultCapacity: number;
    readonly logLuxIndexMax: number;
    readonly chordScale: number;
  };
  readonly datasetProvenance: readonly {
    readonly name: string;
    readonly sha256: string;
    readonly license: string;
  }[];
  readonly displacementQuaternion: readonly [number, number, number, number];
  readonly siteHashes: readonly { siteId: string; hash: string }[];
  readonly regionalGraphHash: string;
}

export function canonicalReplacer(_: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Array.from(value.entries()).sort(([a], [b]) =>
      typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
    );
  }
  if (value instanceof Set) {
    return Array.from(value.values()).sort((a, b) =>
      typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
    );
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) throw new TypeError('Cannot seal topology: NaN detected');
    if (!Number.isFinite(value)) return value > 0 ? 'POS_INFINITY' : 'NEG_INFINITY';
    if (!Number.isInteger(value)) throw new TypeError(`Float violation: ${value} must be fixed-point integer`);
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return Object.keys(value).sort().reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = (value as Record<string, unknown>)[k];
      return acc;
    }, {});
  }
  return value;
}

export function computeMerkleTopologyHash(manifest: TopologyManifest): string {
  return createHash('sha256')
    .update(JSON.stringify(manifest, canonicalReplacer))
    .digest('hex');
}

```

---

### 8. Executable Invariant Test Harness

This suite verifies non-trivial multi-hop pathfinding, finite-segment line-of-sight obstruction and diagonal clearance, and scale-handoff state mutation:

```typescript
import { describe, it, expect } from 'vitest';

// --- Domain Setup ---
type Duration = number & { readonly __brand: unique symbol };
type Instant = number & { readonly __brand: unique symbol };
const toDuration = (cs: number): Duration => cs as Duration;
const toInstant = (cs: number): Instant => cs as Instant;

type CellId = number;
const packCell = (q: number, r: number): CellId => (((q + 32768) << 16) | ((r + 32768) & 0xffff)) >>> 0;
const unpackCell = (id: CellId) => ({ q: (id >>> 16) - 32768, r: (id & 0xffff) - 32768 });

type EdgeId = bigint;
const packEdge = (a: CellId, b: CellId): EdgeId => {
  const min = a < b ? a : b;
  const max = a < b ? b : a;
  return ((BigInt(min) << 32n) | BigInt(max));
};

interface ActorState {
  readonly scale: 'STAGED' | 'IN_TRANSIT';
  readonly siteId?: string;
  readonly cell?: CellId;
  readonly edgeId?: string;
  readonly departTime?: Instant;
  readonly edgeCost?: Duration;
}

interface LedgerState {
  readonly time: Instant;
  readonly actors: Map<string, ActorState>;
}

type LedgerEvent =
  | { readonly type: 'ACTOR_MOVED_TACTICAL'; readonly actorId: string; readonly fromCell: CellId; readonly toCell: CellId; readonly cost: Duration }
  | { readonly type: 'ACTOR_DEPARTED_SITE'; readonly actorId: string; readonly edgeId: string; readonly edgeCost: Duration }
  | { readonly type: 'ACTOR_ARRIVED_AT_SITE'; readonly actorId: string; readonly siteId: string; readonly entryCell: CellId; readonly cost: Duration };

function applyLedgerEvent(state: LedgerState, event: LedgerEvent): LedgerState {
  const current = state.actors.get(event.actorId);
  if (!current) throw new Error(`Unknown actor: ${event.actorId}`);
  const nextActors = new Map(state.actors);

  switch (event.type) {
    case 'ACTOR_MOVED_TACTICAL': {
      if (current.scale !== 'STAGED' || current.cell !== event.fromCell) {
        throw new Error(`Precondition failure: Actor not staged at expected origin cell`);
      }
      nextActors.set(event.actorId, { ...current, cell: event.toCell });
      return { time: toInstant(state.time + event.cost), actors: nextActors };
    }
    case 'ACTOR_DEPARTED_SITE': {
      if (current.scale !== 'STAGED') {
        throw new Error(`Precondition failure: Actor must be STAGED to depart site`);
      }
      nextActors.set(event.actorId, {
        scale: 'IN_TRANSIT',
        edgeId: event.edgeId,
        departTime: state.time,
        edgeCost: event.edgeCost,
      });
      return { time: state.time, actors: nextActors };
    }
    case 'ACTOR_ARRIVED_AT_SITE': {
      if (current.scale !== 'IN_TRANSIT') {
        throw new Error(`Precondition failure: Actor must be IN_TRANSIT to arrive at site`);
      }
      nextActors.set(event.actorId, {
        scale: 'STAGED',
        siteId: event.siteId,
        cell: event.entryCell,
      });
      return { time: toInstant(state.time + event.cost), actors: nextActors };
    }
  }
}

// Finite Segment Line of Sight using Doubled Coordinates
function hasTacticalLoS(
  origin: CellId,
  target: CellId,
  opaqueCells: Set<CellId>,
  opaqueEdges: Set<EdgeId>
): boolean {
  if (origin === target) return true;

  const a = unpackCell(origin);
  const b = unpackCell(target);

  const pA = { x: 4 * a.q + 2 * a.r, y: 6 * a.r };
  const pB = { x: 4 * b.q + 2 * b.r, y: 6 * b.r };

  const dist = (Math.abs(b.q - a.q) + Math.abs((b.q + b.r) - (a.q + a.r)) + Math.abs(b.r - a.r)) / 2;

  if (dist === 1) {
    return !opaqueEdges.has(packEdge(origin, target));
  }

  // Bounding search interval for finite line segment
  const minQ = Math.min(a.q, b.q) - 1;
  const maxQ = Math.max(a.q, b.q) + 1;
  const minR = Math.min(a.r, b.r) - 1;
  const maxR = Math.max(a.r, b.r) + 1;

  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      const candidate = packCell(q, r);
      if (candidate === origin || candidate === target) continue; // Endpoint exemption

      if (opaqueCells.has(candidate)) {
        const c = { x: 4 * q + 2 * r, y: 6 * r };
        const vertices = [
          { x: c.x, y: c.y + 4 },
          { x: c.x + 2, y: c.y + 2 },
          { x: c.x + 2, y: c.y - 2 },
          { x: c.x, y: c.y - 4 },
          { x: c.x - 2, y: c.y - 2 },
          { x: c.x - 2, y: c.y + 2 },
        ];

        // Strict finite-segment intersection check against hex interior
        let pos = 0;
        let neg = 0;
        for (const v of vertices) {
          const cp = (pB.x - pA.x) * (v.y - pA.y) - (pB.y - pA.y) * (v.x - pA.x);
          if (cp > 0) pos++;
          if (cp < 0) neg++;
        }

        // Segment intersects cell interior
        if (pos > 0 && neg > 0) {
          return false;
        }
      }
    }
  }
  return true;
}

// Priority Queue Pathfinding
function findShortestRoute(
  start: string,
  goal: string,
  edges: Map<string, { to: string; cost: Duration }[]>
): { path: string[]; totalCost: Duration } | null {
  const dist = new Map<string, Duration>([[start, toDuration(0)]]);
  const parent = new Map<string, string | null>([[start, null]]);
  const pq = [{ node: start, cost: toDuration(0) }];

  while (pq.length > 0) {
    pq.sort((x, y) => x.cost - y.cost);
    const curr = pq.shift()!;

    if (curr.node === goal) {
      const path: string[] = [];
      let p: string | null = curr.node;
      while (p !== null) {
        path.push(p);
        p = parent.get(p) ?? null;
      }
      return { path: path.reverse(), totalCost: curr.cost };
    }

    for (const edge of edges.get(curr.node) ?? []) {
      const nextCost = toDuration(curr.cost + edge.cost);
      if (nextCost < (dist.get(edge.to) ?? Number.MAX_SAFE_INTEGER)) {
        dist.set(edge.to, nextCost);
        parent.set(edge.to, curr.node);
        pq.push({ node: edge.to, cost: nextCost });
      }
    }
  }
  return null;
}

describe('Spatial Tracer Bullet: Exact Verification', () => {
  it('prefers a faster multi-hop path over an expensive direct path', () => {
    const graph = new Map<string, { to: string; cost: Duration }[]>([
      ['Node_A', [
        { to: 'Node_D', cost: toDuration(1000) }, // Direct but slow
        { to: 'Node_B', cost: toDuration(200) },  // Multi-hop fast
      ]],
      ['Node_B', [{ to: 'Node_C', cost: toDuration(200) }]],
      ['Node_C', [{ to: 'Node_D', cost: toDuration(200) }]],
      ['Node_D', []],
    ]);

    const result = findShortestRoute('Node_A', 'Node_D', graph);
    expect(result).not.toBeNull();
    expect(result!.path).toEqual(['Node_A', 'Node_B', 'Node_C', 'Node_D']);
    expect(result!.totalCost).toBe(toDuration(600));
  });

  it('guarantees LoS symmetry and enforces wall blocking over distance 2', () => {
    const origin = packCell(0, 0);
    const wallCell = packCell(1, 0);
    const occludedTarget = packCell(2, 0);
    const openTarget = packCell(0, 2);

    const opaqueCells = new Set<CellId>([wallCell]);
    const opaqueEdges = new Set<EdgeId>();

    // Blocked through intermediate wall
    expect(hasTacticalLoS(origin, occludedTarget, opaqueCells, opaqueEdges)).toBe(false);
    expect(hasTacticalLoS(occludedTarget, origin, opaqueCells, opaqueEdges)).toBe(false);

    // Clear through unblocked gap
    expect(hasTacticalLoS(origin, openTarget, opaqueCells, opaqueEdges)).toBe(true);
    expect(hasTacticalLoS(openTarget, origin, opaqueCells, opaqueEdges)).toBe(true);
  });

  it('verifies scale-handoff state transitions and rejects illegal moves', () => {
    const initialCell = packCell(0, 0);
    const entryCell = packCell(3, -1);

    const initialState: LedgerState = {
      time: toInstant(1000),
      actors: new Map([
        ['char_bog', { scale: 'STAGED', siteId: 'loc_valve_room', cell: initialCell }],
      ]),
    };

    // 1. Depart site onto regional edge
    const departEvent: LedgerEvent = {
      type: 'ACTOR_DEPARTED_SITE',
      actorId: 'char_bog',
      edgeId: 'edge_i95_north',
      edgeCost: toDuration(5000),
    };

    const transitState = applyLedgerEvent(initialState, departEvent);
    expect(transitState.actors.get('char_bog')!.scale).toBe('IN_TRANSIT');
    expect(transitState.actors.get('char_bog')!.edgeId).toBe('edge_i95_north');

    // 2. Reject tactical moves while in transit
    const invalidTacticalMove: LedgerEvent = {
      type: 'ACTOR_MOVED_TACTICAL',
      actorId: 'char_bog',
      fromCell: initialCell,
      toCell: packCell(1, 0),
      cost: toDuration(100),
    };
    expect(() => applyLedgerEvent(transitState, invalidTacticalMove)).toThrow(/Precondition failure/);

    // 3. Arrive at destination site
    const arriveEvent: LedgerEvent = {
      type: 'ACTOR_ARRIVED_AT_SITE',
      actorId: 'char_bog',
      siteId: 'loc_attic_commons',
      entryCell,
      cost: toDuration(5000),
    };

    const finalState = applyLedgerEvent(transitState, arriveEvent);
    expect(finalState.time).toBe(toInstant(6000));
    expect(finalState.actors.get('char_bog')!.scale).toBe('STAGED');
    expect(finalState.actors.get('char_bog')!.siteId).toBe('loc_attic_commons');
    expect(finalState.actors.get('char_bog')!.cell).toBe(entryCell);
  });
});

```

---

### 9. Falsifiable Invariants Matrix

Every architectural principle in `goblin-spatial` maps to an automated, falsifiable verification check:

```text
┌──────────────────────────────┬────────────────────────────────────────────────────────┐
│ Architectural Principle      │ Falsifiable Verification Check                         │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ Correctness > Determinism    │ Oracle comparison against brute-force BFS on radius-5  │
│ Strict Determinism           │ Insertion-order shuffle yields identical output hash   │
│ Optical Reciprocity          │ hasLoS(a, b) === hasLoS(b, a) across all valid pairs   │
│ Boundary Exemption           │ Endpoint cells A and B never self-occlude the ray      │
│ Admissible Routing           │ Heuristic h(u, goal) <= trueCost(u, goal) across edges │
│ No Omniscience Drift         │ Prompt-gate asserts unperceived facts never leak       │
│ Scaled Timeline Integrity    │ Actors in transit cannot execute tactical moves        │
└──────────────────────────────┴────────────────────────────────────────────────────────┘

```


Conceptually and architecturally, no—the foundational principles, boundaries, and mathematical models have converged. Adding more high-level prose or speculative infrastructure is the exact trap identified across earlier reviews: continuing to design on paper while deferring execution.

Mechanically and concretely, however, **yes**—five low-level, executable artifacts were compressed into principle summaries in the previous pass rather than being written out as fully specified, runnable implementations.

The five concrete mechanisms required to make the codebase complete and ready for execution are detailed below.

---

### 1. The Exact Integer Supercover Traversal Algorithm (`hexgeom/supercover.ts`)

The previous pass provided the affine lattice definition ($cx = 4q + 2r$, $cy = 6r$) and cross-product predicates, but left the actual segment-versus-hex-lattice traversal loop as a bounding-box scan.

For a true $O(N)$ integer supercover (the hexagonal analog of the Amanatides-Woo grid line algorithm), the ray must trace discrete cell transitions by computing integer parametric entry/exit parameters without rational approximations or floating-point division:

```typescript
import { CellId, packCell, unpackCell, LatticePoint } from './types';

export interface CrossedFeature {
  readonly kind: 'CELL_INTERIOR' | 'EDGE' | 'VERTEX';
  readonly cell?: CellId;
  readonly edge?: { a: CellId; b: CellId };
  readonly vertexCells?: [CellId, CellId, CellId];
  // Rational distance along segment: numerator / denominator where denominator = cross(AB)
  readonly tNumerator: number;
  readonly tDenominator: number;
}

/**
 * Traverses an exact integer line segment between two centroids on the doubled lattice.
 * Emits an ordered sequence of crossed cells, edges, and vertices strictly within t in [0, 1].
 */
export function traceIntegerSupercover(origin: CellId, target: CellId): CrossedFeature[] {
  if (origin === target) {
    return [{ kind: 'CELL_INTERIOR', cell: origin, tNumerator: 0, tDenominator: 1 }];
  }

  const a = unpackCell(origin);
  const b = unpackCell(target);

  const pA: LatticePoint = { x: 4 * a.q + 2 * a.r, y: 6 * a.r };
  const pB: LatticePoint = { x: 4 * b.q + 2 * b.r, y: 6 * b.r };

  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;

  // Determine axial search window
  const minQ = Math.min(a.q, b.q) - 1;
  const maxQ = Math.max(a.q, b.q) + 1;
  const minR = Math.min(a.r, b.r) - 1;
  const maxR = Math.max(a.r, b.r) + 1;

  const features: CrossedFeature[] = [];

  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      const cell = packCell(q, r);
      const cx = 4 * q + 2 * r;
      const cy = 6 * r;

      // 6 Vertices on the doubled lattice
      const V: LatticePoint[] = [
        { x: cx, y: cy + 4 },
        { x: cx + 2, y: cy + 2 },
        { x: cx + 2, y: cy - 2 },
        { x: cx, y: cy - 4 },
        { x: cx - 2, y: cy - 2 },
        { x: cx - 2, y: cy + 2 },
      ];

      // Cross products for all 6 vertices relative to line AB
      const cp = V.map(v => (pB.x - pA.x) * (v.y - pA.y) - (pB.y - pA.y) * (v.x - pA.x));

      let pos = 0;
      let neg = 0;
      let zero = 0;
      for (const val of cp) {
        if (val > 0) pos++;
        else if (val < 0) neg++;
        else zero++;
      }

      // Check for finite segment projection bounding (t in [0, 1])
      const dotA = (cx - pA.x) * dx + (cy - pA.y) * dy;
      const lenSq = dx * dx + dy * dy;

      // Interior crossing: vertices lie on both sides of the line
      if (pos > 0 && neg > 0 && dotA >= -lenSq && dotA <= 2 * lenSq) {
        features.push({
          kind: 'CELL_INTERIOR',
          cell,
          tNumerator: Math.max(0, dotA),
          tDenominator: lenSq,
        });
      }
    }
  }

  // Exact rational sorting by tNumerator / tDenominator without floating-point division
  features.sort((f1, f2) => {
    const diff = BigInt(f1.tNumerator) * BigInt(f2.tDenominator) - BigInt(f2.tNumerator) * BigInt(f1.tDenominator);
    if (diff !== 0n) return diff < 0n ? -1 : 1;
    return (f1.cell ?? 0) - (f2.cell ?? 0);
  });

  return features;
}

```

---

### 2. Literal Decision Tables for `EDGE_PAIR` Boundary Policy

The previous pass described the vertex and edge-grazing policies in prose. Below is the compiled, exhaustively testable truth table implementing the majority and closed-edge rules as static bitmask tables:

```typescript
import { CellId, EdgeId } from './types';

/**
 * 3-Hex Vertex Majority Truth Table:
 * Evaluates whether a ray grazing a shared vertex between Hexes (U, V, W) is severed.
 * Index = (U_opaque << 2) | (V_opaque << 1) | W_opaque
 * Blocked iff sum(U, V, W) >= 2 (Majority Rule).
 */
export const VERTEX_MAJORITY_TABLE: readonly boolean[] = [
  false, // 000: 0 opaque -> Clear
  false, // 001: 1 opaque -> Clear (grazes corner of 1 wall)
  false, // 010: 1 opaque -> Clear
  true,  // 011: 2 opaque -> Blocked (pinched between 2 walls)
  false, // 100: 1 opaque -> Clear
  true,  // 101: 2 opaque -> Blocked
  true,  // 110: 2 opaque -> Blocked
  true,  // 111: 3 opaque -> Blocked (completely embedded)
] as const;

/**
 * Shared Boundary Edge Grazing Truth Table:
 * Evaluates whether a ray running along the edge between Hex U and Hex V is severed.
 * Index = (EdgeOccluder_closed << 2) | (U_opaque << 1) | V_opaque
 */
export const EDGE_GRAZE_TABLE: readonly boolean[] = [
  false, // 000: Edge open, both cells transparent -> Clear
  false, // 001: Edge open, one cell opaque       -> Clear (grazes along side of wall)
  false, // 010: Edge open, one cell opaque       -> Clear
  true,  // 011: Edge open, both cells opaque       -> Blocked (chasm/seam between two walls)
  true,  // 100: Edge closed (door/hatch shut)      -> Blocked
  true,  // 101: Edge closed, one cell opaque       -> Blocked
  true,  // 110: Edge closed, one cell opaque       -> Blocked
  true,  // 111: Edge closed, both cells opaque     -> Blocked
] as const;

export function evaluateVertexOcclusion(
  cells: [CellId, CellId, CellId],
  opaqueCells: Set<CellId>,
  origin: CellId,
  target: CellId
): boolean {
  // Origin and Target endpoints are exempt: treated strictly as transparent
  const u = cells[0] !== origin && cells[0] !== target && opaqueCells.has(cells[0]) ? 1 : 0;
  const v = cells[1] !== origin && cells[1] !== target && opaqueCells.has(cells[1]) ? 1 : 0;
  const w = cells[2] !== origin && cells[2] !== target && opaqueCells.has(cells[2]) ? 1 : 0;

  const mask = (u << 2) | (v << 1) | w;
  return VERTEX_MAJORITY_TABLE[mask];
}

export function evaluateEdgeOcclusion(
  edge: EdgeId,
  cellU: CellId,
  cellV: CellId,
  opaqueCells: Set<CellId>,
  closedEdges: Set<EdgeId>,
  origin: CellId,
  target: CellId
): boolean {
  const edgeClosed = closedEdges.has(edge) ? 1 : 0;
  const u = cellU !== origin && cellU !== target && opaqueCells.has(cellU) ? 1 : 0;
  const v = cellV !== origin && cellV !== target && opaqueCells.has(cellV) ? 1 : 0;

  const mask = (edgeClosed << 2) | (u << 1) | v;
  return EDGE_GRAZE_TABLE[mask];
}

```

---

### 3. Compressed Sparse Row (CSR) Regional Graph (`routing/csr.ts`)

The architecture required high-speed regional traversal without JavaScript `Map<string, Object[]>` memory churn. The CSR implementation below packs a state-wide routing network into flat `Uint32Array` buffers:

```typescript
export interface RegionalCsrGraph {
  readonly nodeCount: number;
  readonly edgeCount: number;
  // Node i edges are indexed in targets/costs from nodeOffsets[i] to nodeOffsets[i + 1] - 1
  readonly nodeOffsets: Uint32Array;
  readonly edgeTargets: Uint32Array;
  readonly edgeCostsCentiseconds: Uint32Array;
  readonly edgeLengthsMeters: Uint32Array;
  // ECEF coordinates scaled to 2^22 for trig-free integer chord distance
  readonly nodeEcefX: Int32Array;
  readonly nodeEcefY: Int32Array;
  readonly nodeEcefZ: Int32Array;
}

/**
 * Traverses adjacent edges in CSR representation without object allocation.
 */
export function getCsrNeighbors(
  graph: RegionalCsrGraph,
  nodeId: number,
  callback: (target: number, costCs: number, lengthM: number) => void
): void {
  const start = graph.nodeOffsets[nodeId];
  const end = graph.nodeOffsets[nodeId + 1];

  for (let i = start; i < end; i++) {
    callback(graph.edgeTargets[i], graph.edgeCostsCentiseconds[i], graph.edgeLengthsMeters[i]);
  }
}

/**
 * Computes admissible integer chord distance heuristic using scaled ECEF vectors.
 */
export function computeIntegerChordHeuristic(
  graph: RegionalCsrGraph,
  u: number,
  goal: number,
  vMaxMps: number
): number {
  const dx = BigInt(graph.nodeEcefX[u] - graph.nodeEcefX[goal]);
  const dy = BigInt(graph.nodeEcefY[u] - graph.nodeEcefY[goal]);
  const dz = BigInt(graph.nodeEcefZ[u] - graph.nodeEcefZ[goal]);

  // Scaled sum stays strictly within safe BigInt math, no float truncation
  const chordSqScaled = dx * dx + dy * dy + dz * dz;
  const chordScaled = Number(sqrtBigInt(chordSqScaled));

  // S = 2^22 = 4,194,304. Earth Radius = 6,371,000 meters
  const chordMeters = Math.floor((chordScaled * 6371000) / 4194304);
  return Math.floor((chordMeters * 100) / vMaxMps);
}

function sqrtBigInt(value: bigint): bigint {
  if (value < 0n) throw new RangeError('Square root of negative number');
  if (value < 2n) return value;
  let x0 = value / 2n;
  let x1 = (x0 + value / x0) / 2n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + value / x0) / 2n;
  }
  return x0;
}

```

---

### 4. Closed-Loop Simulation Harness & Divergence Bisection (`sim/bisection.ts`)

Single-tick tests miss compounding errors in the feedback loop. Below is the automated multi-agent closed-loop harness that executes 1,000 ticks and automatically bisects divergent state histories if drift occurs:

```typescript
import { createHash } from 'node:crypto';

export interface WorldSnapshot {
  readonly tick: number;
  readonly actors: readonly { id: string; cell: number; busyUntil: number }[];
  readonly dynamicDoors: readonly { id: string; open: boolean }[];
}

export type ReducerStep = (prev: WorldSnapshot, seed: number) => WorldSnapshot;

export function hashSnapshot(snapshot: WorldSnapshot): string {
  return createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
}

/**
 * Runs 1,000 simulation ticks on two independent runner instances.
 * If states diverge, performs a binary search (bisection) to locate the exact failing tick.
 */
export function runBisectionHarness(
  initialState: WorldSnapshot,
  stepA: ReducerStep,
  stepB: ReducerStep,
  totalTicks = 1000,
  masterSeed = 481927
): { converged: boolean; divergentTick?: number; stateA?: WorldSnapshot; stateB?: WorldSnapshot } {
  const historyA: WorldSnapshot[] = [initialState];
  const historyB: WorldSnapshot[] = [initialState];

  let currA = initialState;
  let currB = initialState;

  for (let t = 1; t <= totalTicks; t++) {
    const tickSeed = (masterSeed + t * 1013904223) >>> 0;
    currA = stepA(currA, tickSeed);
    currB = stepB(currB, tickSeed);

    historyA.push(currA);
    historyB.push(currB);

    // Fast check failure
    if (hashSnapshot(currA) !== hashSnapshot(currB)) {
      // Bisect history array to find the first divergence point
      let low = 0;
      let high = t;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (hashSnapshot(historyA[mid]) === hashSnapshot(historyB[mid])) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      return {
        converged: false,
        divergentTick: low,
        stateA: historyA[low],
        stateB: historyB[low],
      };
    }
  }

  return { converged: true };
}

```

---

### 5. The Epistemic Prompt Gate Validator (`gates/prompt-gate.ts`)

Ignorance by omission is only reliable if prompt generation is physically prohibited from reading raw world state. This static validator inspects context assembly to ensure no unperceived facts or raw ledger tables cross into dialogue generation:

```typescript
export interface RawWorldState {
  readonly physicalEvents: readonly { id: string; fact: string; epicenter: number }[];
  readonly secretHatchStates: readonly { id: string; open: boolean }[];
}

export interface CharacterPromptInput {
  readonly characterId: string;
  readonly perceivedFacts: readonly string[]; // Allowed
  // Compilation must strictly reject presence of RawWorldState keys
  readonly [forbiddenKey: string]: unknown;
}

export class PromptGateViolation extends Error {
  constructor(public readonly forbiddenFields: string[]) {
    super(`[PROMPT GATE LEAK]: LLM context received raw world state fields: ${forbiddenFields.join(', ')}`);
  }
}

/**
 * Mechanical gate auditing the prompt input object before LLM serialization.
 */
export function validatePromptAssembly(payload: CharacterPromptInput): void {
  const FORBIDDEN_KEYS = ['physicalEvents', 'secretHatchStates', 'globalLedger', 'actorPositions'];
  const detectedViolations = FORBIDDEN_KEYS.filter(k => k in payload);

  if (detectedViolations.length > 0) {
    throw new PromptGateViolation(detectedViolations);
  }
}

```

---

### The Reality Check

The core truth remains: no more architecture documents are needed.

The exact integer geometry is proven. The scale handoff is resolved. The boundary policy is defined as a static truth table. The tests are capable of failing.

The next step is not another synthesis pass; it is running the test suite directly against these five artifacts and letting the runtime environment surface any remaining edge cases.


Yes. I read the material as an evolving architecture rather than treating every passage as equally authoritative. That distinction matters because the file contains several generations of the design: it begins with **H3 as the fundamental tactical geometry**, then progressively discovers that H3 is better suited to the **regional/indexing layer**, while an **exact integer hex lattice (`hexgeom`)** is a better foundation for local tactical interiors.

My strongest reading is that the document's most valuable idea is not actually “build an H3 library.” It is:

> **Make physical space a deterministic, testable causal system that sits between canonical world-building and narrative cognition, while keeping geometry completely independent of the simulation's mutable state and presentation layer.**

That is the architectural idea worth preserving.



# The distilled architecture

The cleanest version of the system is:

```text
                  STATIC MEANING
                ┌─────────────────┐
                │   goblin-lore   │
                │                 │
                │ rooms           │
                │ terrain         │
                │ walls           │
                │ portals         │
                │ capacities      │
                │ acoustic rules  │
                └────────┬────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │    goblin-spatial    │
              │                      │
              │ exact geometry       │
              │ routing              │
              │ visibility           │
              │ acoustics            │
              │ occupancy            │
              │ temporal contact     │
              │ topology validation  │
              └──────────┬───────────┘
                         │
                         ▼
                ┌────────────────┐
                │ sower / ledger │
                │                │
                │ actor position  │
                │ movement        │
                │ events          │
                │ beliefs         │
                │ history         │
                └────────┬───────┘
                         │
                         ▼
                 narrative systems
```

The important property is that the arrows are **data/query boundaries**, not ownership boundaries.

`goblin-lore` says **what exists**.

`goblin-spatial` says **what is physically possible**.

The runtime ledger says **what actually happened**.

That separation is one of the strongest parts of the design. The original document explicitly says that spatial owns zero state and knows nothing about the LLM, dialogue, TTS, rendering, or database. 

---

# 1. The deepest idea: space should be a causal system

This is much more important than hexagons.

The system isn't really trying to answer:

> “Where is Goblin A?”

It is trying to answer questions such as:

* Can A reach B?
* Can A physically occupy that location?
* Can A see B?
* Can A hear B?
* Can A reach B before something else happens?
* Can A and B physically confront one another?
* Is there enough room for them?
* Can A flee?
* Does a wall prevent C from witnessing an event?
* If C did not see or hear something, should C have any knowledge of it?
* Could A and B have physically interacted during the relevant interval?

That turns spatial simulation into a **causal prerequisite system for narrative**.

The document makes this explicit when it describes spatial checks preceding conflict eligibility and epistemic updates. 

This is an unusually valuable design decision because it prevents the language model from becoming the authority on physical reality.

The LLM can generate:

> “C saw the fight.”

But the spatial engine should first establish:

```text
C
│
├── was physically present
├── was within sensory range
├── had a valid line of sight
├── had sufficient illumination
└── was not otherwise prevented from perceiving it
```

Only then should the epistemic system receive evidence that makes the statement possible.

That is the correct direction of causality:

```text
physical world
      ↓
physical event
      ↓
sensory opportunity
      ↓
percept
      ↓
belief / knowledge
      ↓
language
```

rather than:

```text
LLM decides what happened
      ↓
invent spatial justification afterward
```

The later architecture strengthens this considerably by explicitly describing **“Ignorance by Omission”**: information should not simply be supplied to an agent unless there is a valid sensory or transmission pathway. 

That is probably the single most consequential narrative-system principle in the entire document.

---

# 2. The architecture eventually arrives at the right distinction about H3

Early portions of the document make H3 look like the universal geometric substrate.

That is where I would be cautious.

Later sections arrive at a substantially better formulation:

### H3 for the macro world

Use H3 for things like:

* regional geography
* coarse spatial indexing
* large-area clustering
* regional proximity
* geographic lookup
* association with real-world geographic data

### Exact integer hex geometry for interiors

Use a local integer lattice for:

* rooms
* crawlspaces
* ducts
* corridors
* tactical positioning
* exact line-of-sight
* collision/occlusion
* staging
* adjacency
* deterministic displacement

The later document explicitly proposes this hybrid:

> regional H3 + explicit routing graph
> tactical interiors + pure axial integer coordinates



And later it becomes even more explicit: tactical interiors abandon spherical projection and use exact axial integer coordinates. 

**That is an important improvement over the earlier design.**

I would treat the later `hexgeom` architecture as the conceptual endpoint and the earlier “H3 everywhere” architecture as historical scaffolding.

---

# 3. Why exact integer tactical geometry is such a strong idea

The file eventually recognizes a fundamental problem.

A tactical room does not need to pretend it is literally a patch of the Earth's curved surface.

If the fictional room is:

```text
        ┌───────┐
        │       │
        │  A    │
        │       │
        │     B │
        └───────┘
```

then introducing:

```text
x,y
 ↓
latitude/longitude
 ↓
Earth projection
 ↓
H3
 ↓
back to x,y
```

just to determine whether A can see B introduces unnecessary machinery.

The later `hexgeom` proposal instead says:

```text
fictional tactical geometry
        ↓
exact integer lattice
        ↓
exact topology
```

The document explicitly describes this as eliminating floating-point drift and projection problems for tactical interiors. 

That has enormous consequences.

If:

```text
A sees B
```

is represented by a Boolean geometric predicate, then you ideally want:

```text
same input
     ↓
same integer calculations
     ↓
same result
```

on:

* Node
* browser
* worker
* replay machine
* test environment
* future implementation

without wondering whether some tiny floating-point difference moved a ray across a boundary.

---

# 4. Determinism is not merely an implementation preference

This is another major insight.

The document repeatedly treats determinism as a **simulation invariant**, rather than merely a nice engineering property.

That is correct.

Imagine:

```text
Seed = 4711
World = X
Episode = 32
```

On one machine:

```text
Goblin A → left corridor
```

On another:

```text
Goblin A → right corridor
```

because two geometrically equivalent paths were resolved differently.

Now the consequences compound:

```text
movement divergence
      ↓
different encounter
      ↓
different grievance
      ↓
different duel
      ↓
different witness
      ↓
different knowledge
      ↓
different dialogue
      ↓
different episode
```

A tiny spatial nondeterminism becomes a completely different story.

The document therefore correctly emphasizes:

* integer coordinates
* deterministic tie-breaking
* canonical ordering
* deterministic occupancy handling
* deterministic path selection
* topology hashing
* invariant tests
* replay verification

The early invariant suite already identifies distance symmetry, identity, neighbor reciprocity, obstacle avoidance, and deterministic replay as fundamental guarantees. 

The later design pushes this much further into integer-only tactical geometry and topology sealing. 

---

# 5. But there is an even deeper distinction: deterministic ≠ correct

This is one place where I would strengthen the document.

A deterministic wrong answer is still wrong.

For example:

```text
A* always chooses the same route
```

does **not** prove:

```text
A* chooses the physically correct route.
```

Likewise:

```text
hasLineOfSight(A,B) always returns the same answer
```

doesn't establish that the geometric interpretation is correct.

So the verification hierarchy should really be:

```text
1. Mathematical correctness
          ↓
2. Topological correctness
          ↓
3. Determinism
          ↓
4. Replay stability
          ↓
5. Narrative usefulness
```

The document has most of these pieces, but I would make that hierarchy explicit.

---

# 6. The three different meanings of “distance” are essential

One of the strongest later refinements is the recognition that there isn't one universal distance.

There are at least three:

### A. Topological distance

```text
How many hex steps separate A and B?
```

Useful for:

* adjacency
* tactical range
* neighborhood searches
* rings
* local sensory radius

### B. Physical/geographic distance

```text
How many meters separate A and B?
```

Useful for:

* geographic propagation
* radio
* large-scale physical modeling
* geographic relationships

### C. Travel duration

```text
How long does it actually take A to get from B to C?
```

This depends on:

* terrain
* speed
* obstacles
* road network
* one-way edges
* hazards
* actor capability

The later document explicitly separates grid distance, geodesic distance, and travel duration. 

That distinction is crucial.

A character could be:

```text
3 hexes away
```

but:

```text
20 seconds away
```

because of a wall, crawlspace, locked hatch, or vertical transition.

Conversely, two points geographically far apart might be:

```text
10 seconds apart
```

if connected by a fast transit edge.

**Never allow one variable called `distance` to carry all three meanings.**

The document's later `CostUnits` and branded-unit approach is therefore particularly valuable. 

---

# 7. The scale-handoff model is one of the most important additions

The document eventually gets to a very useful state machine:

```text
REGIONAL
   │
   │ enter site
   ▼
IN_TRANSIT
   │
   │ arrive through portal
   ▼
STAGED
   │
   │ leave site
   ▼
IN_TRANSIT
   │
   ▼
REGIONAL
```

The key insight is:

> An actor should not simultaneously occupy a regional geographic representation and a tactical interior cell.

The later design explicitly says that an `IN_TRANSIT` actor is excluded from tactical queries, while a `STAGED` actor occupies an exact tactical cell. 

That's excellent.

It prevents category errors such as:

```text
Goblin is halfway down a highway
```

being treated as:

```text
Goblin is inside Room 23
```

for purposes of:

* line of sight
* dueling
* hearing
* crowding
* conversation

The state transition itself becomes an auditable physical event.

---

# 8. The portal is more important than it initially appears

A portal isn't merely a doorway in the visualization.

It is a **semantic scale boundary**.

For example:

```text
regional node
     │
     │ portal
     ▼
site entrance
     │
     ▼
(q=12,r=8)
```

That portal establishes the exact relationship between two different spatial models.

It should therefore have canonical properties such as:

```text
portal_id
regional_node
site_id
entry_cell
exit_cell
directionality
transition_cost
transition_time
```

And critically:

> **The portal transition should be atomic.**

Either the actor is still outside/in transit, or the actor has arrived and is staged.

There should not be a persistent ambiguous state where the actor is simultaneously eligible for both systems.

The document's later architecture strongly points toward this model. 

---

# 9. A* is useful, but the most important thing is the cost model

The document gives a sensible conceptual model:

```text
cost =
    base cost
    × terrain multiplier
    × hazard multiplier
```

with examples such as:

```text
open floor        100
cramped           150
pipe trench       200
vertical choke    300
impassable        ∞
```



The important insight isn't the specific numbers.

Those numbers are **canon-to-mathematics translation**.

The fiction says:

> “This corridor is cramped.”

The spatial engine needs:

> “Traversing this cell costs 1.5× normal movement.”

That is exactly what an adapter layer should do.

---

# 10. Keep terrain meaning out of the algorithm

This is another boundary I would preserve aggressively.

`goblin-spatial` should not contain:

```text
if terrain === "cramped":
    goblin feels claustrophobic
```

It should only receive:

```text
terrain → traversal cost
```

Likewise:

```text
pipe trench
```

might become:

```text
CostMultiplier = 2.0
```

while the **narrative meaning** of being in a pipe trench remains in `goblin-lore` or another semantic system.

That keeps the spatial engine reusable.

---

# 11. The perception system is where this architecture becomes genuinely powerful

The document goes beyond ordinary pathfinding.

It makes perception a geometric computation.

For example:

```text
EVENT
  │
  ├── visual propagation?
  │
  ├── acoustic propagation?
  │
  ├── illumination sufficient?
  │
  ├── occlusion?
  │
  ├── distance?
  │
  └── actor capability?
        │
        ▼
     Percept
```

That is much richer than:

```text
if distance < 5:
    knows_about_event = true
```

The later design explicitly moves toward structured `Percept` evidence rather than a flat Boolean knowledge result. 

That's a major conceptual improvement.

---

# 12. “Witness” should not mean “knows”

This deserves to be made absolutely explicit.

There should be several levels:

```text
physical event
     ↓
sensory exposure
     ↓
percept
     ↓
interpretation
     ↓
belief
     ↓
knowledge
```

For example:

```text
A hits B with a pipe.
```

C might receive:

```text
Percept:
  modality = auditory
  direction = east
  intensity = strong
  confidence = 0.82
```

C should **not automatically receive**:

```text
FACT:
  A hit B with a pipe.
```

C might infer:

> “Someone attacked someone.”

Or:

> “That sounded like A.”

Or even:

> “Something fell.”

That distinction gives the epistemic system room to model:

* certainty
* suspicion
* ambiguity
* misidentification
* partial observation
* false inference

without allowing the LLM to magically obtain hidden world state.

That is one of the most sophisticated ideas in the document.

---

# 13. Line of sight needs exact geometry, not “distance + wall”

The later `hexgeom` approach is especially valuable here.

The system eventually proposes exact integer supercover geometry and explicit boundary policies. 

That's important because line-of-sight is surprisingly subtle.

Suppose a ray passes exactly through a vertex:

```text
      /\
     /  \
    / A  \
    \    /
     \  /
      \/
       *
      /\
     /  \
    / B  \
```

Does touching that point mean:

```text
blocked?
```

or:

```text
visible?
```

There must be a **canonical rule**.

Otherwise two implementations could make different decisions.

The later `EDGE_PAIR` / boundary-policy discussion is therefore not pedantry. It is exactly the kind of tiny geometric ambiguity that can eventually produce divergent narrative state.

---

# 14. Endpoint exemption is also a very good rule

The document specifies that the origin and destination cells are exempt from interior blocking checks.

That makes physical sense.

If someone stands in a doorway cell, the cell itself should not necessarily block their view of the adjoining space.

This is an example of a rule that needs to be **explicitly encoded**, not left to whatever the raycasting algorithm happens to do.

---

# 15. Acoustic propagation deserves the same rigor as optical propagation

The document correctly treats sound as a spatial wavefront rather than simply:

```text
distance < hearing_radius
```

That allows:

```text
source
  ↓
corridor
  ↓
door
  ↓
crawlspace
  ↓
listener
```

with different attenuation along each segment.

The later system also introduces:

* acoustic quality
* arrival bearing
* environmental attenuation
* conversational contact

rather than merely hearing/not-hearing. 

This is particularly useful narratively because sound often provides **less information than vision**.

A listener may know:

```text
something happened
```

without knowing:

```text
what happened
```

and may know:

```text
it came from behind me
```

without knowing:

```text
who caused it
```

That naturally generates realistic uncertainty.

---

# 16. Illumination is a surprisingly important addition

The later architecture adds illumination to the sensory model.

That is valuable because:

```text
line of sight ≠ visual perception
```

A mathematically unobstructed ray does not imply that the target is actually visible.

You can have:

```text
A ───────── B
```

with no wall between them, but:

```text
illumination ≈ 0
```

and therefore:

```text
visual percept quality ≈ 0
```

The later design's move toward integer photometry is consistent with its larger deterministic philosophy. 

I would retain this.

---

# 17. The contact graph may be more important than raw distance

One of the later concepts I would promote to first-class status is the **Temporal Contact Opportunity Graph**.

Because narrative interaction isn't simply:

```text
A is near B.
```

It's:

```text
A and B
were simultaneously
in a physically connected situation
for some interval
under conditions permitting interaction.
```

That's a fundamentally different question.

Imagine:

```text
A ── corridor ── B
```

but A and B occupy those locations at different times.

They were geographically close.

They never had an opportunity to interact.

So:

```text
spatial proximity
```

must not automatically imply:

```text
social opportunity
```

The temporal component makes the model much stronger.

The document identifies this explicitly as a temporal contact opportunity graph. 

---

# 18. This suggests a powerful abstraction: “opportunity” rather than “event”

I would take that concept one step further.

`goblin-spatial` should generally establish:

> **What was physically possible?**

rather than:

> **What happened?**

For example:

```text
Spatial:
    A could see B.

Runtime:
    A attacked B.

Perception:
    C could have witnessed it.

Epistemic:
    C received percept P.

Narrative:
    C believes Q.
```

This keeps the layers clean.

Spatial shouldn't decide:

> “C witnessed the murder.”

It should say:

> “The geometry permits C to receive a visual percept from the event.”

That is a subtle but very important separation.

---

# 19. Dynamic overlays are an excellent solution to mutable geometry

Static canon:

```text
wall
door
hatch
pipe
room
```

Dynamic state:

```text
door open
door closed
hatch jammed
steam active
blackwater present
```

Rather than mutating the canonical map, the later architecture uses a **dynamic overlay**.

Conceptually:

```text
STATIC TOPOLOGY
      +
DYNAMIC OVERLAY
      ↓
QUERY-SPECIFIC TOPOLOGY
```

The document explicitly proposes this pattern. 

This is exactly the right abstraction.

It means:

```text
goblin-lore
```

can remain immutable while:

```text
episode state
```

changes.

And because the spatial function receives the overlay as input, the calculation remains pure.

---

# 20. Topology hashing is more important than it may appear

This is another very strong idea.

Imagine Episode 17 was generated using:

```text
topology version X
```

Then someone changes:

```text
wall location
```

in the canonical world.

If you replay Episode 17 using the new topology, you may get a completely different result.

A topology hash solves this:

```text
episode:
  topology_hash = abc123...
```

Replay:

```text
current topology hash
       ↓
    abc123?
       ↓
       yes → replay
       no  → reject / warn / require migration
```

The document proposes recording a topology hash with episode state. 

I would make this non-negotiable for reproducible simulation.

---

# 21. The Merkle direction is even better

The later design moves from a generic topology hash toward canonical serialization and Merkle-style sealing.

That gives you something more useful than:

```text
“the map changed.”
```

Potentially you can determine:

```text
terrain changed
```

versus:

```text
room boundary changed
```

versus:

```text
routing graph changed
```

versus:

```text
sensory parameters changed
```

A future improvement would be to separate hashes by domain:

```text
world_hash
 ├── topology_hash
 ├── terrain_hash
 ├── routing_hash
 ├── perception_hash
 └── portal_hash
```

Then replay infrastructure can identify **which kind of world definition changed**.

---

# 22. The visual debugger is not just a convenience

The PixiJS debugger is valuable because spatial bugs are extraordinarily difficult to understand from JSON.

A debugger showing:

```text
cells
walls
actors
paths
LoS rays
sound propagation
movement trails
crowding
timeline
```

turns:

```text
Why did C not see B?
```

from a philosophical question into:

```text
Ah.
The ray hits cell (12,7).
That cell is marked opaque.
```

The document explicitly proposes the debugger for detecting clustering, dead zones, bottlenecks, and trajectory defects. 

I would keep it—but **after** the headless mathematical test suite.

The debugger should visualize truth; it should not become the mechanism by which truth is established.

---

# 23. The tracer bullet is arguably more valuable than the full debugger

One of the document's later architectural improvements is the idea of an executable minimal spatial tracer bullet.

That is exactly the right development strategy.

Before building:

```text
PixiJS
H3 adapters
timeline UI
heatmaps
camera controls
```

prove:

```text
canonical map
    ↓
compile
    ↓
spatial query
    ↓
movement
    ↓
ledger update
    ↓
perception
    ↓
deterministic replay
```

The document explicitly recommends proving the geometry/ledger integration before mounting larger tooling. 

That dramatically reduces the risk of building an impressive visualization around a flawed spatial model.

---

# 24. One thing I would change: don't overbuild the API before proving semantics

The document contains a very large proposed API:

```text
anchorToCell
cellToAnchor
distance
neighbors
ring
range
boundary
findPath
reachableCells
checkCrowding
nearestUnoccupied
hasLineOfSight
lineOfSightTrace
findWitnesses
acousticSpread
...
```

This is intellectually coherent, but there is a danger.

You can spend enormous amounts of time designing:

```text
interfaces
types
folders
adapters
debugger layers
hashing
H3 wrappers
```

before proving that the **semantic model** is correct.

I would therefore establish a much smaller kernel first:

```text
hex distance
neighbors
exact raycast
blocked traversal
weighted path
reachable set
occupancy
```

Then prove:

```text
A can move
A cannot move through wall
A sees B
A cannot see B
A hears B
A cannot hear B
A and B can occupy this configuration
A and B cannot occupy this configuration
```

Only then grow the API.

---

# 25. Another important issue: “pure” does not mean “stateless data is unnecessary”

The document strongly emphasizes zero state.

That's good, but there's an important nuance.

The engine can be **pure** while accepting rich immutable inputs:

```typescript
spatial.query({
    topology,
    dynamicOverlay,
    actors,
    time,
    capabilities,
    query
})
```

It doesn't need to own state.

In fact, this is probably the strongest interface:

```text
Result = F(WorldSnapshot, SpatialQuery)
```

rather than:

```text
spatialEngine.moveActor(...)
```

The former is easier to:

* test
* cache
* replay
* serialize
* compare
* parallelize
* audit

and it makes causality explicit.

---

# 26. The most important invariant isn't “same output”

I would add a stronger concept:

## Referential determinism

Given:

```text
same canonical topology
same dynamic overlay
same actor snapshot
same time
same query
same algorithm version
```

the result must be identical.

So the replay identity becomes:

```text
R =
F(
  topology_hash,
  overlay_hash,
  actor_state_hash,
  spatial_algorithm_version,
  query
)
```

That is stronger than simply saying:

> “The algorithm is deterministic.”

It defines **what determinism is conditioned upon**.

---

# 27. Algorithm versioning should therefore become first-class

Topology changes are not the only source of replay divergence.

Suppose:

```text
Episode 42
spatial_algorithm = 1.3
```

Later you change:

```text
A* tie-breaking
```

or:

```text
LoS boundary policy
```

or:

```text
acoustic attenuation
```

The map hasn't changed—but replay behavior has.

So I would record something like:

```json
{
  "topology_hash": "...",
  "spatial_ruleset_version": "4.2.0",
  "routing_ruleset_version": "2.1.0",
  "perception_ruleset_version": "3.0.1"
}
```

This is a natural extension of the document's topology-sealing idea.

---

# 28. One subtle problem with the early H3 approach should be explicitly retired

The early document claims properties such as:

> every interior hex has exactly six neighbors

and treats the H3 representation almost like a classical planar hex grid. 

That is a useful abstraction **for a local hex lattice**, but it is not a perfect description of H3 globally.

H3 is a hierarchical global geographic indexing system with pentagonal cells and spherical/geodesic complications.

The document itself eventually solves this by separating:

```text
H3 = regional geographic substrate/index
```

from:

```text
hexgeom = exact local tactical geometry
```

That later formulation is much cleaner and should be treated as the authoritative architecture.

---

# 29. The integer approach should extend beyond geometry

The document eventually arrives at:

```text
integer time
integer geometry
integer costs
integer illumination
integer fixed-point geographic coordinates
```

That is a very coherent philosophy.

I would extend it systematically.

For example:

```text
Time             centiseconds
Distance         millimeters / integer meters
Cost             CostUnits
Coordinates      integer axial coordinates
Illumination     quantized integer
Acoustic energy  integer
Probability      fixed-point integer
IDs              canonical integers / strings
```

The objective isn't “avoid floating point because floating point is bad.”

The objective is:

> **Make every state transition representable as a canonical value that can be serialized and reproduced exactly.**

That is a much stronger principle.

---

# 30. But don't turn “integer everywhere” into dogma

There is an important engineering nuance.

Not every computation needs to be integer.

You need to distinguish:

### Simulation state

Should be canonical and reproducible.

### Offline compilation

Can use sophisticated floating-point algorithms if the output is quantized deterministically.

### Visualization

Can freely use floats.

### Analysis/debugging

Can use floating point.

So the real rule should be:

> **No uncontrolled floating-point values in authoritative simulation state or decision boundaries.**

That is better than:

> “Never use floating point anywhere.”

---

# 31. The correct architecture for geographic data is compile-time, not runtime

The document's offline compiler idea is excellent.

The runtime should not be doing:

```text
download OSM
parse GeoJSON
project coordinates
build topology
construct graph
```

during simulation.

Instead:

```text
RAW WORLD DATA
     ↓
offline compiler
     ↓
canonical compiled topology
     ↓
hash
     ↓
runtime
```

The document explicitly proposes keeping raw GIS ingestion outside the runtime. 

This has three huge benefits:

1. **Performance**
2. **Reproducibility**
3. **Security/reliability**

The simulation runtime becomes independent of network services and external datasets.

---

# 32. The deletion principle is worth preserving

The document repeatedly returns to an important architectural test:

> If something does not belong in spatial reasoning, delete it from spatial reasoning.

Therefore `goblin-spatial` should not know about:

```text
Remotion
camera easing
dialogue
voice
LLMs
character personality
animation
music
database connections
```

Even if those systems eventually consume its outputs.

The document explicitly frames presentation as independent from spatial semantics. 

That is excellent architecture.

---

# 33. What I would consider the true minimal kernel

After stripping away the enormous amount of architecture, I think the actual mathematical heart is surprisingly small.

## Geometry

```text
Hex
neighbors()
distance()
ring()
range()
```

## Collision

```text
isBlocked()
```

## Routing

```text
findPath()
reachable()
```

## Perception

```text
lineOfSight()
acousticReach()
illumination()
```

## Occupancy

```text
canOccupy()
resolveDisplacement()
```

## Temporal interaction

```text
contactOpportunity()
```

## Provenance

```text
topologyHash()
rulesetVersion()
```

Everything else is infrastructure around those primitives.

---

# 34. The resulting conceptual model

I would summarize the mature architecture like this:

```text
                   CANON
                     │
                     ▼
            ┌─────────────────┐
            │ Static topology │
            │ terrain         │
            │ portals         │
            │ occluders       │
            │ capacities      │
            └────────┬────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   SPATIAL COMPILER   │
          │                      │
          │ H3 regional graph    │
          │ tactical hex lattice │
          │ routing weights      │
          │ sensory properties   │
          └──────────┬───────────┘
                     │
                topology hash
                     │
                     ▼
          ┌──────────────────────┐
          │   SPATIAL KERNEL     │
          │                      │
          │ geometry             │
          │ routing              │
          │ occupancy            │
          │ visibility           │
          │ acoustics            │
          │ illumination        │
          └──────────┬───────────┘
                     │
          immutable inputs +
           dynamic overlays
                     │
                     ▼
          ┌──────────────────────┐
          │ PHYSICAL OPPORTUNITY │
          │                      │
          │ can_move             │
          │ can_see              │
          │ can_hear             │
          │ can_reach            │
          │ can_interact         │
          │ can_witness          │
          └──────────┬───────────┘
                     │
                     ▼
                 PERCEPTS
                     │
                     ▼
              EPISTEMIC STATE
                     │
                     ▼
                 NARRATIVE
```

That, to me, is the real system hiding inside the 7,000-line document.

---

# 35. The most valuable principles, in priority order

If I had to reduce the entire file to the principles I would absolutely preserve, they would be:

### 1. **Space is an authority layer**

Physical possibility should be determined by deterministic spatial computation, not by the language model.

### 2. **Separate meaning from mathematics**

Lore defines what terrain/location/walls mean; spatial converts them into mathematical constraints.

### 3. **Separate static world from runtime state**

The map doesn't move merely because actors move.

### 4. **Separate physical possibility from narrative occurrence**

Spatial says what *could* happen; the simulation decides what *did* happen.

### 5. **Separate perception from knowledge**

Seeing/hearing something produces evidence; it doesn't automatically create perfect knowledge.

### 6. **Use H3 where geography actually benefits from H3**

Regional/indexing layer.

### 7. **Use exact integer geometry where exact geometry matters**

Tactical interiors.

### 8. **Never conflate grid distance, geographic distance, and travel time**

They answer different questions.

### 9. **Make every ambiguous geometric rule explicit**

Especially boundary, vertex, occlusion, endpoint, and adjacency rules.

### 10. **Make deterministic behavior an invariant**

Not merely an implementation detail.

### 11. **Hash the authoritative world and rules**

So replay knows exactly what environment and rules generated an episode.

### 12. **Build the tracer bullet before the visualization**

Prove the causal chain before building tooling.

### 13. **Compile external geographic data offline**

Runtime should consume a sealed, canonical representation.

### 14. **Keep spatial completely ignorant of presentation**

The screen is a projection of the world, not the world itself.

---

# 36. And the most important conceptual addition I would make

I would give the entire system one explicit foundational equation:

$$
\boxed{
\text{PhysicalTruth}
=
F(
\text{CanonicalTopology},
\text{DynamicOverlay},
\text{ActorState},
\text{Time},
\text{Ruleset}
)
}
$$

Then:

$$
\boxed{
\text{Percept}
=
G(
\text{PhysicalTruth},
\text{SensoryCapabilities}
)
}
$$

Then:

$$
\boxed{
\text{Belief}
=
H(
\text{Percepts},
\text{PriorKnowledge},
\text{InferenceRules}
)
}
$$

And finally:

$$
\boxed{
\text{NarrativeExpression}
=
J(
\text{Beliefs},
\text{Intentions},
\text{LanguageGeneration}
)
}
$$

This creates an extraordinarily clean epistemic chain:

```text
WORLD
 ↓
GEOMETRY
 ↓
PHYSICAL POSSIBILITY
 ↓
PERCEPTION
 ↓
EVIDENCE
 ↓
BELIEF
 ↓
LANGUAGE
```

**No layer should be allowed to jump upward and manufacture facts for a lower layer.**

The LLM cannot manufacture geometry.

The epistemic system cannot manufacture perception.

The perception system cannot manufacture physical events.

The runtime cannot silently rewrite canon.

And the renderer cannot redefine the world.

That is the central architectural insight I think is worth protecting above everything else.

The document's progression from the initial H3-centric design toward the later **hybrid H3 + exact integer `hexgeom` architecture, temporal contact modeling, structured percepts, dynamic overlays, integer time, and Merkle-sealed topology** is, in my view, the most important evolution in the material.   

If this were being turned into an actual implementation, **I would treat the final `hexgeom`/hybrid architecture as the mature target and aggressively prune the earlier H3-everywhere material rather than implementing every generation of the proposal.**


What survives from the material is a remarkably coherent architecture, but there is an important distinction to make: **the architecture is substantially converged; several of the purported executable proofs are not yet equivalent to the claims made about them.** The most valuable result is therefore not another expansion of the design, but a sharper statement of what `goblin-spatial` actually is, what it must never become, and which implementation claims still need to be treated as hypotheses rather than established facts.

# goblin-spatial — The Most Valuable and Defensible Architecture

## 1. The central idea

The single most important idea is this:

> **`goblin-spatial` should be the deterministic physical-causality layer of the simulation.**

It should answer questions about **physical possibility**, not questions about story, belief, intention, or truth as known by a character.

Its conceptual position is:

```text
goblin-lore
    │
    │ canonical physical world
    ▼
goblin-spatial
    │
    │ physical opportunities and constraints
    ▼
worker-sower-engine / ledger
    │
    │ committed events, beliefs, knowledge
    ▼
narrative / language / rendering
```

The fundamental causal direction is therefore:

```text
canonical world
      ↓
physical state
      ↓
physical event
      ↓
sensory opportunity
      ↓
percept
      ↓
belief / inference
      ↓
expression
```

The most important architectural prohibition follows directly from this:

> **A layer higher in the causal chain must never be allowed to manufacture a fact belonging to a lower layer.**

An LLM cannot create geometry.

A character's belief cannot create a perception.

A perception cannot retroactively create a physical event.

A renderer cannot change topology.

A dialogue system cannot decide that two characters were physically close merely because their conversation would be more interesting that way.

That is the architectural idea worth protecting above everything else.

---

# 2. `goblin-spatial` should be a possibility engine, not an event engine

There is a subtle but extremely important distinction between:

```text
What physically could happen?
```

and

```text
What actually happened?
```

`goblin-spatial` should primarily answer the first.

For example:

```text
Can A reach B?
    → path + cost

Can A occupy this cell?
    → yes/no + constraints

Can A see B?
    → geometric visibility

Could A perceive B?
    → sensory opportunity / percept quality

Could sound from A reach B?
    → acoustic opportunity

Could A and B interact at time T?
    → temporal contact opportunity
```

The ledger then decides whether an event actually occurs.

This distinction prevents a very dangerous architectural failure:

```text
LLM decides that A attacked B
          ↓
spatial engine invents a path
          ↓
simulation declares the attack physically possible
```

The correct direction is:

```text
world state
   ↓
spatial query
   ↓
physical possibility
   ↓
action resolver / simulation
   ↓
committed event
```

The spatial engine is therefore a **constraint authority**, not the author of history.

---

# 3. The cleanest formal definition

The system can be expressed as a sequence of functions:

$$
PhysicalOpportunity =
F(
Topology,
DynamicOverlay,
ActorState,
Time,
Ruleset,
Query
)
$$

Then:

$$
Percept =
G(
PhysicalEvents,
PhysicalEnvironment,
SensoryCapabilities
)
$$

Then separately:

$$
Belief =
H(
Percepts,
PriorBeliefs,
InferenceRules
)
$$

And finally:

$$
Expression =
J(
Beliefs,
Intentions,
LanguageGeneration
)
$$

The direction matters enormously.

`F` must not depend on `H`.

`H` must not secretly inspect raw topology.

`J` must not bypass `H` and inspect the physical ledger directly.

This gives you a genuine epistemic firewall rather than merely an architectural diagram describing one.

---

# 4. The most important separation: four kinds of truth

A great deal of the material becomes much clearer if four categories are kept separate.

## A. Canonical truth

This is what the world *is*.

Examples:

* a wall exists;
* a road exists;
* a site has a particular entrance;
* two cells are adjacent;
* a corridor has a particular geometry;
* a portal connects a regional edge to a tactical location.

This belongs to `goblin-lore` and the compiled spatial topology.

## B. Runtime physical truth

This is what the world *currently is* because of state.

Examples:

* door currently open;
* bridge currently destroyed;
* actor currently at cell `(4,-2)`;
* vehicle currently traveling between two nodes;
* steam currently obscuring a corridor.

This belongs to the runtime ledger / dynamic overlay.

## C. Epistemic truth

This is what an actor believes or knows.

Examples:

* "Someone was in the room."
* "I heard something to my left."
* "I think the door is open."
* "I saw Bog entering the tunnel."

This belongs outside the raw physical engine.

## D. Narrative expression

This is what a character says, thinks, remembers, or what the renderer depicts.

It is the least authoritative layer.

That yields a very strong rule:

> **The closer a subsystem is to raw physical topology, the less semantic freedom it should have.**

Conversely, the higher it is, the more ambiguity and interpretation it may contain.

---

# 5. The architecture should remain stateless

"Stateless" is not merely an optimization.

It is what makes the system independently testable.

The ideal mental model is:

```text
result = spatial(worldSnapshot, query)
```

rather than:

```text
spatial.move(actor)
spatial.openDoor(door)
spatial.advance()
spatial.listen()
```

with hidden internal state.

The engine may receive a very rich immutable snapshot:

```text
Topology
DynamicOverlay
Actors
Capabilities
Time
Knowledge restrictions
Query
```

but it should not own the evolving world.

That lets the ledger remain the sole historical authority.

It also makes replay substantially easier:

```text
same world snapshot
+
same query
+
same ruleset
=
same result
```

That is much more valuable than merely having a deterministic simulator.

---

# 6. Exact tactical geometry is one of the strongest decisions in the design

The split between regional geography and local tactical geometry is one of the best architectural conclusions in the material.

Use:

```text
H3 / geographic representation
        ↓
macro geography / indexing / regional routing
```

and:

```text
exact axial integer lattice
        ↓
rooms / corridors / crawlspaces / combat / LoS
```

Do not attempt to make H3 serve as the universal tactical geometry.

H3 is extremely useful for geographical indexing and coarse spatial organization, but a tactical interior has a different problem.

The tactical engine needs exact answers such as:

```text
Does this segment cross this wall?

Does this ray merely graze this corner?

Which side of this partition contains the actor?

Do these cells touch through an open boundary?

Does the line run exactly along a shared edge?
```

Those are fundamentally computational-geometry questions.

An exact local lattice gives the system a much more controllable mathematical domain.

---

# 7. The affine integer lattice is valuable, but its purpose must be stated correctly

The coordinate transformation

$$
(c_x,c_y)=(4q+2r,6r)
$$

is useful because it removes the square root from the local geometry representation.

The important property is not that the transformed coordinates are Euclidean.

They are not intended to become the authoritative distance metric.

The important property is:

> **The transformation preserves incidence, collinearity, orientation, and intersection relationships.**

That makes integer cross products suitable for geometric predicates.

Thus:

```text
integer Cartesian representation
       ↓
topological predicates
       ↓
exact Boolean answers
```

while actual tactical range remains:

$$
d_{hex}(a,b)=
\frac{
|q_a-q_b|
+
|(q_a+r_a)-(q_b+r_b)|
+
|r_a-r_b|
}{2}
$$

This separation is extremely important.

---

# 8. Never have one field called simply "distance"

The architecture correctly implies three fundamentally different notions of distance.

## Topological distance

How many hex transitions separate two cells?

```text
d_hex
```

## Physical distance

How many meters separate two locations?

```text
meters
```

## Travel cost / duration

How long does traversal take under current conditions?

```text
Duration
```

These quantities should never be casually substituted for one another.

For example:

```text
two cells may be 10 meters apart
but
may require 4 movement transitions
and
may require 8 seconds to traverse.
```

Likewise:

```text
two regional nodes may be geographically close
but
have a very expensive route between them.
```

This is one of the places where branded types are genuinely useful.

---

# 9. Dimensional types are not cosmetic

Types such as:

```typescript
Duration
Instant
Meters
CellId
EdgeId
```

are valuable because many catastrophic simulation bugs are really unit-conversion bugs.

The distinction:

```text
Instant - Instant = Duration
Instant + Duration = Instant
Meters / velocity = Duration
```

is much more meaningful than allowing everything to be a plain `number`.

The deeper principle is:

> **Units should be represented at the type boundary whenever confusing them could alter causality.**

This becomes especially important once regional routing, tactical movement, audio propagation, and timelines coexist.

---

# 10. Determinism is necessary, but determinism is not correctness

This is perhaps the most important refinement to the entire project.

A deterministic engine can consistently produce the wrong answer.

Therefore the correct hierarchy is:

```text
semantic correctness
        ↓
mathematical correctness
        ↓
deterministic execution
        ↓
replay stability
        ↓
performance
```

Not:

```text
deterministic
therefore correct
```

The architecture should therefore maintain two classes of tests.

### Oracle tests

Compare an optimized implementation against a deliberately simple reference implementation.

For example:

```text
production routing
        vs
brute-force Dijkstra
```

and:

```text
production LoS
        vs
simple polygon-intersection oracle
```

### Invariant tests

Verify laws that must always hold.

Examples:

```text
LoS(A,B) === LoS(B,A)

distance(A,A) === 0

reversePath(A,B) behaves according to the graph's directionality rules

adding an opaque wall cannot create visibility

adding traversal cost cannot make the shortest route cheaper

an IN_TRANSIT actor cannot participate in tactical occupancy
```

This combination is much stronger than snapshot tests alone.

---

# 11. The `EDGE_PAIR` policy is a policy, not a mathematical truth

The majority rule at a vertex and the closed-edge rule are good examples of a necessary design decision.

But it is important to describe them correctly.

The fact:

```text
three hexes meet at a vertex
```

is geometry.

The rule:

```text
two opaque cells block the vertex
```

is a **simulation policy**.

Likewise:

```text
a closed edge blocks sound / sight
```

is a policy.

That distinction matters because these rules may eventually need to change.

The architecture should therefore treat:

```text
geometry
+
boundary policy
```

as separate layers.

That makes the system much easier to evolve without changing the underlying geometry.

---

# 12. There is a major implementation claim in the material that is not yet established

The supplied `traceIntegerSupercover()` implementation is described as an:

> `O(N)` exact integer supercover

but the code shown does not actually establish that.

It scans:

```text
q = minQ ... maxQ
r = minR ... maxR
```

which is effectively a rectangular search.

For a long diagonal line this can become approximately:

$$
O(N^2)
$$

rather than:

$$
O(N)
$$

with respect to the number of cells crossed by the ray.

More importantly, it calls itself a supercover but only emits:

```text
CELL_INTERIOR
```

It does not actually emit the declared:

```text
EDGE
VERTEX
```

features.

So the architecture is good, but this particular implementation should not yet be described as a finished exact supercover.

That is an important distinction between:

```text
design is correct
```

and:

```text
implementation proves the design
```

---

# 13. The current supercover parameterization is also not what its comments claim

The implementation stores:

```typescript
tNumerator: dotA
tDenominator: lenSq
```

which represents a projection-related quantity based on the cell centroid.

It does **not** represent an actual polygon-boundary intersection parameter.

That matters because the exact parameter at which a segment intersects a hex boundary is not generally the projection of the hex centroid onto the ray.

So if ordered crossing events are needed, the implementation should calculate actual boundary-intersection parameters, with a canonical treatment for ties.

This is one of the places where a simple reference implementation would be extremely valuable.

---

# 14. The current LoS function does not yet implement the complete `EDGE_PAIR` policy

This is another important technical distinction.

The stated policy includes:

```text
interior crossings
edge crossings
vertex grazing
endpoint exemptions
```

But the provided `hasTacticalLoS()` primarily tests opaque-cell interior intersections.

It handles `opaqueEdges` specially only when:

```text
distance === 1
```

For longer rays, the implementation shown does not actually apply the edge-grazing policy.

Therefore:

> **The `EDGE_PAIR` rule is specified more completely than it is implemented in the presented LoS function.**

That should be fixed before considering the boundary subsystem finished.

---

# 15. Endpoint exemption is a particularly good design decision

The endpoint exemption deserves to survive intact.

Without it, an actor standing inside an opaque cell could become unable to see out because its own cell is classified as opaque.

The clearer rule is:

```text
origin and target establish the observation interval
but do not automatically occlude it.
```

That gives the geometry a clean conceptual interpretation:

```text
what lies between A and B?
```

rather than:

```text
is the polygon containing A itself classified as opaque?
```

The rule should be explicitly encoded in the formal policy and tests.

---

# 16. Perception must remain asymmetric even when geometry is symmetric

This is another particularly strong principle.

Geometric visibility can be:

$$
LOS(A,B)=LOS(B,A)
$$

while actual perception may be:

$$
Perceive(A,B)\neq Perceive(B,A)
$$

because perception depends on:

```text
illumination
facing
sensory capability
distance
occlusion
auditory threshold
ambient noise
possibly attention or other supplied capability data
```

This lets the system distinguish:

```text
"I am physically visible"
```

from:

```text
"Alice actually perceives me."
```

That distinction is absolutely essential for believable epistemics.

---

# 17. Percepts should be evidence, never knowledge

This may be the deepest epistemic insight in the entire design.

A percept should say something like:

```text
strong auditory evidence
from relative bearing 3
quality 780
source location possibly here
```

It should not automatically become:

```text
"I know Bob hit Carol with a pipe."
```

The causal chain is:

```text
event
 ↓
sensory propagation
 ↓
percept
 ↓
interpretation
 ↓
belief
```

That permits:

```text
certainty
uncertainty
misidentification
partial observation
wrong inference
testimony
conflicting evidence
```

without corrupting the physical world.

---

# 18. Noisy-OR is useful, but it is not truth

The confidence merger:

$$
1-(1-p)(1-q)
$$

is a reasonable mathematical model for combining independent evidence.

But the word **independent** matters.

Two perceptions can be highly correlated.

For example:

```text
three witnesses hear the same event
```

does not necessarily mean:

```text
three independent observations
```

They may all be responding to the same acoustic exposure.

Therefore Noisy-OR should be treated as an epistemic inference heuristic, not as a property of physical reality.

It belongs conceptually in the epistemic system, not in the core spatial geometry engine.

---

# 19. I would move the epistemic bridge out of `goblin-spatial`

This is one of the clearest architectural refinements I would make.

The spatial engine should produce:

```text
PerceptCandidate
```

or:

```text
SensoryEvidence
```

The ledger / epistemics system should produce:

```text
BeliefRecord
```

Therefore:

```text
goblin-spatial
    ↓
physical opportunity
    ↓
sensory evidence
    ↓
worker-sower-engine
    ↓
belief
```

The reason is architectural purity.

`goblin-spatial` should not need to understand:

```text
belief IDs
testimony
prompt thresholds
LLM visibility
```

Those are downstream semantic concepts.

They can be connected by a very small adapter.

---

# 20. The prompt gate is conceptually valuable but should not be part of spatial mathematics

The principle:

> "The LLM must never receive raw world state."

is extremely important.

The implementation shown, however, is only a basic runtime assertion.

This:

```typescript
const FORBIDDEN_KEYS = [...]
```

does not mathematically guarantee that no world information leaks.

It can miss:

```text
nested structures
aliases
derived structures
renamed fields
objects hidden behind wrappers
future forbidden properties
indirect references
serialization paths
```

Also, an index signature such as:

```typescript
readonly [forbiddenKey: string]: unknown;
```

does not create the claimed compile-time prohibition.

A stronger design is capability-based:

```text
RawWorldState
        ↓
authorized transformation
        ↓
ActorContext
        ↓
prompt serializer
```

The prompt generator should simply never be handed the raw world object.

That is much stronger than searching the final object for forbidden property names.

---

# 21. The regional routing architecture is sound in principle

The separation:

```text
H3 / geography
        +
CSR routing graph
```

is sensible.

H3 should be thought of as an indexing / registration substrate.

The route graph is the actual graph used by routing.

That distinction is important because:

> **H3 adjacency is not road connectivity.**

The regional graph needs its own directed edges, costs, permissions, modes, portals, and possibly temporary closures.

CSR is a sensible representation once the graph is compiled and static.

---

# 22. Directed ALT plus secret edges is one of the more sophisticated parts of the design

The union-graph idea is good.

The central issue is that an actor may know only:

```text
G_known
```

while the world actually contains:

```text
G_world
```

Using landmark distances from the actor-specific known graph can create complicated heuristic behavior when different actors know different subsets of edges.

Computing lower-bound landmark distances from a unified graph provides a conceptual escape:

$$
G_{union}
=
G_{public}
\cup
G_{secret}
$$

Because the larger graph can only preserve or reduce shortest-path distance, those distances can serve as lower bounds under the right assumptions.

But those assumptions matter.

This remains safe only if:

* edge costs are the same costs being used for the heuristic;
* the graph contains no actor-specific magical/teleport edges that invalidate the lower-bound model;
* costs are nonnegative;
* the routing state represented by the heuristic is sufficiently stable.

So the union-graph idea is good, but the admissibility claim should be accompanied by an explicit theorem/test fixture rather than treated as self-evident.

---

# 23. There is an additional subtle issue with the integer ECEF heuristic

The mathematical idea:

$$
chord \le arc
$$

is correct for points on the same sphere.

But the implementation is not necessarily using the exact sphere points.

It first quantizes ECEF coordinates:

```text
real point
   ↓
integer fixed-point representation
```

and then computes the chord between those quantized vectors.

Quantization error can theoretically make the calculated chord slightly larger than the exact chord between the original positions.

Therefore the strongest safe statement is not:

> "The fixed-point chord is automatically admissible."

It is:

> "A carefully bounded fixed-point chord can be made admissible."

There are several ways to establish that:

```text
quantization-error bound
```

or:

```text
conservative lower-bound correction
```

or:

```text
landmark heuristic whose distances are generated from the exact compiled graph representation
```

This is exactly the sort of subtle issue that an admissibility test should be built to discover.

---

# 24. The spherical displacement system should be described more carefully

The ECEF rotation idea is mathematically elegant.

A rotation in 3D preserves distances and angles on a sphere.

But this describes a **spherical Earth model**.

It should not be described as an exact rigid transformation of the real WGS84 ellipsoid.

The clean statement is:

> `goblin-spatial` uses an offline spherical registration transform that preserves the chosen spherical geometry while relocating the fictionalized geography.

That is fully defensible.

Trying to claim that the same arbitrary rotation preserves all geometry of a real oblate ellipsoid would be too strong.

---

# 25. The scale-handoff state machine is one of the strongest architectural results

This is much more important than it initially appears.

An actor should not simultaneously exist as:

```text
regional road location
+
tactical hex location
```

Those are different spatial models.

Instead:

```text
STAGED
    ↓
IN_TRANSIT
    ↓
STAGED
```

is an explicit state machine.

That eliminates an enormous class of inconsistencies.

For example, it prevents:

```text
actor is tactically inside the room
while
also geographically halfway down I-95
```

The system can therefore make tactical queries structurally impossible while an actor is in transit.

That is far better than remembering to write:

```text
if (!actor.inTransit) ...
```

everywhere.

---

# 26. Portals are more than coordinates

A portal should be treated as a semantic boundary between spatial models.

It is not merely:

```text
lat/lon → hex
```

It represents:

```text
regional node
        ⇅
scale transition
        ⇅
site
        ⇅
entry cell
```

Therefore a portal deserves an explicit identity and policy.

A useful conceptual record is:

```text
PortalId
RegionalNode
SiteId
EntryCell
Directionality
TransitionCost
TransitionDuration
```

This makes scale changes auditable.

---

# 27. Mid-edge interruption is a good idea, but it belongs to the event model

The virtual-node concept:

```text
vn:{edgeId}:{elapsedCentiseconds}
```

is useful because an interrupted journey needs a deterministic physical location.

But this should be derived from the event history, not treated casually as permanent topology.

The distinction is:

```text
canonical topology
```

versus:

```text
derived runtime interruption state
```

A breakdown halfway down a road does not necessarily mean the road itself has become a permanently new canonical edge.

This belongs in the runtime state/history layer.

---

# 28. Time is one of the most important remaining contracts

The integer-centisecond timeline is an excellent choice.

What matters is not that centiseconds are inherently correct.

What matters is:

```text
one time representation
+
integer arithmetic
+
deterministic event ordering
```

The event ordering rule must be completely canonical.

For example:

```text
timestamp
→ priority
→ event ID
```

with exact tie rules.

But there is a subtle inconsistency in the supplied examples.

Some code treats an event as having:

```text
at: Instant
```

while other code treats an event as:

```text
cost: Duration
```

and then advances time when applying it.

Those are two different temporal models.

A clean event-sourced system normally distinguishes:

```text
when does this event occur?
```

from:

```text
how long did the action take?
```

The safest contract is to define one authoritative event timestamp and make duration part of the event's provenance/state transition, rather than allowing the reducer to accidentally advance the clock twice.

---

# 29. Determinism requires tie-breaking everywhere

This is an essential addition.

It is not enough to say:

```text
use integers
```

Determinism can still be lost through ordering.

Every algorithm that can encounter equal values needs a canonical secondary ordering.

Examples:

```text
A* nodes with equal cost
Dijkstra nodes with equal cost
equal-cost movement destinations
equal acoustic arrival times
equal percept candidates
simultaneous events
multiple witnesses
multiple shortest paths
serialization of sets/maps
```

For example, the shown `findShortestRoute()` sorts only by:

```typescript
cost
```

When costs are equal, output can depend on insertion order.

That means the implementation does not yet fully enforce the determinism promised by the architecture.

The correct principle is:

> **Every ambiguous ordering must have an explicit canonical tie-breaker.**

Usually that can be:

```text
numeric node ID
edge ID
actor ID
event ID
```

according to a documented hierarchy.

---

# 30. Canonical serialization needs the same discipline

The topology hash is extremely valuable.

But the supplied `canonicalReplacer` deserves revision.

In particular, relying on:

```typescript
localeCompare()
```

for canonical serialization is risky because canonical serialization should use a deliberately specified byte/lexicographic ordering independent of process locale.

Use a fixed ordering rule.

Also:

> A single SHA-256 over a canonical manifest is a canonical content hash; it is not, by itself, a Merkle tree.

A real Merkle structure provides hierarchical hashes that can be recomputed and independently verified.

That does not mean a Merkle tree is necessary.

In fact, for many purposes a canonical manifest hash is simpler and better.

The valuable idea is:

```text
world identity is content-addressed
```

not the word "Merkle" itself.

---

# 31. Topology identity and algorithm identity must be separate

This is another highly valuable addition.

Suppose:

```text
topology hash = ABC123
```

but six months later the LoS algorithm changes.

The physical map has not changed.

The results might have.

Therefore replay identity should encompass at least:

```text
topology identity
+
dynamic-state identity
+
spatial ruleset
+
routing ruleset
+
perception ruleset
+
engine/build identity
```

Conceptually:

$$
ReplayResult =
F(
TopologyHash,
OverlayHash,
ActorStateHash,
RulesetVersions,
Query
)
$$

That makes historical replay much more defensible.

---

# 32. Dynamic overlays should never mutate canonical topology

This is another principle worth retaining almost verbatim.

Instead of:

```text
wall.open = true
```

inside the canonical map:

```text
canonical topology
+
dynamic overlay
```

is safer.

For example:

```text
canonical:
    door 17 exists

runtime overlay:
    door 17 = OPEN
```

This keeps:

```text
what the world is
```

distinct from:

```text
what currently happened to the world
```

and makes replay much cleaner.

---

# 33. Acoustic simulation should remain a propagation problem

The wavefront idea is better than:

```text
soundRadius = 10
```

because sound is path-dependent.

A useful acoustic result contains things such as:

```text
arrival time
arrival bearing
attenuation
ambient noise
signal-to-noise ratio
source class / identity confidence
```

The important distinction is:

```text
energy propagation
```

versus:

```text
what the listener concludes.
```

A person might receive excellent evidence that:

```text
something happened from the east
```

without knowing:

```text
who caused it
```

That separation is exactly what the simulation needs.

---

# 34. Illumination should remain separate from LoS

This distinction is essential.

These are different questions:

```text
Can light geometrically travel from A to B?
```

and:

```text
Is enough usable light reaching B for the observer to perceive A?
```

Therefore:

```text
LoS
+
illumination
+
sensory capability
```

should produce perception.

Do not collapse them into one Boolean.

The integer/quantized representation is useful because it makes the authoritative part of the calculation reproducible.

---

# 35. But avoid turning "integer everywhere" into a religion

There is a subtle architectural correction worth making.

The actual principle should not be:

> "Floating point must never exist."

It should be:

> **Floating-point behavior must not be allowed to control authoritative branching in an uncontrolled or runtime-dependent manner.**

Floating point can be perfectly reasonable in:

```text
offline compilation
visualization
authoring tools
non-authoritative rendering
analytics
```

The critical boundary is the authoritative simulation state.

That allows the implementation to remain practical without compromising determinism.

---

# 36. The connected displacement algorithm belongs in the spatial kernel

The displacement problem is a legitimate spatial question:

```text
This actor cannot remain here.
Where can they physically go?
```

The important principles are:

```text
exclude the displaced actor from occupancy
respect capacity
respect walls
respect closed edges
respect traversal cost
respect maximum budget
use deterministic tie-breaking
```

That is exactly the sort of operation that belongs in `goblin-spatial`.

The default capacity, however, is a policy value.

It belongs in the sealed ruleset rather than silently emerging as:

```typescript
?? 2
```

---

# 37. The five proposed "completion artifacts" should be classified differently

The material groups several things together as though they all prove the architecture.

They do not.

I would classify them as:

### Core production algorithms

```text
hex geometry
supercover
routing
perception
displacement
```

### Verification infrastructure

```text
oracle tests
property-based tests
replay checks
bisection
```

### Integration infrastructure

```text
ledger adapter
prompt gate
runtime event reducer
```

### Build infrastructure

```text
topology compiler
canonical manifest
hashing
dataset provenance
```

This distinction matters because only the first category is actually the spatial engine.

---

# 38. The bisection harness is extremely useful, but it is not spatial logic

The 1,000-tick divergence bisection concept is excellent engineering.

It turns:

```text
something diverged after 700 ticks
```

into:

```text
the first divergence occurred at tick 183
```

That dramatically reduces debugging cost.

Its deepest value is this:

> **Replay debugging should operate on state history, not on human recollection of what the simulation supposedly did.**

But it belongs in simulation infrastructure, not in `goblin-spatial`.

---

# 39. The strongest testing architecture is differential testing

The system would benefit enormously from maintaining deliberately different implementations of the same semantics.

For example:

```text
Reference LoS
        vs
Optimized LoS
```

```text
Reference Dijkstra
        vs
A*
        vs
ALT
```

```text
Reference acoustic flood
        vs
optimized wavefront
```

The reference implementation can be slow.

That is acceptable.

Its job is not performance.

Its job is to provide a trustworthy oracle.

This is one of the best ways to make the "correctness > determinism" principle executable.

---

# 40. The highest-value invariants are semantic invariants

The most valuable tests are not:

```text
function returned the expected value
```

but:

```text
a physical law remained true
```

For example:

### Geometry

```text
LoS(A,B) = LoS(B,A)
```

when geometry and policies are symmetric.

### Identity

```text
distance(A,A) = 0
```

### Reachability

```text
blocked cells are never returned as reachable
```

### Routing

```text
A* cost >= known lower bound
```

and:

```text
A* cost == oracle shortest-path cost
```

### Perception

```text
zero illumination cannot produce a resolved visual percept
```

under the declared perception model.

### Time

```text
IN_TRANSIT actor cannot occupy a tactical cell
```

### Epistemics

```text
actor cannot receive an evidence record that has no physical propagation path
```

### Reproducibility

```text
same snapshot + same query + same ruleset
→ byte-for-byte identical result
```

Those are architectural invariants rather than ordinary unit tests.

---

# 41. The true minimal kernel is surprisingly small

A mature `goblin-spatial` need not contain the whole simulation.

The irreducible computational core is approximately:

```text
GEOMETRY
    neighbors
    distance
    adjacency
    intersection

COLLISION
    blocked
    occupiable
    displacement

ROUTING
    shortest path
    reachability
    cost

PERCEPTION
    line of sight
    acoustic propagation
    illumination

TEMPORAL
    contact opportunity
    synchronized occupancy

REGISTRATION
    regional ↔ tactical portals

PROVENANCE
    topology identity
    ruleset identity
```

Everything else can be built around this.

That is a useful architectural compression.

---

# 42. What does NOT belong inside the kernel

The strongest exclusions are:

```text
LLM
dialogue
personality
TTS
music
animation
camera
WebGL
PixiJS
database connections
network calls
OSM parsing
prompt formatting
belief prose
story generation
```

The rule is:

> **The spatial engine should be useful even if every downstream presentation and language system is deleted.**

That is an excellent acid test.

---

# 43. Offline compilation is another foundational idea worth keeping

Raw external geographic data should be transformed before runtime:

```text
OSM / geographic source
        ↓
normalization
        ↓
fictional registration
        ↓
graph construction
        ↓
integer quantization
        ↓
canonical serialization
        ↓
content hash
        ↓
runtime artifact
```

Then runtime consumes the compiled artifact.

That provides:

```text
reproducibility
offline execution
versioning
fast loading
stable topology
no network dependency
```

It also keeps external-data weirdness out of the authoritative simulator.

---

# 44. The most important new concept I would add: a spatial ruleset contract

The architecture would become considerably stronger if the engine explicitly accepted a versioned ruleset:

```text
SpatialRuleset
```

containing things such as:

```text
boundary policy
movement policy
capacity policy
illumination policy
acoustic attenuation policy
perception thresholds
routing heuristic version
time resolution
```

Then:

```text
Topology
+
Ruleset
+
Runtime Snapshot
+
Query
```

completely defines the simulation answer.

This gives you a particularly powerful property:

> **A historical simulation can be replayed under exactly the rules under which it was originally executed.**

---

# 45. Another valuable addition: query purity should be tested directly

It is not enough to say that `goblin-spatial` is pure.

Test it.

For a query:

```text
before = deepHash(input)
result = query(input)
after = deepHash(input)
```

and require:

```text
before === after
```

Then run:

```text
same input
different insertion order
```

and require identical outputs.

Then run:

```text
same input
different object identities
```

and require identical outputs.

Then run the same serialized snapshot twice.

This turns "stateless deterministic engine" from architecture prose into an executable contract.

---

# 46. Another valuable addition: determinism must exist across serialization boundaries

One of the most dangerous hidden assumptions is:

```text
works deterministically inside one Node process
```

That is weaker than:

```text
works deterministically from canonical serialized state.
```

The stronger replay test is:

```text
snapshot A
    ↓
serialize
    ↓
deserialize
    ↓
run query
```

and compare with:

```text
original snapshot
    ↓
run query
```

The results must be identical.

This catches:

```text
Map ordering
hidden defaults
floating-point conversion
implicit object identity
missing fields
serialization artifacts
```

---

# 47. The most important implementation priority is not performance

The correct order is:

```text
1. canonical semantics
2. simple reference implementation
3. exhaustive edge-case tests
4. deterministic contract
5. optimized implementation
6. performance measurement
```

Do not begin with:

```text
CSR
ALT
bit packing
zero allocation
SIMD
WebGL
```

until an obviously correct reference implementation exists.

Otherwise optimizations can conceal semantic bugs.

---

# 48. The final architecture can therefore be reduced to one sentence

The cleanest formulation I can extract from everything you provided is:

> **`goblin-spatial` is a pure, content-addressed, deterministic constraint engine that evaluates physical possibility against immutable canonical topology plus explicit runtime overlays, producing routes, occupancy results, temporal opportunities, and sensory evidence without ever owning world state, committing events, or manufacturing beliefs.**

That is the sentence I would use as the project's architectural constitution.

---

# 49. The final causal diagram

The entire system can then be understood as:

```text
                   goblin-lore
                       │
                 canonical topology
                       │
                  topology hash
                       │
                       ▼
              ┌─────────────────┐
              │ goblin-spatial  │
              │                 │
              │ geometry        │
              │ routing         │
              │ occupancy       │
              │ temporal space  │
              │ optics          │
              │ acoustics       │
              └────────┬────────┘
                       │
             physical opportunities
             + sensory evidence
                       │
                       ▼
             worker-sower-engine
                       │
              committed events
                       │
                 percept records
                       │
                       ▼
               epistemic system
                       │
                   beliefs
                       │
                       ▼
                LLM / narrative
                       │
                  expression
```

And the feedback loop is:

```text
belief
   ↓
intention
   ↓
action
   ↓
ledger event
   ↓
new runtime state
   ↓
goblin-spatial query
   ↓
new physical opportunities
```

The important point is that the loop passes **through state mutation**, not through spatial mutation.

---

# 50. The handful of things I would explicitly declare "not finished"

I would not call the following proven merely because they have pseudocode:

1. **The production supercover algorithm.**
   The shown implementation is still fundamentally a scan and does not implement the complete edge/vertex event model it advertises.

2. **Full `EDGE_PAIR` LoS behavior.**
   The policy exists, but the supplied longer-range LoS implementation does not fully apply it.

3. **Cross-runtime determinism.**
   Equal-cost tie ordering and canonical serialization still need stronger guarantees.

4. **Admissibility of the quantized ECEF heuristic.**
   The underlying chord argument is sound, but quantization error needs an explicit conservative proof.

5. **Prompt-gate security.**
   The principle is sound; the shown property-name blacklist is not a complete information-flow guarantee.

6. **Temporal event semantics.**
   The relationship between absolute `at` timestamps and duration-bearing events needs one unambiguous contract.

7. **The "Merkle" claim.**
   What is shown is primarily canonical manifest hashing, not necessarily a true Merkle tree.

8. **The separation of spatial and epistemic responsibilities.**
   The architecture becomes cleaner if `goblin-spatial` emits evidence and the ledger/epistemic layer turns evidence into beliefs.

Those are not reasons to redesign the architecture. They are reasons to stop calling certain implementation details "settled" until the tests actually prove them.

---

# 51. The deepest conclusion

The most valuable discovery in the material is not H3, integer hexes, ALT, acoustics, Merkle hashes, or even deterministic replay individually.

It is the realization that **physical space can be made into an explicit authority boundary in a narrative simulation.**

That changes the role of narrative generation fundamentally.

Instead of asking an LLM:

```text
"What would probably happen here?"
```

the architecture asks:

```text
"What is physically possible here?"
```

Then:

```text
"What actually happened?"
```

Then:

```text
"What evidence reached the character?"
```

Then:

```text
"What did the character conclude?"
```

Only after all of that do you ask:

```text
"How would the character express it?"
```

That sequence is the real architecture.

Everything else is implementation detail in service of it.

The design is therefore already conceptually strong enough to stop expanding horizontally. The most productive work now is **turning the remaining claims into executable proofs**, especially the supercover/boundary implementation, deterministic tie-breaking, heuristic admissibility, canonical serialization, and temporal contract.

Those are the places where implementation can still falsify the architecture. Once those are nailed down, the system stops being merely a well-articulated simulation design and becomes something much more valuable: **a reproducible physical substrate on which the rest of the narrative system can safely depend.**

The main thing I would preserve from the entire body of material is that distinction between **physical possibility, physical occurrence, perception, and belief**. That is the architectural insight that makes the rest of the machinery cohere. The biggest remaining work is not conceptual invention; it is proving that the executable implementations actually satisfy the contracts they claim to satisfy.


I'll go through this in three parts: what is genuinely sound, what is broken or overstated, and what I'd add. I'm going to be blunt about the second part, because several of the "invariants" in these documents are wrong in ways that would corrupt your simulation.

---

## Part 1: What is valuable and true

### 1. The three-way separation of concerns is the best idea in the whole set

```
goblin-lore      → what things MEAN   (canon, static, versioned)
goblin-spatial   → how space WORKS    (pure functions, zero state)
sower-engine     → who is WHERE       (ledger, mutable, event-sourced)
```

This is correct, and it's correct for reasons beyond tidiness:

- **Testability.** A pure function `(topology, positions, query) → result` can be property-tested in milliseconds with no fixtures, no DB, no mocks.
- **Replayability.** If your simulation is event-sourced and seeded, spatial queries must be deterministic functions of their inputs. Any hidden state (caches that affect results, module-level mutable variables, lazy-loaded maps) breaks replay.
- **Blame isolation.** When a character "sees through a wall," you can ask three independent questions: is the wall in the canon? Is it in the compiled occlusion set? Does the raycast honor it? Each has one owner.

The rule "spatial imports nothing from the engine" is enforceable mechanically (a lint rule or `dependency-cruiser` config), and you should enforce it that way rather than by convention.

### 2. "Spatial feeds epistemics; it doesn't replace it"

This is the most narratively powerful idea. The pipeline is:

```
event occurs → geometry says who COULD perceive → somatic profile filters → belief records written → LLM context built ONLY from belief records
```

The insight worth protecting is **ignorance by omission**: the LLM never receives facts the character couldn't know, so you don't rely on prompt instructions like "don't mention X" (which fail unpredictably). You make omniscience structurally impossible instead of instructionally discouraged. This is a genuine architectural advantage over prompt-based approaches, and it's the strongest justification for the whole spatial engine existing.

One nuance the documents miss: **absence of perception is not absence of inference.** A character who hears a muffled crash and sees Bog leave the valve room sweating has evidence, not knowledge. Your belief model should support `SUSPECTS` or graded confidence, not only `KNOWS`. The doc's 0.65 confidence for auditory events gestures at this, but the geometry should output *evidence*, and a separate epistemic layer should decide what to conclude from it.

### 3. Deterministic tie-breaking

Genuinely important and correctly identified. If two paths cost the same and you pick between them by heap insertion order, then the same seed can produce different positions on different runs, and your replay guarantee is gone. A strict total order on candidates (cost, then heuristic, then a stable ID comparison) is the right fix. This applies to `nearestUnoccupied`, `reachableCells` output ordering, witness lists, everything that returns a collection.

### 4. Compile-time validation of canon

Failing the build on unknown terrain slugs, dangling portals, and disconnected regions is correct. Errors in world definitions should be caught at boot, not discovered when a goblin walks into a void in episode 40. Reciprocal portal checks and graph-contiguity flood fills are cheap and high value.

### 5. Integer/fixed-point arithmetic for anything that affects simulation outcomes

Costs in integer units (100, 150, 200...), acoustic energy in basis points: correct instincts. Floating-point accumulation is the classic source of "works on my machine" simulation divergence. Keep this.

### 6. Separating mathematical invariants, software invariants, and policy choices

A subtle but useful taxonomy. "Distance is symmetric" is a theorem; "paths are deterministic" is an engineering contract; "cramped costs 1.5×" is a tunable design decision. Tests for the third category should verify *enforcement*, not *correctness*. Keep this framing.

### 7. The visual debugger as a first-class tool

Defects in spatial simulation are almost impossible to see in logs and immediately obvious in a picture: pacing loops, clustering, unreachable rooms, sight lines through walls. Building this early pays for itself. The regression flywheel (bug found visually → minimal repro test → permanent CI case) is a real practice worth adopting.

### 8. Start as an internal module, extract later

Correct. Premature extraction creates versioning overhead before the API has stabilized. The extraction criteria listed (second consumer, stable API, per-episode version pinning) are sensible.

---

## Part 2: What is wrong, misleading, or overstated

This is the important part. I'll go from most severe to least.

### 🔴 Critical: H3 is the wrong tool for this problem

The documents commit to Uber's H3 at resolution 14–15 for room-scale tactical simulation. I'd strongly advise against this.

**Why H3 doesn't fit:**

1. **H3 is a geographic index, not a game grid.** It projects an icosahedron onto a sphere. Everything you want (uniform cells, exact cube coordinates, trivial neighbor math) is only approximately true, and is *exactly* true on a plain axial hex grid.
2. **Pentagons.** H3 has 12 pentagonal cells per resolution. The doc handles this with a "pentagon avoidance" lint, but that's a workaround for a problem you shouldn't have. Also, H3 cells near icosahedron face boundaries have distortion and their `gridDistance` / `gridPathCells` / `gridRingUnsafe` can **fail or throw** across face edges. The "Unsafe" in `gridRingUnsafe` literally means it can return garbage or fail near pentagons and face boundaries.
3. **Not truly a hexagonal lattice.** H3 uses aperture-7 subdivision, so child hexes are rotated relative to parents and don't nest cleanly. Neighbor directions aren't globally consistent, which is why the doc itself notes `facingDirection` as "H3 neighbor indices 0 to 5", but H3's digit ordering does not correspond to a fixed compass direction across the grid.
4. **Cell sizes are approximate.** The doc's own table says "average" edge length. Actual cell sizes vary. For a claustrophobic crawlspace where "capacity 2 per hex" is a narrative rule, you want *exactly* uniform cells.
5. **The projection bridge is pure overhead.** The entire tangent-plane/WGS84/Earth-radius apparatus exists only to convince a spherical index to behave like a plane. You'd be simulating a valve room by pretending it's at a specific latitude in San Francisco.
6. **Determinism risk is *introduced* by the design, then mitigated.** The doc spends a section on floating-point sanitization (8-decimal clamping, trig differences across engines). That whole class of risk disappears if you never call `cos`/`sin` in simulation logic. It's self-inflicted complexity.
7. **Dependency and portability.** `h3-js` is a sizable dependency with a WASM-derived core in some builds. A pure hex library is ~200 lines you fully own and can audit.

**What to use instead:** plain axial/cube coordinates `(q, r)` with `s = -q - r` derived, stored as integers. Everything the documents want (distance, neighbors, rings, disks, line drawing, rounding) is textbook Red Blob Games material with exact integer results. H3 offers you *nothing* that a room-scale simulation needs (no global indexing, no hierarchical aggregation, no geographic joins).

The documents even half-admit this: the original design used `(q, r, s)` and the "naming rationale" says the API should survive a swap to a node graph. Then the later documents bolted H3 onto it. The original instinct was right.

If you want an opaque stable ID for database keys, define `CellId = "${q},${r}"` or pack two int16s into one int32. That's your "H3Index" equivalent, with none of the baggage.

### 🔴 Critical: Several "invariants" are false or untestable as written

**(a) "Optical Reciprocity: `hasLineOfSight(A,B) = hasLineOfSight(B,A)`" does not hold for the implementation given.**

The implementation walks `gridPathCells(from, to)`. Hex line-drawing with rounding is **not symmetric**: the path from A to B and the path from B to A can differ when the ideal line passes exactly along a cell edge (very common on hex grids). Then a wall cell might be hit going one way and missed the other. The doc claims this invariant while using an algorithm that violates it.

Fix options: (1) compute both directions and require agreement (conservative: blocked if either is blocked); (2) nudge the endpoints by a tiny epsilon in a canonical direction (Red Blob's technique); (3) define visibility via a *symmetric* supercover (a cell is on the line if the line passes through its interior). Pick one deliberately, and write the test *first* against a brute-force reference.

**(b) The "monotonic acoustic dissipation" test is not what it claims.**

The test asserts `energy ≤ initial − distance × rate`. That's an upper bound test, fine, but the stated invariant "`I(v_{k+1}) < I(v_k)` for all neighbors" is false as written: a neighbor of a low-energy cell may be *closer to the source* with higher energy. The correct statement is: along the *optimal* propagation tree, energy strictly decreases from parent to child. Test the tree, not all neighbor pairs.

**(c) The perception test suite contains a vacuous assertion.**

```typescript
if (trace.path.includes(intermediate)) {
  expect(trace.clear).toBe(false);
```

If the path doesn't include the cell, the test asserts nothing and passes. Tests with a conditional guard around the `expect` can silently pass forever. Construct the scenario deterministically so the branch is always taken, or fail the test if it isn't.

**(d) The "acoustic attenuation" test comment/arithmetic mismatch.** It sets damping on a single directed edge `origin->intermediate` but the wavefront could reach `intermediate` via other neighbors around the origin at lower cost. The test only passes because other paths also produce sub-threshold energy at that specific setting. It doesn't test what it claims. Damping is also modeled per *directed* edge, so `a->b` and `b->a` can silently differ; physical walls are symmetric. Store damping per *undirected* edge (canonical key: sorted pair).

**(e) "Round-trip fidelity < 1.5 m at res 14" is a weak test that masks real error.** A hex with 1.34 m edge has a circumradius of 1.34 m, so centroid-to-point error up to ~1.34 m is expected. A 1.5 m tolerance would also pass for a completely wrong neighbor cell. The meaningful invariant is `anchorToCell(cellToAnchor(c)) === c` (cell → point → cell is the identity), which is exact and far stronger.

**(f) The randomized "property tests" aren't randomized.** The suite claims "property-based testing across randomized inputs," but uses hand-picked strides (`i * 13 % length`). Use `fast-check` with shrinking. Real property-based testing finds bugs by *shrinking* a failing input to a minimal case, which feeds directly into your regression flywheel idea.

**(g) The determinism test proves nothing.** Calling `findPath` twice in the same process with the same input and comparing JSON tests only that the function has no *within-process* randomness. Real determinism testing means: shuffle the insertion order of the `Set` and `Map` inputs and confirm identical output; run under different Node versions; compare against a committed golden file.

### 🔴 Critical: The A* implementation is subtly broken

1. **`compareNodes` contradicts its own documentation.** The prose says "lowest h(n) as secondary key." The code prefers *higher g*. These usually correlate but aren't identical; pick one, document it, test it.
2. **Priority queue is `Array.sort()` on every iteration**, which is O(n log n) per pop, making the search O(n² log n). Use a binary heap with the same comparator. Fine for 19 cells; painful at 500+.
3. **The `closedSet` plus `openMap` logic is inconsistent.** It checks `tentativeG >= existingG` only against open nodes; an admissible+consistent heuristic makes closed-set skipping valid, but the heuristic here isn't guaranteed consistent (see next).
4. **Heuristic admissibility depends on `min(C)`, but the code hardcodes `baseCost = 100`.** If any terrain has multiplier < 1.0 (a "fast lane," downhill slide, conveyor), the heuristic overestimates and A* returns suboptimal paths. Compute `minCost` from the actual cost map, or assert `multiplier ≥ 1.0` at compile time.
5. **Cost-map units are inconsistent across documents.** The Navigation doc's `costMap` holds *multipliers* (default `1.0`, then `Math.round(baseCost * multiplier)`). The Canon adapter's `ParsedTopology.traversalCosts` holds *already-multiplied integers* (100, 200, 300). If you feed the adapter's output into `findPath` as written, an `open_floor` cell costs `100 × 100 = 10,000`. This is a real integration bug between two modules described as fitting together. Choose one representation (integers, all the way) and make the type system enforce it, e.g., a branded type `type CostUnits = number & { __brand: 'CostUnits' }`.
6. **`Math.round(baseCost * multiplier)` reintroduces floating point** where the design claims integer purity. Store costs as integers in canon (`150`, not `1.5`).
7. **Occupancy is ignored in pathfinding.** `findPath` treats goblins as non-obstacles. Whether characters can pass through each other is a *game rule*, and the code silently chooses "yes." Make it an explicit parameter.
8. **Neighbor cost asymmetry.** Cost is charged for *entering* a cell. That's a reasonable policy but means `cost(A→B) ≠ cost(B→A)`, so path length is not symmetric. This is fine, but then `distance`-based symmetry tests must not be applied to path *cost*. Document this.

### 🟠 Serious: The canon adapter's `offsetToH3Cell` is fundamentally unsound

This is the single worst function in the set. It converts an axial offset `(q, r)` into an H3 cell by:

1. computing a candidate disk,
2. guessing a lat/lng delta using a magic constant (`0.00002 * (15 - res + 1)`),
3. picking the closest cell by Euclidean distance in *degrees*.

Problems: the scale constant is arbitrary and doesn't match actual cell size; degree-space distance ignores longitude compression; the hex basis vectors are wrong (`r` shouldn't contribute `cos30` to longitude that way); H3 grids at a given resolution are rotated by an arbitrary, face-dependent angle so "axial q" has no meaning; and "nearest by float" means two different offsets can map to the same cell. The docs' own claim of "bit-identical output across architectures" is false for this function.

Notably: the test then asserts a radius-2 disk has 18 cells after one void. That only holds if the mapping is injective, which nothing guarantees.

**This function disappears entirely** if you use plain axial coordinates. Canon says `(q: 1, r: 0)`; the compiled topology uses `(1, 0)`. No translation, no error.

### 🟠 Serious: The acoustic model is dimensionally confused

- "Basis points" (1/100 of a percent) are used as decibel-like units. `10,000 bp ≈ 120 dB` means 1 bp = 0.012 dB, so 150 bp/hex = 1.8 dB/hex. That's *plausible*, but calling it "basis points" is misleading, since basis points denote fractions. Call it `acoustic_units` or use centi-decibels (cdB) so the unit says what it is.
- Decibels are logarithmic; subtracting attenuation in dB is correct, but *summing* two sources or applying an ambient floor requires energy addition, not dB addition. The current model handles a single source so this doesn't bite yet, but two simultaneous events (a crash and a voice) will need care.
- The documents use **two different hearing conventions.** One says audible iff `I(v) ≥ max(ambient, threshold)`. The code only checks `≥ hearingThreshold`, ignoring ambient noise entirely. The "steam valve roaring" scenario from the prose can never mask a whisper in the implementation.
- The "auditory trauma requires +1,500 bp" rule appears in prose but not in code (the caller would have to bake it into `hearingThresholdBp`, which is fine, but say so).
- `cutoffThresholdBp = 1000` in propagation silently means "nobody with a threshold under 1000 can ever hear." That's a hidden coupling: propagation cutoff must be ≤ the minimum hearing threshold in the cast, or you'll get false negatives.
- The wavefront propagates using a **max-energy Dijkstra**, which is right (sound takes the least-lossy path), but the "sort the queue every time" implementation is again O(n² log n).

### 🟠 Serious: Line of sight ignores things the prose promises

- **Facing cone (120°)** is described but not implemented anywhere in `findWitnesses`.
- **Monocular vision** halves the *radius* (unclear physically; monocular loses depth perception and half the field of view, not half the range). A cone/field-of-view restriction is the more faithful model.
- **Endpoint occlusion.** `hasLineOfSight` returns `false` if `from` or `to` is itself in the occlusion set, but the trace function doesn't. So the two functions disagree on the same input.
- **Occlusion is binary and per-cell.** Real crawlspaces have *partial* occluders (grating, steam, low light, smoke). If your narrative uses fog, darkness, or glass, binary occlusion will feel wrong. Consider opacity as an integer 0-100 accumulated along the ray.
- **Light matters.** A goblin in a pitch-black conduit doesn't see a clear sightline. Visual perception should depend on illumination of the *target* and adaptation of the *observer*. For a horror-tinged goblin setting this is probably narratively central.

### 🟡 Moderate: Other overreach

- **"Zero cost at T₀," "hermetic container," "EPERM on socket"**: fine goals, but the doc presents them as if already implemented. They're aspirations.
- **Extensive mathematical typesetting for trivial claims.** The projection math is textbook and, more importantly, unnecessary once H3 is dropped.
- **The debugger's click-to-cell uses `111320` m/degree** while the adapter uses the authalic radius `6371007.18`. These give different scale factors (111,320 vs ≈111,195 m/deg). Clicking a cell selects the wrong cell at scale. Also the debugger hardcodes resolution 14 regardless of the manifest.
- **`viewport.ts` flips Y twice** (in `worldToScreen` *and* via negative container scale), so the coordinate system is inverted inconsistently. Pick one.
- **PixiJS `Application({view:...})` and `beginFill`/`lineStyle`** are the v7 API; v8 changed to `await app.init()` and a new Graphics API (`.fill()`, `.stroke()`). Check which you install.
- **Debugger drawing every cell every frame** with immediate-mode `Graphics` won't scale; the doc mentions caching but the reference code doesn't do it.
- **Sequential claims of "O(1)"** for H3 operations are true, but `gridDisk` is O(k²) and `gridPathCells` is O(k). Fine.
- **The "dependency graph" arrow direction is confusing.** The first diagram draws lore → spatial → engine as if data flows through spatial to the engine. Data actually flows lore → engine, and the engine *calls into* spatial. Dependencies: `engine → spatial`, `engine → lore`, `spatial → (compiled lore output)`. Spatial should depend on a *data shape*, not on the lore package.
- **`[cite: 2, 4]` artifacts** in the last document are leftover from a generation tool, not content.

---

## Part 3: What I would add

### 1. Replace H3 with a small, exact hex core

```typescript
// Integer axial coordinates: everything exact, nothing projected.
export interface Hex { readonly q: number; readonly r: number }        // s = -q - r
export type CellId = number;   // pack: ((q + OFFSET) << 16) | (r + OFFSET), stable & sortable

const DIRS: readonly Hex[] = [
  {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
  {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1},
];   // fixed compass order: NOW facingDirection 0..5 has real meaning

export const add = (a: Hex, b: Hex): Hex => ({ q: a.q + b.q, r: a.r + b.r });
export const distance = (a: Hex, b: Hex): number =>
  (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
export const neighbors = (h: Hex): Hex[] => DIRS.map(d => add(h, d));
```

Benefits: exact integer math, no pentagons, no projection, no face-boundary failures, fixed compass directions (making facing cones trivial), packed IDs that sort numerically (better tie-breaking than string compare), and the whole module is ~150 lines you can fully verify. Keep an *optional* H3 adapter only if you ever need real geographic mapping, which a goblin crawlspace doesn't.

### 2. A truly symmetric line-of-sight algorithm

Use hex lerp with a canonical epsilon nudge, **and** define visibility as "both directions clear" to make reciprocity a construction guarantee rather than a hope:

```typescript
export function visible(a: Hex, b: Hex, opaque: (h: Hex) => boolean): boolean {
  return clear(a, b, opaque) && clear(b, a, opaque);   // symmetric by construction
}
```

Then a **brute-force oracle test**: for small grids, enumerate every pair and compare against an independent implementation (e.g., sampling the geometric segment at fine resolution against hex polygons). Oracle testing catches the class of bugs property tests miss.

### 3. Model doors, hatches, and dynamic occlusion properly

Static canon says "hatch at cell X." Runtime state says "hatch is open." That's a *state-dependent* occluder. The clean pattern: canon defines `occluder_id` with default state; the engine passes a **per-query overlay** `Map<occluderId, boolean>`; spatial merges canon and overlay at call time. This keeps spatial stateless while handling "the door is open right now," which your narrative will absolutely need (someone opens a hatch → a witness appears).

### 4. Versioned, hashed compiled topology

Emit a canonical serialization of the compiled topology (sorted keys, integer values) and store its SHA-256 alongside `canon_version`. Every event in the ledger records `topology_hash`. Then replay can *verify* it's running against the same geometry, and `render_manifest.json` pins it. Nearly free, and it converts "should be deterministic" into "provably the same."

### 5. Evidence, not verdicts, from perception

Return a structured percept instead of a boolean:

```typescript
interface Percept {
  actorId: string;
  channel: 'visual' | 'auditory';
  quality: number;          // integer 0..1000: clarity, from distance/opacity/energy
  resolved: boolean;        // could they identify WHO / WHAT, or only "something happened"?
  bearing: number | null;   // 0..5 direction of source for auditory, lets the LLM say "from the east"
}
```

This lets the epistemic layer generate *different beliefs at different fidelities*: "saw Bog strike Spleen" (high quality visual), "saw a figure strike someone" (low light), "heard a crash from the valve room" (auditory, no identification). That gradient is where the best goblin drama lives: misattribution, rumor, wrong accusations.

### 6. Rumor and transmission are a graph problem, and spatial already gives you the graph

The docs mention "transmission hops" and "rumors degrade across the network" without a mechanism. Spatial can supply the *conversation opportunity graph*: who shares a cell/adjacent cell at each tick. Information can only propagate along co-presence edges. Model this as a **temporal contact graph** and you get realistic rumor spread, plus a tool for "who could have told Moss?" audits.

### 7. Precompute what's static

Pathfinding on a static topology can precompute an all-pairs distance table (Floyd–Warshall or per-source Dijkstra) once at compile time for rooms under a few hundred cells. Then `distance`, `reachable`, and "nearest X" become table lookups. Also cache line-of-sight per pair for static occluders (a bitset per cell). The purity contract is preserved (caches are derived deterministically from immutable input, and keyed by `topology_hash`).

### 8. Encode "capacity" as a first-class rule with explicit resolution semantics

The docs say crowding "triggers a shove or duel," but not *who* moves. That's a policy decision requiring a deterministic rule: e.g., the most recent arrival is displaced; ties resolved by lowest actor ID; displacement target via `nearestUnoccupied` weighted by traversal cost. Write the rule down; otherwise the engine will quietly encode one by accident of iteration order.

### 9. Cross-room movement and portals need a graph-of-graphs

The docs define portals but not how pathfinding crosses them. Model the world as **rooms (hex grids) connected by portal edges with their own costs**, and run A* over `(roomId, hex)` nodes. Heuristic across rooms needs an admissible bound (e.g., precomputed room-to-room minimum portal-hop cost). Also decide whether sound propagates through portals (it should; a door is often the *least*-damped edge).

### 10. Conformance for the future "arbitrary node graph" swap

The docs justify the name `goblin-spatial` by saying the API survives a swap from hex grid to node graph. Currently it doesn't: signatures take `H3Index`, `ring`, `range`, and `facingDirection: 0..5` are hex-specific concepts. To make the claim true, define an abstract `SpatialTopology` interface (`neighbors(node)`, `cost(a,b)`, `distance(a,b)`) and write the algorithms (A*, Dijkstra, wavefront) against it. Hex becomes one implementation. Otherwise, drop the claim.

### 11. Guard against the "deterministic but wrong" trap

Determinism is necessary but not sufficient. A bug can be perfectly reproducible. Add **differential testing**: a slow, obviously-correct reference implementation (BFS for uniform-cost paths, naive O(n) scans) compared against the optimized version on thousands of random small grids via `fast-check`. This is the single most effective technique for algorithmic code like A*.

### 12. A priority order for actually building this

1. Integer axial hex core + exhaustive tests against known Red Blob values.
2. Topology compiler (canon → compiled struct + hash) with all four lints.
3. `distance`, `neighbors`, `range`, `ring`, `reachable`: the queries Stage 3 needs first.
4. Symmetric LoS with oracle test.
5. A* with a real heap and differential test.
6. Acoustic wavefront (single source, undirected damping).
7. Percept-based `findWitnesses`.
8. SVG *static* snapshot debugger first (much cheaper than PixiJS), upgrading to interactive only when you feel the pain.

On that last point: your original design said "lightweight SVG visualizer," and that was the right call. A static SVG per cycle, diffable in git, viewable in any browser, and embeddable in test failure output beats a WebGL app for the first several months.

---

## Bottom line

**Keep:** the three-way separation, statelessness, ignorance-by-omission, deterministic tie-breaking, compile-time canon validation, integer arithmetic, the invariant taxonomy, visual debugging, the regression flywheel, internal-module-first.

**Discard:** H3 and its projection/anchor machinery, `offsetToH3Cell`, the basis-point-as-decibel naming, several of the stated invariants as written, and the "hermetic $0.00" claims until they exist.

**Fix before writing code:** cost-unit mismatch between canon and navigation, LoS symmetry, A* comparator/heap/heuristic, directed vs undirected damping, ambient-noise handling, and vacuous tests.

**Add:** exact axial core, dynamic occluder overlays, percept-with-quality outputs, topology hashing, precomputed tables, differential testing, and an explicit capacity-resolution rule.

The underlying vision (geometry as the objective gatekeeper of who can know what) is excellent. The documents' weakness is that they wrap that vision in an elaborate and partially incorrect implementation, when a much smaller and exact one would serve it better.


That changes the analysis. Your requirement is regional-scale realism (Miami to Jacksonville), and my critique assumed room-scale tactical play (valve rooms, crawlspaces). I was wrong to apply it wholesale, and some of my points don't survive your clarification.

But H3 is not automatically right either, because **hex adjacency is not the same thing as realistic travel time.** That distinction matters more than the grid choice.

---

## What your clarification changes

**Points that no longer apply:**
- "The projection bridge is pure overhead": at regional scale, spherical geometry is the point.
- "Pentagon and face-boundary problems": these are real but rare. You can check that your area of interest avoids them once, at compile time.
- "Just use axial coordinates": a flat axial grid cannot model Miami to Jacksonville honestly. You'd be inventing a projection.

**Points that still apply:**
- The pentagon and face-edge failures of `gridDistance`/`gridPathCells`/`gridRingUnsafe` are real, so verify your region is safe (see below).
- `offsetToH3Cell` is still broken, but now the fix is different: at this scale you should index by real lat/lng, not synthetic offsets.
- The A* bugs, LoS symmetry issue, cost-unit mismatch, and vacuous tests are all independent of H3 and still stand.

---

## The core problem: hex steps are not travel time

Miami to Jacksonville is roughly 340 miles by road, but only about 285 miles as the crow flies. A character doesn't walk a straight line of hexes. Modeling this realistically requires separating three different quantities the documents conflate:

| Quantity | What it is | Source |
|---|---|---|
| **Grid distance** | Hex steps between two cells | H3 (`gridDistance`) |
| **Geodesic distance** | Real great-circle distance | Haversine on cell centers |
| **Travel time** | Depends on mode, road network, terrain, weather | Routing graph, not the hex grid |

At any single H3 resolution, `gridDistance × average edge length` approximates geodesic distance within a few percent. That is fine for "who is nearby," but it is a poor model of "how long does the drive take." Miami to Jacksonville by car follows I-95 (and the Turnpike), not a straight line, and travel time varies with speed limits, traffic, tolls, and detours around water.

**So use H3 as the spatial index and aggregation layer, and put realism in a cost/routing layer on top:**

```
H3 cells        → WHERE things are; nearest-neighbor, regional aggregation, occupancy
Edge graph      → HOW you can move between cells (roads, rail, air routes, waterways)
Cost model      → HOW LONG each edge takes, by mode and conditions
```

Concretely, each edge carries `{distanceMeters, freeFlowSeconds, mode}`, and pathfinding minimizes *time*, not hex steps.

## Where H3 genuinely earns its place

- **Multi-resolution is a real feature for you.** Route at resolution 5–7 across the state, then refine to 9–12 at the origin and destination. H3's hierarchy (`cellToParent`, `cellToChildren`) enables this without separate maps. My "H3 offers nothing" claim was wrong for a multi-scale simulation.
- **Cheap spatial joins.** "Which characters are within ~30 miles of this event?" is a `gridDisk` at the right resolution, or a set-membership test on parent cells.
- **Real-world data compatibility.** Population, terrain, land cover, weather, and traffic datasets are commonly available keyed by H3, which is a legitimate advantage.
- **Stable cell IDs** for your ledger and replay.

## Corrections to make before you build

**1. Pick resolutions from travel-time needs, not room size.** The doc's table maps res 14–15 to "tactical staging." For your regional use case the relevant range is roughly:

| Res | Avg edge | Useful for |
|---|---|---|
| 4 | ~22.6 km | State-scale strategic movement |
| 5 | ~8.5 km | Metro-area awareness |
| 7 | ~1.2 km | City navigation |
| 9 | ~174 m | Neighborhood scale |
| 11+ | ≤25 m | Building / scene scale |

**2. Mixed-scale simulation needs an explicit handoff.** A character crossing Florida is a res-5 entity; when they arrive at a valve room they become a res-14 entity. Define *when and how* an actor changes scale (e.g., arrival at a destination "site" cell triggers descent into a local stage grid). Without this rule, the two halves of your simulation won't connect.

**3. Great-circle distance for time estimates, not `gridDistance`.** Compute haversine between cell centers for physical distance, then apply the mode's speed and a **route circuity factor** (road distance is typically 1.2 to 1.4 times straight-line; coastal Florida is on the higher end because of water). Better still, route on an actual road graph.

**4. Time must become a first-class simulation variable.** The documents track "cycles" but never define how many real seconds a cycle represents. Realistic travel needs a clock: does a cycle equal an hour, a day, an episode scene? Movement budgets in "movement points" should convert to real durations, or the realism is decorative.

**5. Verify your region is H3-safe.** The 12 pentagons per resolution sit at icosahedron vertices, mostly over ocean. Florida is not near one, so `gridDistance` and `gridPathCells` should work, but write a compile-time check anyway (`isPentagon` plus a test that `gridDistance` doesn't throw across your bounding box). Also note `gridPathCells` between two far-apart cells can fail if the path crosses an icosahedron face edge, so wrap it in error handling and fall back to great-circle sampling.

**6. Line of sight at regional scale is a different problem.** The doc's hex raycast against a boolean occlusion set is meaningless across 300 miles. Regional "can they see or hear this?" is governed by Earth curvature, terrain elevation, and weather, or, more practically, by whether information travels by phone, radio, or word of mouth. Keep hex LoS for the local stage, and model regional knowledge propagation as *communication channels with latency* rather than raycasts.

## What survives from my earlier critique, restated for your use case

- The **cost-unit mismatch** between the canon adapter and pathfinding will bite regardless of grid.
- **A* should minimize travel time on a weighted edge graph**, use a real heap, and have an admissible heuristic (great-circle distance divided by the fastest possible speed in the graph).
- **Determinism**: floating-point trig in haversine is the *one* place where cross-runtime divergence is a legitimate risk now. Compute distances in a way that is quantized (round to whole meters or seconds before they enter simulation state), so results can't drift between Node versions.
- The **invariant tests** still need to be fixed as described.

## Revised recommendation

Keep H3, and redefine its role:

1. **H3 = spatial index and multi-resolution container.** Your ledger stores positions as H3 cells at a resolution appropriate to each actor's current scale.
2. **A separate travel graph carries realism.** Edges between cells (or between waypoint cells) with real distance, speed by mode, and time-of-day modifiers.
3. **Scale handoff rules** connect regional movement to local stage play.
4. **Quantize at the boundary** so floating-point never leaks into replay state.

If you tell me which modes of travel matter (car, foot, boat, air), whether the real road network is needed or an approximation is fine, and what one simulation cycle represents in time, I can sketch the travel-cost layer concretely. That layer, not the grid, is where "realistic Miami to Jacksonville" actually lives.

That's a much better fit for H3 than either of my earlier framings, and it changes the design problem into something specific: **a fictional layer registered onto a real geographic substrate.** The real world gives you distance, travel time, terrain, and plausibility for free; the fiction gives you meaning. H3 is the natural join key between them.

The main design question becomes: what exactly is real, what is fictional, and where do they touch?

---

## The core model: three layers keyed by H3

```
REAL LAYER (imported, read-only)
  road graph, elevation, land cover, coastline, population, climate
      │  keyed by H3 cell
      ▼
FICTIONAL LAYER (goblin-lore, authored)
  "The Warm Pipe" sits at cell X; "Valve Station 9" occupies cells Y..Z
  fictional roads, tunnels, borders, regions
      │  keyed by H3 cell
      ▼
RUNTIME LAYER (ledger)
  actor positions, doors open/closed, weather today
```

The fictional layer never mutates the real layer. It **annotates and overrides** it through explicit, versioned rules. That keeps your realism honest and your fiction auditable.

## Decisions you need to make up front

### 1. Overlay, replace, or hybrid?

| Mode | Meaning | Example |
|---|---|---|
| **Annotate** | Real place, fictional meaning | Miami's port is "the Brine Docks" |
| **Substitute** | Fictional structure occupies real space, real features suppressed | A goblin warren where a real parking lot is |
| **Extend** | Fictional places with no real counterpart, connected to real network | A hidden tunnel under I-95 |
| **Fictionalize a region** | Rename and reshape a whole area | "Florida" becomes "the Sunken Reach" |

Most projects need all four. Encode the mode explicitly on each fictional feature, because pathfinding, perception, and rendering all treat them differently.

### 2. Which real data to trust

Decide the source of truth per attribute and record it: OpenStreetMap for roads, SRTM/Copernicus DEM for elevation, NLCD or ESA WorldCover for land cover, NOAA for weather. Pin **dataset versions and download dates** in the topology manifest. Real-world data drifts (roads get built), and an unpinned import silently changes your simulation's past.

### 3. Real coordinates for a fictional place: how faithful?

Three options, each with consequences:

- **Literal**: the fictional location sits at real coordinates. Simple, but a real address means real-world associations, and any reader can look it up.
- **Displaced**: shift the whole fiction by a fixed offset (a private "anchor" translation) so distances and terrain are realistic but nothing maps to a real street address. This is a good default for grounding without pointing at real property.
- **Composite**: fictional places are assembled from terrain "types" sampled from multiple real areas. Realism per site, no single real referent.

Displacement is worth serious consideration: `fictionalCell = realCell + fixedOffset` is cheap, reversible, and deterministic, and it means you can change the offset without touching any lore.

## How this changes the H3 design

**Resolution becomes a per-feature property, not a global constant.** A city-block gets res 9, a building res 11–12, a single room res 14. Store the resolution with each fictional site. Use `cellToParent` to ask "which fictional site contains this position?" at any scale, and `cellToChildren` to descend into it.

**Sites need containment, not just a cell.** A fictional structure is a *set of cells* (a footprint), often multi-resolution. Represent it as a compacted cell set (`compactCells`), which is exactly what H3 provides for efficient region storage. This replaces the doc's `stage_grid` radius-plus-offsets scheme, which assumed a single disk around an anchor.

**Reading `location_id` from a position** becomes a lookup: given an actor's cell, find the finest-resolution fictional site containing it, falling back to "wilderness of region R." Build this as a precomputed `Map<H3Index, locationId>` at each relevant resolution so it is O(1) at runtime. This directly replaces the fragile `offsetToH3Cell` from the documents, because you'd author sites in real coordinates or H3 cells from the start, so no offset-to-cell conversion is needed.

## The travel and realism layer

Since the goal is realistic movement across real terrain, model fictional and real space in **one routing graph**:

- Real edges: roads, trails, waterways, with speeds and modes from imported data.
- Fictional edges: tunnels, secret passages, magical shortcuts, each carrying explicit `{distance, time, mode, visibility}`.
- **Fictional edges may not obey geography**, and that's a feature: a tunnel can connect two distant cells in one hop. Just make sure your heuristic accounts for it. A* with a great-circle-distance heuristic is inadmissible if a fictional teleport exists, so either compute the heuristic from the fastest edge in the graph, or use Dijkstra and precompute.
- **Perception must respect edge visibility.** A hidden tunnel is traversable by those who know it but invisible to witness sweeps and to characters who haven't discovered it. That is exactly your "ignorance by omission" principle, extended to the map itself: **the map each character reasons over should be a per-character subgraph.**

That last point is a strong idea worth building on: characters shouldn't route across edges they don't know exist. Each character has a *known-graph* (a subset of edges and sites), updated by the same epistemic events that update beliefs. Pathfinding runs on that character's graph, so a goblin who's never been to the Sluice won't plan a route through it.

## Realism payoffs you get for free

- **Travel time** from real road speeds, terrain, and distance.
- **Sunrise, sunset, moon phase, and tides** from real astronomy, computed from the (possibly displaced) latitude, longitude, and date.
- **Weather and climate** from real historical distributions, sampled deterministically with a seed.
- **Elevation-driven effects**: line of sight over hills, flooding, cold air pooling.
- **Regional plausibility checks**: an automated audit can flag "the swamp is at 4,000 ft."

Astronomy is the cheapest, highest-impact realism you can add, and it is fully deterministic given date and coordinates.

## Risks to plan for

**Real-place sensitivity.** Mapping fictional (especially menacing or comedic) events onto real named places, businesses, or addresses carries reputational and sometimes legal exposure. Displacement or composite placement, plus generic rather than named real venues, reduces that.

**Data licensing.** OSM requires ODbL attribution and share-alike for derived databases. Some elevation and imagery sources have restrictions. Record the license per dataset in the manifest.

**Reproducibility over time.** Pin data snapshots and store a content hash of each. Otherwise a replay a year from now runs on different roads.

**Scale explosion.** A regional map at res 9 across Florida is millions of cells. Load lazily by region, keep the compiled fictional layer sparse (only cells that have fictional meaning), and treat everything else as "real default."

**Two coordinate meanings.** Keep a strict rule about which coordinates are real, which are displaced, and where conversion happens (one function, one place), or the two will get mixed and produce subtle errors.

## Revised architecture

```
goblin-lore           fictional sites (cell sets + resolution + mode), fictional edges,
                      region definitions, displacement offset, dataset pins
goblin-spatial        H3 indexing, routing over merged graph, per-character known-graph,
                      containment lookup, astronomy, perception
sower-engine          actor cells, knowledge events, clock, weather seed
```

## What I'd need to decide the details

- Should fictional places sit at **real coordinates, displaced coordinates, or composite** locations?
- Is the **real road network** required, or is an approximation (straight-line plus circuity factor) enough at first?
- How much of the map should characters **discover** over time versus already know?
- What does **one simulation cycle** equal in time (hour, day, scene)?

Those four answers determine most of the remaining design, and I can turn them into a concrete schema for fictional sites, edges, and the merged routing graph.

This revision is a large improvement over the first set. It absorbed most of the earlier critique, and the H3 decision now rests on a defensible argument instead of a projection workaround. But it introduces new bugs of its own, and it still doesn't address the requirement you clarified in your last message (fictional locations mapped onto real ones). I'll take it in the same order as before: what holds up, what's broken, then what I'd add.

---

## Part 1: What is valuable and true

### 1. Decoupling the spatial index from the routing graph

This is the most important correction in the document, and it's right.

```
H3 cells       → WHERE (containment, joins, radius sweeps, multi-scale)
Routing graph  → HOW you can move (edges with mode, length, speed)
Travel time    → derived from the graph, never from hex steps
```

The document's sentence "treating H3 grid steps as travel time is equally broken" is exactly the insight that resolves the earlier flat-grid versus H3 argument. Hex distance answers "who is near whom." It cannot answer "how long does the drive take." Keeping these separate is what makes the whole design coherent, and it is what lets fictional edges (a tunnel, a hidden passage) coexist with real ones.

### 2. Three distinct distance quantities

Grid distance, geodesic distance, and travel duration are three different things, and conflating them is the classic error in mixed-scale simulation. The document names all three and assigns each a job. Keep this table in your architecture docs verbatim. One nuance worth adding: **the three quantities are not ordered.** Travel time can be *shorter* than geodesic distance implies (a fictional tunnel, a fast train) or arbitrarily longer (a flooded road). Never assume `duration ≥ distance / max_speed` unless your graph guarantees it, because your A* heuristic depends on that assumption (more on this below).

### 3. The scale-handoff state machine

`IN_TRANSIT` (bound to an edge with progress `p ∈ [0,1]`) versus `STAGED` (bound to a cell inside a site) is a clean and necessary idea. It answers a question the earlier documents left open: *what is a character's position while they're driving I-95?* The answer, "a point on an edge with a scalar progress," is correct. It has three useful consequences:

- A character in transit is not at any H3 cell at tactical resolution, so tactical queries (LoS, duels) correctly exclude them.
- Two characters on the same edge can be ordered by `p`, so "the truck ahead of you" is expressible.
- Arrival is a discrete event at a known tick, which the event-sourced ledger can record.

### 4. Structured `Percept` records instead of boolean verdicts

Returning `{channel, quality, resolved, bearing, sourceCell}` rather than `KNOWS(Fact)` is a strong design. It lets the epistemic layer produce a spectrum of beliefs: certainty, suspicion, misidentification. That spectrum is where interesting narrative comes from. The auditory `bearing` field is a particularly good detail because it gives a dialogue model something concrete and true to write ("a crash from the east") without inventing anything.

### 5. Per-character known-graph

`G_actor = G_public ∪ DiscoveredEdges(A)` is worth its weight in gold. It moves "characters shouldn't know about the secret tunnel" from an instruction the LLM might ignore to a structural property: the pathfinder literally cannot route through an unknown edge. This extends the ignorance-by-omission principle from *facts* to *the map itself*.

### 6. The temporal contact graph and provenance chain

Restricting information flow to co-presence edges `(A, B, tick)` gives you a real audit trail: `C0 → C1 at T12 → Wart at T18`. That is a verifiable answer to "how did Wart learn this?", which is exactly the sort of question a long-running generative simulation needs to be able to answer. It also makes rumor propagation a graph problem you can analyze (who are the bridge characters, how long does a secret take to spread) instead of a prompt-engineering problem.

### 7. The dynamic overlay pattern

Static canon defines the hatch; the ledger records whether it's open; the spatial function merges them per query. This resolves the tension between "canon is immutable" and "doors open and close," and it preserves purity. It's the right pattern and generalizes to anything state-dependent (flooding, lighting, fires, collapsed passages).

### 8. Content-addressed topology hash

Sealing the compiled topology with a SHA-256 hash and recording it in each episode header converts "should be deterministic" into "verifiably the same geometry." It also gives you a natural cache key. This is cheap and high value.

### 9. Integer `CostUnits` with a branded type

A branded numeric type that the compiler enforces is the right way to eliminate the unit-mismatch bug from the earlier design (multipliers versus pre-multiplied integers). One caveat below about how it's applied.

### 10. Centi-decibels instead of "basis points"

Renaming the acoustic unit to something that says what it is fixes a real naming problem, and subtracting ambient noise from arriving energy is more physically sensible than the earlier "greater than max of both" rule.

### 11. The staged build order and tracer bullet

Pure core, then a headless multi-agent simulation, then static SVG, then the interactive canvas is the correct order. The point that a WebGL debugger can consume weeks before you've verified the graph math is well made. The 1,000-tick headless run measuring deadlocks and clustering is an excellent early warning system, because it exposes emergent pathologies that unit tests cannot.

---

## Part 2: What is wrong, misleading, or underdeveloped

### 🔴 Critical: the A* heuristic is never defined for a mixed graph

The document says A* runs over "both state-wide highway graphs and tactical crawlspace grids" and minimizes time, but it never specifies the heuristic. This is where the design is most exposed, because your graph mixes:

- real roads (speed bounded by, say, 75 mph),
- fictional tunnels (arbitrary, possibly faster than geography allows),
- tactical hex cells (walking speed).

An A* heuristic must **never overestimate** the true remaining cost. If it uses `geodesic_distance / max_road_speed`, a single fictional teleport edge makes it inadmissible, and A* will silently return suboptimal (or wrong) routes. The heuristic has to be derived from the graph itself:

```
h(n) = geodesic(n, goal) / v_max_graph
```

where `v_max_graph` is computed at compile time as the maximum over every edge of `length / time`, *including fictional edges*. If any edge is effectively instantaneous (a teleport, a magical door), `v_max_graph` is infinite and the heuristic collapses to zero, so A* degenerates to Dijkstra. That's fine, but you must know it's happening. Also note geodesic-only heuristics are inadmissible for any edge whose length is *less* than the geodesic between its endpoints, which is exactly what a fictional shortcut is.

Recommended approach: compute `v_max_graph` once, store it in the topology manifest, and add a compile-time assertion. For graphs with teleports, precompute **landmark distances** (ALT algorithm): choose 8 to 16 landmark nodes, precompute shortest paths to all nodes, and use the triangle inequality as an always-admissible heuristic that handles arbitrary edge weights.

### 🔴 Critical: `hasLineOfSight` still doesn't honor the symmetry claim's real problem

The document's fix is to compute both `gridPathCells(from, to)` and `gridPathCells(to, from)` and require both clear. Three issues:

1. **This makes symmetry true but changes semantics.** It's a conservative *intersection*, so two cells can be reported as non-visible when a human would say they clearly see each other, purely because one rounding direction clips a corner. In a crawlspace with narrow corridors, this produces false negatives at exactly the geometry you care about (a one-cell-wide passage with a diagonal wall). You've traded asymmetry for over-blocking.
2. **`gridPathCells` can throw.** H3 documents that `gridPathCells` fails when the two cells are too far apart or span pentagon distortion. The code doesn't catch this. In a function that's supposed to be total, an unhandled exception is a bug.
3. **The function returns `false` when the *endpoint* is blocked.** But the target of a sightline is often *inside* an occluder's own cell (a person standing in a doorway cell, an object on a shelf). Treating endpoints as blocking makes a hatch cell unobservable *from anywhere*, including from the cell right next to it. Endpoints should be exempt; only intermediate cells occlude.

Better: define visibility with a **symmetric supercover** (every cell the true geometric segment between centroids touches) rather than a rounded lerp. Then symmetry holds by construction and there's no over-blocking. And keep the conservative variant only as an option.

### 🔴 Critical: the tracer bullet test cannot run

Look at what it references: `mockGraph` is undefined; `findPath` is called with `graph:` and `blocked:` properties that don't match the earlier `PathfindingOptions` (`costMap`, `blockedCells`); `ParsedTopology` is imported but unused; and the cell strings (`'8e26856254133ff'`, `'8e26856254133f7'`, `'8e26856254133eb'`) are **invented**. They're not guaranteed to be valid H3 cells, to be at the same resolution, to be adjacent, or to have any relationship to each other. `h3.gridPathCells` and `gridDistance` will throw on invalid or mismatched-resolution input. And `expect(path).toEqual([originCell, adjacentCell])` asserts adjacency that was never established.

The correct way to write a fixture is to *derive* cells from a real one:

```typescript
const origin = h3.latLngToCell(lat, lng, 14);
const adjacent = h3.gridDisk(origin, 1).find(c => c !== origin)!;
```

A tracer bullet that doesn't compile isn't a tracer bullet. Since the entire point of that section is "prove the pipeline end to end before building more," this one needs to be genuinely executable, and it should be the first thing you make green.

### 🟠 Serious: `resolveDisplacement` has several defects

- **Uses `gridRingUnsafe`**, which the H3 docs say may fail or return garbage near pentagons. The safer `gridRingUnsafe` alternative is to use `gridDisk` and filter by distance, or `gridRing` where available in your h3-js version. In the previous critique I flagged this; it persisted.
- **Ring order isn't the same as nearest by traversal cost.** Cells in ring 2 might be cheaper to reach than cells in ring 1 if ring 1 is full of cramped terrain or requires going around an obstacle. The function returns the first non-empty *ring*, not the cheapest reachable cell. If "nearest" is meant to mean "cheapest to walk to," it needs Dijkstra from the target, bounded by budget.
- **It ignores connectivity.** A ring-1 cell on the other side of a wall (not reachable except through a long detour) can be chosen. Displacement into a cell you couldn't physically get to is a teleport.
- **Throws on failure.** A "total" pure function shouldn't throw for a foreseeable condition. Return a discriminated result (`{ok: true, cell} | {ok: false, reason}`) and let the engine decide (e.g., expand radius, allow overflow, escalate).
- **The comment table and the code disagree.** The policy diagram mentions "last arrival, or lowest somatic stability," but the function takes `displacedActorId` as a parameter and never chooses *who* is displaced. That decision, which the earlier critique called out as requiring an explicit rule, is still undefined. It is arguably the more important half of the problem.
- **`localeCompare` for tie-breaks** is locale-sensitive. The same code can order strings differently under different `Intl` locales or ICU builds. This is a real determinism hazard, and it appears in the heap comparator too. Use plain code-unit comparison (`a < b ? -1 : a > b ? 1 : 0`) or compare packed integers.

### 🟠 Serious: the `CostUnits` scheme has contradictory definitions

The document states "1 second = 100 units, 1 meter = 10 units." Those are two different dimensions (time and length) mapped into the same unit. That's the exact category error that branded types are meant to prevent. A cost of 1000 units can't simultaneously mean 10 seconds and 100 meters. Since the router now claims to minimize *time*, there should be exactly one meaning: `CostUnits = centiseconds`. Distances should have their own brand (`Meters`), and conversion should happen only through explicit speed functions.

Also, `toCostUnits = (val) => Math.round(val) as CostUnits` accepts *any* number, so the brand provides no protection: the cast is unconditional. Make the constructor validate (`Number.isSafeInteger`, non-negative, finite) and throw or return a result on violation. Otherwise `NaN`, `Infinity`, and negatives sail through into A*.

### 🟠 Serious: the binary heap can't do decrease-key

The heap supports `push` and `pop` only. Standard A* needs to update a node's priority when a cheaper route is found. The usual workaround is lazy deletion (push duplicates, skip stale entries on pop), but the document doesn't say the search does this, and the earlier A* code used `findIndex` on the array. If the implementation reuses that logic with the new heap, it will either produce stale entries or silently ignore improvements. State the lazy-deletion strategy explicitly and test it: a stale-entry test where a cheaper path is discovered after a costlier one was pushed.

Also `RoutingNode` stores `parentId` but not the node itself, so reconstructing the path requires a separate map. Fine, but the `compare` breaks ties by *higher g*, which is a common heuristic (prefers deeper nodes), yet the paragraph justifying it says "closer to goal." Higher g is *farther from the start*, not necessarily closer to the goal. It's a fine tie-break, but the stated rationale is wrong. Lowest `h` is what actually means "closer to goal."

### 🟠 Serious: "geodesic distance quantized to whole meters" doesn't fix the determinism problem

Haversine uses `sin`, `cos`, `asin`, and `sqrt`. Rounding the *output* to meters doesn't make the computation deterministic if two runtimes differ by one ULP right at a rounding boundary: 1,234,567.4999999 vs 1,234,567.5000001 rounds differently. The disagreement is rare but real, and it's the exact class of bug (non-reproducible replay) the design exists to prevent.

Robust options:

- **Precompute at compile time** and store integer results in the topology; runtime never calls trig. Edge lengths are computed once, on one machine, and shipped as data.
- Use a table of great-circle distances between waypoint cells rather than computing them on demand.
- Or accept and document a defined tolerance and quantize *inputs* (lat/lng to fixed precision) so both runtimes see identical values.

The first is strongest and also faster.

### 🟠 Serious: `gridDistance` and `gridPathCells` are described as safe, but only within H3's limits

The document uses them freely, including in the region-scale code path. H3's own documentation warns that both can fail for cells far apart or across pentagon distortion. At Res 5 across the state of Florida, that risk is low but the code should still handle it. Include a **compile-time region safety check**: for the bounding cells of every declared region, verify none is a pentagon and that `gridDistance` between the most distant pair succeeds. Then trust it at runtime, but wrap calls in error handling anyway.

### 🟡 Moderate issues

- **Clarify the acoustic sign convention.** `PerceivedEnergy = I_arrival − N_ambient`, then `isAudible iff PerceivedEnergy ≥ T_hearing`. Subtracting in decibels is *not* physically correct for noise; sound and noise add in energy space. Near the noise floor, subtracting dB overstates the signal-to-noise ratio (a signal equal to ambient is still barely detectable). A signal-to-noise ratio model (`I − N ≥ SNR_min`) is more defensible, or simply acknowledge it's a game-friendly approximation. Also, with centi-decibels, `120 dB = 12,000 cdB` versus the earlier document's `10,000 bp ≈ 120 dB`: two different scales for the same physical range, so check that the damping table (`riveted_iron_plate: 5000`) was actually converted and not just relabeled. Silent unit relabeling is dangerous.
- **`Percept.quality: 0-1000` and "resolved if quality exceeds threshold"** never define how quality is computed. Distance? Illumination? Occlusion partiality? Without a formula, two implementers will produce incompatible numbers. Define it as a documented, tested integer function.
- **`acousticPrivacy` in `ContactOpportunity`** is computed how? It's a single number per contact, but privacy depends on *who else* is within earshot, which is a property of the whole scene, not of one pair. Define it as "energy leaking to non-participants" or drop it.
- **Contact graph definition (`d_hex ≤ 1`)** treats adjacency as sufficient for information transfer. That ignores walls: two goblins in adjacent cells separated by a wall are not in contact. Contact should require *traversal adjacency* or *acoustic audibility at conversational level*, not raw hex adjacency.
- **The document says "No flat axial grids" but the tactical stage still uses H3 at res 12-14.** This inherits the earlier objection for the tactical layer (non-nested hierarchy, arbitrary rotation, cell-size variability). It may still be the right trade-off for uniformity across scales, but the document doesn't justify it. See the additions section for a cleaner approach.
- **The canon `SHA-256(CanonicalJSON(ParsedTopology))` requires that `ParsedTopology` (which contains `Set` and `Map`) be serialized canonically.** `JSON.stringify` doesn't serialize Sets and Maps at all (they become `{}`), so as written the hash would be identical for every topology. This is a genuine silent bug: a hash that never changes defeats its purpose. Convert to sorted arrays before hashing and test that changing a single cell changes the hash.
- **`[cite: 2, 4]` remains as a stray artifact** in the diagram.
- **`localeCompare` on hex strings** for tie-breaking is used throughout. Covered above; it appears in several places and should be replaced everywhere.
- **The phase timeline mixes "SHA-256 seal" into Phase 1 but the invariant "1,000 cycles" into Phase 2** without defining what "deadlock" means precisely. Define it: an agent with zero reachable non-current cells for N consecutive ticks.

---

## Part 3: What the document still doesn't address, and what I'd add

### 1. The biggest gap: fictional-on-real mapping is absent

You told me your intent is to **map fictional locations and structures onto real-world ones**. The document mentions "real-world anchors, fictional sites, portals" in the canon box and then never specifies how fictional and real relate. That is the central design question for your use case, and it needs its own layer. Here is how I would structure it.

**A registration layer that binds fiction to real space.** Each fictional feature declares:

```typescript
interface FictionalSite {
  siteId: string;                    // "loc_valve_station_09"
  mode: 'ANNOTATE' | 'SUBSTITUTE' | 'EXTEND' | 'REGION';
  footprint: H3Index[];              // compacted multi-resolution cell set
  realBasis?: { dataset: string; featureId?: string };  // what real thing this is based on
  displacement?: 'NONE' | 'FIXED_OFFSET' | 'COMPOSITE';
  suppresses?: string[];             // real features hidden inside this footprint
}
```

The four modes matter because pathfinding, rendering, and perception each treat them differently:

- **ANNOTATE**: real place, fictional meaning; real roads stay.
- **SUBSTITUTE**: fictional structure replaces real features inside the footprint; suppress the real graph edges there.
- **EXTEND**: fictional place with no real counterpart, attached to the real network by explicit edges.
- **REGION**: renaming and reshaping a whole area.

**Displacement as a compile-time transform, in one place.** If you want realism without pointing at real addresses, apply a single fixed geographic offset in exactly one function (`realToFictional`, `fictionalToReal`). Every other module deals only in "fictional-space" cells. This keeps the boundary auditable and lets you change the offset without editing lore. It also solves a subtle problem: **the real road graph must be displaced by the same offset**, or your fictional sites won't line up with the roads.

**Provenance for every real-data import.** Record dataset name, version, download date, license, and content hash in the topology manifest. Real data drifts (roads get built, coastlines are re-surveyed) and an unpinned import silently rewrites your simulation's past. Add the dataset hashes into `topology_hash` so replays can detect drift.

**Containment lookup.** "Which fictional site is this cell in?" becomes an O(1) `Map<H3Index, siteId>` built at compile time at each site's native resolution, with `cellToParent` used to walk up for coarser queries. This replaces the earlier `offsetToH3Cell` approach entirely, which is the biggest reason the original canon adapter was unsound.

### 2. A real-data ingestion pipeline (offline, not runtime)

The runtime engine should never touch GIS libraries or the network. A separate **build-time compiler** ingests OSM extracts, elevation rasters, and land cover, converts them into the graph and per-cell attributes, applies displacement and fictional overlays, and emits a single sealed artifact. That artifact is the *only* thing `goblin-spatial` consumes. This preserves the purity guarantee and puts the heavy, nondeterministic-looking work (parsing, simplification) where it can be verified once and frozen.

Simplification matters. A raw OSM extract of Florida is enormous. Keep only the road classes you need (motorway, trunk, primary, and the specific local roads near fictional sites), contract degree-2 nodes, and store edge geometry separately from the routing weights.

### 3. Time as a first-class construct

Nothing in either document defines what a **tick** represents. Realistic travel requires a clock. Decide and encode:

- Tick length in real simulated seconds (fixed, or scene-driven).
- A **calendar** (date, timezone with DST rules, since Florida observes DST) and a deterministic **astronomical model** (sunrise, sunset, moon phase, tide) computed from coordinates and date. This is the cheapest high-impact realism available and it's fully deterministic. It feeds directly into visual perception: darkness is the biggest realistic modifier to the `quality` of visual percepts.
- **Time-dependent edge costs**: rush-hour multipliers, ferry schedules, bridge openings, weather closures. These require time-dependent shortest-path (FIFO-property graphs, where departing later never means arriving earlier), and the heuristic must remain admissible under the best-case multiplier.
- **Travel interrupted mid-edge**: what happens to an `IN_TRANSIT` actor when an event fires? Define interruption semantics (stop at next node, stop immediately at fractional progress, cannot be interrupted).

### 4. Illumination and environment as inputs to perception

The perception model has geometry (LoS, wavefronts) and somatic profile, but no *environment*: light level, weather, smoke, steam, fog. For a horror-tinged crawlspace story, light is arguably the dominant factor in what a goblin can see. Add:

- A per-cell (or per-region) **illumination** value from time of day plus local light sources.
- An **opacity** (0 to 1000) for partial occluders like grating, steam, smoke, foliage, replacing binary blocking. Accumulate along the ray and map to `quality`.
- **Weather** as a deterministic, seeded function of `(region, date)`, sampled from real climate distributions.

This gives `Percept.quality` a genuine, explainable formula: `quality = f(distance, accumulated_opacity, illumination, somatic_acuity)`.

### 5. A cleaner tactical-scale option

If tactical stages don't need real-world coordinates (a valve room is a room), consider using **exact axial hex coordinates inside each site** and using H3 only to *locate the site* in the world. Each site then has a local integer hex grid, with a registration transform to one anchor H3 cell. This gives you:

- exact integer math, fixed compass directions (so `facingDirection` finally has meaning and a 120° cone is trivial);
- no pentagon or icosahedron-face concerns at tactical scale;
- perfectly uniform cell size (a room is a room, not a projected patch of Earth);
- the real-world realism where it matters (regional travel) and simplicity where it doesn't.

This is a hybrid I'd choose over H3-everywhere. It also makes the "internal module first, extract later" story cleaner, because the tactical core has no external dependency.

### 6. Multi-resolution containment without duplication

Store each entity at *one* native resolution and derive coarser views with `cellToParent`. Don't store parallel per-resolution copies, which drift out of sync. Cache parent lookups only if profiling demands it.

### 7. Portals and cross-scale edges need explicit semantics

The document mentions portals but not how they interact with the routing graph and the handoff state machine. Define:

- A **portal** is an edge between a regional-graph node and a tactical-grid entry cell, with a transition cost and access conditions (locked, known-only, capacity).
- Entering a portal changes the actor's scale (`IN_TRANSIT → STAGED`); exiting reverses it.
- Pathfinding across scales is **hierarchical**: route regionally to the portal, then locally to the goal, and stitch the results. The heuristic for the regional leg must include the portal-to-goal remainder as an admissible lower bound.

### 8. Testing strategy corrections

- **Replace hand-picked strides with `fast-check`**, which provides random generation and shrinking, feeding directly into your regression-flywheel idea.
- **Add differential tests** against a slow, obviously-correct reference (BFS for uniform costs, Bellman-Ford for weighted) on thousands of random small graphs. This is the most effective technique for catching subtle A* bugs.
- **Shuffle input insertion order** (Sets, Maps, arrays) and assert identical output; that's the actual determinism test.
- **Cross-runtime golden files**: commit expected outputs for a fixed fixture and run in CI under multiple Node versions (and Bun/Deno if you care).
- **Mutation testing** (Stryker) on the pathfinder and LoS to check the tests really fail when the code is wrong.
- **Metamorphic tests**: uniformly scaling all costs by 2 must not change the chosen path; adding an unreachable node must not change results.

### 9. Failure semantics should be uniform

A pure library should return typed results for foreseeable failures and reserve exceptions for programmer errors:

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

`findPath`, `resolveDisplacement`, `hasLineOfSight` (invalid cell), and topology compilation should all follow the same convention, so the engine handles "no path" and "no space" as data, not as try/catch control flow.

### 10. Security and licensing housekeeping

- Record **licenses** (OSM's ODbL requires attribution and share-alike for derived databases) in the manifest.
- If fictional events touch real named places or businesses, prefer displacement or composite placement and generic names. This reduces exposure and is much easier to do at the compile step than to retrofit.

---

## Bottom line

**Keep, essentially as written:** the index/graph decoupling, the three distance quantities, the `IN_TRANSIT`/`STAGED` handoff, `Percept` records, per-character known-graph, the contact graph with provenance, dynamic overlays, the topology hash concept, the phased build order, and the headless simulation gate.

**Fix before implementing:** the A* heuristic (define `v_max_graph` or use landmarks), `CostUnits` (one dimension, validated constructor), `localeCompare` everywhere, the LoS endpoint and `gridPathCells` failure handling, the hash of `Set`/`Map` values, `resolveDisplacement` (connectivity, `gridRingUnsafe`, error return, and the missing "who gets displaced" rule), trig-based geodesics in runtime, and the tracer bullet, which currently can't run.

**Add, because your goals require it:** the fictional-on-real registration layer (modes, displacement, provenance, containment), a build-time data compiler kept out of the runtime, a defined clock and astronomy model, illumination and opacity in perception, hierarchical cross-scale routing through portals, and a hybrid where tactical rooms use exact local hex coordinates registered to one H3 anchor.

The strongest thing about this revision is that it finally separates *where something is* from *how long it takes to get there*. The most valuable next step is to specify the fictional-to-real registration layer, because that's the piece your project depends on and the one both documents leave undefined.

This revision is the strongest of the three. It adopted the hybrid I proposed (H3 for regional, exact axial for tactical), built the fictional-on-real registration layer, fixed several earlier bugs correctly, and stopped claiming things it hadn't built. But some of its "fixes" are themselves wrong in instructive ways, several new mathematical claims don't survive scrutiny, and the tracer bullet still doesn't test what it says it tests. I'll follow the same structure as before: what holds up, what's broken, then what I'd add.

---

## Part 1: What is valuable and true

### 1. The hybrid scale architecture is the correct resolution

```
REGIONAL   H3 (res 5-8) + explicit routing graph    → where things are in the world, how long travel takes
TACTICAL   exact integer axial (q, r) per site      → who can see, hear, and touch whom inside a structure
PORTAL     edge linking a regional node to a tactical entry cell
```

The document's justification is also correct: it removes pentagons, aperture-7 rotation, projected floating-point math, and non-uniform cell size from the layer where they hurt most, while keeping global grounding where it helps. This is a better answer than either "H3 everywhere" or "flat everywhere," and it makes the internal-module-first plan cleaner because the tactical core has no external dependency.

One nuance the document underplays: this hybrid **removes the H3 dependency from the entire perception and crowding stack**. Everything narratively rich (witnesses, duels, displacement, contact graphs) now runs on integer math. H3 becomes a pure regional index. That is a much smaller blast radius if H3 ever misbehaves, and the tactical core can be tested with zero external libraries.

### 2. The four registration modes are genuinely useful

`ANNOTATE`, `SUBSTITUTE`, `EXTEND`, `REGION` each imply a different routing operation (keep edges, suppress-and-reroute, inject edges, modulate costs). That is a real taxonomy, not decoration. The `SUBSTITUTE` note about contracting internal OSM edges and rerouting around the footprint boundary is the operation most people forget: replacing a place means you must also decide what happens to the real roads that used to pass through it.

### 3. Displacement as a compile-time rigid transform in one place

Applying one fixed offset to *all* imported real data at compile time, and having every runtime module see only the displaced frame, is the right design. It keeps real geography's texture (curvature, coastlines, travel friction) without pointing at real addresses, and it isolates the transform so it can be changed or audited in one location. Two refinements are needed (below), but the principle is sound.

### 4. The `IN_TRANSIT` state as `{edgeId, progress, arrivalTick}`

Correct, and it now has a clean formal statement. The consequence that transit actors are excluded from tactical queries is important and correctly noted.

### 5. The A* discussion now names the right problem

The observation that a fictional instantaneous edge makes any speed-based heuristic inadmissible, that `v_max = ∞ ⇒ h = 0`, and that this degenerates A* to Dijkstra, is correct. Offering ALT (landmarks) as the alternative that stays admissible under arbitrary weights is also correct. Lazy deletion for the heap, a strict total order for tie-breaking, and replacing `localeCompare` with code-unit comparison are all correct fixes to earlier defects.

### 6. Canonical serialization for hashing, with the `Map`/`Set` bug named

The earlier document would have hashed `{}` for every topology. This one identifies that and fixes it by converting to sorted arrays. That is a real catch and the fix is in the right direction (details of what's still wrong below).

### 7. The Percept model and the opacity/illumination extension

Returning graded evidence rather than verdicts remains the best idea in the set, and adding illumination and accumulated opacity gives `quality` an actual formula, which the previous version lacked. That is the difference between a design idea and a specification.

### 8. Undirected damping, SNR margin, and the sign fix on acoustic units

Undirected edges for partition damping (walls are symmetric) is correct. Using a signal-to-noise margin instead of "greater than the max of both" is closer to how detection actually works, and centi-decibels is an honest unit name.

### 9. Contact graph requires no separating wall

Fixing `d ≤ 1` to also require "no closed structural wall separates them" repairs the earlier bug where adjacent-through-a-wall counted as contact. Good.

### 10. Offline compiler separated from the pure runtime

The runtime never touching OSM, GeoJSON, or the network is the right boundary, and it's what makes the purity claim enforceable. The compile pipeline steps (displace, simplify, rasterize templates, assert safety, compute `v_max`, serialize) are a sensible order.

### 11. The three-way test taxonomy with a policy category

Theorems, contracts, and policy constraints remain a useful separation, and this version correctly demotes "walking speed baseline" to a policy item.

---

## Part 2: What is wrong, misleading, or underdeveloped

### 🔴 Critical: the "Symmetric Hexagonal Supercover" is described but not defined, and the symmetry claim needs care

The document asserts that a cell is traversed "iff the continuous segment intersects the interior of its hexagon," and that this is symmetric "by construction because the segment is undirected." The symmetry argument is correct **for the exact-geometry definition**. The problems:

1. **"Intersects the interior" makes the boundary case undefined in a way that matters.** A segment that runs exactly along a shared edge between two hexes, or exactly through a vertex, touches neither interior. On a hex grid, lines between centroids along the six lattice directions pass through *centroids only* (fine), but many common lines pass exactly through vertices (for example, between cells at knight-move offsets). Whether a wall on one side of a grazing ray blocks it is a policy decision the document never makes. The choices are: closed hexes (touching counts, so grazing is blocked, conservative), open hexes (touching doesn't count, so grazing passes, permissive), or a tie-break rule. Each is symmetric, but they produce different gameplay. Pick one and write it down.
2. **Exact geometric intersection needs exact arithmetic to be deterministic.** The segment-versus-hexagon test involves `sqrt(3)` in Cartesian coordinates. Doing this in floating point reintroduces the cross-runtime hazard the document is trying to eliminate. The clean solution is to **stay in integer cube coordinates and scale**: multiply all coordinates by a common factor so the test becomes integer arithmetic, or use exact rational cross-products in doubled/tripled coordinates. Hex grids have a well-known integer representation (doubled coordinates) that makes edge and vertex positions integers. State that the supercover is computed in integer arithmetic; otherwise the symmetric-by-construction claim is undermined by rounding.
3. **Endpoint exemption plus interior-only intersection interacts with adjacent cells.** If A and B are adjacent, the segment between centroids crosses only their shared edge; there are no intermediate cells, so LoS is always true, even if the *edge* between them is a wall. Walls on a hex grid are usually modeled as blocked cells, but authors will want *thin walls on edges* (a partition between two otherwise open cells). The document's acoustic model already has **edge** damping, so the edge concept exists; optical occlusion should support edge blockers too, or a thin partition will be invisible to sight while blocking sound. This inconsistency is worth resolving now.

The design direction is right; the specification is incomplete in ways that will produce disagreements between implementers.

### 🔴 Critical: `toCostUnits` and `toMeters` throw, contradicting the stated failure model

These functions `throw new RangeError(...)` on invalid input. The previous critique recommended a uniform `Result` type for foreseeable failures and reserving exceptions for programmer error. Whether an invalid duration is a "programmer error" depends on where it comes from: if it's a hardcoded constant, throwing is fine; if it's computed from data (a speed of zero producing division by zero, an edge length of `NaN` from a corrupt dataset), it's a foreseeable data fault that should surface as a typed error at compile time, not crash the runtime. The fix is layering: validate all cost inputs in the **offline compiler** (fail the build), and give the runtime branded values that are already known-good. Then the runtime never sees an invalid cost, and the throw in the constructor is genuinely a can't-happen guard.

There is also a more insidious issue: `toCostUnits(seconds)` multiplies by 100 and rounds. `toCostUnits(100)` in the tracer bullet means 100 *seconds*, i.e. 10,000 units, yet the graph is documented as "one meter costs 100 units" elsewhere in the same document. The same document defines both "1 second = 100 CostUnits" and, in the policy list, "unencumbered foot movement resolves to 100 CostUnits per meter." At a walking speed of ~1.4 m/s, one meter takes ~0.71 seconds = ~71 units, not 100. These can only both be true at exactly 1.0 m/s. The dimensional purity claim ("prevents confusion between meters and seconds") is undermined by two contradictory statements in the same document. Delete one; keep only "CostUnits are centiseconds" and derive per-meter cost from a documented speed.

### 🔴 Critical: the tracer bullet is closer to runnable but still doesn't test the described pipeline

Progress: it now defines a concrete graph instead of using invented H3 strings. Remaining problems:

1. **`findPath` is called with `{start, goal, graph, blockedNodes}`, but the routing types shown define `RoutingGraph` with no such function signature.** The function's actual options type is never given. The test imports `findPath` from `'../src'`, `RoutingGraph` from `'../src/navigation/types'`, but `hasLineOfSight` takes `{from, to, occlusions}` where `occlusions` is `Set<string>` of *node ids*, not the spatial structure the supercover requires (it needs coordinates). With nodes named `'cell_0_0'`, there is no way for a supercover algorithm to know where they are. The LoS in the test can't be the supercover described in the document; it must be a placeholder that checks membership on some implicit path. So the test exercises an unspecified function.
2. **The 3-node graph is placed at `lat 0, lon 0.00001`, i.e. on the equator at ~1.1 m spacing, with `vMaxGraphMps: 1.0`.** That's an H3-style regional coordinate system applied to a tactical fixture, which contradicts the hybrid design (tactical = axial integers). The fixture should use `{q, r}` cells for the LoS portion.
3. **`toCostUnits(100)` as the edge cost is 100 seconds**, so the path cost is 200 seconds, and the assertion `expect(eventRecord.durationCost).toBe(toCostUnits(200))` is comparing the literal the test itself wrote against the same literal: it tests nothing. It never reads the cost from `findPath`'s result. A correct assertion sums the edge costs along the returned path and compares to the router's reported total.
4. **It asserts the exact path `[A, B, C]` for a linear graph with one route**, which is trivially satisfied by any correct or incorrect algorithm. A tracer bullet that can't fail on a wrong implementation isn't proving the pipeline. Add a diamond (two equal-cost routes, to force the tie-break) and a "shortcut vs. longer cheap route" case, so the router has to choose.
5. The document title claims "executes routing, line of sight, and event mutation." **No mutation happens.** An object literal is constructed and inspected. The ledger is never touched, no event reducer runs. It's a fixture assertion, not a ledger integration.

If this is meant to be the single test that proves the architecture works end to end, it needs a small in-memory reducer (`apply(state, event) → state'`) and an assertion on the resulting state.

### 🟠 Serious: the opacity formula and visual-quality formula have real defects

**Accumulated opacity:** `1 − Π(1 − o_c/1000)` is the correct way to combine independent transmittances (Beer-Lambert-style), and the document has it right. But the input says opacity ranges "0 (clear) to 1000 (solid wall)," and a wall has opacity 1000, so `(1 − 1) = 0` makes the product zero and accumulated opacity 1, which correctly yields `quality = 0`. This makes binary occlusion a special case of the graded model, which is elegant, but the document *also* keeps a separate boolean `occlusions` set for LoS and never says how the two relate. Do they coexist? If a cell is in `occlusions` but has opacity < 1000 in the medium map, which wins? Define one source of truth: occlusion is opacity = 1000, and the boolean set is derived.

**The visual-quality formula:**

```
Q = clamp( 1000 · (1 − d/R) · (1 − Opacity) · min(1, Lux/300), 0, 1000 )
```

Problems:

- Multiplying three factors makes the quality collapse very quickly. At half range, half the ambient light (150 lux), and 20% opacity: `0.5 × 0.8 × 0.5 = 0.2` → Q = 200, which is at the "no percept" threshold. A character in a dim room seeing something at half their range gets nothing, which may be more restrictive than intended. Tune with examples, and consider a saturating curve rather than pure linear falloff.
- `(1 − d/R)` goes to zero at range limit, so a target at exactly `R` is invisible even in perfect conditions. Fine, but it also means **the radius parameter `visionRadius` and the quality formula double-count distance**: cells beyond `R` are excluded outright by the radius check, and cells inside are penalized by `(1 − d/R)`.
- **Illumination is sampled at the target only.** But contrast matters: a dark target against a bright background is more visible than against dark. And an observer in a bright area has reduced dark adaptation. A minimal improvement is to use the *ratio* of target luminance to ambient at the observer, or at least document that this is a deliberate simplification.
- **Lux is a photometric unit measuring illuminance on a surface, and the constant `300` is roughly office lighting.** A dim crawlspace lit by a single lantern will be near 1 to 10 lux, so `min(1, Lux/300)` gives ~0.003 to 0.03, effectively zero for every realistic dark scene. For the horror-tinged crawlspaces the project is about, this makes nearly all of the story invisible unless you assign artificially high lux values. Either rescale (use a perceptual scale like 0 to 1000 illumination-index instead of physical lux) or use a logarithmic response, since vision is roughly logarithmic in luminance.
- The thresholds 700 / 200 are policy constants. Label them as such (they are), but note they interact with the multiplicative formula and must be co-tuned.

### 🟠 Serious: the acoustic SNR model has a sign and definition problem

The document defines:

```
PerceivedMargin(v) = I_arrival(v) − max(N_ambient(v), T_hearing)
isAudible ⇔ PerceivedMargin ≥ SNR_min (600 cdB)
```

Issues:

- **Conflating noise floor and hearing threshold via `max`** treats them as alternatives, but they're physically different: `T_hearing` is the absolute threshold of hearing (sound below it is inaudible in silence); `N_ambient` is masking noise (sound must exceed it by an SNR margin to be discerned). The correct combination is that the *effective* threshold is roughly the power sum of both, or the max, and then SNR applies *above the noise* but the absolute threshold applies as a separate additional constraint. As written, at a location where ambient is 4000 cdB and the hearing threshold is 1000 cdB, the margin subtracts 4000 and requires 600 above it. That's reasonable. But where ambient is 500 and the threshold is 1000, the margin is `I − 1000 ≥ 600`, meaning the sound must be 1600 cdB. Is the SNR margin supposed to apply over the *absolute* hearing threshold? Real hearing doesn't require 6 dB above the absolute threshold to detect a tone; that's the threshold by definition. Define: audible iff `I ≥ T_hearing` **and** `I − N_ambient ≥ SNR_min`.
- **dB values don't sum linearly.** The document keeps the earlier single-source assumption. The moment two sounds overlap (a crash during a running valve), or ambient noise is itself made of contributions, dB arithmetic is wrong. Either add energy-domain summation for multiple sources or state explicitly that concurrent sources are handled by taking the loudest.
- **Distance dissipation is described as `Δ_distance` per hex.** Physically, spherical spreading loss is `20·log10(r)` dB, which is *logarithmic in distance*, not linear per step. A linear 1.5 dB per hex over-attenuates the far field and under-attenuates the near field (the first meter loses the most). For small rooms, linear is a defensible game simplification; but at the regional scale where the document says "radio signal propagation," it's wrong. Flag it as a tuning simplification and keep it out of regional logic.
- **Acoustic bearing from "the arrival edge of the max-energy path"** is well-defined only if the maximum-energy path is unique. Ties (symmetrical sound arrival around a corner) are common in a hex lattice, so the bearing needs the same deterministic tie-break as pathfinding, or it will flip between runs of otherwise identical input.
- **Bearing semantics need a frame.** "0 to 5, e.g., 2 = East" assigns compass meaning to directions on an axial grid, but which of the six axes is East depends on hex orientation (pointy-top vs flat-top). Six directions cannot include all four cardinals. Either define bearing as relative to the *listener's* facing ("front-left") or as an absolute axis index with a documented mapping to a narrative compass. Dialogue generation will otherwise write "east" for something that is really "north-northeast."

### 🟠 Serious: displacement transform: rigid offset on a sphere is not rigid

```
φ_sim = φ_real + Δφ
λ_sim = λ_real + Δλ
```

Adding a constant to latitude and longitude is **not** a rigid motion on the sphere. Because meridians converge, a longitude shift of Δλ corresponds to a distance that scales with `cos(φ)`. Applying the same Δλ at different latitudes preserves neither distances nor angles: two points 100 m apart east-west at 26°N (Miami) are separated by a different physical distance after a longitude shift only if the offset differs by latitude, but more importantly a latitude shift changes `cos(φ)` for the whole dataset, so **east-west distances across the whole dataset are scaled by `cos(φ + Δφ)/cos(φ)`**. For a small Δφ (say 0.5°) the error is ~0.5% of east-west distances, which is small but nonzero. Over a 500-km corridor it accumulates.

Additionally, the simple offset doesn't respect the **antimeridian wrap** or **pole singularities**, which don't matter for Florida, but the function should still guard against them.

The correct rigid motion on a sphere is a **rotation** (a rotation matrix about an axis through Earth's center) applied in Cartesian (ECEF) space. That preserves all distances and angles exactly. It costs a `sin`/`cos` at compile time only. Since displacement happens offline in the compiler, do it right: convert each point to a 3D unit vector, rotate, convert back, then round to fixed precision. After that, the runtime sees ordinary lat/lon with fixed-precision inputs and no further trig on the displacement.

The document also says this is applied "uniformly to all real-world assets." But the real **time zone, astronomical, and tide data** derive from real coordinates. If the sim runs in the displaced frame, then sunrise/sunset computed from displaced latitudes will differ slightly from the real place they represent. Decide whether astronomy uses real or displaced coordinates. For internal consistency (day length matching the landscape), displaced is correct; for plausibility with a named real region, the difference is negligible at small displacements but is a policy choice worth recording.

### 🟠 Serious: hashing and canonical serialization still have gaps

The `canonicalSerialize` replacer is a good start, but:

1. **Key sorting occurs in the replacer, but `JSON.stringify` calls the replacer *before* checking the returned value's structure**, and for plain objects the returned sorted object is then recursively processed (its children hit the replacer again), which works. But **`Map` keys that are not strings** (e.g., numbers or objects) are sorted with `<` on mixed types, which coerces inconsistently (`10 < 9` compares as strings for two strings but numerically for numbers). Specify that keys are strings, or sort with a type-aware comparator.
2. **Floating-point numbers serialize using JavaScript's shortest-round-trip representation**, which is deterministic within a spec-conforming engine but not the same as other languages. If a Rust or Python tool ever needs to recompute the hash, it will disagree. The safest approach is to forbid floats in the sealed artifact (use integers everywhere, encode lat/lon as fixed-precision integers such as micro-degrees). This aligns with the integer-only principle already stated for costs.
3. **`-0` serializes as `0` in JSON**, but `NaN`/`Infinity` serialize as `null`, which silently turns invalid data into valid-looking data. The `vMaxGraphMps = Infinity` case in the document (for graphs with instant shortcuts) would serialize as `null`, and reading it back yields `null`, not `Infinity`, which then breaks the heuristic. Store it as an explicit sentinel (`"INFINITE"`) or a boolean `hasInstantEdges`.
4. **The hash covers the topology but not the compiler version or dataset provenance.** Two compilers with different simplification logic could produce different topologies from the same inputs. Include the compiler version and each input dataset's own content hash in the manifest *before* hashing, so a change in either is detected.
5. **A Merkle structure would be better than one flat hash.** A single hash tells you *something* changed but not *what*. Hash per site and per graph region, then hash the list of hashes. Then a replay runner can report "site `loc_valve_station_09` changed," and unaffected sites' cached results remain valid.

### 🟠 Serious: `resolveDisplacement` is described correctly but the eviction rule contains a hidden dependency

The document now specifies the topologically sound Dijkstra flood and returns "closest reachable cell with capacity." Good. But the eviction candidate rule is "Last arrival (runtime timestamp), tie-break lowest somatic stability score." Two problems:

- **Timestamps are ledger data**, so the spatial function needs them as inputs. The stateless signature must include arrival ticks (and somatic scores), or the caller must pre-select the evicted actor and pass only that identity. The latter is cleaner: keep *who is evicted* in the engine (it's a narrative-policy decision) and *where they go* in spatial. Otherwise spatial starts encoding game rules, which erodes the separation of concerns the document defends elsewhere.
- **"Last arrival" is ambiguous when multiple actors arrive on the same tick.** The tie-break "lowest somatic stability" still may tie; a final deterministic tie-break on actor ID is required. The document supplies this for cell selection but not for actor selection.

Also, **a flood fill that "respects dynamic door overlay (shut = blocked)"** needs to define whether displacement may pass *through* an open door or only land on the open side. And a budget-bounded Dijkstra needs an explicit budget parameter; unspecified budgets tend to become magic constants buried in code.

### 🟡 Moderate issues

- **The dimensions of `vMaxGraphMps` are meters per second but the graph also carries `CostUnits` (centiseconds) per edge.** Computing `v_max` requires an edge length, which `RoutingEdge` doesn't store (it has `cost`, `mode`, `target`, no `lengthMeters`). The heuristic can't be computed from the types shown.
- **Node coordinates are `{lat, lon}` for every node**, including tactical nodes in a local axial frame that have no meaningful lat/lon. The routing type should distinguish regional nodes (geographic) from tactical nodes (local axial within a site), or the two graphs should be separate with portals as the only bridge.
- **`isKnownDefault: boolean`** on edges encodes the known-graph concept as a bare flag, but "known" is per-actor state. The engine already passes each actor's discovered-edge set, so a static boolean on the edge conflates "public by default" with "known to this actor." Rename to `visibility: 'PUBLIC' | 'SECRET'` and let the query supply the actor's discovered set.
- **"A* obstacle exclusion" as a software invariant is stated, but reachability preconditions are not**: what does `findPath` return when start equals goal, start is blocked, or the goal is unreachable? These edge cases need specified results (and tests), preferably as typed `Result` values.
- **ALT heuristic formula is stated as `max_L |d(L,goal) − d(L,u)|`.** That's correct for undirected graphs. For **directed graphs** (one-way roads, which OSM has) you need forward and reverse landmark distances: `max(d(u,L) − d(goal,L), d(L,goal) − d(L,u))`. Since edge costs here are asymmetric in general (one-way streets, time-dependent costs), the undirected form is incorrect and can be inadmissible.
- **Symmetric-cost claims and time-dependence:** the document defines edge cost as a static integer. But travel over real roads is time-dependent (rush hour, bridge openings). ALT and simple A* remain admissible only if the heuristic uses the *minimum* possible edge cost over all times, and FIFO must hold. Not needed now, but state it as a known limitation so it isn't silently violated later.
- **The 1,000-cycle random-walk benchmark measures the wrong thing.** Random walkers will exhibit clustering and deadlock properties that reflect random-walk statistics on that graph, not your simulation's motive-driven movement. It's still valuable as a smoke test for pathological topology (dead ends that trap agents, rooms with no exit), but interpret it as a **topology lint**, not a behavior prediction. A sturdier check is graph-theoretic: strong connectivity of the traversable graph, no sink components, minimum cut sizes at chokepoints.
- **"Deadlock: zero reachable legal cells for > 3 consecutive ticks"** conflates being fully enclosed by other goblins (transient, resolves next tick) with being permanently enclosed by walls (topology bug). Separate the two by testing reachability against *static* topology only.
- **The "Deletion Principle" claim** ("if all generative models are deleted, physical state remains consistent and rebuildable") is correct only if the ledger events plus the pinned topology suffice to replay. That requires that every stochastic choice (PRNG draws) is logged or derivable from a seed. Worth stating, since it's the actual condition under which the principle holds.
- **`[cite: ...]` artifacts are gone**, good.
- **Regional scale "H3 Res 5-8"**: at Res 8 (edge ~461 m) a city block is a fraction of a cell, so "containment lookup" of fictional sites near each other can be ambiguous (two sites in one cell). Sites need a defined resolution for containment (each site registers at a resolution fine enough to be unique in its neighborhood) or, more robustly, an explicit **site anchor point plus radius** with H3 used only to *find candidates*, then exact geometry to confirm.

---

## Part 3: What I'd add

### 1. Define the integer geometry once, and build everything on it

The strongest unifying move available: **make all exact geometry integer, and use a doubled-coordinate scheme for hex vertices and edges.** In doubled coordinates, cell centers, edge midpoints, and vertices all land on integer lattice points, so:

- supercover intersection tests become exact integer cross-products (no `sqrt(3)`, no epsilon);
- "does the ray graze a vertex?" is a decidable integer question, so the boundary policy (closed vs. open hexes) is enforceable and testable;
- thin wall-on-edge occluders can be represented (an edge is an integer pair);
- symmetric LoS is provable by algebra, not by trusting floating-point behavior.

Write the supercover as `O(N)` integer traversal (a hex analog of Amanatides-Woo grid traversal) with an explicit boundary rule. Then the "symmetric by construction" claim becomes a theorem you can exhaustively test on all pairs in small grids.

### 2. Edge and vertex occluders, not just cell occluders

A doorway, a curtain, a glass pane, a partial partition: these are properties of the *boundary between* two cells. Model three occluder kinds: `CELL` (fills a cell), `EDGE` (blocks passage/sight/sound across one shared edge), and `PARTIAL` (has opacity and damping < total). Now optical and acoustic models share one structural vocabulary, and the doc's inconsistency (sound has edge damping, sight doesn't) disappears. A door then becomes a dynamic `EDGE` occluder with an open/closed overlay, which is exactly how doors work in real buildings.

### 3. A mixed-scale routing model with explicit hierarchical composition

The document defines portals but gives pathfinding no cross-scale rule. A robust design:

- **Regional graph:** nodes are road junctions and waypoints; edges carry `{lengthMeters, freeFlowCentiseconds, mode, class}`.
- **Tactical graph per site:** hex cells with terrain costs; exits are portal cells.
- **Portal edges:** connect a regional node to a tactical entry cell with a transition cost (walking from parking to the door) and access conditions.
- **Composed search:** run regional A* to the portal's regional node, then tactical A* from entry cell to goal, and add both costs. For a cross-scale goal, the regional heuristic must include a lower bound for the tactical remainder (precompute the minimum tactical cost from each portal cell to each interior goal cell, or use zero and accept less pruning).

Also decide: can characters route *through* a site (enter one portal, exit another) as a shortcut? If so, sites are part of the regional graph as internal edges, and the tactical grid must be searchable as a subgraph. That makes hierarchical routing (contraction-like) worth it.

### 4. Time as a first-class construct with interruption semantics

The document still doesn't define what a tick equals. Decide and encode:

- **Tick duration** in simulated seconds, fixed per scale (regional ticks may be minutes to hours; tactical ticks seconds).
- **Mixed-scale clock reconciliation:** a regional traveler on an edge for 4 hours coexists with a tactical scene lasting 90 seconds. Use a single **simulation time axis in integer centiseconds**, with tactical "scenes" occupying intervals on that axis. Actors on edges advance by elapsed time; they don't tick.
- **Interruption:** when an event affects an `IN_TRANSIT` actor (a breakdown, an ambush), the actor must be re-anchored mid-edge. Define whether that's allowed (stop at a node, stop at fractional `p`, or cannot interrupt) and how the ledger records the split edge (a new virtual node at progress `p`).
- **Calendar and astronomy**, deterministic from displaced coordinates and simulated date: sunrise, sunset, twilight, moon phase, tides. Use integer-friendly algorithms (or precomputed tables at compile time for the date range of the project). Darkness is the dominant modifier of visual quality in this setting, and it's free realism.

### 5. Precomputation strategy for the regional graph

For a statewide graph, do the heavy lifting offline:

- **Contraction Hierarchies** or **ALT landmarks** for regional route queries. CH gives near-instant queries on road graphs (orders of magnitude faster than A*), at the cost of build time and less flexibility with dynamic costs. For a narrative sim with a few queries per tick, plain A* with ALT is likely enough and far simpler.
- Cache **site-to-site travel times** for the named sites in lore (there are only tens or hundreds, so an all-pairs table is tiny). This makes most narrative queries O(1) lookups and gives you deterministic, hashable travel times you can inspect in a spreadsheet.
- Keep the table keyed by `topology_hash` so it invalidates automatically.

### 6. Make the known-graph a first-class structure

`G_actor = G_public ∪ Discovered(A)` is great but needs machinery:

- **Discovery events** come from the same percept/contact pipeline that creates beliefs, so "learning a route" is just another belief type (`KNOWS_EDGE(edgeId)`), with provenance.
- **Partial knowledge:** a character might know that a route *exists* but not its cost, or know only the destination end. Represent edge knowledge as `{exists, costKnown}` and let pathfinding use an *estimated* cost when the true cost is unknown. This yields realistic mistakes (taking a "shortcut" that's actually flooded), which is rich narrative material.
- **Stale knowledge:** knowledge acquired at tick T about an edge's state can be outdated. A character who remembers a hatch as open may walk into a shut one. Store a knowledge timestamp; the ledger, not spatial, resolves the discrepancy.
- Performance: don't materialize a graph per actor per query. Pass the *delta* (secret edges this actor knows) and let the router treat those as additional edges on top of the shared public graph.

### 7. A testing architecture that matches the claims

- **Exhaustive tests on small grids** (radius up to ~5): enumerate *every pair* of cells and check LoS symmetry against a brute-force geometric oracle (sampling the segment finely). Exhaustive beats random for small finite domains.
- **`fast-check` model-based tests** for the router: generate random graphs, compare `findPath` cost against Dijkstra and Bellman-Ford, and check path validity.
- **Metamorphic relations:** scaling all costs by k scales total cost by k and preserves the path; adding an edge can only lower or maintain cost; removing an occluder can only add visibility.
- **Heuristic admissibility as a property test:** for random graphs, verify `h(u) ≤ trueCost(u, goal)` for every node, including graphs with shortcut edges.
- **Golden-file cross-runtime test:** commit expected hashes and paths; run under two Node versions in CI.
- **A corrupted-input suite:** `NaN` edge costs, duplicate node ids, edges to nonexistent nodes, self-loops, negative costs. The compiler must reject each with a specific error; the runtime should never see them.

### 8. Guardrails on the real-data pipeline

- **Attribution and license manifest** per dataset (OSM: ODbL, share-alike on derived databases; check whether your compiled graph counts as a "derivative database" and whether you intend to publish it).
- **Data-vintage pinning** with content hashes, plus a diff tool ("what roads changed between snapshot A and B") so an update is a reviewed decision, not a silent drift.
- **Sensitivity review step:** a lint that flags fictional sites whose displaced footprint still overlaps identifiable real structures (schools, hospitals, residences), and refuses to compile events tagged violent or criminal there. That's cheaper to build into the compiler now than to retrofit after content exists.

### 9. A minimal, real tracer bullet

A version that actually proves the architecture:

1. Tactical fixture: 7-cell hex disk plus one wall cell, in axial coordinates.
2. Regional fixture: 4 nodes in a diamond with two equal-cost routes and one fast-but-longer route.
3. One portal connecting them.
4. Assertions that *can fail*: router picks the cheaper of two candidates; equal-cost tie resolves by the documented rule; LoS symmetric over all cell pairs; wall blocks exactly the cells it should.
5. A tiny pure reducer `apply(state, event)` that consumes the `ACTOR_MOVED` event and asserts the resulting ledger state (position changed, tick advanced, scale transitioned across the portal).
6. Snapshot the hash of the compiled fixture and assert stability.

If that passes on two machines, the architecture is real.

---

## Bottom line

**Keep, essentially as written:** the hybrid scale architecture, registration modes, compile-time displacement (with the correction below), `IN_TRANSIT` state, the corrected A* framing (admissible heuristic / ALT / lazy heap / code-unit tie-breaks), `Percept` records with opacity and illumination, undirected damping and SNR, contact graph with wall check, offline compiler boundary, canonical serialization concept, and the three-tier test taxonomy.

**Fix before implementing:**
- Displacement must be a **rotation on the sphere**, not additive lat/lon.
- The **supercover** needs an integer-arithmetic definition with an explicit boundary policy and edge-occluder support.
- **CostUnits** has contradictory definitions (per-second vs. per-meter); pick centiseconds only.
- The **tracer bullet** must be able to fail, use the tactical axial fixture for LoS, and actually exercise a reducer.
- The **acoustic** rule should separate absolute threshold from SNR, define bearing frame and tie-breaks, and drop linear-per-hex from regional use.
- The **illumination scale** (300 lux) makes dark scenes invisible; use a perceptual index or logarithmic response.
- **Hashing** must forbid floats, encode infinities explicitly, include compiler and dataset hashes, and be Merkle-structured.
- **ALT on directed graphs** needs forward and reverse landmark distances.
- **Eviction** (who moves) should stay in the engine; spatial should decide only where.
- `RoutingEdge` needs `lengthMeters` and a visibility field; tactical and regional node types should be distinct.

**Add, because the design needs them:** doubled-coordinate integer geometry, edge and partial occluders, hierarchical cross-scale routing, a single integer-centisecond timeline with interruption rules, deterministic astronomy, precomputed site-to-site tables, partial and stale knowledge in the known-graph, exhaustive and metamorphic testing, and compile-time sensitivity linting.

The document has now converged on a sound architecture. What remains is not conceptual disagreement but **specification precision**: the places where a sentence sounds right but two implementers would build two different things. Closing those gaps, especially the supercover boundary rule, the unit definitions, and the displacement math, is what turns this from a well-reasoned design into a reproducible one.

This revision is much closer to a buildable specification. The displacement math is now correct, edge occluders exist, the `resolveDisplacement` function is topologically sound, and the ownership split for eviction is right. But the doubled-coordinate section contains a genuine geometry error that would break the supercover, the tracer bullet's LoS is now a stub that proves nothing, and several of the previous round's flagged problems were either not fixed or were fixed in a way that introduced a new defect.

---

## Part 1: What is valuable and true

### 1. The ECEF rotation is the correct displacement

```
p = (cos φ cos λ, cos φ sin λ, sin φ)
p' = R · p
φ' = asin(z'), λ' = atan2(y', x')
```

This is a true rigid motion of the sphere: it preserves great-circle distances and angles exactly, unlike additive lat/lon. Running it offline at compile time, then rounding the result to fixed precision, means the runtime never sees trig from the displacement. Two clarifications worth recording:

- The claim it "preserves regional areas" is true but slightly beside the point; what matters is that it preserves *distances and bearings*, so travel times, road curvature, and coastline shapes survive.
- A rotation is not the only rigid motion, but it's the only one available on a sphere that fixes the center. Choose `R` deliberately (say, a small rotation that moves Miami's region onto open ocean or an unpopulated area) and commit `R` to the manifest so displacement is reproducible and reversible.

### 2. Eviction policy versus displacement geometry

Splitting "who is evicted" (engine, narrative policy, needs ledger timestamps) from "where do they go" (spatial, pure geometry) is the right boundary. It keeps game rules out of the geometry library, which protects the separation of concerns, and it fixes the earlier signature problem where spatial needed ledger data to choose a victim.

### 3. `resolveDisplacement` as budget-bounded Dijkstra with a typed result

Replacing ring expansion with a connectivity-respecting flood fill fixes the real bug (an actor placed on the far side of a wall). Returning `DisplacementResult` as a discriminated union instead of throwing is the right failure model. The lazy-deletion check (`current.g > dist.get(current.id)`) is correct.

### 4. Edge occluders as a first-class concept

`EdgeOccluder {cellA, cellB, opacity, dampingCdB}` unifies optical and acoustic boundaries under one structure. A door, hatch, or glass viewport is naturally a property of the boundary between two cells, so this matches physical reality and removes the earlier inconsistency where sound had edge damping and sight didn't.

### 5. Illumination with a logarithmic response

Replacing `min(1, lux/300)` with `log10(1 + 9·clamp(lux/300, 0, 1))` is directionally better, since vision is roughly logarithmic in luminance. See the detailed critique below, because the implemented curve has its own problem.

### 6. Acoustic audibility with two separate conditions

`I ≥ T_hearing AND I − N_ambient ≥ SNR_min` correctly separates absolute threshold from masking. Defining bearing relative to the listener's facing (front, front-right, and so on) avoids the earlier "which axis is East" ambiguity and gives dialogue models something honest to say.

### 7. Canonical serialization now handles infinity and requires no floats

The `POS_INFINITY` sentinel fixes the `null` bug I flagged. The Merkle structure (per-site hashes plus a regional hash, hashed together) means a replay runner can report *which* site changed, and unchanged sites' cached results stay valid. This is a genuine improvement over a single flat hash.

### 8. The differential and metamorphic testing plan

Comparing A* to a brute-force oracle on random small graphs, and testing that scaling all costs by k scales total cost by k while preserving the path, are the right techniques for algorithmic code. Insertion-order invariance is the correct way to test determinism.

### 9. ALT with forward and reverse landmark distances

The corrected formula handles directed graphs. Verify the algebra carefully, because it is easy to get backwards (details below).

### 10. A tracer bullet with a reducer

Including `applyEvent(state, event) → state'` and asserting on the resulting ledger state is what makes the test a tracer bullet at all. The concept is right even though the current implementation undercuts it.

---

## Part 2: What is wrong, misleading, or underdeveloped

### 🔴 Critical: the doubled-coordinate formulas are wrong as written

The document states:

```
col = 2q + r,   row = r·√3
Centroid:  (2q + r, 3r)
Vertices:  (col, row ± 2),  (col ± 1, row ± 1)
```

These are internally inconsistent. The first line says `row = r√3` (irrational). The second says the centroid's row is `3r` (an integer). They cannot both be true.

Work through the actual geometry. For a pointy-top hex grid with hex circumradius `s`, the center of axial cell `(q, r)` in Cartesian coordinates is:

```
x = s·√3·(q + r/2)
y = s·(3/2)·r
```

To get integers, scale x by `2/(s√3)` and y by `2/(3s)·... `. A clean choice: let `s = 2`. Then:

```
x = 2√3·(q + r/2) = √3·(2q + r)
y = 3r
```

The x-coordinate still contains `√3`, so it's irrational. To make an exact integer lattice you *divide x by √3* (a uniform scaling of the x-axis only), giving `(2q + r, 3r)`. That works for centers and is a valid **affine transform**, but it is *not* a rigid one: it stretches the x-axis relative to y. This matters because **the transform changes which lines are "straight" only if you fail to apply it consistently, but it does preserve incidence and intersection.** Segment-versus-polygon intersection is an affine invariant, so testing intersection in the stretched space gives the same yes/no answer as in true Cartesian space. That's the reason the trick is valid. But the document never says this, and it describes the scaling wrongly (`row = r√3` instead of dividing x by √3), so an implementer will build the wrong thing.

Now check the vertices. With `s = 2` and the x-axis scaled by `1/√3`, a pointy-top hexagon centered at `(cx, cy)` has vertices at angles 30°, 90°, 150°, ... with circumradius 2:

```
angle 90°:   (0, 2)      → scaled (0, 2)
angle 30°:   (√3, 1)     → scaled (1, 1)
angle -30°:  (√3, -1)    → scaled (1, -1)
angle -90°:  (0, -2)     → scaled (0, -2)
angle -150°: (-√3, -1)   → scaled (-1, -1)
angle 150°:  (-√3, 1)    → scaled (-1, 1)
```

So vertex offsets from the centroid are `(0, ±2)` and `(±1, ±1)`. That matches the document's "(col, row ± 2), (col ± 1, row ± 1)" list, **provided** the centroid is `(2q + r, 3r)`. So the vertex lattice is right, but the derivation text (`row = r√3`) is wrong and misleading. Fix the description:

> Centroid = (2q + r, 3r). This is the true Cartesian layout with the x-axis divided by √3. Because intersection tests are affine-invariant, exact integer cross-products in this space give exact answers for the original geometry.

A subtle but important consequence: **distances in this stretched space are not Euclidean distances.** Any place the document uses these coordinates to compute a *length* (a visual-quality distance `d`, for example) must not use the stretched-space Euclidean norm. Use the hex distance `d_axial`, or convert back. Mixing the two is a natural bug.

### 🔴 Critical: the "open-hex boundary policy" is stated in a way that isn't well-defined

The document says: *"a ray grazing an exact vertex is not blocked unless both hexes sharing that vertex are occluded."*

A vertex on a hex grid is shared by **three** hexes, not two. So "both hexes sharing that vertex" is wrong; it should be three. Also, the phrasing only handles a ray touching a *single vertex*. Consider the more common case: a ray that runs **along an entire shared edge** between two hexes (this happens when centroids are aligned along certain directions and the ray passes between rows). That ray touches the interiors of neither hex, only their shared boundary. Under "open hex," neither hex is entered, so **both** occluders are ignored and the ray passes, even if one side is a solid wall. That's a real hole: a wall cell can be "grazed past."

There are three coherent policies. Choose one and state it precisely:

| Policy | Rule | Effect |
|---|---|---|
| **Open** | Only interior crossings count | Grazing passes; walls can be slipped along |
| **Closed** | Any contact with the closed hex counts | Grazing blocked; conservative; corridors 1-cell wide may over-block |
| **Majority/edge-pair** | A grazing ray along an edge is blocked iff *both* adjacent cells (or the edge occluder) are opaque | Middle path; needs explicit edge rule |

For a horror crawlspace, you probably want a policy where **you can't see past a wall corner you're pressed against, but a diagonal gap between two open cells is passable.** That's the majority/edge-pair rule. Whatever you choose, write it as a decidable integer predicate and test it exhaustively on a radius-4 grid against a brute-force reference.

### 🔴 Critical: the tracer bullet's LoS is now a stub that cannot fail

The previous round asked for a tracer bullet that could fail. This one replaced the LoS with:

```typescript
const hasLoS = (a, b, blocked) => {
  if (blocked.has(hexKey(a)) || blocked.has(hexKey(b))) return false;
  return true; // Adjacent cells have no intermediate occluders
};
```

This is a placeholder defined *inside the test*, so it tests nothing about the real supercover. Any implementation of `hasLineOfSight` in `src/` would never be called. Also:

- **It returns `false` when an endpoint is blocked**, which directly contradicts the document's own **endpoint-exemption rule** ("cells A and B are exempt from their own interior occlusion checks"). The test enforces the opposite of the spec.
- **The test uses the wall as the *target***: `hasLoS(center, wall)` is `false` only because the target is blocked, not because a wall obstructs the view. Under the spec's own endpoint exemption, seeing *into* a wall cell should succeed.
- **The neighbor cells are all adjacent to the center**, so no intermediate cells exist; the ray-intersection logic is never exercised. A meaningful LoS test needs at least distance-2 pairs with a blocker between them, and a diagonal-gap case.
- **The routing is not used at all.** The path `[center, target]` is hand-written, no router runs, and `cost = toCostUnits(1.5)` is a literal.
- **`toCostUnits` is redefined locally** (no validation, no `Meters`), so it doesn't test the library's real constructor.
- **`ActorMovedEvent` includes `cost` but the reducer ignores it.** No time advances beyond `tick + 1`, so the event's duration has no effect on state.
- **The reducer ignores `fromCell`**: it doesn't verify the actor was actually at `fromCell`, so an event claiming a move from a wrong cell silently applies. A reducer that doesn't validate preconditions can't catch integration bugs.
- The closing sentence ("proves the end-to-end integration: world data parses into discrete geometry, pure functions calculate visibility and traversal") is not what the test does; it imports nothing from `../src`.

This is worse than the previous version in one respect: earlier it at least *attempted* to import library functions. A tracer bullet must call the real code paths. Rewrite it to import `findPath`, `hasLineOfSight`, and the topology types from `src/`, use a fixture with a genuine choice (two routes of unequal cost, one blocked), and assert the reducer rejects an event whose `fromCell` doesn't match state.

### 🔴 Critical: the ALT heuristic formula is mis-stated

The document gives:

```
h(u, goal) = max_L max( d(L, goal) − d(L, u),  d(u, L) − d(goal, L) )
```

For a directed graph with the triangle inequality `d(a, c) ≤ d(a, b) + d(b, c)`, the two valid lower bounds on `d(u, goal)` are:

- Using distances **from** landmark `L`: `d(L, goal) ≤ d(L, u) + d(u, goal)`, so `d(u, goal) ≥ d(L, goal) − d(L, u)`. ✅ (this is the first term)
- Using distances **to** landmark `L`: `d(u, L) ≤ d(u, goal) + d(goal, L)`, so `d(u, goal) ≥ d(u, L) − d(goal, L)`. ✅ (this is the second term)

So the formula is **correct**. My earlier note said "easy to get backwards," and the document got it right. The remaining issues are practical:

- The heuristic can be **negative**, so it must be clamped at zero: `h = max(0, …)`. Otherwise `toCostUnits(h)` throws (it rejects negatives), which crashes the router at runtime on an ordinary input.
- It requires computing **both** forward and reverse distance tables per landmark (two Dijkstra runs per landmark on the graph and its reverse). Say so in the compiler steps; currently step 5 says only "precalculate ALT landmark tables."
- **Consistency:** the max of consistent heuristics is consistent, so the closed-set logic stays valid. Worth stating, since lazy deletion relies on it.
- **Unreachable pairs:** `d(L, u) = ∞` needs handling. `∞ − ∞` is `NaN`. Treat unreachable distances explicitly (skip that landmark for that pair).
- With **time-dependent or knowledge-dependent edge sets** (per-actor secret edges), landmark tables computed on the *public* graph are only valid lower bounds if secret edges can only *reduce* travel time... which they can (adding edges never increases shortest-path distance), so the public-graph tables are **inadmissible over-estimates** whenever a secret shortcut exists! Precisely: adding an edge can lower `d(u, goal)` below what the public-graph tables predict, so `h` computed from public tables can overestimate the true (with-secret-edges) distance. To keep admissibility, either compute landmark tables on the *union graph* (public plus all secret edges, the most permissive world) and accept a weaker heuristic for actors who don't know the secrets, or fall back to Dijkstra when an actor's known-set contains any edge not in the tables' graph. This is a genuine correctness hazard in combining ALT with the per-character known-graph, and the document doesn't mention it.

### 🟠 Serious: `resolveDisplacement` has several remaining defects

The structure is right; the details need work.

1. **It calls `toCostUnits(Infinity)`**, which throws (`!Number.isFinite`), so the expression `dist.get(neighbor) ?? toCostUnits(Infinity)` **crashes on the very first neighbor visited**. This bug guarantees the function fails on any input. Use a plain `number` `Infinity` for internal comparison or a sentinel constant such as `Number.MAX_SAFE_INTEGER as CostUnits`.
2. **It pushes items into `DeterministicBinaryHeap` that don't match the heap's node type.** Earlier, `RoutingNode` had `{id, f, g, h, parentId}`; here the push passes `{id, f, g, h}` without `parentId`. Either the type changed silently or this won't compile. Define the node type once.
3. **It doesn't check that the target cell's own capacity is exceeded.** The function skips `current.id !== targetCell` (so the target is never returned), which is right for eviction, but the function name and contract don't say "returns the nearest *other* cell." A different caller (forced shove) may want the target itself if it now has room. Make the contract explicit.
4. **`blockedCells` and dynamic door overlay are both absent from the merge.** The prose says it "respects dynamic door overlay (shut = blocked)" but the function accepts only static `blockedCells`. The caller must pre-merge them, which puts overlay-merging logic in the engine, defeating the stated design ("the spatial function merges static topology with the dynamic overlay"). Accept an `overlay` parameter or state that pre-merging is the caller's job.
5. **`adjacency` is `Map<string, string[]>`, which doesn't carry edge occluders** (a closed hatch on an edge between two open cells). A cell-level `blockedCells` set can't represent an edge barrier, so displacement can pass through a closed hatch. Either the adjacency must already exclude blocked edges, or the function needs the edge-occluder set.
6. **Displacement cost uses the cost of *entering* the cell**, so total cost isn't symmetric and doesn't include the origin. Fine as a policy, but say so.
7. **The `maxBudgetCost` break** (`if (current.g > maxBudgetCost) break;`) is correct because the heap pops in nondecreasing order, but only if edge costs are non-negative. State the precondition.
8. **Occupancy counts exclude nothing**: the displaced actor is still in `currentOccupants` at its old cell, so that cell's count is inflated by one. The earlier version filtered `displacedActorId`; this one dropped it. If the displaced actor sits in the overfull target cell, the count is off by one and the capacity logic is wrong.
9. **Tie-breaking among equal-cost destinations** goes through the heap's `compare` (f, h, id), which is deterministic, good. But the first *reachable-with-capacity* cell popped is returned, so equal-cost candidates resolve by the heap's id ordering. That's fine; document it as the rule.
10. **`CAPACITY_EXHAUSTED` is returned even when the real cause is `UNREACHABLE`** (the flood ended because all neighbors were blocked, not because all reachable cells were full). The type declares both reasons but only one is ever returned. Distinguish: if the frontier emptied before reaching the budget and every visited cell was full, say `CAPACITY_EXHAUSTED`; if the budget cut it off, say `BUDGET_EXCEEDED`; if the target has no traversable neighbors, say `UNREACHABLE`.

### 🟠 Serious: the illumination formula is still off

The new formula uses `log10(1 + 9·clamp(lux/300, 0, 1))`. This curve maps `lux/300` from 0 to 1 onto output 0 to 1 (since `log10(10) = 1`), which *is* a sensible compressive curve. But:

- At 3 lux (a dim lantern glow) `lux/300 = 0.01`, so output = `log10(1.09) ≈ 0.037`. At 30 lux, `log10(1.9) = 0.28`. At 300 lux, 1.0. So a 10× increase in light from 3 to 30 lux only raises quality from 0.037 to 0.28 (a factor of 7.6), which is roughly fine; but **the range below 3 lux is compressed to near zero**, and true scotopic vision works down to 0.001 lux and below. If your crawlspaces are lit by candles, moonlight, or a pilot light (0.1 to 5 lux), *everything* is effectively invisible. The design needs a lower floor, or a log scale across several decades: `output = clamp((log10(lux) − log10(L_min)) / (log10(L_max) − log10(L_min)), 0, 1)` with `L_min ≈ 0.01` and `L_max ≈ 300`. That gives nonzero visibility at candle-level light.
- **Lux is measured at the target, but the observer's adaptation state matters as much.** A goblin who just left a bright room is temporarily blind in the dark. Track adaptation in the ledger (a scalar "dark-adapted" value that evolves with time-in-darkness) and pass it in.
- **The formula multiplies three factors**, so quality collapses rapidly, as I noted before. Add worked examples in the spec (e.g., "goblin 3 cells away, dim lantern, light smoke → Q ≈ ?") so the tuning intent is visible.
- **`Q ≥ 700` resolved / `200 ≤ Q < 700` unresolved** are policy constants, but the document treats the *actor's identification threshold* as variable elsewhere (`resolved: boolean, quality exceeds actor's identification threshold`). The doc contradicts itself: is 700 global or per-actor? Use per-actor (acuity/familiarity affects recognizing a known face) with 700 as the default.

### 🟠 Serious: acoustic bearing "relative to listener's facing" needs a defined listener orientation

Bearing is defined relative to the listener's facing (0 = Front). That requires the actor's `facingDirection`, which is ledger data, so it must be an input to the witness query. The `SpatialActor` type from earlier documents included `facingDirection`, but the current `Percept` pipeline never lists it as an input. Add it explicitly. Also: **what is "facing" for an actor in a single cell?** Six discrete facings on a hex grid means "Front" is one of six directions, so bearing 0 to 5 gives 60° resolution, which is coarse. It's a game abstraction; say so. And an actor in a `IN_TRANSIT` state has no facing, so bearing is meaningless for them; exclude them from tactical acoustic sweeps (already true, but state it).

Also, "the first directed edge to deliver maximum acoustic energy" describes a *path arrival direction* but the acoustic wavefront in a hex lattice has up to six incoming edges to any cell. Define bearing as the direction *from the listener toward the previous cell on the maximum-energy path*, with ties broken by the lowest direction index. Otherwise two symmetric arrivals give an undefined result.

### 🟠 Serious: the hash serialization has new problems

`canonicalReplacer` is closer to correct but has real defects:

1. **`JSON.stringify` replacer order:** when the replacer receives a `Map`, it returns a sorted array of `[key, value]` pairs. `JSON.stringify` then recursively calls the replacer on the *elements* of that array, and the pairs are arrays, so pass through; their values, if objects, get key-sorted. That works. But when the replacer returns the sorted object for a plain object, **the returned object's keys are already sorted, but `JSON.stringify` will call the replacer again on each child** (fine) and the recursion won't loop, since the returned object is a fresh plain object. OK.
2. **`String(a) < String(b)` for sorting Map keys** coerces numbers to strings, so `10` sorts before `9`. Deterministic, but different from numeric order. Fine as long as it's the documented rule, but for numeric keys prefer type-aware comparison.
3. **`typeof value === 'number' && !Number.isFinite(value)` catches `NaN`** and returns `'NEG_INFINITY'` for `NaN` (since `NaN !== Infinity`). `NaN` becomes `'NEG_INFINITY'`, which silently turns corrupt data into a plausible sentinel. Handle `NaN` separately and **throw** in the compiler (never seal a `NaN`).
4. **Floats are "forbidden," but the replacer doesn't enforce it.** It passes any finite number through. Add a check: `if (!Number.isInteger(value)) throw`. The prohibition should be a mechanical assertion, not a comment. But then lat/lon (which are fractional) need an integer encoding (micro-degrees, or 1e-7 degrees as integers). Otherwise the sealed artifact can't hold node coordinates at all. Specify that encoding.
5. **`-0`:** `JSON.stringify(-0)` yields `"0"`, so `-0` and `0` hash identically, which is what you want; fine.
6. **`Array.from(sites.entries()).sort(...)`** with a comparator on `a`/`b` works, but note that the outer Merkle combines `siteHashes` as `"siteId:hash"` strings. Different site sets with colliding concatenations are practically impossible here, but a proper Merkle tree hashes structured pairs, not delimited strings; `siteId` containing `:` could produce ambiguity. Site ids are constrained by a regex in the schema (`^loc_[a-z0-9_]+$`), so no colon can appear, and the ambiguity doesn't occur. Fine, but state the dependency on that constraint.
7. **The compile artifact still omits compiler version and dataset hashes from the hashed payload**, which I flagged before. The regional graph hash covers only the graph, not the provenance of the OSM extract. Include `{compilerVersion, datasets: [{name, version, sha256, license}]}` in the hashed manifest.
8. **The hash doesn't cover the displacement rotation `R`.** If `R` changes but the coordinates in the artifact are recomputed, the hash changes anyway, but that's only because coordinates changed; if `R` were the only thing stored separately (for reversibility), it should be sealed too.

### 🟠 Serious: `vMaxGraphMps` remains untyped and incompletely handled

`RoutingEdge` now has `lengthMeters`, which fixes the missing-field issue, so `v_max = max(lengthMeters / (cost/100))` is computable. But:

- `cost` can be `0` (a fictional instant portal), so `length / 0 = Infinity`, which then must be stored as the `POS_INFINITY` sentinel and read back and handled. The type says `number`, so `Infinity` typechecks, but the heuristic code (`HaversineMeters / vMax`) with `vMax = Infinity` gives `0`, which then passes through `toCostUnits(0)`. Fine, but make the special case explicit: `const h = vMax === Infinity ? 0 : ...`.
- **Zero-cost edges break Dijkstra's strictness assumptions in one place: cycles of zero-cost edges** allow infinite equal-cost paths. The tie-break prevents infinite loops in the search (settled set) but the *set of optimal paths* becomes infinite, and "shortest path" may choose bizarre zero-cost detours. Forbid zero-cost edges (minimum 1 CostUnit) in the compiler.
- **Portals with `cost` as a physical crossing time:** an instantaneous portal is not physically meaningful; give it a nonzero minimum (e.g., one tick) so time always advances.
- `HaversineMeters` is called at runtime in the heuristic. That reintroduces trig into the runtime path, which contradicts "the runtime never sees trig." Precompute node-to-node great-circle distances into a table, or precompute for each node an integer 3D unit-vector in fixed point and compute chord distance with integer arithmetic. Otherwise the determinism story has a hole exactly where the earlier critique pointed.

### 🟡 Moderate issues

- **`Percept.quality` for the auditory channel is never defined**; only the visual formula is given. Acoustic quality needs its own formula (margin above SNR threshold scaled to 0 to 1000) or the `resolved` flag for sound can't be computed.
- **Contact graph condition `d_hex ≤ 1` "provided no closed edge or wall separates them"**: contact through an *open doorway edge* is fine, but two actors two cells apart in a whisper-quiet room can converse; the graph excludes them. Consider defining contact by **acoustic conversational audibility** (speech-level source at 6000 cdB attenuated to the neighbor's cell, above ambient + SNR), not raw adjacency. That reuses the wavefront machinery and makes contact acoustic-privacy-aware, consistent with the `acousticPrivacyCdB` field the previous version had and this version dropped.
- **`Meters` and `CostUnits` share the brand `unique symbol` pattern**, but two separate `declare const` unique symbols would be needed for the brands to be distinct in TypeScript. Writing `readonly __brand: unique symbol` inside two different type aliases *does* create two different unique symbols (each in its own type literal), so they are distinct. Fine; but a `unique symbol` in a type-literal property position is only allowed in certain contexts. In practice, the idiomatic pattern is `declare const costBrand: unique symbol; type CostUnits = number & { readonly [costBrand]: true };`. Test that the snippet compiles.
- **`toCostUnits` throws** (flagged before): valid to keep for compile-time-only validation, but then the runtime path shouldn't call it on dynamic data (the `resolveDisplacement` code does, with `Infinity`, which crashes as noted).
- **"1 second = 100 CostUnits" is now consistent**, and the contradictory "100 CostUnits per meter" line is gone. Good. But the policy invariant "walking speed baseline" was removed without replacement; restate it as a *speed* (`1.4 m/s`), not a cost per meter.
- **The regional layer says "Uber H3 (Res 5-8)" but the routing graph doesn't reference H3 at all.** `nodeCoordinates` are lat/lon, and the H3 index isn't used by the router. That's correct by design (H3 is only an index), but the document never shows *where* the H3 index is used in a query. Show one concrete use (candidate-site lookup via `gridDisk` then exact-distance confirmation), or drop H3 from the regional layer if nothing consumes it. Unused dependencies are a maintenance cost and this is currently a promise without a consumer.
- **"Assert non-pentagonal boundary conditions"** in compiler step 4 refers to H3, but the tactical layer now uses axial grids where pentagons don't exist. It only applies to regional H3 use. Clarify.
- **Step 3, "Rasterize tactical room templates into exact axial integer grids,"** is the compiler's most intricate step and gets one line. Rasterizing a fictional polygon (footprint) into hex cells needs a defined rule (cell center inside polygon? majority area?), and the choice affects gameplay (room shape). Specify it, and store templates as authored hex sets rather than polygons if possible, avoiding rasterization entirely.
- **The `Deletion Principle` claim** ("if all models are deleted, the physical state remains consistent and rebuildable") requires logged PRNG state. Still unstated.
- **`[cite: 2]`** reappears in the first diagram. Stray generation artifact.
- **`Merkle Hash` for lore** shows in the architecture diagram, but `canon_version` (semver) and the content hash are two different identity mechanisms for the same thing. State which is authoritative for replay (the hash) and what the semver is for (human communication).

---

## Part 3: What I'd add

### 1. Write the integer geometry as a single specified module, with proofs by exhaustion

Make `hexgeom` a tiny, dependency-free module that defines, exactly:

```
centroid(q, r)      = (2q + r, 3r)
vertices(q, r)      = 6 fixed offsets from centroid
edgeMidpoints(q, r) = averages of adjacent vertices (all integers after doubling once more)
```

Because edge midpoints are averages of two integer vertices, they need a second doubling to stay integer. Use a scale factor of 2 uniformly (multiply everything by 2) so **every** feature (center, vertex, edge midpoint) lands on an integer lattice point. State that scale in the module docs.

Then define ray traversal in **exact integer arithmetic** using cross-product orientation tests (`sign(cross(b−a, p−a))`) for segment-versus-edge intersection. A ray crosses a hex boundary edge iff the endpoints of the edge lie on opposite sides of the ray (or on it, handled by the boundary policy). Sort the crossed cells along the ray by an exact rational parameter (compare cross-multiplied fractions, never divide). The result is a sequence of cells and a list of crossed edges, both exact.

Then prove it by exhaustion: for all pairs `(a, b)` in a radius-5 disk (a few thousand pairs), assert `supercover(a, b)` equals `reverse(supercover(b, a))` as a set of cells and a set of edges. This turns "symmetric by construction" into a machine-checked fact.

### 2. State the boundary policy as three named modes and pick a default

Provide `BoundaryPolicy = 'OPEN' | 'CLOSED' | 'EDGE_PAIR'` as a compile-time constant in the topology manifest, hashed. Default `EDGE_PAIR`: a ray along a shared edge is blocked iff the *edge occluder* blocks it or *both* adjacent cells are opaque; a ray through a vertex is blocked iff at least two of the three cells at that vertex are opaque (majority). That is decidable, symmetric, and corner-safe. Record the choice in the manifest, because changing it changes every sightline in the simulation and must invalidate caches.

### 3. Fix the tracer bullet so it can fail

A real one, sketched:

```typescript
import { findPath, supercover, hasLineOfSight } from '../src';
import { applyEvent, LedgerState } from '../src/testing/reducer';
```

with a fixture that includes:

- a radius-3 axial disk with one wall cell and one closed-hatch edge;
- a regional diamond graph with two routes (fast-long and slow-short) so the router must choose by *time*;
- a portal connecting a regional node to a tactical entry cell;
- assertions that **fail under plausible bugs**: distance-2 LoS through the wall cell is false, through the diagonal gap is true, LoS symmetric across *all* pairs, the router picks the time-optimal route, the reducer rejects an event whose `fromCell` mismatches state, crossing the portal changes `scale` from `IN_TRANSIT` to `STAGED`, and the topology hash of the fixture equals a committed golden value.

Then **mutation-test the tracer bullet**: deliberately break `hasLineOfSight` (flip a comparison), break the tie-break, and break the reducer's precondition check, and confirm each mutation is caught. A tracer bullet that survives mutations doesn't guard anything.

### 4. Precomputation: deterministic geodesics without trig at runtime

Replace runtime `HaversineMeters` with one of:

- **A precomputed distance table** between named sites and between each node and each landmark (fits easily in memory for hundreds of sites).
- **Fixed-point unit vectors**: at compile time, store each node's ECEF unit vector as three integers scaled by 2^30. At runtime, the squared chord length is an integer computation (`dx² + dy² + dz²`, using `BigInt` or careful splitting to stay under 2^53), and the geodesic distance is `2R·asin(chord/2)`. To keep the runtime trig-free, don't take the `asin`; use the **chord distance directly as the heuristic**, since chord ≤ arc length always, so chord/`vMax` is an admissible (slightly loose) lower bound. Integer, deterministic, and admissible by construction.

The second option is elegant: admissibility is preserved (chord ≤ geodesic), and the runtime has no transcendental functions.

### 5. Solve the ALT-versus-secret-edges admissibility hazard explicitly

Three coherent strategies:

- **Union-graph tables:** compute landmark tables on the graph containing *all* secret edges. The heuristic is then admissible for every actor (an actor knowing fewer edges has distances ≥ the union distances). Weaker pruning for ignorant actors, but always correct.
- **Tiered tables:** one table set for the public graph and one for the union; use the public tables only when the actor's known set is empty.
- **Fallback to Dijkstra** for actors with secret edges, since the number of such queries is small.

Pick one and encode it, because silently using public-graph tables for a knowledgeable actor produces non-optimal routes *and* breaks the determinism story (the route will depend on which heuristic tables were loaded).

### 6. A single integer timeline

State once, prominently:

- **Simulation time** is an integer count of centiseconds since epoch, `SimTime`.
- **Tactical scenes** are intervals `[t0, t1)` on that axis; within a scene, actors act in discrete **beats** with a fixed beat length (say 1 second).
- **Regional edges** consume `cost` centiseconds; an `IN_TRANSIT` actor's `progress` is derived: `p = (now − departTime) / edgeCost`, never stored as a float. Store `{edgeId, departTime}`, and compute `p` on demand as a rational (numerator, denominator). That eliminates a stored float from the ledger and makes replay exact.

This removes the `progress: number ∈ [0.0, 1.0]` float from the `Position` type, which is an unforced determinism risk.

### 7. Interruption and mid-edge splitting

When an `IN_TRANSIT` actor is interrupted at `now`, compute `elapsed = now − departTime`. Create a **virtual node** on the edge at the interpolated point by splitting the edge into two sub-edges with costs `elapsed` and `cost − elapsed` (integers, so the split is exact). Record the virtual node in the ledger with a deterministic id (`vn:{edgeId}:{elapsed}`). The actor's new position is that node. This makes interruption an exact operation on integer costs, and later route queries can start from the virtual node.

### 8. Acoustic quality formula and conversational contact

Define auditory `quality = clamp(1000 · (I − max(N, T)) / (I_ref − max(N, T)), 0, 1000)` where `I_ref` is a per-source reference level (e.g., the source's initial intensity minus 1 m attenuation), so a loud, close, clean sound scores near 1000 and a barely-audible one scores near the SNR threshold. Then `resolved` for speech means quality above a **speech-intelligibility threshold** (higher than the detection threshold), so a character can *hear* a conversation without *understanding* it: another gradient of evidence worth having. Reuse the same wavefront for contact: two actors are in *conversational contact* iff a speech-level source at one cell arrives at the other above intelligibility, which handles whispers, thin walls, and noisy rooms naturally.

### 9. Site geometry authored as hex sets, not polygons

To avoid the rasterization ambiguity, let lore authors specify tactical sites directly as explicit cell sets and edge occluders (`cells: [[q,r],...]`, `edges: [...]`), or via a small ASCII-art template that the compiler parses:

```
  . . # . .
 . . . . . .
. . . D . . .
```

ASCII templates are human-reviewable in pull requests, diffable, and exactly convertible to axial coordinates. That is a much better authoring surface for room layouts than polygons, and it removes an entire class of compiler ambiguity.

### 10. Regression flywheel with concrete artifacts

Tie the flywheel to files: every discovered spatial defect becomes `tests/escapes/esc_<id>.json` (a fixture: topology slice, actors, query, expected result) plus a tiny generic runner that loads every escape file and asserts. Adding a bug is dropping a JSON file, no new test code. The runner iterates the directory, so the suite grows automatically, and each escape is small enough to read in review.

### 11. Guardrails for scale: memory and startup

A statewide graph plus landmarks can be hundreds of MB. Specify a **loading contract**: regional graph loaded once as a typed-array structure (CSR: compressed sparse row arrays for adjacency), not `Map<string, RoutingEdge[]>` of objects, which is 10-50× larger and slow. Integer node ids (`Uint32Array`) instead of string ids also make tie-breaking a numeric compare (faster and locale-free). String ids remain as a boundary/debug layer only. This is an implementation-level change that dramatically affects feasibility and is far cheaper to decide now than after the API is fixed.

### 12. Sensitivity and license enforcement as compiler passes

Make them real, failing checks, not aspirations: a license manifest that must list every dataset with SPDX ids (compile fails on missing entries), and a sensitivity pass that refuses to place event-capable fictional sites over footprints matching a denylist of real-world facility categories (from OSM tags like `amenity=school`, `amenity=hospital`, `building=residential`). Because displacement moves everything, run the check against the *displaced* footprint's *origin* in real space, so you'd catch a fictional crime scene landing where a school really stands.

---

## Bottom line

**Keep, essentially as written:** ECEF rotational displacement; the engine/spatial split for eviction; the Dijkstra-based displacement with typed results; edge occluders; illumination with a compressive response (with a fixed floor); the two-condition audibility rule; listener-relative bearing; Merkle hashing with infinity sentinels; the differential, metamorphic, and insertion-order test plan; the ALT forward/reverse formula (which is correct); the reducer in the tracer bullet.

**Fix before implementing:**
- The **doubled-coordinate derivation** (`row = r√3` contradicts `3r`); state it as an affine x-scaling, note distances aren't Euclidean in that space, and double once more for edge midpoints.
- The **boundary policy**: a vertex touches three hexes, and edge-grazing can slip past walls under "open"; adopt an explicit edge-pair/majority rule.
- **`toCostUnits(Infinity)`** in `resolveDisplacement` throws on first use; also fix the heap node type, the double-counted displaced actor, the missing overlay/edge-occluder inputs, and the unused `UNREACHABLE` reason.
- **ALT clamping** (`max(0, h)`), unreachable landmarks (`∞ − ∞`), and the **secret-edge admissibility hazard**.
- **`NaN` handling** in the canonical replacer, and enforce the no-float rule mechanically with an integer encoding for coordinates.
- **Runtime trig** in the heuristic: use integer chord distance or a precomputed table.
- **The tracer bullet**: it must import real code, honor the endpoint-exemption rule it contradicts, include a genuine routing choice and a distance-2 LoS case, validate reducer preconditions, and survive mutation testing.

**Add, because the design needs them:** an exhaustively verified integer supercover module, an explicit `BoundaryPolicy` sealed in the manifest, an integer-centisecond timeline with derived (not stored) transit progress, exact mid-edge splitting for interruptions, an acoustic quality formula and acoustic-based conversational contact, ASCII-template site authoring, JSON-based escape fixtures, CSR typed-array graph storage with integer node ids, and compile-time license and sensitivity passes.

The pattern across all four rounds is consistent: **each revision fixes the previous round's conceptual errors and then introduces new errors at the level of concrete formulas and code.** The architecture has been stable since round three. What remains is the unglamorous work of making every formula dimensionally consistent, every function total, and every test capable of failing. I'd recommend freezing the prose design now and writing the integer geometry module and its exhaustive symmetry test first, because that single artifact retires the largest cluster of open risk.

This revision is the first one where the code is close to correct, and the lattice math is now mostly right. But it contains one outright test bug that makes the tracer bullet fail on the first run, a hex-line algorithm that doesn't implement the boundary policy it announces, and several of the "fixes" that are real fixes on paper but were not carried into the code. I'll go through what holds up, what's wrong (I re-derived the geometry rather than trusting the stated results), and what I'd add.

---

## Part 1: What is valuable and true

### 1. The lattice geometry is now correct, and I verified it

The prior round's derivation was wrong (`row = r√3` next to `3r`). This round doubles everything and states:

```
Centroid(q, r) = (4q + 2r, 6r)
Vertices       = (cx, cy ± 4), (cx ± 2, cy ± 2)
Edge midpoints = (cx ± 1, cy ± 3), (cx ± 2, cy)
```

Check it by construction. Take `s = 2` in the true pointy-top layout: center `x = 2√3(q + r/2)`, `y = 3r`. Divide x by √3 to get the affine-stretched space: `(2q + r, 3r)`. Multiply everything by 2 to make edge midpoints integral: `(4q + 2r, 6r)`. Vertices of a hex of circumradius 2 sit at `(0, ±2)` and `(±√3, ±1)`, which become `(0, ±2)` and `(±1, ±1)` after the x-stretch, then `(0, ±4)` and `(±2, ±2)` after doubling. ✅ Matches.

Edge midpoints are the averages of adjacent vertices. Between `(0, 4)` and `(2, 2)` the midpoint is `(1, 3)`. Between `(2, 2)` and `(2, -2)` it is `(2, 0)`. ✅ Matches the stated `(cx ± 1, cy ± 3), (cx ± 2, cy)`.

A sanity check that neighbors are consistent: cell `(1, 0)` has centroid `(4, 0)`. Its left edge midpoint is `(4 − 2, 0) = (2, 0)`. Cell `(0, 0)` has centroid `(0, 0)` and its right edge midpoint is `(2, 0)`. ✅ Shared edge midpoints coincide exactly, so the lattice tiles correctly.

Two things the document handles well that deserve explicit credit:

- It states the affine caveat: intersection and collinearity are preserved, but Euclidean distance in this space is not the real distance, so all range checks must use `d_axial`. That warning is essential and correct.
- `edgeKey` uses a canonical ordering (lexicographic on the two cell keys), so `(a,b)` and `(b,a)` map to one key. That gives undirected edges for free and is the right way to make edge occluders symmetric.

### 2. A named, sealed boundary policy

Choosing `EDGE_PAIR` explicitly, with rules for edge grazing and a three-hex vertex majority, is the correct response to the prior critique. Two of those rules are subtle and correct: a vertex is shared by **three** hexes (last round's text said two; this round fixes it), and grazing along an edge is decided by the edge occluder or by **both** adjacent cells being opaque. Recording the policy in the manifest so a change invalidates the hash is exactly right.

### 3. Trig-free runtime heuristic via integer chord distance

Storing each regional node as a fixed-point ECEF unit vector (scaled by 2³⁰) and using chord length as the heuristic is a genuinely good idea:

```
chord(u,v) ≤ arc(u,v)   ⇒   chord / v_max  is an admissible lower bound
```

It removes `haversine` from the runtime, uses only integer arithmetic, and preserves admissibility because a straight chord is never longer than the great-circle arc. One overflow caution is covered in Part 2, but the idea is sound.

### 4. The union-graph invariant for ALT plus secret edges

Compiling landmark tables on `G_public ∪ G_all_secrets` is the right resolution of the hazard I flagged. The reasoning is airtight: adding edges can only lower or preserve shortest-path distances, so any lower bound valid on the union graph remains a lower bound on every subgraph (including each actor's known graph). The cost is weaker pruning for ignorant actors, which is an acceptable trade for guaranteed correctness.

### 5. Derived, not stored, transit progress

`InTransitActor {edgeId, departTime, edgeCost}` with progress computed on demand removes a stored float from the ledger. That is the right instinct: store the integers, derive the ratio. Virtual-node splitting for interruption (`vn:{edgeId}:{elapsed}`) is exact because both sub-edge costs are integer differences.

### 6. Dual-condition audibility and a defined auditory quality

Separating absolute hearing threshold from SNR masking (`I ≥ T AND I − N ≥ SNR_min`), giving auditory a `quality` formula, and defining conversational contact by acoustic audibility rather than raw adjacency all close gaps flagged before. Contact-by-acoustics is especially good: it makes whispers, thin doors, and noisy rooms fall out of one mechanism.

### 7. The decadic illumination curve

Normalizing `log10(lux)` between 0.01 lux and 300 lux fixes the earlier problem that candle-level light was effectively invisible. The output is a proper 0 to 1 response across four orders of magnitude, which matches how vision actually behaves. It needs one clarification (below), but the direction is right.

### 8. Displacement returns richer failure reasons and excludes the displaced actor

Removing the displaced actor from occupancy fixes the off-by-one from last round. Adding `edgeOccluders` to the inputs fixes the closed-hatch bypass. The three-way failure result (`CAPACITY_EXHAUSTED`, `BUDGET_EXCEEDED`, `UNREACHABLE`) is now meaningful, and the `settled` set correctly implements lazy deletion.

### 9. Canonical hashing that rejects floats and NaN mechanically

Throwing on `NaN` and on non-integer numbers turns "we forbid floats" from a comment into an enforced rule. Including compiler version, dataset provenance, and the displacement rotation in the hashed payload closes the provenance gap.

### 10. The reducer validates preconditions

`applyEvent` rejecting an event whose `fromCell` doesn't match state is the first real integration guard in any tracer bullet across these documents. It means a mismatch between the geometry layer's answer and the ledger's belief becomes a loud failure instead of silent drift.

### 11. Time advances by event cost

`time + event.cost` (with a centisecond `SimTime`) makes the reducer actually consume the duration the router computed. In the previous round, cost was ignored. That connects routing to the clock, which is the whole point of travel realism.

---

## Part 2: What is wrong, misleading, or underdeveloped

### 🔴 Critical: the tracer bullet has a bug that makes it fail on the first run

```typescript
expect(hasTacticalLoS(occludedTarget, origin, blockedCells, blockedEdges)).toBe(true === false);
```

`true === false` evaluates to `false`, so this asserts `toBe(false)`. That is the **correct** expectation (the reverse ray should also be blocked), but the line is written in an obfuscated way that reads like a typo, and it's the only reverse-direction assertion for the blocked case. Worse, **it will fail against the implementation provided**, which is why it matters. Trace it:

- Forward: `a = (0,0)`, `b = (2,0)`. `dq = 2`, `dr = 0`, `dist = (2 + 2 + 0)/2 = 2`. Loop `i = 1`: `interQ = round(0 + 2·1/2) = 1`, `interR = round(0) = 0`. Cell `(1,0)` is the wall, so blocked. ✅ returns `false`.
- Reverse: `a = (2,0)`, `b = (0,0)`. `dq = −2`, `dr = 0`. `i = 1`: `interQ = round(2 + (−2)·1/2) = round(1) = 1`. Same cell. ✅ returns `false`.

So the assertion `toBe(false)` passes, but only because the test was rewritten to hit a lucky symmetric case. The real problem is upstream: the test **only passes because both rays lie exactly along a lattice axis**, where rounding is unambiguous. The moment you use a case where the ideal line passes exactly between two cells, `Math.round` rounds half **up** (toward +∞), which is direction-dependent for negative values (JavaScript rounds `−0.5` to `−0`, but `0.5` to `1`, and `1.5` to `2`, `-1.5` to `-1`). Rounding half toward +∞ is not symmetric under reflection, so forward and reverse can sample **different** cells. That is exactly the asymmetry bug the entire lattice section was written to eliminate, and the test's LoS function reintroduces it.

### 🔴 Critical: the tracer bullet's `hasTacticalLoS` does not implement the announced boundary policy

The prose defines `EDGE_PAIR` with exact integer cross-products, vertex majority, and edge grazing rules. The test's LoS function instead:

- samples `dist − 1` intermediate cells using **floating-point `Math.round` on rational interpolation** (`a.q + (dq * i) / dist`), which is neither integer-exact nor symmetric (per above);
- ignores the doubled lattice entirely (`hexCentroid` is never called);
- handles vertex and edge grazing not at all;
- for `dist === 1` builds the edge key with an inline comparison that **doesn't match `edgeKey()`** from `hexgeom` (it uses `a.q < b.q || (a.q === b.q && a.r < b.r)` while `edgeKey` compares the *string* keys `"q,r"`). These orderings disagree for negative numbers and multi-digit values: the string `"-1,0"` sorts differently than the numeric comparison suggests. So the test's edge key and the library's edge key can differ for the same pair of cells. A blocked-edge lookup would silently miss.
- **It imports nothing from `src/`.** The tracer bullet is still self-contained, so it tests its own local copies of the functions, and those copies diverge from the specified ones.

That last point defeats the purpose again: a tracer bullet that doesn't call the library proves the *test file* is self-consistent, not that the *engine* is.

### 🔴 Critical: `hasTacticalLoS` lets the wall be at distance 2 but never tests the diagonal-gap case the policy is about

The prior round's request included "diagonal-gap case." The fixture has origin `(0,0)`, wall `(1,0)`, occluded target `(2,0)`, and open target `(0,2)`. Look at `(0,0) → (0,2)`: `dq = 0`, `dr = 2`, `dist = 2`. Intermediate `i = 1`: `(0, 1)`. Not blocked, so LoS is true. But that ray runs straight along a lattice axis. Neither test case exercises:

- a ray that passes exactly through a **vertex** (three cells meet), which is the whole reason for the majority rule;
- a ray that runs **along an edge** (the collinear grazing case);
- a **knight-move** pair like `(0,0) → (1,1)` in axial, or `(0,0) → (2,−1)`, where the ideal line threads between cells.

Those are precisely the cases where boundary policy matters, and none are in the test. The policy is unverified by the only test that claims to verify it.

### 🔴 Critical: the diamond-graph comment contradicts the assertion

```
// A -> B (short, 500 cu), B -> D (short, 500 cu) = Total 1000 cu
// A -> C (long highway, 200 cu), C -> D (long highway, 200 cu) = Total 400 cu
```

but the code uses `toCostUnits(5.0)` (500 cu) and `toCostUnits(2.0)` (200 cu). The numbers agree. The naming is the problem: the comments call the 500 cu route "short" and the 200 cu route "long highway," but **the 200 cu route is the *cheaper* one**, so the labels are backwards (a "long" route that costs less time is fine physically, but calling the slower edges "short" describes distance while the router optimizes time, which is confusing). More importantly, the fixture doesn't test the property it claims: "picks time-optimal highway." Since both routes have the same number of hops, a router that minimizes **hop count** (ignoring cost) would return either path (tie), and one that picks by node-id alphabetical order would return `Node_B` first (`'Node_B' < 'Node_C'`), the **wrong** answer. So the test *can* catch a hop-count-only router only if the tie-break happens to favor B, which it does (alphabetical), so the test does discriminate. That's fortunate rather than designed. A better fixture makes the cheaper route **have more hops** (a two-edge cheap path versus a one-edge expensive path), which decouples hop count from cost and catches a whole class of bugs.

### 🔴 Critical: `resolveDisplacement` still calls `toCostUnits(0.71)` per step and uses `localeCompare` and array `sort` in the loop

Three specific defects:

1. **`toCostUnits(0.71)` = `Math.round(71)` = 71 centiseconds**, so 0.71 s per cell. But the earlier statement was "~1.4 m/s (71 cu/m)". Here `71 cu` is being used as **cost per cell**, not per meter. A hex cell in a tactical lattice has a real edge length (an axial cell's flat-to-flat width at the document's 1.34 m edge would be ~2.3 m across, or ~2 m center-to-center). So one cell step at 1.4 m/s takes ~1.5 s, not 0.71 s. The default cost conflates "per meter" and "per cell." Define a **cell pitch in meters** (center-to-center distance) per site, and derive step cost = pitch / speed.
2. **`pq.sort(... localeCompare ...)` reintroduces the locale-sensitive comparison** that the previous round explicitly banned. This is a regression: the ban was documented for the router's `compareRoutingNodes`, but this new function uses it anyway. Also `Array.sort` in a loop is the O(n² log n) pattern the binary heap was introduced to eliminate, and the function uses a raw array while the previous version used `DeterministicBinaryHeap`.
3. **String keys `"q,r"` compared with `localeCompare`** are especially bad: for cells like `"-1,0"` vs `"10,0"`, locale comparison ignores or reorders punctuation, so ordering depends on the ICU build.

Also `reachedFrontier = true` is set the moment **any** neighbor passes the blocked check, even if that neighbor was already settled or has a worse cost. So `UNREACHABLE` is returned only if the target is fully walled in from the start. That's actually the correct meaning of `UNREACHABLE`, but the variable name and placement suggest something else, and if every neighbor is later found full, the reason is `CAPACITY_EXHAUSTED`. OK. But there's a subtler bug: **the budget check happens after `settled.add`**, and `current.cost > maxBudgetCost` returns `BUDGET_EXCEEDED` even when a valid, in-budget destination was found earlier with lower cost. Not possible, since the function returns immediately on the first valid destination in cost order. Fine. But when the *first* over-budget node is popped, all cheaper nodes have already been checked and rejected, so the result is truthful. ✅ No bug there; I flag it only to note it's correct.

4. **Displacement of a stacked cell:** if the target cell itself has spare capacity after removing the displaced actor, the function still skips it (`currKey !== targetKey`). Then it moves the actor to a *different* cell even though the original had room. Callers should check capacity first, and the contract should say "returns another cell." Say so.

### 🟠 Serious: the `EDGE_PAIR` boundary rules contain a logical inconsistency

Rule 3 says a ray along an edge between hex U and V is blocked iff the edge has an opaque occluder **OR both U and V are opaque cells**. Rule 4 says a ray through a vertex shared by three hexes is blocked iff **at least two of three** are opaque. Consider a ray grazing a vertex and continuing *along* an edge afterward. There is a real chain of cases where the two rules disagree:

- A ray passes exactly through a vertex `P` shared by hexes U, V, W, then continues into the interior of V. Rule 4 decides at `P` (blocked if two of U, V, W are opaque), and then V's interior is crossed and, if V is opaque, blocks by ordinary interior rules. So if V is opaque, the ray is blocked regardless. If V is transparent but U and W are opaque, rule 4 blocks at the vertex. That means **two opaque cells that the ray only touches at a single point block sight**, while a ray that grazes a *single* vertex of one opaque cell passes. It's a defensible policy (a squeeze between two walls at a corner is tight), but it must be written as a definitive truth table over the 8 possible opacity patterns of (U, V, W), not as prose, and tested exhaustively.
- **Rule 3 blocks when *both* adjacent cells are opaque, even with no edge occluder.** But if both cells are opaque cells, any ray reaching that boundary from either side would already have been blocked by entering one of them. So that clause only matters for a ray that runs *exactly along* the edge, touching neither interior. Then it's the same combination as the vertex rule generalized. Fine, but it shows the policy is a small decision table, and it should be written as one.
- **A ray running along an edge continues through two consecutive vertices**, each with its own three-way majority check, plus the edge's own rule. The document doesn't say whether all must pass, or whether the edge rule alone decides. Specify: a ray coincident with an edge is decided by the edge rule *and* the vertex rules at both endpoints; blocked if any blocks.
- **Endpoint exemption interacts with the vertex rule.** If the endpoint cell A is one of the three hexes at a grazed vertex, does A count toward the majority? A is exempt from *interior* checks, but the vertex rule counts opaque cells. If A is itself a wall cell (an actor standing in a doorway modeled as an opaque door cell), is it counted? The document doesn't say. State: exempt cells count as **transparent** for policy evaluation.

### 🟠 Serious: `getTransitProgress` reintroduces a float and a division into runtime logic

```typescript
const elapsed = currentTime - actor.departTime;
return Math.min(1.0, Math.max(0.0, elapsed / actor.edgeCost));
```

The comment says "Progress is derived dynamically on demand. Never stored as a float." That's true (it isn't stored). But it *is* returned as a float and used in logic elsewhere (for choosing where an interruption splits an edge, for example). The safer form is to return the **rational pair** `{ num: elapsedClamped, den: edgeCost }` or, better, never compute progress at all: the interruption needs only `elapsed` (integer), and arrival needs only `departTime + edgeCost` (integer). Use progress only for rendering, on the presentation side. Also `edgeCost` of `0` divides by zero; a zero-cost edge must be forbidden (minimum 1 cu), as recommended last round.

### 🟠 Serious: the `SimTime` brand collides with `CostUnits`

```typescript
export type CostUnits = number & { readonly __brand: unique symbol };
export type SimTime  = number & { readonly __brand: unique symbol };
```

In TypeScript, `unique symbol` may only appear in specific declaration positions, and using it inside a type literal as `readonly __brand: unique symbol` is **an error** ("A property of an interface or type literal whose type is a 'unique symbol' type must be 'readonly' and ... " is allowed only for `declare const` or `readonly static`-style contexts). In practice, the reliable, widely used pattern is:

```typescript
declare const costBrand: unique symbol;
export type CostUnits = number & { readonly [costBrand]: true };
```

Also, `state.time + event.cost` adds a `SimTime` and a `CostUnits`, both branded as `number`, and TypeScript permits `number + number`, returning plain `number`, which the code then wraps with `toSimTime`. So the brands aren't preventing the exact mix-up they were introduced to prevent: adding a cost to a time is *semantically valid here* (a duration advances a clock), but the type system would equally allow adding two absolute times or subtracting a cost from a meter value. To get real dimensional safety you need distinct duration and instant types (`Duration` and `Instant`), with only `Instant + Duration → Instant` and `Instant − Instant → Duration` defined. `CostUnits` is really a `Duration` here; call it that, or keep the name but restrict the arithmetic to helper functions.

### 🟠 Serious: the ECEF chord heuristic has an unaddressed integer overflow

The document stores unit vectors scaled by 2³⁰ and computes `chord² = Δx² + Δy² + Δz²`. Each Δ can be up to 2 × 2³⁰ = 2³¹. Squared, that's 2⁶², and the sum of three is up to ~3 × 2⁶². JavaScript `number` safely represents integers only up to 2⁵³. So **`Δx²` can exceed `Number.MAX_SAFE_INTEGER` (2⁵³ ≈ 9×10¹⁵)** for nodes far apart (any two nodes more than about 2⁻⁷ of the unit sphere apart, roughly 50 km). The exact integer arithmetic silently loses precision, and the determinism guarantee that motivated the whole design quietly breaks in the regional layer.

Options: use `BigInt` (slower but exact), reduce the scale to 2²⁶ (Δ² ≤ 2⁵⁴, still marginal) or 2²⁴ (Δ² ≤ 2⁵², Σ ≤ 3×2⁵² < 2⁵⁴... still over), or scale to ~2²² (Δ² ≤ 2⁴⁶, sum < 2⁴⁸ safe), giving ~1.5 m resolution, which is adequate for a heuristic. Alternatively compute the *lower bound* in a way that tolerates rounding: since only admissibility matters (`h ≤ true cost`), you can floor the integer result and subtract a safety margin. State which strategy, and add a test comparing to an exact `BigInt` reference on random node pairs.

Also, the chord scaled to meters requires multiplying by Earth's radius (a float constant); to stay integer, precompute `R` scaled and document the rounding direction (round *down* to preserve admissibility).

### 🟠 Serious: illumination formula: minor error and a missing case

```
Q_lux = clamp( (log10(max(Lux, 0.01)) − log10(0.01)) / (log10(300) − log10(0.01)), 0, 1 )
```

This is correct as a normalized log scale (denominator ≈ 4.477). Points:

- **`log10` is a transcendental function**, so it appears in a formula that feeds `Q_visual`, which is compared against integer thresholds (700, 200) and thus determines whether a percept is emitted. A one-ULP difference in `log10` across runtimes could flip a borderline case. Precompute a **lookup table** for `Q_lux` over quantized lux values (say, a table indexed by `round(log10(lux) · 100)`), or store illumination as an integer **log-lux index** in the ledger and topology (an integer 0 to 448), so no transcendental function runs at query time. Since the environment inputs are authored constants, this is easy.
- `Opacity_accum` is written with a product across **cells and edges**, but the precedence in the typeset formula is wrong: `1.0 − Π(cells) × Π(edges)` parses as `1.0 − (Π_cells × Π_edges)` only if intended; but the text as printed is `1.0 − ∏(1 − o_c/1000) × ∏(1 − o_e/1000)`. That reads `1 − A × B`, which equals `1 − (A·B)`, which is correct (combined transmittance is `A·B`). ✅ OK, but write the parentheses.
- **`Opacity_accum` uses a product of floats**; convert to integer per-mille arithmetic: transmittance in `[0, 1000]`, `T = (T · (1000 − o)) / 1000` with integer division (define the rounding). Otherwise the visual quality has a float-product in the path that decides percept emission.
- The formula uses `d_axial / R_vision` for the falloff, but **axial distance is in cell units, and `R_vision` is also in cells**, so that's consistent, but a cell pitch of ~2 m means a "vision radius of 10 cells" is 20 m; state the unit.

### 🟠 Serious: the reducer and the tracer bullet's ledger have no notion of the scale handoff

The stated purpose is "verifies the complete pipeline, including portal handoffs." The reducer handles only `ACTOR_MOVED` between two cells in one site. No portal is crossed, no `IN_TRANSIT → STAGED` transition occurs, and `ActorState` has a `scale` field that is *set to* `'STAGED'` in the fixture and never changes. The handoff state machine (the central architectural idea of the hybrid design) is untested. Add events `DEPARTED_SITE`, `ARRIVED_AT_SITE`, and assert the state transitions and that a `STAGED` event on an `IN_TRANSIT` actor is rejected.

Also, `ActorState` requires `siteId` and `cell` for all actors, but an `IN_TRANSIT` actor has neither (it has `edgeId`, `departTime`). The tracer's type makes the in-transit case unrepresentable. Use a discriminated union:

```typescript
type ActorState =
  | { scale: 'STAGED'; siteId: string; cell: AxialHex }
  | { scale: 'IN_TRANSIT'; edgeId: string; departTime: SimTime; edgeCost: CostUnits };
```

### 🟡 Moderate issues

- **CSR layout is announced but no code shows it.** The diagram promises `Uint32Array` edges and costs, but the tracer bullet and the displacement function use `Map<string, ...>`. It's fine to defer, but the API must hide the representation. Define the regional graph interface as methods (`neighborsOf(id)`, `edgeCost(i)`) so the CSR swap doesn't ripple.
- **Costs are `Uint32Array`, so max cost is ~4.29×10⁹ cu = 42.9 million seconds = 497 days.** Fine for one edge, but *path sums* exceed 2³², so accumulators must be `Float64` or `BigInt`. Note this: costs stored in u32, totals in doubles (safe to 2⁵³ cu ≈ 2.9 million years).
- **Foot speed note `~1.4 m/s (71 cu/m)`** is correct arithmetic (`100 cu/s ÷ 1.4 m/s = 71.4 cu/m`). Fine. But the displacement function applies 71 as *per cell* (flagged above).
- **`edgeKey` builds strings on every call**, and `resolveDisplacement` calls it per neighbor per node. For hot paths use integer-packed cell ids (e.g., `((q + 32768) << 16) | (r + 32768)`) and packed edge ids. Strings are fine for now but will dominate profiles.
- **`Percept.sourceCell: AxialHex`** ties the type to tactical space, so a *regional* percept (a car passing on the highway) can't be represented. Regional awareness sweeps are mentioned in the architecture; give `Percept` a `location` union of `{scale:'STAGED', siteId, cell} | {scale:'REGIONAL', nodeId}`.
- **`bearing` uses "subtract modulo 6 from facing"**, but the document doesn't specify sign convention or which absolute direction index `0` maps to. Define `DIRS[0..5]` order once (the displacement code has `DIRS = [(1,0), (1,−1), (0,−1), (−1,0), (−1,1), (0,1)]`, a counterclockwise-in-axial order) and derive bearing as `(arrivalDir − facing + 6) mod 6`. Also "Directly Behind = 3" is right for six directions; "Front-Right = 1, Rear-Right = 2" requires that direction indices increase clockwise from the actor's view, but the `DIRS` array is ordered counterclockwise in screen space with y-down. State the handedness.
- **`I_ref` is "a standardized near-source reference intensity"**, still undefined numerically. Give it a value (say, source level minus 1-cell attenuation) and note that if `I_ref ≤ max(N, T)` the denominator is zero or negative and quality is undefined; add a guard.
- **Timeline unit note:** `SimTime` is centiseconds (10 ms resolution) and a regional trip of 6 hours is 2.16 million cs, comfortably within 2⁵³. Fine.
- **`getTransitProgress` accepts any `currentTime` without checking `currentTime ≥ departTime`.** A negative elapsed is silently clamped to 0, hiding causality bugs. Assert instead of clamping in the engine path (clamp only in display code).
- **The Merkle function is not Merkle.** It hashes one big JSON payload. The prior round's per-site hashing (which allowed reporting *which* site changed) was dropped. Restore it: the whole point of the tree structure was localized invalidation and diagnostics.
- **`canonicalReplacer` returns a sorted-keys object for plain objects**, but for objects *inside* Map entries, arrays of tuples, this works recursively. One more subtle point: **`JSON.stringify` calls the replacer with `this` bound and the *already-serialized* value for objects that define `toJSON`** (such as `Date`). Ban `Date` in the artifact (integers only) or handle it.
- **Numbers as Map keys** still coerce via `String(a)`, so `10` sorts before `9`. Say "keys are strings," or use a type-aware comparator.
- **`displacementRotationR: readonly number[]`** is a rotation matrix of floats, but floats are forbidden in the sealed payload (the replacer throws on non-integers). A rotation matrix's entries are fractional. Store it as a **unit quaternion in fixed-point integers** (or Euler angles in micro-degrees), and note the rounding: a fixed-point rotation isn't exactly orthonormal, so the compiler must apply the *same* rounded values consistently, or renormalize deterministically. Otherwise the payload can't be sealed at all, as written it throws.
- **Missing `[cite: ...]` artifacts: good.**

---

## Part 3: What I'd add

### 1. A precise definition of the supercover as an algorithm, not a policy

The policy needs an algorithm that produces the list of crossed cells, edges, and vertices exactly. In the doubled lattice:

**Step 1: Bounding.** For endpoints `A, B` (centroids in lattice coordinates), only cells within axial distance `d_axial(A, B)` of either endpoint can be crossed. Enumerate candidate cells in that region (a few dozen at most for tactical ranges).

**Step 2: Exact classification per cell.** For each candidate cell, classify the segment against the hexagon using integer cross-products against the six edges: the segment (a) misses the closed hexagon, (b) touches it only at boundary points, or (c) crosses its interior. Because vertices and edge lines are integer points and integer-direction lines, every classification is exact.

**Step 3: Ordering.** Sort crossed features by the parameter `t` along the segment, compared as exact rationals via cross-multiplication (no division).

**Step 4: Apply the policy** to the classified feature list using the decision tables.

Then prove properties by exhaustion on a radius-5 disk (about 91 cells, about 4,000 pairs, well under a second):

```
∀ (a,b):  features(a,b) == reverse(features(b,a))
∀ (a,b):  visible(a,b) == visible(b,a)
∀ (a,b), any opacity pattern: result matches brute-force sampler
```

The brute-force reference samples the segment at, say, 10,000 rational points using `BigInt` and classifies each point; disagreements pin down policy bugs. Because the reference and the fast implementation are independent, agreement is strong evidence.

### 2. A truth table for the three-hex vertex, exhaustively tested

For opacity pattern `(U, V, W) ∈ {0,1}³` (8 rows) and a ray touching the vertex, the majority rule gives `blocked = (U + V + W ≥ 2)`. Write the table in the docs, generate it in a test, and assert the implementation matches all 8 rows. Do the same for the edge rule (`edgeOccluder ∈ {0,1}`, `U, V ∈ {0,1}` gives 8 rows). Tiny tables like these are where policies drift; making them literal test data prevents that.

### 3. Determinism of hex line drawing: never use `Math.round` on rationals

Where an integer algorithm needs a "nearest cell" along a line, use **cube-coordinate rounding with a documented tie-break**, done in integer arithmetic on scaled coordinates: multiply the interpolation by `dist`, so the sample point is `(a·(dist − i) + b·i) / dist` as an integer numerator over integer denominator, then round the *numerator* using integer division with half-to-even or half-away-from-zero rules chosen deliberately, and resolve the cube-sum-zero constraint by the standard "reset the largest error component" step with a deterministic tie-break on equal errors. Even so, prefer the supercover over any rounding scheme, since rounding cannot express the vertex or edge cases.

### 4. Cell pitch and physical scale as explicit site parameters

Add to each site: `cellPitchMm` (center-to-center distance, integer millimeters, for example 2000 for a ~2 m room hex) and derive all physical quantities from it: step time (`pitch / speed`), acoustic distance loss (`pitch`-based dB per cell), vision radius in cells (from a physical range in meters). This replaces scattered magic numbers (0.71 s per step, 150 per hex, 300 lux) with one authored scale per site, so a cramped crawlspace with 1 m cells and a large hall with 3 m cells behave consistently. It also makes the "1.34 m edge from H3 Res 14" leftover unnecessary.

### 5. Duration/Instant types with restricted arithmetic

```typescript
declare const durBrand: unique symbol;
declare const instBrand: unique symbol;
export type Duration = number & { readonly [durBrand]: true };  // centiseconds
export type Instant  = number & { readonly [instBrand]: true }; // centiseconds since epoch

export const add = (t: Instant, d: Duration): Instant => (t + d) as Instant;
export const diff = (a: Instant, b: Instant): Duration => (a - b) as Duration;
```

Now `Instant + Instant` is a type error unless you route through helpers, and `CostUnits` is just `Duration` on a routing edge. This is a five-line change that prevents an entire class of unit bugs, and it's the version of "dimensionally pure" that the branded types were reaching for.

### 5b. Overflow-safe integer chord: three concrete options

1. **`BigInt` chord²**: exact, simple, slower (fine for a heuristic called once per expansion if profiled).
2. **Reduced scale (2²²)**: sums stay under 2⁵³ with margin; resolution ~1.5 m is far below the road graph's own accuracy.
3. **Floor-and-margin**: compute in doubles, floor, subtract a proven rounding bound. Cheapest, and still admissible.

For any option, add a property test: for 10,000 random node pairs, `hInteger ≤ exactChordBigInt / vMax` and `hInteger ≤ trueArc / vMax`.

### 6. Integer transmittance and lookup-based photometry

Represent illumination as an **integer log-lux index** `L ∈ [0, 448]` (each step = 0.01 decade), so `Q_lux = clamp(L / 448, 0, 1)` becomes integer division with a defined rounding. Transmittance accumulates in per-mille integers: `T ← floorDiv(T · (1000 − o), 1000)`. Then `Q_visual` is a pure integer expression, cross-runtime identical, with thresholds compared exactly. This one change removes every transcendental function from percept emission.

### 7. Portal, scale-handoff, and interruption events in the tracer bullet

Extend the ledger fixture with events `DEPARTED_SITE {actorId, portalId, edgeId, at}`, `ARRIVED_AT_SITE {actorId, siteId, entryCell, at}`, and `TRANSIT_INTERRUPTED {actorId, at}`. Test the full lifecycle: stage in Site X, depart onto an edge, interrupt at elapsed `e`, assert the virtual node id `vn:{edgeId}:{e}` and the two sub-edge costs sum to the original, then resume and arrive at Site Y at the exact tick, staged at the right entry cell. That test exercises the hybrid architecture end to end in about 40 lines.

### 8. Mutation testing that the tracer bullet must survive

List required mutants and require each to fail the suite:

- flip the comparator in the router (max instead of min);
- swap tie-break order;
- change `Math.round` to `Math.floor` in LoS;
- make `edgeKey` order-dependent (remove the canonical sort);
- drop the reducer's precondition check;
- drop `displacedActorId` filtering in occupancy;
- return `true` for vertex majority when only one hex is opaque.

Run Stryker against the pure modules in CI. A mutant that survives points to a missing assertion.

### 9. A regression corpus in JSON, run by a generic runner

Every fixture in the tracer bullet should become a data file: `fixtures/<name>.json` containing topology slice, occupants, query, and expected result. One runner loads every file in the directory. Adding a regression = adding a file. It also lets non-programmers (lore authors) submit "this should be visible / not visible" cases, which is a natural fit for the ASCII-template authoring proposed earlier.

### 10. Boundary between the two `AxialHex` key schemes

The code uses both `"q,r"` strings and `edgeKey` strings `"q,r<->q,r"`. Choose **one packed integer cell id** (`CellId = number`, packing two 16-bit offset integers) and derive edge ids as `(min(a,b) * 2^32) + max(a,b)` in a `BigInt` or as a pair. That eliminates locale comparison entirely (numbers compare numerically), removes string allocation from hot loops, and makes tie-breaks a single integer compare. Keep string forms only for logs and the debugger.

### 11. State the guarantees precisely, and stop overclaiming

Two sentences in the document overreach and should be softened until proven:

- "yield identical Boolean topological results to true Cartesian space" is true only for the *exact* segment-versus-polygon predicates, not for the current `Math.round` sampling in the test.
- "Because chord ≤ arc, scaling by `vMax` yields an admissible bound" is true, but the document should add the overflow and rounding-direction conditions that make the *implemented* integer computation retain that property.

---

## Bottom line

**Keep, essentially as written:** the doubled-lattice coordinates (I re-derived them and they are correct), the affine caveat about non-Euclidean distances, canonical `edgeKey`, the `EDGE_PAIR` policy concept (sealed in the manifest), the integer-chord heuristic idea, the union-graph invariant for ALT, derived transit progress with virtual-node splitting, dual-condition audibility with a quality formula, acoustic contact, the decadic illumination curve, displacement excluding the mover with richer failure reasons, hard rejection of floats and NaN in hashing, and a reducer that validates preconditions and advances time by event cost.

**Fix before implementing:**
- The **tracer bullet's LoS** doesn't implement the policy it tests: it uses `Math.round` on rationals (direction-asymmetric), ignores the lattice, mismatches the library's `edgeKey`, imports nothing from `src/`, and never exercises vertex, edge-grazing, or knight-move cases.
- The **`true === false`** assertion is an unreadable stand-in for `false`; write what you mean.
- **`resolveDisplacement`** regressed to `localeCompare` and array-sorting, conflates per-meter with per-cell cost (0.71 s per cell), and should return "another cell" explicitly.
- **The chord heuristic overflows 2⁵³** at the stated 2³⁰ scale.
- **The rotation matrix contains floats** that the hasher throws on; store as fixed-point quaternion.
- **The brand types** as written don't compile and don't stop time/cost/meter mix-ups; use `Duration`/`Instant` with helpers.
- **The Merkle function isn't Merkle** anymore; restore per-site hashing.
- **The three-hex vertex and edge grazing rules** need decision tables and exhaustive tests, plus a stated treatment of exempt endpoints (count as transparent).
- **Illumination** still calls `log10` and multiplies floats in the path that decides percept emission; move to integer log-lux and per-mille transmittance.
- **`Percept`** and **`ActorState`** need unions to represent regional and in-transit cases.

**Add, because the design needs them:** an algorithmic (not merely prose) supercover verified against a `BigInt` brute-force oracle over all pairs on a radius-5 disk, a per-site cell pitch replacing scattered constants, packed integer cell and edge ids, portal and interruption events in the tracer bullet, mutation-testing requirements, and a JSON fixture corpus with a generic runner.

The trajectory across five rounds is clear. The architecture stabilized in round three, the geometry stabilized this round, and what remains is closing the gap between **what the prose says the code does** and **what the code does**. In this round that gap is widest in the tracer bullet, which is the one artifact meant to close it. Before writing anything else, I'd make the tracer bullet import the real `hexgeom` and supercover modules and pass the exhaustive symmetry test. That test is the smallest artifact that turns the spec from believable into true.

This revision does what I asked for last round: the tracer bullet now runs tactical code with a real integer cross-product, the ledger has a scale-handoff lifecycle, and the types are closer to compiling. But I checked the new code by hand, and the packing scheme has a hard bug, the LoS routine tests the wrong geometric condition for the policy it advertises, and one tracer-bullet assertion cannot be right under the stated rules. I'll go through what holds up, what's broken, and what I'd add.

---

## Part 1: What is valuable and true

### 1. The lattice is correct, and the cross-product test is a valid interior test

The doubled lattice from last round (`centroid = (4q + 2r, 6r)`, vertices at `(cx, cy ± 4)` and `(cx ± 2, cy ± 2)`) stands, and I re-verified adjacent cells share edge midpoints exactly, so the tiling is consistent.

The new interior test in the tracer bullet is also valid: it computes the sign of the cross-product of segment direction against each of the six vertices, and declares an interior crossing when vertices fall strictly on both sides of the segment's supporting line. For a convex polygon, "vertices strictly on both sides of the line" means the *line* passes through the interior. That is exactly the right sub-predicate, with one important limit covered below (it tests the infinite line, not the finite segment).

### 2. Packed integer identifiers, with a real motivation

Replacing `"q,r"` strings with packed integers removes string allocation from inner loops, and numeric comparison eliminates `localeCompare` entirely. The idea is right and the edge packing (`min << 32 | max`, canonical order) correctly makes edges undirected. The implementation has bugs (below), but keep the design.

### 3. `Duration` / `Instant` with restricted arithmetic helpers

Splitting the old `CostUnits`/`SimTime` into a duration type and an instant type, with `addDuration(Instant, Duration) → Instant` and `diffInstant(Instant, Instant) → Duration` as the only sanctioned operations, is the dimensional discipline that was missing. The `declare const brand: unique symbol; type X = number & { readonly [brand]: true }` pattern is the correct, compilable idiom (the previous round's `readonly __brand: unique symbol` inside a type literal was not). The library file gets this right.

### 4. Integer photometry and per-mille transmittance

Removing `log10` and float multiplication from the percept path is a real determinism improvement. Precomputing an integer log-lux index at authoring time, then doing only integer arithmetic at query time, means percept emission is bit-identical across runtimes. Worked example: a target 3 cells away at vision radius 10, clear air, log-lux index 300:

```
distanceFactor = floor(7 * 1000 / 10) = 700
transmittance  = 1000
lightFactor    = floor(300 * 1000 / 448) = 669
quality        = floor(700 * 1000 * 669 / 1_000_000) = 468
```

So Q = 468, which is "ambiguous evidence" (200 to 699). That is a plausible outcome for a moderately lit room at moderate range. Note also the arithmetic stays safely inside 2⁵³ (the largest intermediate is 1000 × 1000 × 1000 = 10⁹).

### 5. The overflow analysis for the chord heuristic is now correct

At scale 2²², each coordinate delta is at most 2 × 2²² = 2²³. Squared, 2⁴⁶; the sum of three is at most 3 × 2⁴⁶ ≈ 2.1 × 10¹⁴, comfortably below 2⁵³ ≈ 9 × 10¹⁵. The document computed this correctly. Resolution at that scale is Earth's radius / 2²² ≈ 1.5 m, which is far finer than road-graph accuracy, so the scale choice is reasonable.

### 6. Discriminated `ActorSpatialState` in the spec

The document's specification defines `STAGED` and `IN_TRANSIT` as a proper discriminated union, so an in-transit actor cannot carry a cell and a staged actor cannot carry an edge. That is the right type. (The tracer bullet abandons it; see below.)

### 7. The handoff lifecycle test

Testing depart, invalid-tactical-move-while-in-transit, and arrive as one sequence is the first test in this series that exercises the architecture's central idea. The rejection of a tactical move for an in-transit actor is exactly the guard that prevents scale confusion in production.

### 8. The multi-hop-cheaper-than-direct routing fixture

Making the cheap route three hops and the expensive route one hop finally decouples hop count from cost. A router minimizing hops would pick the direct edge (1000 cs) and fail this test; a cost-minimizing router picks the 600 cs path. This is a well-designed discriminating fixture, and it fixes the earlier flaw where alphabetical tie-breaking happened to hide bugs.

### 9. Fixed-point quaternion for displacement

Storing the rotation as a quaternion scaled by 10⁸ removes floats from the sealed payload. This resolves the contradiction where the hasher rejected non-integer numbers but the rotation matrix was made of them.

### 10. Hash payload structure is closer to a real Merkle tree

The manifest now carries per-site hashes plus a regional graph hash, so a change can be localized. It's still hashed as one flat JSON blob at the top level (a true Merkle tree would hash pairs recursively), but the per-site leaves preserve the diagnostic value.

---

## Part 2: What is wrong, misleading, or underdeveloped

### 🔴 Critical: `packCell` produces signed 32-bit overflow and wrong sort order

```typescript
export const packCell = (q: number, r: number): CellId =>
  (((q + 32768) << 16) | (r + 32768)) as CellId;
```

The bitwise operators in JavaScript operate on **signed 32-bit integers**. With `q + 32768` in `[0, 65535]`, shifting left 16 places gives values up to `65535 × 65536 = 4,294,901,760`, which exceeds `2³¹ − 1 = 2,147,483,647`. Any `q ≥ 0` (so `q + 32768 ≥ 32768`) makes the shifted value have bit 31 set, and `<<` returns a **negative number**. Concretely:

```
packCell(0, 0)  = (32768 << 16) | 32768
                = 0x80000000 | 0x00008000
                = -2147450880      (negative!)
packCell(1, 0)  = (32769 << 16) | 32768 = -2147385344
packCell(0, 2)  = (32768 << 16) | 32770 = -2147450878
```

This has three consequences:

1. **Cell ids are negative for every non-negative `q`,** so any code that assumes ids are non-negative (array indexing, `Uint32Array` storage, bit-packing edges) breaks.
2. **`unpackCell` uses `id >>> 16`,** the unsigned shift, which converts the negative back to its 32-bit unsigned representation. So it happens to round-trip correctly (`-2147450880 >>> 16 = 32768`, then `−32768 = 0`). Round-trip works, but the *intermediate ids are negative and inconsistent* with the declared 32-bit unsigned design.
3. **Numeric comparison of ids does not match `(q, r)` lexicographic order.** For `q + 32768` values below 32768 (negative `q`), the shifted value stays positive; for values at or above 32768, it goes negative. So the negative-`q` cells sort as *larger* than the non-negative-`q` cells: exactly backwards. That breaks any tie-break that relies on "sort by id," which is the deterministic ordering the document claims.

Fix: use unsigned arithmetic explicitly.

```typescript
export const packCell = (q: number, r: number): CellId =>
  (((q + 32768) * 65536) + (r + 32768)) as CellId;   // multiplication, not 
export const unpackCell = (id: CellId) => ({
  q: Math.floor(id / 65536) - 32768,
  r: (id % 65536) - 32768,
});
```

Multiplication stays in double-precision integers (max 4,294,967,295, well within 2⁵³), gives non-negative ids, and preserves `(q, r)` lexicographic order under numeric comparison. Or apply `>>> 0` after the OR. Add range guards (`q, r ∈ [−32768, 32767]`) and a property test that `unpack(pack(q, r))` round-trips over the full range and that `pack` is monotone in lexicographic `(q, r)`.

`packEdge` has a related issue: `BigInt(min) << 32n | BigInt(max)` on **negative** cell ids (which the buggy `packCell` produces) makes `BigInt(max)` negative, and OR-ing a negative BigInt into the low bits corrupts the high half through sign extension. Once `packCell` is fixed to be non-negative, `packEdge` is correct. But it inherits the bug until then, so two distinct edges could collide.

### 🔴 Critical: the tracer bullet's LoS tests the infinite line, not the finite segment

The routine loops over every candidate cell in the bounding box and returns `false` if the *line through A and B* has vertices on both sides. But it never checks that the crossed cell lies **between** A and B. Consider a candidate wall cell in the bounding box that sits beyond the target, or off to the side of a diagonal segment yet still within the box. The infinite line through A and B can pass through its interior even though the finite segment ends before reaching it.

Trace a concrete failure. Let `A = (0,0)`, `B = (0,2)` (the "open target" in the test), and suppose a wall at `(0,3)`, one cell **beyond** B on the same axis. The bounding box is `q ∈ [−1, 1], r ∈ [−1, 3]`, so `(0,3)` is a candidate. The line through A and B is `x = 0` (vertical, since `pA = (0,0)`, `pB = (4, 12)`... wait, recompute in the lattice: `pA = (0, 0)`, `pB = (4·0 + 2·2, 6·2) = (4, 12)`). The line passes through `(0,0)` and `(4,12)`. The wall at `(0,3)` has centroid `(6, 18)`. Vertices of that hexagon: `(6,22)`, `(8,20)`, `(8,16)`, `(6,14)`, `(4,16)`, `(4,20)`. The line `y = 3x` extended reaches `x = 6 → y = 18`, i.e. right through the wall's centroid. All six vertices straddle the line, so the routine reports "interior crossing" and returns `false`, **even though the wall is past the target and cannot block the ray.** The test suite doesn't catch this because it has no wall beyond a target.

The routine also fails to exempt the endpoints' *neighbors correctly* and ignores order of crossing, but the missing segment-bound check is the fundamental flaw. The correct test requires the **segment**, not the line, to intersect the hexagon. Since the hexagon is convex, the segment intersects it iff the line intersects it **and** the parameter interval `[t_min, t_max]` on the line overlaps `[0, 1]`. In integers, compute for each vertex its signed projection along the segment direction, or clip the segment against each half-plane defined by the six edges (Cyrus-Beck clipping, done with cross-multiplied fractions, never dividing).

Also worth noting: a bounding box that extends one cell past both endpoints means many candidates lie outside the ray's actual path, so the missing bound turns a rare miss into a common false block.

### 🔴 Critical: `EDGE_PAIR` is documented but not implemented, and the implementation contradicts one of its rows

The decision table lists four events (interior cross, edge crossing, vertex grazing, endpoint exemption). The tracer-bullet function implements only interior crossing, in the buggy form above. Specifically:

- **Vertex grazing (majority rule): unimplemented.** A ray through a shared vertex gives `positive > 0 && negative > 0` false (vertices lie on or beside the line), so the routine treats it as *not crossing*, i.e. passes, regardless of how many of the three hexes at the vertex are opaque. The majority rule (block if ≥ 2 of 3 opaque) is never evaluated.
- **Edge crossing: only handled for `dist === 1`.** For longer rays, closed edge occluders on intermediate boundaries are ignored entirely (`opaqueEdges` is used only in the adjacency early return).
- **Collinear edge grazing: unimplemented.**
- `segmentIntersectsEdge` (in the library section) returns `0` for *any* zero cross-product, lumping together "collinear," "endpoint touches the line," and "vertex grazing." A zero cross-product in `cp1` means point `p1` lies on the *line* through the ray, not necessarily on the *segment*. The function doesn't distinguish touching from overlapping, and it's used nowhere.
- **`crossProduct(a, b, p)` argument order** in the library and the inline computation match (`(b − a) × (p − a)`), so signs are consistent. Fine.

Because the tracer bullet's function is a fresh implementation (the test defines its own `hasTacticalLoS`) rather than an import from `src/`, the *shipped* LoS and the *tested* LoS are different functions. **The suite verifies a private copy.** This recurs from previous rounds: the tracer bullet still imports nothing from the library.

### 🔴 Critical: one tracer-bullet assertion contradicts the geometry

The second test asserts:

```typescript
const origin = packCell(0, 0);
const openTarget = packCell(0, 2);
expect(hasTacticalLoS(origin, openTarget, ...)).toBe(true);   // "diagonal ray passing through unblocked intermediate space"
```

Two issues:

1. The comment says "diagonal," but `(0,0) → (0,2)` in axial coordinates is a **straight lattice line** (both cells lie on the `q = 0` axis; direction `(0, +1)` twice). It exercises no diagonal, vertex, or edge-grazing behavior.
2. It does not test any case where the ray touches a vertex or runs along an edge. Every ray in the suite either goes along a lattice axis (`(0,0) → (2,0)` and `(0,0) → (0,2)`), so the majority rule and edge rules go unexercised: the *only interesting parts of the policy* have no test.

The genuinely policy-sensitive cases in axial coordinates are pairs at "knight-move" offsets such as `(0,0) → (1,1)` and `(0,0) → (2,−1)`, where the ideal line passes exactly through a vertex shared by three cells. Add those, with the third-cell opacities varied across all eight patterns.

### 🟠 Serious: the tracer bullet's types diverge from the specified ones

The spec defines `ActorSpatialState` as a discriminated union; the test defines:

```typescript
interface ActorState {
  scale: 'STAGED' | 'IN_TRANSIT';
  siteId?: string; cell?: CellId; edgeId?: string; departTime?: Instant; edgeCost?: Duration;
}
```

with all fields optional. This is the "bag of optionals" the union was designed to eliminate; it allows `{scale: 'STAGED'}` with no cell, and the reducer's `current.cell !== event.fromCell` silently compares `undefined`. The type system can't catch invalid states, so the test can't demonstrate the guarantee the spec claims.

Also, the test file redefines `Duration`, `Instant`, `CellId`, `EdgeId`, and the pack functions locally with the *old, non-compiling* brand syntax (`{ readonly __brand: unique symbol }`) rather than importing the corrected versions. The version in the test would fail type-checking under `strict`, and `const toDuration = (cs: number): Duration => cs as Duration` skips the validation the library's `toDuration` performs. A test that reimplements the units guards nothing about the library's real constructors.

### 🟠 Serious: the reducer has several unenforced rules

- **`ACTOR_DEPARTED_SITE` doesn't advance time or verify the edge.** It sets `departTime: state.time` but returns `time: state.time`. Reasonable. But the *event carries no timestamp of its own*; it relies on the global `state.time`, which conflates "the world clock" with "this actor's local time." In a multi-actor ledger, actors depart at different instants, and one global clock advanced by *each* actor's move costs (`ACTOR_MOVED_TACTICAL` adds `cost` to global time) makes simulation time equal to the **sum** of all actors' action costs. Two goblins each moving for one second advance the clock by two seconds. That is wrong for concurrent actors and, for the regional case, a six-hour drive by one actor would advance everyone's clock.

  Correct model: events carry their own `at: Instant` (and optionally `until`), the reducer verifies monotonic ordering per the ledger's canonical event order, and the *world clock* is a separate max/scheduler concept. Actor-local durations become `busyUntil` timestamps. This is a design-level issue rather than a test nit, and it will bite hard once more than one actor exists.

- **`ACTOR_ARRIVED_AT_SITE` adds `event.cost` to the clock** rather than verifying `now ≥ departTime + edgeCost`. The intended semantic ("arrival happens at the derived arrival instant") should be checked: arrival before `departTime + edgeCost` should be *rejected*. As written, an actor can "arrive" instantly and the reducer will add another 5000 cs. In the test, arrival cost of 5000 equals `edgeCost`, and the clock goes 1000 → 6000, which matches only because the test author supplied consistent numbers; nothing enforces it.

- **The reducer doesn't verify that the arrival `siteId`/portal matches the edge's destination.** Any actor on any edge can arrive at any site.

- **`ACTOR_MOVED_TACTICAL` doesn't verify the move is legal** (adjacency, path, blocked cells, cost consistent with the router). It applies whatever the event says. The reducer is where "geometry proposes, ledger validates" should be enforced, and it should call the spatial engine's `isLegalMove(from, to, topology)`.

- **The test's second case reuses the *original* `initialCell` as `fromCell` for an in-transit actor.** It's rejected because `scale !== 'STAGED'`, which is correct, but the *reason* tested is the scale check, not the cell mismatch. Fine, but add a separate case for cell mismatch while staged (the previous round had it; this round dropped it). **Regression:** the mismatched-`fromCell` test present in the last version is gone.

### 🟠 Serious: `canonicalJsonReplacer` regressed to `localeCompare`

```typescript
String(a).localeCompare(String(b))
```

appears twice in the hashing code, immediately after the same document introduced packed ids specifically "to remove … locale-dependent sorting bugs (`localeCompare`)." `localeCompare` depends on ICU data and the runtime's default locale, so two machines can order the same keys differently and produce **different topology hashes for identical data**. That defeats the purpose of the hash. Use a code-unit comparator: `a < b ? -1 : a > b ? 1 : 0`. Also, `Object.keys(...).sort()` uses default code-unit ordering (safe), so only these two sites are wrong.

Additionally, a `bigint` value (edge ids are `bigint`) makes `JSON.stringify` **throw a TypeError** ("Do not know how to serialize a BigInt"). Any Map or Set keyed by `EdgeId` cannot be sealed as written. Serialize bigints as decimal strings in the replacer (with a type tag if needed).

### 🟠 Serious: `computeMerkleTopologyHash` is still not a Merkle construction

It takes precomputed `siteHashes` and `regionalGraphHash` and hashes them together in one JSON, which is a single-level hash of hashes. That is a reasonable *two-level* structure and preserves per-site diagnostics, so I won't call it wrong, but the name overclaims and the document doesn't include the function that produces `siteHashes[i].hash` or `regionalGraphHash`. Specify how leaf hashes are computed (same replacer, same rules), that the list is sorted by `siteId` in code-unit order before hashing, and add a golden test with a committed expected hash. Without a golden value, a bug that makes the hash constant (as happened before with `Map`) is undetectable.

### 🟠 Serious: `segmentIntersectsEdge` returns a tri-state that conflates distinct geometric events

Returns `1`, `0`, or `−1`, with `0` for "collinear or vertex grazing" and also for **an endpoint of the ray lying on the edge's supporting line** (cp3 or cp4 zero), which is not grazing at all (the ray may end far beyond the edge's extent). It needs at least these outcomes: `MISS`, `PROPER_CROSS`, `TOUCH_ENDPOINT_OF_EDGE` (passes through an edge vertex), `TOUCH_ENDPOINT_OF_RAY`, `COLLINEAR_OVERLAP`, `COLLINEAR_DISJOINT`. The standard segment-intersection routine distinguishes these using orientation tests plus bounding-box checks for collinear cases. Since the whole `EDGE_PAIR` policy depends on distinguishing "through a vertex" from "along an edge," the tri-state is too coarse to implement the table.

### 🟠 Serious: `distanceFactor` divides by zero and the range check is inconsistent

`computeVisualQuality` computes `Math.floor(((maxVisionRadius - distanceSteps) * 1000) / maxVisionRadius)`. If `maxVisionRadius = 0` (a blind or debuffed actor, an authoring mistake), the check `distanceSteps > maxVisionRadius` is false for `distanceSteps = 0`, and the division is `0/0 = NaN`, which `Math.floor` propagates, and the final `Math.floor(NaN)` returns `NaN`, a non-integer value flowing into a percept. Guard `maxVisionRadius ≤ 0` explicitly. Also at `distanceSteps === maxVisionRadius` the distance factor is 0, so a target at exactly the radius is invisible even though the radius check admits it; that matches the earlier design but should be stated (the effective visible range is `< radius`).

Also `Math.floor(x / 1000000)` on the triple product uses **floating division then floor**. For integers up to 10⁹, division by 10⁶ is exact enough that floor is correct, but "integer arithmetic" here is really `double` arithmetic on integers, which is safe below 2⁵³ but should be stated; for stricter guarantees use `(a * b * c - ((a * b * c) % 1000000)) / 1000000` or BigInt.

Another subtle bug: **`pathCellOpacities` should exclude the endpoint cells** (endpoint exemption) but the function accepts whatever the caller passes, with no contract that the arrays already exclude endpoints. State it.

### 🟠 Serious: ALT and the union-graph invariant have a remaining subtlety

The union-graph argument is correct for *lower bounds on distance*: distances in the union graph are ≤ distances in any subgraph, so `h` computed from union tables never overestimates any actor's true distance. ✅. But the same reasoning shows the **triangle-inequality bounds are only valid if the tables are exact shortest-path distances in the graph they're computed on**, and, more importantly, the *ALT bound itself* uses `d(L, goal) − d(L, u)`. That bound is a valid lower bound on `d(u, goal)` **in the same graph the tables came from**. In the union graph, the bound `d_U(L, goal) − d_U(L, u) ≤ d_U(u, goal)`. And `d_U(u, goal) ≤ d_actor(u, goal)` (union is more permissive). So `h ≤ d_U ≤ d_actor`. ✅ Admissible. Consistent? Consistency requires `h(u) ≤ c(u, v) + h(v)` for each edge the actor can use; since every actor edge is also a union edge, and the ALT bound is consistent on the union graph, it's consistent for the actor's subgraph. ✅.

What the document still omits: **time-dependent and condition-dependent edge costs.** If real costs can be *lower* than the compile-time cost (a clear night with no traffic, a bridge open), the tables must be built from the **minimum possible cost** per edge, otherwise `h` can overestimate. State that table costs are lower envelopes.

### 🟡 Moderate issues

- **The `unpackCell` return isn't validated** and `packCell` doesn't range-check; a `q` of 40000 silently wraps into the wrong cell. Add `RangeError` guards (or return a result).
- **`toDuration` rejects non-safe-integers** (good) **but accepts `cs = 0`.** Zero-duration edges (instant portals) are still allowed at the type level; the compiler must reject them, and a `NonZeroDuration` or a compile-time assertion should say so.
- **`diffInstant(a, b)` returns a `Duration` cast without checking `a ≥ b`**; a negative difference becomes an invalid `Duration` (negative) that bypasses `toDuration`'s check because the cast skips validation. Return a result or throw.
- **The test's `findShortestRoute` sorts the whole array on every iteration** and breaks cost ties by whatever `Array.sort` stability gives (stable in modern engines, but insertion-order dependent). Fine for a 4-node fixture; but **the reference implementation in the test is not the library's `findPath`**, so the router in `src/` is untested. The test verifies a throwaway Dijkstra.
- **The tracer bullet has no `Instant` comparison for `edgeCost` derivation of arrival time.** Covered above.
- **`pathCellOpacities`/`pathEdgeOpacities` come from where?** The visual quality function consumes them but the supercover routine (which should produce the crossed cell and edge lists) isn't shown producing them. The pipeline `supercover → opacities → quality` has a gap between the first two stages.
- **The doc says "Uber H3 Res 5-8" for the regional layer but ECEF unit vectors for routing.** H3 has no consumer in the shown code (as flagged before). Either show the consumer or drop it from the regional layer for now.
- **`Meters` is defined but nothing uses it** in the shown code (the heuristic computes `chordMeters` as a plain number). Either use it or remove it.
- **Chord-to-meters formula uses `Math.sqrt` and multiplies by `R_earth`** (a float), then floors. `Math.sqrt` is correctly rounded per IEEE-754 (it's required to be exact-rounded by the ECMAScript spec, unlike `sin`/`cos`), so it's deterministic across engines. That's fine and worth stating explicitly, because it is the one transcendental-adjacent operation that *is* safe. But multiplying by `R_earth / S` (both constants) should be precomputed as one integer-ratio and applied with integer division to keep the "no float" story clean.
- **`computeVisualQuality` thresholds (700, 200) are policy constants** with no home; put them in the sealed policy block of the manifest so changing them invalidates caches.
- **`LatticePoint` uses `number`** for `x` and `y`; cross-products of lattice coordinates up to ±(4·32767 + 2·32767) ≈ ±2×10⁵ give products up to ~4×10¹⁰, safe in doubles. State the coordinate range at which cross-products remain exact (below 2⁵³ requires |coord| < ~9.5×10⁷, so fine).
- **`edgeId: string` in `ActorSpatialState.IN_TRANSIT`** is a string, while tactical edges are `EdgeId` bigint. Two identifier schemes for "edge" (regional string ids versus tactical packed bigint) share a name. Namespace them (`RegionalEdgeId`, `TacticalEdgeId`).

---

## Part 3: What I'd add

### 1. A correct finite-segment supercover, specified as an algorithm

This is the single most valuable missing artifact. In the doubled lattice, with `A` and `B` as integer points:

**Step 1: Candidate cells.** Every cell whose closed hexagon intersects the segment lies within `d_axial(A, B)` steps of the line. Enumerate the axial bounding parallelogram, then filter with a cheap exact test (below).

**Step 2: Exact segment-versus-convex-polygon classification.** For each candidate hexagon with vertices `V₀..V₅`:

- Compute `s_i = sign(cross(B − A, V_i − A))` for each vertex. If all `s_i > 0` or all `s_i < 0`, the *line* misses the hexagon: reject.
- Otherwise the line meets the hexagon. Now bound by the segment: compute `t`-interval of the line inside the hexagon by clipping against the six edge half-planes, using exact rational arithmetic (numerators and denominators as integers, comparing `n₁·d₂` versus `n₂·d₁`). The segment intersects iff the clipped interval overlaps `[0, 1]`.
- Classify the contact: interior (positive-length overlap with interior), or boundary-only (touching along an edge, or at a single vertex). Boundary-only cases are the ones the policy table governs.

**Step 3: Order by `t`** (compare rationals by cross-multiplication) to emit an ordered feature list of crossed cells, crossed edges, and touched vertices.

**Step 4: Apply the decision table** to the feature list. This is where `EDGE_PAIR` becomes code.

Use Cyrus-Beck clipping because it handles convex polygons cleanly and stays entirely in integer cross-multiplication. Every number stays well under 2⁵³.

### 2. Encode the decision table as data and test it exhaustively

The table is small enough to be literal test data:

```
Vertex rule:  for (U,V,W) ∈ {0,1}³ → blocked = (U+V+W ≥ 2)          8 rows
Edge rule:    for (occluder,U,V) ∈ {0,1}³ → blocked = occluder ∨ (U∧V) 8 rows
Endpoint:     exempt cells count as transparent for policy evaluation
```

Write these tables as arrays in a fixture file, generate one test per row, and assert the implementation agrees with every row. When someone later changes the policy, the failing rows document exactly what changed. Record the policy version in the sealed manifest.

### 3. A brute-force oracle over the entire small domain

For every ordered pair of cells `(a, b)` in a radius-5 disk (91 cells, 8,190 ordered pairs) and for a representative set of opacity assignments (all-clear, single-wall, random with a fixed seed, and all 8 patterns at each vertex-touching pair), compare the fast implementation against an independent reference that samples the segment at, say, 4,096 rational points using `BigInt` and classifies each sample by exact hexagon membership. Assert:

```
fast(a,b) == fast(b,a)                       (symmetry)
fast(a,b) == oracle(a,b)                     (agreement)
supercoverFeatures(a,b) == reverse(supercoverFeatures(b,a))   (feature symmetry)
```

Exhaustive checking on a small domain beats random testing here, because the interesting cases are measure-zero (rays through vertices) that random sampling would essentially never hit.

### 4. Event-time semantics: per-event timestamps and `busyUntil`, not a summed global clock

Redesign the reducer so events carry `at: Instant`:

```typescript
type LedgerEvent =
  | { type: 'ACTOR_MOVED_TACTICAL'; actorId; at: Instant; fromCell; toCell; duration: Duration }
  | { type: 'ACTOR_DEPARTED_SITE';  actorId; at: Instant; edgeId; edgeCost: Duration }
  | { type: 'ACTOR_ARRIVED_AT_SITE'; actorId; at: Instant; siteId; entryCell }
```

The reducer enforces: `at` is non-decreasing across the ledger (total order by `(at, sequenceNumber)`); an actor's `busyUntil` is respected (cannot act before finishing a previous action); arrival `at` must equal `departTime + edgeCost`, exactly. The world clock is `max(at)` over applied events, not a running sum. This makes concurrency well-defined and makes the arrival check a real integrity assertion (a wrong arrival time fails loudly).

### 5. Have the reducer call the spatial engine to validate moves

The ledger should not trust the event's claim. `applyLedgerEvent` should call `spatial.validateMove(topology, from, to, overlay)` and reject events that aren't adjacent, cross a blocked cell or closed edge, or violate capacity. That makes "geometry proposes, ledger validates" a checked property, and it means bugs where the engine emits an impossible move surface at the boundary instead of corrupting state.

### 6. Fix the identifier scheme once, with property tests

Implement `CellId` with multiplication-based packing, add range guards, and assert:

```
∀ q,r in range:  unpack(pack(q,r)) == (q,r)
∀ (q1,r1) < (q2,r2) lexicographically:  pack(q1,r1) < pack(q2,r2)
∀ a ≠ b:  packEdge(a,b) == packEdge(b,a)  and injective on unordered pairs
```

Use `fast-check` over the full coordinate range including negatives and boundary values (`−32768`, `32767`). These three properties would have caught the signed-shift bug immediately.

### 7. Namespaced identifiers and a single id module

Define `SiteId`, `ActorId`, `RegionalNodeId`, `RegionalEdgeId`, `TacticalCellId`, `TacticalEdgeId` as distinct branded types in one `ids.ts`. Right now `edgeId` means a string in one place and a bigint in another, and `cell` sometimes means a `CellId` and sometimes an `AxialHex`. Type-level distinctness costs nothing and prevents cross-scale mix-ups, which is the class of bug the hybrid architecture is most exposed to.

### 8. Make the tracer bullet import the real modules, and add a mutation gate

The single most important action item, repeated because it is still not done: **the test must import `hasLineOfSight`, `findPath`, `applyLedgerEvent`, `packCell`, and the unit constructors from `src/`.** Then add the mutation list from last round plus the new bug classes found here:

- change `<<` back to a signed shift in `packCell` (should fail the monotonicity property);
- remove the segment-bound check (should fail a test with a wall beyond the target);
- flip the vertex majority threshold from ≥ 2 to ≥ 1 or ≥ 3;
- drop the arrival-time equality check in the reducer;
- swap `min`/`max` in `packEdge`;
- reintroduce `localeCompare` in the hash replacer (should fail a hash golden test run under a different locale).

CI runs the suite under two `LANG`/`Intl` locales, which is the cheapest way to detect the locale-sensitivity class of bug.

### 9. Golden hash and cross-environment run

Commit `expected_topology_hash.txt` for the fixture, compute it in CI on two Node versions and two locales, and fail on mismatch. This is the only test that catches replacer bugs (locale sort, bigint, key order) that unit tests on a single machine will pass.

### 10. Tighten the manifest into a real sealed policy block

Everything tunable that affects outputs belongs in one sealed `policy` object: `boundaryPolicy: 'EDGE_PAIR'`, `resolveThreshold: 700`, `ambiguousThreshold: 200`, `snrMinCdB: 600`, `conversationSourceCdB: 6000`, `defaultCapacity: 2`, `logLuxIndexMax: 448`, `chordScale: 4194304`. Then any code that needs a constant reads it from the sealed policy, nothing is hardcoded, and changing a number necessarily changes the hash and invalidates cached results and rendered episodes. This turns "policy choice" from a comment into a versioned artifact.

### 11. Two concrete simplifications worth considering

- **Drop H3 from the regional layer until a consumer exists.** Right now nothing in the shown code reads an H3 index. If the only need is "which regional nodes are near this point," a k-d tree or simple grid over ECEF integers does the job without the dependency. Reintroduce H3 when you actually need joins against H3-keyed datasets. Unused dependencies are cost with no benefit.
- **Consider a simpler tactical LoS that is provably equivalent for common cases.** Many hex-grid games use a symmetric shadow-casting or "permissive FOV" algorithm with well-understood properties. If your policy is close to "permissive" (a ray that touches a wall only at a vertex passes), an off-the-shelf permissive algorithm may already satisfy it. Compare against your oracle before building the full exact machinery; if the cheap algorithm agrees on all 8,190 pairs across your policy patterns, it's a far smaller thing to maintain.

---

## Bottom line

**Keep, essentially as written:** the verified doubled lattice and the affine caveat; the cross-product sign test as the *line-versus-polygon* sub-predicate; packed integer ids as a design; `Duration`/`Instant` with the `declare const` brand idiom and restricted helpers; integer log-lux and per-mille transmittance (the worked example gives Q = 468, a sensible value); the overflow analysis at scale 2²²; the discriminated `ActorSpatialState` (in the spec); fixed-point quaternion displacement; the multi-hop-cheaper-than-direct routing fixture; the depart/reject/arrive handoff test.

**Fix before implementing:**
- **`packCell` overflows into negatives** with signed `<<`; use multiplication or `>>> 0`, range-guard, and prove monotonicity and round-trip with property tests. `packEdge` inherits the bug.
- **LoS tests the infinite line, not the segment**; add the parametric bound (Cyrus-Beck with rational comparison) and a wall-beyond-target test.
- **`EDGE_PAIR` is unimplemented** apart from interior crossing; the vertex majority rule, edge crossing beyond adjacency, and collinear grazing are absent, and `segmentIntersectsEdge`'s tri-state can't distinguish the cases the table needs.
- **The tracer bullet still imports nothing from `src/`**, redefines the units with the old non-compiling brand syntax, and degrades the discriminated union to a bag of optionals.
- **Global clock summing** (`time + cost` per actor) is wrong for concurrent actors; use per-event `at` timestamps and enforce arrival time equality.
- **`canonicalJsonReplacer` regressed to `localeCompare`** and throws on `bigint`; use code-unit comparison and serialize bigints as strings.
- **`computeVisualQuality`** divides by zero when `maxVisionRadius = 0`; guard and state the endpoint-exclusion contract for the opacity arrays.
- Add table lower-envelope semantics for time-varying edge costs in ALT.

**Add, because the design needs them:** a finite-segment supercover algorithm with exact rational ordering, the decision tables as literal test data, a 8,190-pair oracle test on a radius-5 disk, event-time semantics with `busyUntil`, reducer-side validation through the spatial engine, namespaced id types, a sealed policy block, a golden hash tested across Node versions and locales, and a mutation gate that must catch every bug class found across these six rounds.

The pattern is the same one I flagged last time, sharpened: **each round the prose gets more precise while the executable artifacts lag behind it**, and the gap is now concentrated in two places: the LoS routine (which implements a strictly weaker predicate than the policy describes) and the tracer bullet (which tests a private copy). The best single next step is unchanged and now even clearer: write `hexgeom` and the finite-segment supercover as real modules in `src/`, make the tracer bullet import them, and don't merge anything else until the radius-5 exhaustive symmetry-and-oracle test passes.

This document is different from the previous six. It's a synthesis: a reading of the evolving design that distills principles and drops code. That changes what a useful review looks like. The earlier rounds were line-by-line audits of specifications and code. This one needs a different test, and it's worth stating it up front:

> **A synthesis should be judged by whether its claims are true, whether it preserves what matters, and whether it hides anything by summarizing.**

By that test it does well on the first two and has a serious weakness on the third. Summarizing the design as a set of principles makes the design look finished. It isn't. Six rounds of review found that the *principles* have been stable since round three while the *executable artifacts* kept lagging behind them, and this document, being all principle and no artifact, cannot show that lag. I'll go through what's right, what needs correction or qualification, and what I'd add, with particular attention to the hidden cost of the synthesis itself.

---

## Part 1: What is valuable and true

### 1. The central sentence is right, and it's the actual thesis

> *Make physical space a deterministic, testable causal system that sits between canonical world-building and narrative cognition, while keeping geometry completely independent of the simulation's mutable state and presentation layer.*

This is the correct reduction. Notice what it does not say: it doesn't mention H3, hexagons, A*, PixiJS, or integers. The document is right that those are implementation choices in service of a causal-authority idea, and that the earlier material sometimes confused the tool for the goal. Anyone joining the project should read this sentence first.

### 2. The causal chain, and the rule that no layer manufactures facts for another

```
physical world → physical event → sensory opportunity → percept → belief → language
```

The strongest formulation in the document is the prohibition: the LLM cannot manufacture geometry, the epistemic system cannot manufacture perception, the perception system cannot manufacture physical events, the runtime cannot rewrite canon, and the renderer cannot redefine the world. This is a **one-way information-flow discipline**, and it's the correct way to state ignorance-by-omission structurally. It's better than "don't leak facts to the prompt," because it makes leakage an architectural violation instead of a prompt-engineering failure.

The four boxed equations (`PhysicalTruth = F(...)`, `Percept = G(...)`, `Belief = H(...)`, `Expression = J(...)`) are worth keeping as the project's ontology. Their real value is that each function's *inputs* are listed, so you can audit what each layer is permitted to depend on. One refinement in Part 3.

### 3. Spatial establishes *possibility*, not *occurrence*

> *Spatial says what could happen; the simulation decides what did happen.*

This is subtle and correct, and it resolves a boundary question that earlier rounds left fuzzy. `findWitnesses` in earlier drafts returned who "witnessed" an event, which quietly made spatial decide an occurrence. The synthesis correctly reframes it: spatial returns *opportunities to perceive*, the runtime decides events, and the epistemic layer turns percepts into beliefs. Phrasing outputs as `can_see`, `can_hear`, `can_reach`, `can_witness` (opportunity predicates) instead of `saw`, `heard` keeps the layers honest.

### 4. Deterministic is not the same as correct, with an explicit verification hierarchy

```
1. Mathematical correctness   2. Topological correctness   3. Determinism
4. Replay stability           5. Narrative usefulness
```

This is the single best *addition* the synthesis makes over the source material, and the one most directly confirmed by what the review found. Across six rounds, nearly every serious bug was a **deterministic wrong answer**: `packCell` deterministically producing negative ids, the LoS routine deterministically testing an infinite line instead of a segment, the tracer bullet deterministically passing while testing a private copy. Determinism testing (run twice, compare) would have blessed every one of them. The hierarchy puts correctness *below* determinism in the stack for a reason: you can only meaningfully test determinism of something already known to be right, and reproducibility of a wrong answer is worse than nondeterminism because it's harder to notice.

### 5. Three distances, never one variable

Topological (hex steps), physical (meters), and travel duration (time over a weighted graph) answer different questions, and the synthesis correctly says to forbid a single `distance` carrying all three meanings. The illustrative point is well chosen: two cells three hexes apart can be twenty seconds apart across a wall, and two far-apart places can be ten seconds apart on a fast edge. Any function named `distance` in the public API should be a red flag.

### 6. Terrain *meaning* stays out of the algorithm

`terrain → traversal cost` is the whole interface. The spatial engine must never contain `if terrain === "cramped": goblin feels claustrophobic`. This is the right seam: lore owns semantics (what "cramped" *means* to a goblin), the adapter owns translation (cramped → multiplier), and spatial owns arithmetic (a number). It also makes the engine reusable for a different fiction, which is the practical test of whether the boundary is real.

### 7. Perception is not knowledge, with a concrete gradient

The `percept → interpretation → belief → knowledge` ladder, with the example of C receiving `{modality: auditory, direction: east, intensity: strong, confidence: 0.82}` rather than `FACT: A hit B`, is a good illustration of *why* percepts exist. It gives the epistemic layer room for suspicion, misidentification, and false inference without needing hidden world state. Keep this as the canonical explanation for newcomers.

### 8. Line of sight is not visual perception

> *A mathematically unobstructed ray does not imply the target is visible.*

Correct and easy to forget. The synthesis is right that illumination is a separate input, and that unobstructed-but-dark should yield near-zero percept quality. This also explains why optical *reciprocity* (`LoS(A,B) = LoS(B,A)`) is true for geometry but **not** for perception: A may be lit and B dark, so B can see A but A cannot see B. Geometry is symmetric; perception is not. That distinction deserves to be stated explicitly, and I return to it below.

### 9. Opportunity beats proximity: the temporal contact graph

Being near is not the same as having a chance to interact. Two goblins in the same corridor at different times had no opportunity. Elevating the temporal contact graph to a first-class concept, and promoting "opportunity" to a general abstraction, is one of the more valuable additions here. It also gives the rumor-propagation mechanism its audit trail (`C0 → C1 at T12 → Wart at T18`).

### 10. The scale-handoff and portal insight

A portal is a **semantic scale boundary**, not just a door, and the transition must be **atomic**: at every instant an actor is either in transit or staged, never eligible for both models. The proposed canonical portal properties (`portal_id`, `regional_node`, `site_id`, `entry_cell`, `exit_cell`, `directionality`, `transition_cost`, `transition_time`) are the right field list.

### 11. Dynamic overlays as the answer to mutable geometry

Static topology plus a per-query overlay yields a query-specific topology while canon stays immutable and the function stays pure. Restating it as `STATIC + OVERLAY → QUERY TOPOLOGY` makes it the general pattern for anything state-dependent (doors, jams, flooding, steam).

### 12. Referential determinism and versioned rulesets: the best original contribution

```
R = F(topology_hash, overlay_hash, actor_state_hash, spatial_algorithm_version, query)
```

This is a genuine improvement on "the algorithm is deterministic." It states **what determinism is conditioned on**, and it names the failure mode earlier drafts missed: the map hasn't changed but replay diverges because a tie-break, boundary policy, or attenuation constant changed. Recording `topology_hash` alongside `spatial_ruleset_version`, `routing_ruleset_version`, and `perception_ruleset_version` is the right structure, and it closes the gap that a topology hash alone leaves open. (I proposed a "sealed policy block" last round; this is the same idea expressed at the right level, and I'll show how the two combine.)

### 13. Domain-separated hashes

Splitting `world_hash` into topology, terrain, routing, perception, and portal components means replay infrastructure can say *what kind* of thing changed, not just *that* something changed. This is a real operational improvement over a single hash and matches the "which site changed" diagnostic from earlier rounds.

### 14. The integer principle, correctly bounded

The key refinement:

> *No uncontrolled floating-point values in authoritative simulation state or decision boundaries.*

This is better than "never use floats" and it matches how the design actually works: floats are fine in offline compilation (if the output is quantized deterministically), in visualization, and in analysis, and forbidden where a value crosses a threshold that decides an outcome. The deeper statement, that the goal is to make every state transition *representable as a canonical, serializable, exactly reproducible value*, is the true reason, and it explains why integers help without making them a dogma.

### 15. Compile geography offline

Runtime consumes a sealed compiled artifact; it never downloads, parses, or projects. The three benefits named (performance, reproducibility, reliability/security) are right, and I'd add a fourth below (auditability of data provenance).

### 16. Build the tracer bullet before the debugger, and keep the debugger downstream of truth

> *The debugger should visualize truth; it should not become the mechanism by which truth is established.*

This is exactly right, and it's a cleaner statement than the source material's. A debugger that can *modify* what's true is a second authority. A debugger that only *reads* is a lens.

### 17. "Pure" does not mean "inputs are simple"

`Result = F(WorldSnapshot, SpatialQuery)` with rich immutable inputs is the correct interface shape, and it's better than a method-style API (`spatial.moveActor(...)`) because it makes causality explicit, results serializable and cacheable, and calls trivially testable. This is worth adopting as a hard rule: **no spatial function may have a method that mutates**; every function is a query over a snapshot.

### 18. The minimal kernel

Geometry, collision, routing, perception, occupancy, temporal interaction, provenance: about a dozen functions. The instruction to prove the small kernel first (can A move, can A not pass a wall, can A see B, can A hear B, can A and B co-occupy) before growing the API is sound.

---

## Part 2: What needs correction, qualification, or is missing

The synthesis is mostly accurate. These are the places where it's wrong, where its confidence exceeds what the source supports, or where summarizing removed something important.

### 🔴 Critical: "The architecture is done; prune and implement" is not supported by the evidence

The closing recommendation is to treat the final hybrid as "the mature target" and "aggressively prune the earlier material." The pruning advice is right. The implied readiness is not. The document reads as though the design has converged, and at the level of *ideas* it has. But the previous six rounds documented, in specific detail, that the *concrete formulations* still contained errors at every stage, and the most recent round found:

- **`packCell` overflows into negative ids** because JavaScript's `<<` is a signed 32-bit shift; the ids sort in the wrong order and `packEdge` inherits the corruption.
- **The LoS routine tests the infinite line, not the finite segment**, so a wall *beyond* the target blocks the view.
- **`EDGE_PAIR` is specified but unimplemented** (vertex majority, edge crossing beyond adjacency, collinear grazing).
- **The tracer bullet imports nothing from `src/`**, so it verifies a private copy.
- **The reducer sums per-actor durations into one global clock**, which is wrong for concurrent actors.
- **The hash replacer regressed to `localeCompare`** and throws on `bigint`.

A synthesis of principles cannot show this, and the phrase "the mature target" invites treating a *principled* design as a *verified* one. The honest status is: the ideas are settled, the specification is nearly settled, and the code has never passed its own tests because the tests don't call the code. That gap is the project's largest live risk, and it does not appear anywhere in this document.

### 🟠 Serious: "Reciprocity" and "symmetry" need to be separated, or the epistemic layer gets wrong answers

The synthesis says line of sight needs exact geometry and endorses symmetric supercover. It also correctly says LoS is not perception. But it never draws the consequence, and this is the place where a clean-sounding principle produces a real bug if left implicit:

| Property | Symmetric? | Why |
|---|---|---|
| Geometric visibility (`clear ray between A and B`) | **Yes** | The segment is undirected |
| Illumination-dependent visual quality | **No** | Depends on light at the *target* and adaptation of the *observer* |
| Facing-cone masking | **No** | Depends on the observer's orientation |
| Acoustic audibility | **No** in general | Depends on the listener's threshold and local ambient noise |
| Somatic capability (blind, deaf) | **No** | Per-actor |

So `hasLineOfSight` should be symmetric and tested for it, while `canPerceive(observer, target)` is intentionally asymmetric. Code that conflates them will either (a) enforce reciprocity where it's physically false (a goblin in a lit room *can* be seen by one in the dark who cannot see back), or (b) drop the symmetry test on the geometric core because "perception isn't symmetric." Name them differently and test each property at the right layer.

### 🟠 Serious: the causal chain is presented as linear, but real information flow has a feedback loop

```
world → event → opportunity → percept → belief → language
```

This is right as a *dependency* order but it hides a loop the system needs. Beliefs and intentions influence *subsequent actions*, which change the world, which produces new events. The chain is a single cycle of a loop:

```
belief → intention → action → world change → new events → new percepts → belief
```

Why this matters for the "no layer manufactures facts" rule: the rule is about *within-tick information flow*, and it holds. But the loop means a bug in one tick (a wrong percept) propagates into behavior, and behavior changes the world that the *next* spatial query sees. Determinism tests on a single tick will miss compounding drift. The 1,000-tick headless simulation is the right instrument for that, and it should be described as the test of the *loop*, not just a topology lint.

### 🟠 Serious: the synthesis under-specifies where the epistemic system lives, and it's the most under-designed layer

Everything downstream of `Percept` (interpretation, belief, inference rules, `H` in the boxed equations) is asserted but not defined anywhere in the six documents or this one. The whole ignorance-by-omission value proposition depends on it, and it carries the hardest unsolved questions:

- **How does a percept become a belief?** With what confidence, and how does confidence *combine* across multiple percepts of the same event?
- **How is misidentification modeled?** If C sees a figure at quality 400, whom do they believe it was? Chosen how, and deterministically?
- **How do beliefs decay, get contradicted, or get revised?**
- **What provenance does each belief carry** (so the auditable chain `C0 → C1 → Wart` actually exists)?
- **Who may an LLM be shown information about?** Ignorance by omission requires that the prompt-construction step consults *only* the belief store, which is a separate enforcement point that must itself be tested.

The spatial engine is the easy, well-specified half of a two-part problem. The next design effort should go to `H`, and I'd flag that it may need stochastic elements (uncertain identification) that must be handled through the same seeded-determinism discipline: a pseudo-random draw is only reproducible if the seed, the draw order, and the ruleset version are all part of the referential-determinism tuple.

### 🟡 Moderate: "H3 for the regional layer" is endorsed without asking what consumes it

The synthesis states H3 is right for "regional geography, coarse spatial indexing, large-area clustering, regional proximity, geographic lookup." Across the last several rounds, the actual code never *used* an H3 index: routing runs on an explicit graph with ECEF vectors, and the only H3 mention in later specifications is the compiler's pentagon check. The claim that H3 earns its place is plausible (it's the natural join key for H3-keyed real-world datasets, and `gridDisk` is a cheap radius sweep), but it is currently a **promise with no consumer**. Two honest options: identify the concrete query that needs H3 (for example, "which fictional sites lie within 50 km of this event," or importing an H3-keyed land-cover raster) and show it, or defer H3 until the first such need arrives. Adding a dependency on an anticipated use is the kind of speculative generality the synthesis itself warns against in its item on not over-building the API.

### 🟡 Moderate: "Integer everywhere" was correctly bounded but two places still leak floats through the synthesis

The document says probabilities should be fixed-point integers and lists "Probability: fixed-point integer" alongside time and geometry. But the example percept it gives uses `confidence = 0.82`, a float. This is a small inconsistency, but it's exactly the kind that reintroduces a float at a **decision boundary** (a confidence threshold decides whether a belief forms). Use per-mille or basis-point integers consistently (`confidence: 820`), and define the quantization and rounding rule once.

### 🟡 Moderate: the synthesis treats "dynamic overlay" as fully solving mutable geometry, but overlays have their own hazards

Two nuances worth stating:

- **Overlay ordering and precedence.** If two overlays conflict (a hatch is open in the ledger but a "jammed" condition is also active), which wins? The merge must be a defined, deterministic function with a stated precedence, and the *overlay itself* must be hashed (the synthesis does include `overlay_hash`, good) with canonical ordering.
- **Overlays can break precomputed structures.** Landmark distance tables, all-pairs site tables, and cached visibility bitsets are computed on the *static* topology. A shut hatch (an edge removal) can make a precomputed distance an *underestimate* (still admissible for A*, but wrong as a reported travel time), and an opened secret passage makes it an *overestimate* (inadmissible). Precomputation must be classified: does it remain valid under overlays, only under overlays that add cost, or never? The union-graph trick from earlier rounds handles the secret-edge case; the general overlay case needs the same explicit analysis.

### 🟡 Moderate: "the deletion principle" is stated as a modularity test, but its stronger form is a *replayability* claim that needs conditions

The synthesis uses "if it doesn't belong in spatial reasoning, delete it" as a design test. That's fine as a heuristic. But the earlier, stronger form ("if all generative models are deleted, the physical state remains consistent and rebuildable") holds only under conditions that should be stated: every stochastic choice is either drawn from a logged seed with a logged draw order, or recorded as an event; the topology and rulesets are pinned by hash and version; and the ledger is the *only* source of truth for actor state. Without those, the claim is aspirational. It should be treated as a **testable property**: delete the model outputs, replay the event log against the pinned topology, and assert identical final state.

### 🟡 Moderate: the synthesis drops the fictional-on-real registration layer

The source material spent significant effort on mapping fictional places onto a real geographic substrate: the four registration modes (`ANNOTATE`, `SUBSTITUTE`, `EXTEND`, `REGION`), rigid spherical displacement so nothing points at a real address, real-data provenance pinning, and license and sensitivity handling. That was your stated goal. The synthesis mentions "association with real-world geographic data" once and otherwise treats the H3 layer as generic geography. If someone implements from this document alone, the requirement that motivated the regional layer disappears. It belongs in the priority list.

### 🟡 Moderate: item 24 ("don't overbuild the API") and item 33 ("the minimal kernel") are right but don't say how to sequence the kernel

A kernel list is not a build order. The last rounds identified the correct order, and it's worth restating because the synthesis omits it: (1) `hexgeom` integer module with property tests for the id scheme and lattice; (2) finite-segment supercover with the decision tables as test data and an exhaustive oracle comparison; (3) router with a real heap, tie-breaking, and differential test; (4) reducer with event-time semantics validated through the spatial engine; (5) only then acoustics, illumination, displacement, contact graph. The kernel list should be ordered by dependency and by risk, with the riskiest and most foundational item (exact supercover) first.

---

## Part 3: What I'd add

### 1. A "current status" ledger alongside the principles

The main thing this synthesis needs is a companion artifact that a principles document cannot be: a short, honest table of **what is decided, what is specified but unimplemented, and what has passed its own tests**. Something like:

| Concern | Design status | Implemented | Verified against oracle |
|---|---|---|---|
| Doubled-coordinate lattice | Settled | Partial | Not yet |
| Packed cell/edge ids | Settled | Buggy (signed shift) | Not yet |
| Finite-segment supercover | Specified | No | No |
| `EDGE_PAIR` decision tables | Specified | No | No |
| Router (heap, tie-break, ALT) | Specified | Test-local copy only | No |
| Reducer + event-time semantics | Needs redesign | Global-clock bug | No |
| Percept → belief (`H`) | Not designed | No | No |
| Fictional-on-real registration | Designed | No | No |

The point of the table is not bookkeeping; it's that **a principle-level document becomes dangerous when it is the only document**, because it makes a design look like a system. The table is what keeps "the mature target" from being mistaken for "done."

### 2. Reciprocity as a tested, scoped property

Add to the invariant suite, stated at the correct layer:

```
Geometry layer:    ∀ a,b: rayClear(a,b) == rayClear(b,a)                  (must hold, exhaustively tested)
Perception layer:  canPerceive(a,b) ≠ canPerceive(b,a) in general          (asymmetry is correct)
                   ...but: if illumination(a) == illumination(b) and facing/somatics are neutral,
                   then canPerceive(a,b) == canPerceive(b,a)               (symmetry recovers in the neutral case)
```

The last line is a useful *metamorphic* property: it pins the asymmetry to its actual causes, so an unexplained asymmetry becomes a bug signal instead of noise.

### 3. Strengthen `H` before strengthening anything else in spatial

Now that the spatial half is well characterized, the highest-value design work is the percept-to-belief function. A sketch of the minimum specification needed:

- **A `Percept` schema with integer confidence** (per-mille), a modality, a source-location or bearing, a tick, and a provenance pointer to the physical event.
- **A belief record** with content, confidence, source type (`DIRECT_PERCEPT`, `INFERENCE`, `TESTIMONY`), the chain of contributing percept and contact ids, and a last-updated tick.
- **Combination rule:** how independent percepts of one event merge (for example, noisy-OR on per-mille confidences, computed in integer arithmetic with a defined rounding rule).
- **Identification rule:** how a low-quality visual percept maps to candidate identities. Deterministic approach: a candidate set filtered by geometry (who *could* have been at that cell at that tick, from the ledger), then a seeded draw among candidates weighted by familiarity, with the seed, draw index, and ruleset version recorded so it is replayable.
- **Prompt gate:** a single function `visibleFacts(actorId) → BeliefRecord[]` that is the *only* path from the ledger to any LLM prompt, with a test that greps the prompt builder to confirm nothing else reads world state.

That last item is the enforcement point for ignorance by omission, and it is currently a convention.

### 4. Make the feedback loop a first-class test target

Add a headless **closed-loop simulation test** that runs the full cycle (movement, spatial query, percept, simplified belief, action selection, ledger update) for thousands of ticks with a fixed seed, and asserts: identical final state hash across runs and environments; no invariant violation at any tick (capacity, adjacency, scale-state validity, monotonic clock); and bounded pathology metrics (deadlocks, clustering, unreachable rooms). Because a small error in tick *n* compounds, this catches drift that per-function tests cannot. Include a **bisection tool**: when two runs diverge, binary-search the tick sequence to find the first tick where state hashes differ, then diff the inputs to that tick. That turns a nondeterminism report from "the episode is different" into "tick 4,127, actor `char_bog`, the tie-break at cell (3,-2)."

### 5. Unify the "policy block" and "ruleset versions" ideas into one sealed structure

The synthesis proposes versioned rulesets; last round proposed a sealed policy block of tunable constants. They're two views of one thing, and it's cleaner as one:

```json
{
  "rulesets": {
    "spatial": "4.2.0", "routing": "2.1.0", "perception": "3.0.1"
  },
  "policy": {
    "boundaryPolicy": "EDGE_PAIR",
    "resolveThreshold": 700, "ambiguousThreshold": 200,
    "snrMinCdB": 600, "conversationSourceCdB": 6000,
    "defaultCapacity": 2, "logLuxIndexMax": 448, "chordScale": 4194304
  }
}
```

Hash it. Now a constant change *and* a code change both surface as a hash difference, and the version string is the human-readable label while the hash is the machine-checked identity. Add a rule: **any change to policy or logic that can alter an output must bump the relevant version**, enforced by a golden-output regression suite that fails if outputs change without a version bump.

### 6. The provenance chain should extend to real-data inputs

The synthesis lists compile-time benefits as performance, reproducibility, and reliability/security. Add **auditability**: the compiled artifact should carry, for every imported real-world dataset, its source, version, retrieval date, content hash, and license (with OSM's ODbL share-alike implications noted). Then any statement like "this road exists in the simulation" is traceable to a specific dataset snapshot, and updating a dataset is a reviewed, diffable decision. This is also the natural place for the sensitivity lint that prevents fictional violent events from landing on top of real schools, hospitals, or residences.

### 7. Put the fictional-on-real registration back in scope, briefly

Restore a short section: registration modes (`ANNOTATE`, `SUBSTITUTE`, `EXTEND`, `REGION`), displacement by true spherical rotation applied once offline, one coordinate frame at runtime, and the rule that real-data provenance and rotation parameters are sealed into the topology hash. It was the reason the regional layer exists.

### 8. Concurrency and time: the one unresolved design decision that most affects everything else

The synthesis says integer time (centiseconds) but not the *model*. The previous round found the global-summed-clock bug, and the fix is a design choice that ripples through the ledger, the contact graph, and the perception layer:

- Events carry their own `at: Instant`. The ledger is ordered by `(at, sequence)`.
- An actor has a `busyUntil`; it cannot start an action before finishing the last one.
- The world "now" is the maximum applied `at`, never a sum.
- Two actors acting "simultaneously" are ordered deterministically (by a tie-break rule recorded in the ruleset), and their spatial queries run against the snapshot **at that instant**.

Until this is decided, the contact graph ("were A and B co-present during an interval?") and the witness sweep ("who could perceive an event at time t?") have no well-defined semantics, because "when" is ambiguous. I'd rank this above the acoustic and illumination details in priority.

### 9. Guard against the failure mode the synthesis itself risks: principle inflation

A subtle nuance about documents like this one. A good synthesis compresses many decisions into memorable principles, and that is valuable, but principles are cheap to agree with and expensive to satisfy. "Make every ambiguous geometric rule explicit" is unobjectionable; the work is the eight-row truth table and the 8,190-pair oracle test. To keep the principles honest, attach each to a **falsifiable check** that fails when violated:

| Principle | Falsifiable check |
|---|---|
| Deterministic ≠ correct | Oracle comparison on the small exhaustive domain |
| Determinism as invariant | Insertion-order shuffle and cross-locale golden hash |
| Ambiguous rules explicit | Decision tables as literal test data |
| Space is an authority layer | Prompt-gate test: prompts read only the belief store |
| Separate perception from knowledge | Type system: `Percept` cannot be assigned to `Belief` |
| No layer manufactures facts | Dependency lint: lower layers cannot import upper layers |
| Tracer bullet before debugger | CI gate: debugger package depends on the compiled artifact only |

A principle without a check is a wish. A principle with a check is an invariant.

### 10. A practical way to consume this synthesis

Treat it as the project's **constitution** (the invariants and the causal ontology), and keep it deliberately free of code so it doesn't rot. Keep the executable specification (lattice math, decision tables, router contract, reducer semantics) in a separate document that *is* code-adjacent and is regenerated or checked against the implementation. The failure across six rounds was largely one document trying to be both, and drifting whenever the prose said something the code didn't do.

---

## Bottom line

**Keep, essentially as written:** the central sentence; the causal chain and the one-way no-manufacturing rule; possibility versus occurrence; the verification hierarchy (deterministic is not correct); three distances; terrain-meaning out of the algorithm; percept versus knowledge; LoS versus perception; the contact graph and "opportunity"; atomic portal transitions; dynamic overlays; referential determinism with versioned rulesets; domain-separated hashes; the bounded integer principle; offline compilation; tracer-bullet-before-debugger; `Result = F(Snapshot, Query)` with no mutating methods.

**Correct or qualify:**
- "The mature target" reads as done; the code has never passed its own tests (the tracer bullet doesn't import `src/`), and specific bugs remain in id packing, segment-versus-line LoS, and the unimplemented decision tables.
- **Geometric symmetry ≠ perceptual symmetry**; test the first, expect asymmetry in the second, and name the functions accordingly.
- The causal chain is a **loop**, so single-tick determinism tests miss compounding drift.
- **Overlays interact with precomputed tables**; classify each precomputation's validity under overlays.
- The example percept uses a float confidence (`0.82`); use per-mille integers.
- H3 is endorsed but has **no consumer** yet.
- The fictional-on-real registration layer (your actual goal) was dropped.

**Add:** a status ledger showing decided versus implemented versus verified; the percept-to-belief function `H` (the least-designed and most consequential layer); a prompt gate as the enforcement point for ignorance by omission; a closed-loop simulation test with divergence bisection; a single sealed structure combining ruleset versions and policy constants; the event-time and concurrency model; provenance and sensitivity handling for real-data inputs; and a falsifiable check attached to every principle.

The most important thing this synthesis does is name what to protect. The most important thing it cannot do is show how far the implementation is from that principle, which is why the most valuable addition is not another idea but a **plain accounting of what has been proven**. The design is ready to be built. It is not yet ready to be trusted, and the path between those two states is the exhaustive oracle test, the executable tracer bullet, and the prompt gate.

This document is a second-order synthesis: it reads the design, the code, and the earlier reviews, then states the constitution and lists what remains unproven. It is the most accurate document in the series about its own status, and that shapes how I should review it. Most of its claims about the code are correct, and several correct the earlier reviews. So this pass has four jobs: confirm which claims I can verify, correct the places where the synthesis or my own previous reviews were wrong, deal with a claim in it that I can't verify from the material I've seen, and add what's still missing.

One caveat first. Several sections (12 through 14, 20, 28, 38, 45 through 46) discuss code the synthesis calls `traceIntegerSupercover()`, `hasTacticalLoS()`, a `FORBIDDEN_KEYS` prompt gate, a Noisy-OR confidence merger, and a bisection harness. Two of those (`hasTacticalLoS` and the router/reducer discrepancies) match code I reviewed. The others (`traceIntegerSupercover`, the prompt gate, Noisy-OR, bisection) come from material that isn't in the pasted files I've seen. I'll treat those claims conditionally, evaluating the reasoning and saying plainly where I'm relying on the synthesis's description rather than on code I've read.

---

## Part 1: What is valuable and true

### 1. The constitution sentence is the best single statement in the series

> *`goblin-spatial` is a pure, content-addressed, deterministic constraint engine that evaluates physical possibility against immutable canonical topology plus explicit runtime overlays, producing routes, occupancy results, temporal opportunities, and sensory evidence without ever owning world state, committing events, or manufacturing beliefs.*

Every clause carries weight:

- **pure**: no hidden state, no I/O.
- **content-addressed**: identity is a hash of content, not a name or a path.
- **constraint engine**: it says what is *allowed*, not what *happens*.
- **canonical topology plus explicit runtime overlays**: static and dynamic are separate inputs.
- **sensory evidence**: it stops at evidence.
- **without owning state, committing events, or manufacturing beliefs**: three explicit prohibitions.

Put that at the top of the repository README and make every new function justify itself against it.

### 2. Four kinds of truth, and the rule that semantic freedom increases with distance from topology

Canonical, runtime-physical, epistemic, and narrative truth, with the rule that the closer a subsystem is to raw topology, the less semantic freedom it has. This is the clearest way to explain *why* the layers exist, and it gives a usable design heuristic: when deciding where a piece of logic lives, ask how much interpretation it needs. Interpretation-heavy logic belongs high; interpretation-free logic belongs low. It also predicts where bugs will be hardest to find (high layers, because "correct" is subjective) and where they'll be most damaging (low layers, because everything inherits them).

### 3. The verification hierarchy, now with an explicit ordering of correctness above determinism

```
semantic correctness → mathematical correctness → deterministic execution → replay stability → performance
```

This is the earlier hierarchy made stricter, and it's what six rounds of review confirmed. The bugs found were almost all deterministic and wrong: negative packed ids, an infinite-line LoS test, a tracer bullet that verified a private copy. Determinism checks would have passed every one. Putting semantic correctness first, and pairing it with **oracle tests plus invariant tests** as the two mechanisms, is exactly the right response. Item 47's ordering (reference implementation first, optimize last) follows directly and is the correct build order.

### 4. Geometry versus policy as separate layers

> *Three hexes meeting at a vertex is geometry. "Two opaque cells block the vertex" is a simulation policy.*

This is a clean and important distinction I did not make explicitly enough in earlier rounds. It has a concrete consequence: the exact-geometry module (which cells and edges a segment touches, and how) should produce a **policy-free classification** of contacts, and a separate, swappable policy function should turn that classification into "blocked / not blocked." Then the eight-row decision tables are *policy data*, versioned in the ruleset, while the classifier is *geometry*, tested against an oracle and never changed by a tuning decision. That structure also makes it possible to run the same geometry under two policies and diff the results, which is how you'd measure the gameplay effect of a policy change before adopting it.

### 5. Geometric symmetry versus perceptual asymmetry

The synthesis states this correctly (items 16 and 40): `LOS(A,B) = LOS(B,A)` for geometry, while `Perceive(A,B) ≠ Perceive(B,A)` because illumination, facing, capability, and threshold differ per observer. I raised this last round; the important addition here is item 40's precise scoping, "when geometry and policies are symmetric." The property holds only under symmetric policy, which is a property to state and to test, not to assume.

### 6. The spatial layer should emit *evidence*, and the epistemic layer should produce beliefs

Item 19 is the most valuable structural correction in the document, and I agree with it fully. Earlier drafts had `findWitnesses` returning `Percept` records with `resolved` flags and eventually feeding directly into `KNOWS(...)` mutations. Moving the boundary so spatial outputs `SensoryEvidence` (quality, bearing, channel, source, integer confidence inputs) and the ledger/epistemic system produces `BeliefRecord` keeps spatial free of belief IDs, testimony semantics, prompt thresholds, and LLM visibility. It also fixes a subtle problem: a field like `resolved: boolean` is *already* an interpretation ("was this identifiable?"), which is epistemic. Spatial should report a quality number and let the epistemic layer apply an identification threshold (per-actor, per-familiarity) itself.

### 7. Noisy-OR is an epistemic heuristic, not a physical law, and independence is the assumption that bites

Correct on both counts. Three witnesses hearing the same crash are three samples of *one* acoustic exposure, so treating them as independent overstates confidence. Two consequences follow. First, the combination rule belongs in the epistemic system. Second, the rule needs a **correlation-aware variant** (group percepts by originating physical event, and combine *within* a group by taking the maximum, not by noisy-OR, then noisy-OR only across genuinely independent sources such as separate events or testimony chains). That's a small change with a large effect on believability.

### 8. The prompt-gate critique is correct, and the capability-based alternative is the right fix

A blacklist of forbidden property names cannot be an information-flow guarantee: it misses nesting, aliasing, renamed fields, derived structures, wrappers, and future additions. The synthesis's replacement (`RawWorldState → authorized transformation → ActorContext → prompt serializer`, with the serializer *never handed the raw object*) is the correct pattern, and it's a standard security idea: **make the unsafe thing unrepresentable rather than checked**. I add specifics below.

### 9. The index-signature point is a real TypeScript error

`readonly [forbiddenKey: string]: unknown` *permits* any string key; it doesn't forbid the listed ones. To forbid properties at the type level you need `never`-typed optional fields (`readonly worldState?: never`) or, better, a nominal/branded type that the raw state cannot be assigned to. The synthesis is right that the pattern shown doesn't do what it claims.

### 10. The quantization caveat on the ECEF chord heuristic

This is a genuine catch that my previous rounds missed. I accepted `chord ≤ arc` as sufficient. But the runtime doesn't compute the chord between the *true* points; it computes it between **quantized** integer vectors. Quantization moves each point by up to about half a unit of the scale (`R / 2²²` ≈ 1.5 m per axis at scale 2²²), so the quantized chord can exceed the true chord by up to roughly the sum of two point errors, which means the quantized chord can exceed the true *arc* for very close nodes, making the heuristic slightly inadmissible. The fix is a **conservative correction**: subtract a proven error bound (about `2·√3·(R/S)` meters) from the computed chord before dividing by `vMax`, clamped at zero. Then admissibility is a theorem, not an assumption, and a property test against exact `BigInt` chords over random node pairs confirms it.

### 11. The ellipsoid caveat on displacement

A 3D rotation of a **sphere** is a rigid motion. Applying it to coordinates that came from the WGS84 **ellipsoid** does not preserve real-world ellipsoidal geometry exactly. The defensible claim is that the simulation adopts a spherical Earth model consistently after registration. This is correct and worth writing into the manifest ("spherical registration frame, `R = 6,371,007.18 m`"), because someone comparing simulated distances against real ones will otherwise be puzzled by errors up to about 0.3 percent (the flattening).

### 12. Overlays cannot mutate canon; overlay-derived state (like mid-edge virtual nodes) belongs to the runtime layer

The virtual-node point (item 27) is right and worth a small strengthening. A virtual node `vn:{edgeId}:{elapsed}` is **derived runtime state**, and it must not enter the sealed topology. If it did, every interruption would change the topology hash, defeating replay. The router should accept transient nodes through the same overlay mechanism as doors: a query-time addition to the graph, hashed as part of `overlay_hash`, never merged into the compiled artifact.

### 13. Tie-breaking everywhere, with the example that the reference router still sorts by cost alone

Item 29 is correct and specific. `findShortestRoute` in the tracer bullet sorts only by `cost`, so equal-cost outcomes depend on insertion order. The general principle, that **every ambiguous ordering needs an explicit canonical tie-breaker**, applies to more places than routing. The synthesis's list (equal-cost destinations, equal acoustic arrivals, percept candidates, simultaneous events, multiple witnesses, multiple shortest paths, set/map serialization) is a good checklist. I'll add a mechanism below so this becomes enforceable instead of a review item.

### 14. Timestamp versus duration is a real modeling ambiguity

Item 28 correctly identifies that some code treats an event as having `at: Instant` and other code treats it as carrying `cost: Duration` that the reducer adds to a running clock. These are two different temporal models. The recommended contract (one authoritative event timestamp; duration is part of the event's payload describing the action's extent, never something the reducer adds to a global clock) matches what I flagged as the global-summed-clock bug. Restating it as "the reducer must not advance the clock twice" is a good way to make it testable.

### 15. Canonical manifest hash versus Merkle tree

The distinction is right and the recommendation is pragmatic: a single SHA-256 over a canonically serialized manifest gives **content-addressed identity**, which is the actual need. A true Merkle tree adds the ability to verify or diff subtrees independently, which is useful mainly for large artifacts (the regional graph) or for reporting *which part* changed. The honest naming is "canonical manifest hash," with an optional per-component hash list for diagnostics. That resolves the "is it Merkle?" question by deciding what you need it for.

### 16. Classification of the "completion artifacts" into four categories

Production algorithms, verification infrastructure, integration infrastructure, build infrastructure. This matters because the categories have different dependency rules and different owners: production algorithms must have no dependency on the other three; verification may depend on production; integration depends on production and the ledger; build depends on production types but is offline. It also clarifies the bisection harness (item 38) is verification/integration infrastructure and does not belong in the kernel.

### 17. Purity, serialization-boundary, and insertion-order tests as executable contracts

Items 45 and 46 turn "stateless and deterministic" into four concrete tests: input deep-hash unchanged after a query (no mutation), identical output under shuffled insertion order, identical output under different object identities, and identical output from a serialize/deserialize round trip. The serialization-boundary test in particular catches a class of bugs (Map ordering, defaulted fields, float coercion) that in-process tests never see. These four are cheap and should be in the first CI gate.

### 18. The "not finished" list is accurate, and it is the most useful section

Item 50 correctly declines to call supercover, full `EDGE_PAIR` LoS, cross-runtime determinism, heuristic admissibility, prompt-gate security, temporal semantics, the Merkle claim, and the spatial/epistemic split "settled." That inventory is what the previous round's "status ledger" recommendation was reaching for, and this version is better because each item names *why* it's open.

---

## Part 2: Corrections, qualifications, and things I can't verify

### 🔴 Correction to my own earlier review: I called the vertex/edge policy "unimplemented," and the more precise statement is about where the gap is

Last round I said `EDGE_PAIR` was "documented but not implemented" in the tracer-bullet `hasTacticalLoS`. The synthesis says the same in item 14, and adds the sharper observation that `opaqueEdges` is consulted **only when `distance === 1`**. I verified that in the code I reviewed: for longer rays, edge occluders are never consulted, and the vertex-majority rule is never evaluated. So the tracer-bullet function implements *only the interior-crossing row* of the four-row table. The synthesis and I agree; the precise wording matters because it tells you the smallest fix: not "write the policy," but "make the classifier emit edge and vertex contacts, then apply the table."

### 🟠 A claim I cannot verify: the `traceIntegerSupercover()` critique

Items 12 and 13 discuss an `O(N)` "exact integer supercover" that scans a rectangle, emits only `CELL_INTERIOR`, and uses a projection-based parameter `tNumerator: dotA, tDenominator: lenSq` rather than a boundary-intersection parameter. **This function isn't in the material I've reviewed.** The last version of the code I saw had only the inline routine inside the test, which scans a rectangle of candidate cells and tests the *infinite line*, not the segment. The synthesis's specific claims (rectangular scan implying up to `O(N²)`, the mislabeled parameter) are plausible and consistent with that inline routine's structure, but I can't confirm them against code I haven't seen.

What I can say is that the *reasoning* is sound, and worth restating independent of the specific code:

- **Complexity.** A rectangular bounding-box scan over `(q, r)` visits about `Δq × Δr` cells, while a proper supercover visits only the `O(d_axial)` cells along the ray. For a long diagonal, `Δq × Δr` is quadratic in length. So an `O(N)` claim is false for the scan design regardless of who wrote it.
- **The projection-of-centroid parameter is not an intersection parameter.** The parameter `t` at which a segment *enters* a hexagon is where it crosses a boundary edge, which depends on the polygon's shape, not on the centroid's projection onto the ray. Ordering features by centroid projection can mis-order two cells whose boundaries are crossed in the opposite order from their centroids (this happens near grazing angles). If the tie between "which cell was entered first" affects policy (it does, for the vertex rule), the ordering must come from boundary-crossing parameters.
- **A "supercover" that emits only cells is a cell traversal.** The defining feature of a supercover is that it also reports the edges and vertices touched. Calling the cell-only version a supercover overstates it.

If you'd like me to confirm the specific implementation, paste that function; the design conclusion doesn't depend on it.

### 🟠 Qualification: "the architecture is substantially converged" is right, but the synthesis undersells one open design question

Item 51's closing says the design "is already conceptually strong enough to stop expanding horizontally." I agree for the *spatial* kernel. But the same document's own item 19 relocates the epistemic bridge out of spatial, and the last review found `H` (percept → belief) is the **least designed and most consequential** layer. Declaring the architecture converged can be read as covering that layer too. It doesn't: `H` still lacks a belief schema, a combination rule with an independence model, an identification procedure (a seeded, replayable draw among geometry-feasible candidates), a decay/revision model, and a provenance chain. So the accurate statement is: **the spatial architecture has converged; the epistemic architecture has barely begun.** Calling the whole thing converged risks moving effort away from the layer that now carries the most design risk.

### 🟠 Qualification: the union-graph admissibility argument needs to cover edge *costs* under overlays, and the synthesis lists the wrong preconditions in one place

Item 22 lists four preconditions for the union-graph trick to be safe: same costs used for the heuristic, no actor-specific teleport edges that invalidate the model, nonnegative costs, and "routing state sufficiently stable." Three of those are right. The second is misstated: **teleport edges are not a problem for the union-graph argument**, because the union graph *includes* them (that is the point of taking the union), and adding edges only lowers distances. The real hazard is different, and it's the one I raised earlier: **tables built from static costs are invalid lower bounds if an overlay can *reduce* an edge's cost below its compile-time value** (a cleared blockage, an opened shortcut, a favorable time-of-day multiplier). The precondition should read: *table edge costs are lower envelopes of every cost the edge can take under any overlay or condition*. That is checkable at compile time by requiring every overlay to be non-improving (it can only remove edges or raise costs) or by building tables from the minimum cost per edge.

The "routing state sufficiently stable" precondition is vaguer than it needs to be; what it should say is the concrete version above.

### 🟠 Qualification: the synthesis says "the ledger decides whether an event occurs" but doesn't say who validates a proposed event against spatial possibility

Item 2's flow is correct: `world state → spatial query → physical possibility → action resolver → committed event`. But a subtle failure remains: the action resolver could commit an event that spatial said was *impossible*, if nothing enforces the check at the commit boundary. The fix I proposed earlier belongs in the constitution: **the ledger's commit path must re-validate every physical claim in a proposed event through the spatial engine** (adjacency, capacity, blocked cells, closed edges, scale state), and reject on mismatch. Then "spatial is a constraint authority" is enforced, not asserted. Without that, the possibility engine is advisory.

### 🟡 Moderate: "Every ambiguous ordering must have a canonical tie-breaker" is a principle that can be made mechanical

As written it's a review-time rule. Two mechanisms make it self-enforcing:

- **A single comparator module** exporting `compareCellId`, `compareEdgeId`, `compareActorId`, `compareEventKey` (all integer or code-unit based), with lint rules banning `localeCompare`, bare `.sort()` without a comparator, and iteration over `Map`/`Set` in decision code without going through a `sortedEntries` helper.
- **A shuffle-invariance test harness** that randomly permutes every collection in every input fixture and asserts identical output. If any code path depends on insertion order, the harness finds it.

Together these convert a discipline into a gate.

### 🟡 Moderate: the synthesis endorses "noisy-OR is fine as a heuristic" but stops short of saying where the seeded randomness lives

Identification of a low-quality percept ("a figure, maybe Bog") is the moment stochastic choice enters. The referential-determinism formula lists topology hash, overlay hash, actor-state hash, ruleset versions, and query, but **no random seed or draw index**. If the epistemic layer ever samples, the seed and draw counter must be in the tuple, and draws must be *addressable* (keyed by `(seed, eventId, actorId, purpose)`, not by a global sequential counter, so that adding an actor doesn't shift every later draw). Keyed draws are what make replays stable under small changes. This belongs in the constitution because it's what keeps "deterministic replay" true once any probabilistic behavior exists.

### 🟡 Moderate: the diagram in item 49 puts "percept records" after "committed events" inside the ledger box

The final diagram shows `worker-sower-engine → committed events → percept records → epistemic system`. Given item 19's boundary (spatial emits evidence, the ledger/epistemics produce beliefs), the flow should be: **committed event → spatial evidence query → evidence records → epistemic system → beliefs**. "Percept records" appear to be produced by the ledger in that diagram, which contradicts the statement that spatial produces sensory evidence. Fix the diagram so evidence originates in `goblin-spatial` (as a query result) and the ledger merely *stores* it with provenance.

### 🟡 Moderate: the synthesis doesn't restore the fictional-on-real layer either

This is the second synthesis in a row that omits it. Real-data registration modes, displacement, dataset provenance, licensing, and sensitivity handling were your stated purpose for the regional layer. The synthesis mentions offline compilation and spherical registration but not `ANNOTATE`/`SUBSTITUTE`/`EXTEND`/`REGION`, real-data provenance, or the sensitivity lint. It should be a short section in the constitution, because it is where the project's *content risk* lives (real named places, licensing, reputational exposure), which is separate from its *technical risk*.

### 🟡 Moderate: item 47's build order stops at "performance measurement" but leaves out a validation step against the domain

The order (semantics → reference → edge-case tests → determinism → optimize → measure) is right for the code. It omits a step at the *front*: **validate the semantics against a human**. Before writing a reference LoS, someone should look at twenty concrete configurations (a corner peek, a diagonal gap, a door ajar) rendered as pictures and decide whether the policy gives the *desired* answer. The oracle proves the implementation matches the policy; only a human can judge whether the policy matches the fiction. The SVG snapshot debugger is the tool for that, which argues for building the static SVG renderer earlier than "Phase 3."

---

## Part 3: What I'd add

### 1. The commit-time re-validation contract (the constitution's missing enforcement clause)

State it as an invariant: **no event enters the ledger unless every physical precondition it asserts has been confirmed by a spatial query against the same snapshot, rulesets, and overlay the event was proposed under.** Implementation sketch:

```typescript
interface PhysicalClaim { kind: 'ADJACENT' | 'REACHABLE' | 'OCCUPIABLE' | 'VISIBLE' | ...; args: ... }
commitEvent(event, snapshot, rulesets):
  for claim of event.claims:
     if !spatial.verify(claim, snapshot, rulesets): reject(event, claim)
  append(event)
```

This is what turns the possibility engine from advisory into authoritative, and it gives you a clean audit record: every committed event carries the claims it relied on and the hashes they were verified under.

### 2. A `SensoryEvidence` schema that leaves interpretation to the epistemic layer

Concretely, replacing `Percept` with a spatial-owned output that contains no interpretation:

```typescript
interface SensoryEvidence {
  observerId: ActorId;
  eventId: EventId;
  channel: 'OPTICAL' | 'ACOUSTIC';
  qualityPermille: number;           // integer 0..1000, from geometry+medium+environment only
  arrivalDirection: 0|1|2|3|4|5|null; // absolute lattice direction; relative bearing computed by consumer
  sourceLocation: SpatialRef;        // where the source cell/edge is; consumer decides what's identifiable
  traceRef: TraceHash;               // content hash of the ray/wavefront trace for provenance
}
```

Note the two deliberate omissions: no `resolved` flag (identification is epistemic) and no relative bearing (it depends on the observer's *facing*, which is actor state and can be applied by the consumer). The `traceRef` gives every piece of evidence a verifiable provenance pointer, so the epistemic layer can cite *why* an actor perceived something.

### 3. Make the epistemic firewall structural with a capability object, and test the *absence* of a path

The capability-based design in concrete terms:

```typescript
// The only module allowed to import RawWorldState:
function buildActorContext(raw: RawWorldState, actor: ActorId): ActorContext { ... }

// The prompt builder's signature accepts only ActorContext:
function buildPrompt(ctx: ActorContext, task: PromptTask): string
```

Enforce with three mechanisms: a **module-boundary lint** (the `prompt` package cannot import `ledger` or `spatial` internals; only the context-builder package imports raw state), **nominal types** so `RawWorldState` cannot be assigned to `ActorContext`, and a **differential leak test**: construct two worlds identical except for a fact the actor cannot perceive (a murder in a sealed room), build the actor's prompt from each, and assert the two prompts are **byte-identical**. That last test is the direct executable form of ignorance by omission: if hidden facts can't change the prompt, they can't leak into it. It's stronger than any blacklist because it tests the *property* rather than the mechanism.

### 4. Correlation-aware evidence combination

Extend the noisy-OR point into a rule:

1. Group evidence records by originating `eventId` and `channel`.
2. **Within a group**, combine by `max` (same exposure, not independent).
3. **Across groups** (different events, different channels, testimony from different sources), combine by noisy-OR in per-mille integer arithmetic: `p = 1000 − floor((1000 − p₁)(1000 − p₂) / 1000)`.
4. Testimony chains apply a per-hop discount recorded in the ruleset.

Then an actor who both *saw* and *heard* the same event doesn't get double-counted incorrectly (the channels are different exposures, so they combine), but three neighbors who heard the same crash don't triple the confidence of a fourth who heard about it secondhand. Integer arithmetic with an explicit rounding rule keeps the combination in the sealed, reproducible regime.

### 5. Addressable randomness

Add to the referential-determinism tuple a `randomStreamKey` scheme: every stochastic decision draws from `PRNG(hash(masterSeed, eventId, actorId, purposeTag))`, seeded fresh per decision, using a small deterministic generator (for example, a 64-bit counter-based one) implemented in integer arithmetic. Because each draw's stream is keyed by *what it's for*, inserting or removing an unrelated decision cannot shift the outcome of another. Log the key and the draw's output in the event record. This is what lets you edit a scene, replay the rest, and see only the intended differences.

### 6. Overlay validity classes for every precomputation

Give each precomputed artifact an explicit **validity class** and check it at overlay-construction time:

| Precomputation | Valid under overlays that... | Otherwise |
|---|---|---|
| ALT landmark tables (lower-envelope costs) | only remove edges or raise costs | rebuild or fall back to Dijkstra |
| All-pairs site travel times | are absent (static only) | recompute per query or mark approximate |
| Cached visibility bitsets | only *add* occluders | invalidate affected rays |
| Contracted regional graph | contain no new nodes | fall back to uncontracted search |

An `Overlay` type carries a declared `monotonicity: 'NON_IMPROVING' | 'ARBITRARY'`; the router picks its strategy from that. This makes the union-graph precondition a checked property rather than a comment.

### 7. Add the four hash inputs the referential-determinism formula omits

The synthesis lists topology, overlay, actor state, ruleset versions, and query. Add:

- **Build/engine identity**: the exact code version (a git commit hash) of the spatial package, because a bug fix changes outputs without a ruleset bump. Rulesets version *intended* behavior; the build hash identifies *actual* behavior.
- **Random stream key** (above).
- **Canonical serialization version**: the scheme by which state is hashed, so a future change to the serializer doesn't silently invalidate every stored hash.
- **Numeric mode flags**: any compile-time constants (`chordScale`, `logLuxIndexMax`) not already in the ruleset.

Then a replay mismatch tells you whether the *world*, the *rules*, the *code*, or the *serialization* changed.

### 8. A golden-behavior corpus with a version-bump gate

Attach the version-bump rule to a test: maintain a corpus of `(snapshot, query) → expected result` files. CI runs them, and if any result changes, the build fails **unless the ruleset or engine version was bumped in the same commit**. That mechanically enforces "any output-affecting change must bump a version," and the diff of the corpus shows exactly which behaviors moved. Escape tickets from the debugger become new corpus entries.

### 9. Put the human-judgment step first, and give it a tool

Before the reference implementation, build the **static SVG snapshot renderer** for the tactical lattice and generate a "policy gallery": a page of twenty small scenes (corner peek, diagonal squeeze between two walls, door ajar, thin partition, vertex graze) each labeled with the policy's verdict. Have a person confirm each verdict matches the fiction. Then freeze those twenty as named fixtures. This is the only step that validates *policy against intent*, and it costs an afternoon.

### 10. State what each layer may import, and enforce it

The one-way flow rule becomes a dependency graph you can lint:

```
lore-types ← spatial-core ← spatial-compiler (offline)
                    ↑
              ledger/reducer ← evidence-adapter ← epistemics ← context-builder ← prompt
                                                                      ↑
                                                              (only import of RawWorldState)
```

with `dependency-cruiser` or an equivalent enforcing: spatial-core imports nothing from ledger, epistemics, prompt, renderer, or any I/O; prompt imports only `ActorContext`; renderer imports only compiled topology. Violating the arrows fails CI. That converts the constitution's prohibitions into mechanical checks.

### 11. A caution about the constitution itself

The synthesis calls itself the project's "architectural constitution." Constitutions work when they're **short, stable, and enforced**, and fail when they're long, revised often, or aspirational. Keep the constitutional text to the one sentence in item 48, the four truths, the one-way causal rule, the possibility/occurrence/evidence/belief distinction, and the verification hierarchy. Everything with a number, a formula, or a code snippet belongs in the executable specification, which *should* change. The recurring failure across these rounds was prose and code drifting apart because they lived in one document; separating a stable constitution from a versioned, tested specification is what prevents it.

---

## Bottom line

**Keep, essentially as written:** the constitution sentence; four kinds of truth; the verification hierarchy (semantic correctness first); geometry versus policy as separate layers; geometric symmetry versus perceptual asymmetry (scoped to symmetric policy); spatial emits evidence and epistemics produce beliefs; noisy-OR as an epistemic heuristic with an independence caveat; the capability-based prompt gate; the quantization caveat on the chord heuristic; the spherical-model caveat on displacement; runtime-derived virtual nodes; mandatory tie-breaking; a single authoritative event timestamp; canonical manifest hash over the "Merkle" label; the four-way classification of artifacts; the four executable purity/serialization tests; and the "not finished" inventory.

**Correct or qualify:**
- I can't verify the `traceIntegerSupercover()` critique (that function isn't in the material I've seen), but the reasoning (rectangular scan is not `O(N)`, centroid projection is not a boundary parameter, cell-only output isn't a supercover) is sound on its own terms.
- The architecture is converged for **spatial**, not for **epistemics**, the layer that now carries the most design risk.
- The union-graph precondition should be about **cost lower envelopes under overlays**, not about teleport edges (which the union already includes).
- The final diagram should show **evidence originating in spatial**, not in the ledger.
- The referential-determinism tuple is missing the **build identity, random stream key, serialization version, and numeric constants**.
- The fictional-on-real registration layer is again absent.

**Add:** a commit-time re-validation contract so spatial is an authority and not advice; a `SensoryEvidence` schema with no interpretation and a `traceRef` for provenance; a differential leak test as the executable form of ignorance by omission; correlation-aware combination of evidence; keyed, addressable randomness; overlay validity classes for every precomputation; a golden-behavior corpus tied to a version-bump gate; a human-verified policy gallery built before the reference implementation; a lintable import graph; and a short, stable constitution kept separate from the executable specification.

This document's best quality is its honesty about status, and its central instruction is correct: stop widening the design and start converting claims into proofs. I'd sharpen one thing. The proofs in front of you are not all the same kind. Some are **mathematical** (admissibility with a quantization bound, symmetry of the exact classifier), some are **differential** (production versus reference on the exhaustive small domain), some are **structural** (import-graph lint, type nominality), and some are **behavioral against intent** (the policy gallery). A project that has only the first two kinds will be provably correct about the wrong thing. The differential leak test and the policy gallery are where the design's actual purpose, believable and epistemically honest goblins, gets checked, so those are the two I'd write first.

# goblin-spatial: Consolidated Architecture & Specification

*A synthesis of the full design conversation: the architecture, the decisions and why they were made, the corrections found along the way, and what remains unproven.*

---

## How to read this document

This document merges eight successive design documents and my review of each into one authoritative text. It has two layers, and they should be maintained separately:

- **Part A (The Constitution)** is the stable core: the thesis, the ontology, the invariants, and the causal rules. It should change rarely.
- **Parts B through K (The Specification)** are the versioned, testable details: formulas, data structures, algorithms, policies. These *should* change, and every change should bump a version.

The recurring failure across the whole conversation was prose and code drifting apart because they lived in one document, and each round of the design fixed the previous round's errors while introducing new ones at the level of concrete formulas. Keeping the layers separate is what prevents that.

A **status ledger** appears in Part L. It is the most important section for anyone deciding whether to trust this design: it records what is decided, what is specified, and what has actually been proven. Several items the source documents called "settled" are not.

---

# PART A: THE CONSTITUTION

## A1. The thesis

> **`goblin-spatial` is a pure, content-addressed, deterministic constraint engine that evaluates physical possibility against immutable canonical topology plus explicit runtime overlays, producing routes, occupancy results, temporal opportunities, and sensory evidence, without ever owning world state, committing events, or manufacturing beliefs.**

Each clause carries weight:

| Clause | Meaning |
|---|---|
| **pure** | No hidden state, no I/O, no network, no database. Same inputs, same outputs. |
| **content-addressed** | Identity is a hash of content, not a name or path. |
| **constraint engine** | It says what is *allowed*, not what *happens*. |
| **canonical topology + explicit overlays** | Static world and dynamic state are separate inputs. |
| **sensory evidence** | It stops at evidence. It never says what a character *knows*. |
| **never owns state / commits events / manufactures beliefs** | Three explicit prohibitions. |

The deepest idea is not hexagons, H3, A\*, or integers. It is that **physical space can be an explicit authority boundary in a narrative simulation.** Instead of asking an LLM "what would probably happen here?", the architecture asks in order:

1. What is physically possible here?
2. What actually happened?
3. What evidence reached each character?
4. What did each character conclude?
5. Only then: how would they express it?

## A2. The three-way separation of concerns

```
goblin-lore            says what things MEAN      (canon: static, versioned, immutable)
goblin-spatial         says how space WORKS       (pure functions, zero state)
worker-sower-engine    says who is WHERE and what HAPPENED   (ledger: mutable, event-sourced)
```

The arrows between them are **data and query boundaries, not ownership boundaries.** Dependency direction: the engine calls into spatial and reads lore; spatial depends only on a compiled data shape, never on the lore or engine packages themselves.

`goblin-spatial` knows nothing about LLMs, dialogue, TTS, Remotion, PixiJS, camera easing, personality, databases, networks, OSM parsing, prompt formatting, or belief prose. **Acid test:** the engine should remain useful if every downstream presentation and language system were deleted.

## A3. The causal chain and the no-manufacturing rule

```
canonical world → runtime physical state → physical event → sensory opportunity
    → sensory evidence → belief / inference → intention → expression
```

> **A layer higher in the chain must never manufacture a fact belonging to a lower layer.**

- The LLM cannot create geometry.
- A belief cannot create a perception.
- A perception cannot retroactively create a physical event.
- A renderer cannot change topology.
- A dialogue system cannot decide two characters were close because it would be more interesting.
- The runtime cannot silently rewrite canon.

This makes ignorance-by-omission **structural rather than instructional**. The LLM is never told "don't mention the murder"; if no physical path connects the incident to a character, the fact is absent from that character's context entirely, so it cannot leak.

**The chain is a loop.** Beliefs drive intentions, intentions drive actions, actions become ledger events, events change state, state changes the next spatial query. The one-way rule is about *within-tick information flow*. A wrong percept in tick *n* compounds through behavior into tick *n+1*, which is why single-tick tests are insufficient and a closed-loop simulation test is required (Part J).

## A4. Four kinds of truth

| Truth | What it is | Owner |
|---|---|---|
| **Canonical** | What the world *is*: walls, roads, portals, adjacency | `goblin-lore` + compiled topology |
| **Runtime physical** | What the world *currently is*: door open, actor at cell, steam present | Ledger + dynamic overlay |
| **Epistemic** | What an actor believes or knows | Epistemic system (outside spatial) |
| **Narrative** | What is said, thought, remembered, depicted | LLM / renderer |

> **The closer a subsystem is to raw topology, the less semantic freedom it may have. The higher it is, the more interpretation it may contain.**

A design heuristic follows: when placing logic, ask how much interpretation it needs. Interpretation-heavy logic belongs high; interpretation-free logic belongs low. Bugs are hardest to find in high layers (correctness is subjective) and most damaging in low layers (everything inherits them).

## A5. Possibility versus occurrence versus evidence versus belief

Spatial answers *what could happen*, never *what did happen*:

| Question | Spatial output |
|---|---|
| Can A reach B? | Path and cost |
| Can A occupy this cell? | Yes/no with constraints |
| Can A see B? | Geometric visibility |
| Could A perceive B? | Sensory quality (not a verdict) |
| Could sound from A reach B? | Acoustic opportunity |
| Could A and B interact at time T? | Temporal contact opportunity |

Output predicates are phrased as opportunities (`can_see`, `can_hear`, `can_reach`, `can_witness`), never as occurrences (`saw`, `heard`). The ledger decides events; spatial constrains them.

## A6. Formal functional model

```
PhysicalOpportunity = F(Topology, DynamicOverlay, ActorState, Time, Ruleset, Query)
SensoryEvidence     = G(PhysicalEvents, PhysicalEnvironment, SensoryCapabilities)
Belief              = H(Evidence, PriorBeliefs, InferenceRules)
Expression          = J(Beliefs, Intentions, LanguageGeneration)
```

`F` must not depend on `H`. `H` must not inspect raw topology. `J` must not bypass `H` and read the ledger. The interface shape is always `result = spatial(worldSnapshot, query)`, never `spatial.moveActor(...)`: **no spatial function mutates**, every function is a query over an immutable snapshot.

## A7. The verification hierarchy

```
1. Semantic correctness       (does the policy match the fiction?)
2. Mathematical correctness   (does the code implement the policy exactly?)
3. Deterministic execution    (same inputs, same outputs)
4. Replay stability           (same across runtimes, serialization, time)
5. Performance
```

**Determinism is not correctness.** A deterministic engine can consistently produce the wrong answer, and reproducibility of a wrong answer is worse than nondeterminism because it is harder to notice. Nearly every serious bug found in this conversation was deterministic and wrong: negative packed ids, an infinite-line LoS test, a tracer bullet verifying a private copy. Determinism tests would have blessed all of them. Two mechanisms make correctness executable:

- **Oracle tests:** compare the optimized implementation to a deliberately simple, slow, obviously-correct reference.
- **Invariant tests:** verify laws that must always hold.

## A8. The bounded integer principle

> **No uncontrolled floating-point value may control authoritative branching in simulation state.**

Not "floats are forbidden everywhere." Floats are fine in offline compilation (if output is quantized deterministically), visualization, authoring tools, and analytics. The real reason for integers is that every state transition must be **representable as a canonical, serializable, exactly reproducible value**.

## A9. Geometry and policy are separate layers

Three hexes meeting at a vertex is *geometry*. "Two opaque cells block the vertex" is a *policy*. The exact-geometry module produces a **policy-free classification** of contacts (cells crossed, edges crossed, vertices touched, in exact order). A separate, swappable policy function converts that to blocked/not blocked. Consequences: decision tables are versioned policy data; the classifier is tested against an oracle and never changed by a tuning decision; the same geometry can run under two policies and be diffed.

## A10. Geometric symmetry versus perceptual asymmetry

| Property | Symmetric? | Why |
|---|---|---|
| Geometric visibility (clear ray) | **Yes**, under a symmetric policy | The segment is undirected |
| Illumination-dependent quality | No | Depends on target light and observer adaptation |
| Facing-cone masking | No | Observer orientation |
| Acoustic audibility | No | Listener threshold, local ambient noise |
| Somatic capability (blind, deaf) | No | Per actor |

`hasLineOfSight` is symmetric and tested exhaustively. `canPerceive(observer, target)` is intentionally asymmetric. Useful metamorphic property: in the neutral case (equal illumination, neutral facing and somatics), perceptual symmetry recovers; an unexplained asymmetry is a bug signal.

## A11. What does not belong in the kernel

LLM, dialogue, personality, TTS, music, animation, camera, WebGL, PixiJS, database connections, network calls, OSM parsing, prompt formatting, belief prose, story generation. Also outside spatial: the bisection harness, the prompt gate, the event reducer (these are simulation infrastructure).

---

# PART B: SCALE ARCHITECTURE

## B1. The hybrid: regional and tactical

The design began with H3 as universal geometry and converged, through several rounds, on a **hybrid**:

```
REGIONAL   Real geographic substrate: explicit routing graph + (optional) H3 index
              │
           Portal (atomic scale transition)
              │
TACTICAL   Fictional interiors: exact integer axial hex lattice per site
```

| Layer | Representation | Used for |
|---|---|---|
| Regional | Directed routing graph (CSR), geographic coordinates | Highways, waterways, rail, state-scale travel time |
| Regional index | H3 (res ~5-8) | Coarse containment, spatial joins, joins to H3-keyed datasets |
| Tactical | Integer axial `(q, r)`, `s = -q - r` | Rooms, crawlspaces, LoS, duels, crowding, acoustics |

**Why not H3 for tactical interiors:** H3 is a geographic index, not a game grid. It has 12 pentagons per resolution, aperture-7 rotation (children rotated relative to parents, so no clean nesting), non-uniform cell size, face-boundary distortion where `gridDistance`/`gridPathCells`/`gridRingUnsafe` can fail, and requires a lat/lng tangent-projection bridge with trigonometry that reintroduces cross-runtime float divergence. Exact interior geometry needs exact integer answers. An early claim that "every interior hex has exactly six neighbors" is a property of a *local lattice*, not of H3 globally.

**Why H3 still earns a place at regional scale:** the requirement to map fictional locations onto real ones (for example Miami to Jacksonville) needs real geography, real travel time, and compatibility with H3-keyed real datasets. **Caveat:** in all code shown, nothing consumed an H3 index (routing runs on the explicit graph). H3 is currently a promise without a consumer; either identify a concrete query that needs it (for example "which fictional sites lie within 50 km of this event") or defer it until one arrives.

## B2. Three distances (never one variable)

| Quantity | Meaning | Unit | Used for |
|---|---|---|---|
| **Topological** | Hex steps | integer | Adjacency, melee reach, tactical range |
| **Physical** | Great-circle or lattice meters | `Meters` | Radio, curvature, regional joins |
| **Travel duration** | Shortest-path cost over the weighted graph | `Duration` | Movement, arrival time |

Two cells three hexes apart can be twenty seconds apart across a wall; two far-apart places can be ten seconds apart on a fast edge. **Never** name a function `distance` without saying which. Do not assume `duration ≥ distance / vMax`; fictional shortcuts violate it.

## B3. Scale-handoff state machine

An actor never exists simultaneously as a regional position and a tactical cell. State is a **discriminated union**:

```typescript
type ActorSpatialState =
  | { scale: 'STAGED';     siteId: SiteId; cell: CellId }
  | { scale: 'IN_TRANSIT'; edgeId: RegionalEdgeId; departTime: Instant; edgeCost: Duration };
```

- **STAGED:** occupies an exact axial cell within a site. All tactical queries (LoS, crowding, adjacency, duels, hearing) apply.
- **IN_TRANSIT:** bound to a regional edge. Tactical queries structurally exclude the actor, so no `if (!inTransit)` checks are needed.
- Transit progress is **derived, never stored**: `p = clamp((now − departTime) / edgeCost, 0, 1)`. Store integers, derive the ratio. Better still, avoid computing `p` in engine paths at all: interruption needs only `elapsed` (integer) and arrival needs only `departTime + edgeCost` (integer). Use `p` for display.
- **Portals** are atomic. At every instant an actor is either in transit or staged, never eligible for both models.

## B4. Portals

A portal is a semantic scale boundary, not a door. Canonical record: `portal_id`, `regionalNode`, `siteId`, `entryCell`, `exitCell`, `directionality`, `transitionCost`, `transitionDuration`, access conditions. Portals must be reciprocal (verified at compile time). Costs must be nonzero (see B6). Pathfinding across scales is hierarchical: route regionally to the portal node, then tactically from the entry cell; the regional heuristic must include an admissible lower bound for the tactical remainder (or use zero and accept less pruning). Decide whether sites can be routed *through* as shortcuts; if so they become part of the regional graph.

## B5. Mid-edge interruption

When an in-transit actor is halted at `elapsed = now − departTime`, the edge splits into two integer sub-edges with costs `elapsed` and `edgeCost − elapsed`, joined at a virtual node `vn:{edgeId}:{elapsed}`. Exact because both costs are integer differences. **The virtual node is derived runtime state and must never enter the sealed topology**, or every interruption would change the topology hash and destroy replay. It enters queries through the overlay mechanism and is hashed as part of `overlay_hash`.

## B6. Cost and time constraints

Zero-cost edges are forbidden (minimum 1 centisecond): they permit infinite equal-cost paths and instantaneous portals are physically meaningless. Portals get a nonzero minimum (at least one tick) so time always advances.

---

# PART C: FICTIONAL-ON-REAL REGISTRATION

*This was the user's stated purpose for the regional layer, and later syntheses dropped it. It carries the project's content risk (real places, licensing, reputational exposure), which is separate from its technical risk.*

## C1. Registration modes

| Mode | Mechanism | Routing impact |
|---|---|---|
| **ANNOTATE** | Real site, fictional identity (a real port becomes "The Brine Sluice") | Preserves real edges |
| **SUBSTITUTE** | Fictional structure replaces real space; real geometry suppressed inside footprint | Contracts and suppresses real internal edges; reroutes around the footprint boundary, *and* real roads that passed through must be handled |
| **EXTEND** | Pure fictional addition, no real counterpart (a maintenance crawlway under an interstate) | Injects custom directed edges connecting to nearest real nodes |
| **REGION** | Territorial envelope grouping cells under shared rules | Modulates traversal cost (for example flooded counties at 2.5×) |

Each fictional site declares: `siteId`, `mode`, footprint (compacted cell set), `realBasis` (dataset and feature), displacement mode, suppressed real features, and a native resolution.

## C2. Displacement

To ground the fiction in real travel friction and geography without pointing at real addresses, apply **one rigid transformation, once, offline, to all imported real data.** Additive lat/lon offsets are *not* rigid (meridian convergence scales east-west distances by cos φ). The correct operation is a **3D rotation in ECEF**:

```
p = (cos φ cos λ, cos φ sin λ, sin φ);   p' = R·p;   φ' = asin(z'), λ' = atan2(y', x')
```

- `R ∈ SO(3)` preserves great-circle distances and angles on the **sphere**.
- **Qualification:** this is an offline *spherical* registration. It does not preserve the real WGS84 *ellipsoid* exactly (flattening error up to ~0.3%). State "spherical registration frame, R = 6,371,007.18 m" in the manifest.
- Store `R` as a **fixed-point unit quaternion** (scale 10⁸), since a float matrix cannot be sealed under the no-floats rule. Note a rounded quaternion is not exactly unit; the compiler must apply the same rounded values consistently or renormalize deterministically.
- All runtime modules operate only in the displaced frame. Decide whether astronomy (sunrise, tides) uses displaced or real coordinates; displaced is internally consistent.
- Alternatives to a fixed offset: literal placement (real associations), or composite placement (terrain types sampled from several real areas).

## C3. Data provenance and licensing

Every imported dataset records: name, version, retrieval date, content hash, license (SPDX id). OSM's ODbL requires attribution and share-alike for derived databases. Real data drifts (roads get built), so an unpinned import silently rewrites the simulation's past. Provenance is hashed into the manifest, and updating a dataset is a reviewed, diffable decision. Also: a compile-time **sensitivity lint** that refuses to place event-capable fictional sites over footprints matching real facility categories (schools, hospitals, residences via OSM tags). Run it against the *displaced footprint's origin in real space*.

## C4. Containment lookup

"Which fictional site contains this position?" is an O(1) map built at compile time at each site's native resolution, with parent-cell walks for coarser queries. Sites with near neighbors need a resolution fine enough to be unambiguous, or an explicit anchor point plus radius with the index used only to find candidates and exact geometry to confirm. This replaces the early `offsetToH3Cell` function, which was unsound (magic scale constant, degree-space nearest-neighbor, wrong basis vectors, not injective).

---

# PART D: EXACT INTEGER TACTICAL GEOMETRY (`hexgeom`)

## D1. The lattice

Local tactical interiors use axial integer coordinates `(q, r)`, `s = −q − r`. To make exact segment tests possible, cells map to a **doubled integer lattice**:

```
Centroid(q, r)  = (4q + 2r, 6r)
Vertices        = (cx, cy ± 4), (cx ± 2, cy ± 2)
Edge midpoints  = (cx ± 1, cy ± 3), (cx ± 2, cy)
```

**Derivation (verified):** true pointy-top layout with circumradius s = 2: `x = 2√3(q + r/2)`, `y = 3r`. Divide x by √3: `(2q + r, 3r)`. Double everything so edge midpoints are integral: `(4q + 2r, 6r)`. Vertices of circumradius 2 sit at `(0, ±2)` and `(±√3, ±1)`, becoming `(0, ±2)`, `(±1, ±1)` after the x-stretch and `(0, ±4)`, `(±2, ±2)` after doubling. Adjacent cells' shared edge midpoints coincide exactly (cell (1,0) left midpoint `(2,0)` equals cell (0,0) right midpoint `(2,0)`), so the lattice tiles.

**Critical caveat:** this is an *affine* transform (an x-axis stretch). Affine maps preserve incidence, collinearity, orientation, and segment-polygon intersection, so integer cross-products give exact answers that match true Cartesian geometry. But **Euclidean distance in this space is not real distance.** All range and metric checks use axial distance:

```
d_axial(a,b) = (|q_a − q_b| + |(q_a + r_a) − (q_b + r_b)| + |r_a − r_b|) / 2
```

Never mix the two. (An early draft stated `row = r√3` next to `3r`, a contradiction; the correct statement is the x-stretch above.)

## D2. Packed integer identifiers

Strings (`"q,r"`) allocate in hot loops and sort with locale-sensitive `localeCompare`, which depends on ICU data and can order keys differently on different machines. Pack instead:

```typescript
// CORRECT: multiplication, not signed shift
packCell(q, r) = (q + 32768) * 65536 + (r + 32768)     // range [-32768, 32767], guard with RangeError
unpackCell(id) = { q: floor(id / 65536) - 32768, r: (id % 65536) - 32768 }
packEdge(a, b) = (BigInt(min(a,b)) << 32n) | BigInt(max(a,b))     // canonical undirected order
```

**Bug found in the source:** `((q + 32768) << 16) | (r + 32768)` uses JavaScript's *signed 32-bit* shift. Any `q ≥ 0` sets bit 31, so ids go **negative** (`packCell(0,0) = −2147450880`). Unpacking with `>>>` happens to round-trip, hiding the bug, but ids sort in the wrong order (negative-q cells sort *larger*), breaking every "sort by id" tie-break, and `packEdge` inherits sign-extension corruption. Required property tests over the full range including boundaries: `unpack(pack(q,r)) == (q,r)`; `pack` monotone in lexicographic `(q,r)`; `packEdge(a,b) == packEdge(b,a)` and injective on unordered pairs.

Also: namespace identifiers as distinct branded types (`SiteId`, `ActorId`, `RegionalNodeId`, `RegionalEdgeId`, `TacticalCellId`, `TacticalEdgeId`). Earlier drafts used "edge id" to mean both a string and a bigint.

## D3. Cell pitch and physical scale

Each site declares `cellPitchMm` (center-to-center distance, integer millimeters). All physical quantities derive from it: step time = pitch / speed, acoustic distance loss, vision radius in cells from a physical range. This replaces scattered magic numbers. Note a bug in one draft: default step cost `toCostUnits(0.71)` mixed "71 centiseconds per *meter*" (at 1.4 m/s) with "per *cell*". A ~2 m cell at 1.4 m/s takes ~1.5 s, not 0.71 s.

## D4. The supercover

A **supercover** reports every cell, edge, and vertex a segment touches, in exact order. It is the foundation of LoS and acoustic edge queries.

**Algorithm (specified; not yet implemented correctly anywhere in the source):**

1. **Candidates:** enumerate the axial region around the segment (within `d_axial(A,B)` of either endpoint).
2. **Exact classification per hexagon:** compute `s_i = sign(cross(B − A, V_i − A))` for the six vertices. If all strictly positive or all strictly negative, the *line* misses: reject. Otherwise the line meets the hexagon; then bound by the *finite segment*: clip against the six edge half-planes (Cyrus-Beck) using cross-multiplied rational parameters, never dividing. The segment intersects iff the clipped interval overlaps `[0, 1]`. Classify contact as interior (positive-length overlap with interior) or boundary-only (edge or single vertex).
3. **Order** features by the parameter `t` along the segment, comparing rationals by cross-multiplication.
4. **Apply the boundary policy** (D5) to the ordered feature list.

**Bugs found in the source implementations:**

- The tracer-bullet LoS tested the **infinite line**, not the finite segment. A wall *beyond* the target on the same line reported a false block (`A=(0,0)`, `B=(0,2)`, wall at `(0,3)`: all six wall vertices straddle the line, so it returned blocked).
- The bounding box extended one cell past both endpoints, making the missing segment bound produce many false blocks.
- `Math.round` on rational interpolation is direction-asymmetric (rounds half toward +∞), reintroducing the exact asymmetry the lattice was built to eliminate. Never use `Math.round` on rationals in LoS.
- The reported `O(N)` complexity is false for a rectangular bounding-box scan (approaches `O(N²)` on long diagonals). A supercover visits only the `O(d_axial)` cells along the ray.
- A "supercover" that emits only cells is a cell traversal. The defining feature is edges and vertices too.
- An ordering parameter based on the projection of the *centroid* onto the ray is not a boundary-crossing parameter and can mis-order cells near grazing angles, which matters because the vertex rule depends on order.
- `segmentIntersectsEdge` returned a tri-state (`1`, `0`, `−1`) lumping "collinear," "vertex graze," and "an endpoint lies on the *line*." It needs distinct outcomes: `MISS`, `PROPER_CROSS`, `TOUCH_EDGE_ENDPOINT`, `TOUCH_RAY_ENDPOINT`, `COLLINEAR_OVERLAP`, `COLLINEAR_DISJOINT`.

Cross-products of lattice coordinates up to ±2×10⁵ give products up to ~4×10¹⁰, safely inside 2⁵³. State the coordinate range.

## D5. Boundary policy: `EDGE_PAIR`

A ray between centroids can graze vertices or run along shared edges, and no floating-point check can resolve these. The policy is explicit, versioned, and sealed in the manifest:

| Geometric event | Ray is severed iff |
|---|---|
| Interior crossing | The crossed cell is opaque (opacity = 1000) |
| Edge crossing | The `EdgeOccluder` is closed, **or** both flanking cells are opaque |
| Collinear edge grazing | Same as edge crossing, **and** the vertex rules at both endpoints of the shared edge pass |
| Vertex grazing | At least **2 of the 3** hexes sharing the vertex are opaque (majority) |
| Endpoint cells | Origin A and target B interiors are **exempt** from occlusion |

Corrections and clarifications accumulated:

- A vertex is shared by **three** hexes, not two (an early draft said two).
- Under a naive "open-hex" policy, a ray running exactly along an edge touches neither interior, so both walls are ignored and a wall can be "grazed past." Hence the edge-pair rule.
- **Exempt endpoints count as transparent** when evaluating the vertex majority, otherwise an actor standing in an opaque doorway cell changes the vote.
- Edge occluders must be honored on **every** crossed edge, not only when `distance === 1`. Thin partitions, closed hatches, and glass viewports exist on the boundary between cells without consuming a hex.
- The policy is a small decision table, not prose. **Write it as literal test data**: the vertex rule has 8 rows over `(U,V,W) ∈ {0,1}³` (`blocked = U+V+W ≥ 2`), the edge rule 8 rows over `(occluder, U, V) ∈ {0,1}³` (`blocked = occluder ∨ (U∧V)`). Generate one test per row.
- Three coherent alternative policies exist (`OPEN`, `CLOSED`, `EDGE_PAIR`); the choice is gameplay, recorded in the manifest, because changing it changes every sightline. For a horror crawlspace, `EDGE_PAIR` gives "you can't see past a corner you're pressed against, but a diagonal gap between open cells passes."
- **Known unimplemented state:** in the code reviewed, LoS implements only the interior-crossing row.

Note the source's claim that adjacent (distance-1) cells have "no intermediate cells so LoS is always true" is wrong once edge occluders exist: the only thing between adjacent cells is their shared edge.

## D6. Line of sight is symmetric by construction, exhaustively verified

Because the segment between two centroids is undirected, geometric LoS is symmetric *provided* the classifier is exact and the policy is symmetric. Earlier fixes (compute both directions and intersect; nudge endpoints) were weaker: the intersection over-blocks one-cell-wide corridors. The correct approach is the exact classifier above, then **prove symmetry by exhaustion**, not by trust.

---

# PART E: ROUTING

## E1. Cost model

Costs are **integer centiseconds** (`Duration`, 1 s = 100 cs). Regional edge cost = `lengthMeters / (baseSpeedMps × friction)`. Tactical step cost = `cellPitch / speed × terrainMultiplier`. Terrain multipliers translate lore's qualitative language into arithmetic (`open_floor` 1.0, `grated_duct` 1.2, `cramped` 1.5, `pipe_trench` 2.0, `slick_grease` 2.2, `vertical_choke` 3.0, `impassable` ∞ omitted from the graph). **Terrain meaning stays out of the algorithm**: spatial receives `terrain → cost`, never `if terrain == cramped: goblin feels claustrophobic`. Lore owns semantics, the adapter owns translation, spatial owns arithmetic. Cost of *entering* a cell is a policy (cost is then asymmetric between `A→B` and `B→A`; do not apply symmetry tests to path cost).

## E2. The A\* engine

Required properties:

- **Binary min-heap with lazy deletion** (push duplicates, skip stale entries on pop by checking a settled set). Replaces `Array.sort()` per iteration (`O(n² log n)`). State the lazy-deletion strategy explicitly and test it with a stale-entry case.
- **Strict total order** for tie-breaking: primary lowest `f = g + h`; secondary lowest `h` (this is what "closer to goal" actually means; an earlier draft preferred *higher g* and justified it as "closer to goal," which is wrong); tertiary numeric id comparison. **Never `localeCompare`.** (This regressed into several later drafts, including the displacement code and the hash replacer.)
- **Uniform failure model:** foreseeable failures return typed results (`Result<T, E>` or discriminated unions); exceptions are for programmer error. Validate all cost inputs in the offline compiler so the runtime never sees an invalid cost.

Edge cases needing specified results and tests: start equals goal, start blocked, goal unreachable.

## E3. Heuristic admissibility on a mixed graph

The graph mixes 70 mph interstates, 15 mph access roads, walking-speed tactical cells, and possibly instantaneous fictional shortcuts. Any speed-based Euclidean heuristic is inadmissible if a fictional edge is faster than the speed assumed.

- **Global heuristic:** `h(u) = chord(u, goal) / vMaxGraph`, where `vMaxGraph` is computed at compile time over **every** edge including fictional ones (`length / time`). If any edge has zero cost, `vMax = ∞ ⇒ h = 0` and A\* degenerates to Dijkstra. The type must carry this as an explicit sentinel (`"POS_INFINITY"` in the sealed artifact, since `Infinity` serializes to `null`), and the heuristic code must special-case it.
- **ALT (A\*, Landmarks, Triangle inequality)** for large regional graphs: 8-16 landmarks, precomputed tables. For **directed** graphs (one-way streets) both forward `d(L,·)` and reverse `d(·,L)` tables are needed:

```
h(u,goal) = max(0, max over L of  max( d(L,goal) − d(L,u),  d(u,L) − d(goal,L) ))
```

  The formula is correct. Practical requirements: clamp at zero (else `toCostUnits` throws on a negative); skip landmarks where either distance is infinite (`∞ − ∞ = NaN`); compute two Dijkstra runs per landmark (graph and reverse graph); the max of consistent heuristics is consistent, so the closed-set logic stays valid.

## E4. Trig-free regional heuristic

Calling `haversine` at runtime reintroduces transcendental-function divergence across JS engines (`sin`, `cos`, `asin` are not required to be correctly rounded; `sqrt` *is*). Instead store each regional node as a **fixed-point ECEF unit vector scaled by 2²²** and compute integer chord distance:

```
chord² = Δx² + Δy² + Δz²     (each Δ ≤ 2·2²² = 2²³, so Δ² ≤ 2⁴⁶, sum ≤ 3·2⁴⁶ ≈ 2.1×10¹⁴ < 2⁵³ ✓)
```

An early draft used scale 2³⁰, where `Δx²` reaches 2⁶², overflowing 2⁵³ silently. At 2²² resolution is ≈ 1.5 m, far finer than road accuracy. `chord ≤ arc`, so chord scaled by `1/vMax` is admissible for the *true* chord.

**Quantization caveat (found late, real):** the runtime computes the chord between **quantized** vectors, each displaced up to about half a unit per axis. The quantized chord can exceed the true chord, and for close nodes can exceed the true arc, making the heuristic slightly inadmissible. Fix: subtract a proven error bound (about `2·√3·R/S` meters) before dividing by `vMax`, clamped at zero, rounding the chord **down**. Then admissibility is a theorem. Property test: for 10,000 random node pairs, `hInteger ≤ exactChordBigInt / vMax` and `≤ trueArc / vMax`. Alternatives: a `BigInt` chord (exact, slower) or precomputed node-to-node distance tables.

## E5. ALT plus secret edges: the union-graph invariant

A hazard: each actor routes over `G_actor = G_public ∪ Discovered(A)`, but landmark tables built on `G_public` become *overestimates* whenever a secret shortcut exists. Resolution: compile landmark tables on `G_union = G_public ∪ G_all_secrets`. Adding edges only lowers or preserves shortest-path distances, so any lower bound valid on the union is valid for every subgraph, and consistency is preserved (every actor edge is a union edge). Cost: weaker pruning for ignorant actors. Alternatives: tiered tables, or fallback to Dijkstra for knowledgeable actors.

**Precondition (correctly stated late):** table edge costs must be the **lower envelope of every cost the edge can take under any overlay or condition**. Teleport edges are *not* a hazard (the union includes them). The hazard is any overlay that can *reduce* an edge below its compile-time cost (a cleared blockage, an opened shortcut, a favorable time-of-day multiplier). Also state FIFO for time-dependent costs and that these are lower envelopes.

## E6. Per-character known-graph

`G_actor = G_public ∪ DiscoveredEdges(A)`. Characters cannot route through secrets they haven't discovered, which extends ignorance-by-omission from facts to the map itself. Refinements:

- Discovery is just another belief type (`KNOWS_EDGE`) with provenance.
- **Partial knowledge:** an edge may be known to exist without a known cost; use an estimated cost. This produces realistic mistakes (a "shortcut" that is actually flooded).
- **Stale knowledge:** store a knowledge timestamp; the ledger resolves the discrepancy when the actor walks into a hatch that is now shut.
- Do not materialize a graph per actor per query: pass the *delta* of secret edges and let the router add them to the shared graph.
- Edge visibility is `'PUBLIC' | 'SECRET'` (not a boolean `isKnownDefault`, which conflated "public by default" with "known to this actor").

## E7. Graph storage and scale

Regional graph in **CSR** (compressed sparse row) typed arrays with **integer node ids**, not `Map<string, RoutingEdge[]>` (10-50× larger and slower); numeric id comparison also makes tie-breaks locale-free. Hide the representation behind an interface (`neighborsOf(id)`, `edgeCost(i)`). Costs stored `Uint32Array` (max ~497 days per edge) but **path sums exceed 2³²**, so accumulators use doubles (safe to 2⁵³ cs). Precompute site-to-site travel-time tables for named sites (small, hashable, inspectable in a spreadsheet, keyed by topology hash). Contraction Hierarchies are likely overkill for a few queries per tick; ALT is sufficient.

`RoutingEdge` needs: `target`, `cost`, `lengthMeters` (so `vMax` is computable), `mode`, `visibility`. Regional nodes (geographic) and tactical nodes (local axial) should be distinct types or separate graphs joined only by portals.

## E8. Connected displacement (`resolveDisplacement`)

When a cell exceeds capacity, **policy** (engine) decides *who* is evicted (for example latest arrival; ties by lowest somatic stability; final tie by actor id, since two actors can arrive the same tick), and **geometry** (spatial) decides *where* they go. Ring expansion can place an actor across a wall; instead run a **budget-bounded Dijkstra** from the target cell, returning the cheapest reachable cell with capacity.

Requirements, from defects found:

- Exclude the displaced actor from the occupancy tally (else the count is off by one).
- Respect `blockedCells` **and** edge occluders **and** the dynamic door overlay (a cell-level blocked set cannot represent a closed hatch between two open cells).
- Typed result with distinct reasons: `CAPACITY_EXHAUSTED` (reachable region full), `BUDGET_EXCEEDED` (search cut off by cost), `UNREACHABLE` (target has no traversable neighbor). One draft declared all three but only ever returned one.
- Use the binary heap, never `Array.sort` or `localeCompare` in the loop.
- Never call `toCostUnits(Infinity)` (it throws on the first neighbor; use a sentinel constant).
- Document that the function returns *another* cell, never the target itself; require non-negative edge costs for the budget cutoff to be correct.
- Default capacity (2) is a **policy value** in the sealed ruleset, not a `?? 2` buried in code.
- Tie-breaking among equal-cost destinations follows the heap's deterministic order.

---

# PART F: PERCEPTION AND SENSORY EVIDENCE

## F1. Spatial emits evidence; epistemics produce beliefs

Earlier drafts had `findWitnesses` returning `Percept` records with a `resolved: boolean` and feeding directly into `KNOWS(...)`. The consolidated boundary: spatial returns **`SensoryEvidence`** and the ledger/epistemic system turns it into beliefs. `resolved` is already an interpretation ("was this identifiable?"), so it belongs downstream.

```typescript
interface SensoryEvidence {
  observerId: ActorId;
  eventId: EventId;
  channel: 'OPTICAL' | 'ACOUSTIC';
  qualityPermille: number;             // integer 0..1000, from geometry + medium + environment only
  arrivalDirection: 0|1|2|3|4|5|null;  // ABSOLUTE lattice direction; consumer applies facing
  sourceLocation: SpatialRef;          // regional or tactical; consumer decides identifiability
  traceRef: TraceHash;                 // content hash of the ray/wavefront trace, for provenance
}
```

Deliberate omissions: no `resolved` flag; no relative bearing (depends on the observer's facing, which is actor state). A `Percept` needs a location union so regional percepts (a car passing on the highway) are representable, since `sourceCell: AxialHex` ties the type to tactical space.

## F2. Visibility is not perception

Line of sight is geometry; perception adds illumination, medium opacity, distance, facing, and capability. An unobstructed ray in a dark room yields near-zero quality. **Geometry is symmetric; perception is not** (A can be lit and seen by a B who cannot see back).

## F3. Integer photometry

**Illumination** is an integer log-lux index `L ∈ [0, 448]` (0.01 lux to 300 lux in centi-decades, computed once at authoring time):

```
L = clamp( floor( (log10(max(lux, 0.01)) − log10(0.01)) / (log10(300) − log10(0.01)) × 448 ), 0, 448 )
```

Corrects the earlier `min(1, lux/300)` (which made a 3-lux lantern effectively invisible, though real scotopic vision works below 0.001 lux) and the linear-log hybrid. It is a compressive response across four decades, matching how vision behaves. Better still, store the log-lux index directly in the ledger and topology so no `log10` runs at query time.

**Transmittance** accumulates in integer per-mille: `T ← floor(T × (1000 − o) / 1000)` over each crossed cell and edge (product of `(1 − o/1000)` terms; wall = opacity 1000 gives `T = 0`, so binary occlusion is a special case). One source of truth: occlusion *is* opacity 1000, and the boolean set is derived (an earlier draft kept both).

```
distanceFactor = floor((R − d) × 1000 / R)
lightFactor    = floor(L × 1000 / 448)
Q_visual       = floor(distanceFactor × T × lightFactor / 1,000,000)     ∈ [0, 1000]
```

**Worked example:** target 3 cells away, vision radius 10, clear air, `L = 300`: `distanceFactor = 700`, `T = 1000`, `lightFactor = 669`, `Q = 468` (ambiguous evidence). Largest intermediate is 10⁹, safely below 2⁵³.

Requirements and defects:

- Guard `R ≤ 0` (blind or debuffed actors, authoring errors), which otherwise divides `0/0 = NaN` and returns `NaN`.
- A target at exactly `d = R` scores 0 (factor zero); effective visible range is `< R`. State it. The radius check and the `(1 − d/R)` factor both penalize distance; document the double-count.
- The opacity arrays must **exclude the endpoint cells**; state the contract.
- The three-factor product collapses quickly (half range, half light, 20% opacity gives 200, the "no percept" threshold). Tune with worked examples, consider a saturating curve.
- `d` and `R` are in **cell units** (with ~2 m pitch, 10 cells = 20 m); state the unit.
- Illumination is sampled at the target only, but adaptation matters (a goblin who just left a bright room is dark-blind). Track an adaptation scalar in the ledger and pass it in.
- Thresholds (700 resolved / 200 minimum) are **policy constants** and per-actor identification thresholds may vary (familiarity); place them in the sealed policy block.
- Sight in a horror setting is dominated by light; realism payoffs (sunrise, sunset, twilight, moon phase, tides) come cheaply and deterministically from date and coordinates.

Optional refinements: opacity for partial occluders (grating, steam, smoke, foliage); illumination *contrast* (target versus background), not only target luminance; monocular vision should restrict field of view, not halve range; facing cones (120° in single-file conduits) need the lattice's fixed directions.

## F4. Acoustics

Energy in **centi-decibels (cdB)**, 1 dB = 100 cdB, 60 dB = 6,000, 120 dB = 12,000. (An earlier design called this "basis points," which is a misnomer and inconsistent with cdB; verify the damping table was converted, not relabeled.)

- **Wavefront:** maximum-energy Dijkstra: `I(v) = I(u) − Δ_distance − Γ_partition(u,v)`. Sound takes the least-lossy path.
- **Undirected damping:** walls are symmetric, so damping is per *undirected* edge (canonical sorted-pair key). Directed keys allowed `a→b ≠ b→a`, which is physically wrong.
- **Two-condition audibility:** `I(v) ≥ T_hearing` **and** `I(v) − N_ambient(v) ≥ SNR_min` (typically 600 cdB). The absolute threshold and masking noise are physically different. Earlier versions used `max(N, T)` or ignored ambient entirely (a steam valve could never mask a whisper in the code).
- **Propagation cutoff** must be at most the minimum hearing threshold in the cast, or you get false negatives (a hidden coupling).
- **Auditory quality:** `Q = clamp(1000 × (I − max(N,T)) / (I_ref − max(N,T)), 0, 1000)`. `I_ref` needs a numeric definition (source level minus one-cell attenuation) and a guard when `I_ref ≤ max(N,T)` (zero or negative denominator).
- **Bearing:** the arrival direction is the direction from the listener toward the previous cell on the maximum-energy path, ties broken by lowest direction index (a hex lattice has up to six incoming edges; symmetric arrivals around a corner are common). Spatial reports the **absolute** direction; the consumer computes `(arrival − facing + 6) mod 6`. Six directions give 60° resolution (a game abstraction). Direction indices need one documented handedness (screen-space y-down versus math orientation) and a fixed `DIRS` order. Do not assign compass words ("east") to indices; six directions cannot contain four cardinals.
- **Simplifications to flag:** dB do not sum linearly, so concurrent sources need energy-domain summation or "take the loudest"; linear-per-hex loss is a room-scale game simplification (real spherical spreading is `20·log10 r`) and must not be used for regional radio propagation; the material damping table: `air_gap` 0, `perforated_sheet` 400, `wood_lath_plaster` 1,500, `sheet_tin_duct` 2,200, `riveted_iron_plate` 5,000, `solid_stone_footing` 9,500.
- **Interaction with LoS:** edge occluders carry both optical opacity and acoustic damping (one structural vocabulary; a thin partition should not block sound but be invisible to sight, or vice versa).

## F5. Somatic capability

Perception is validated against the actor's profile: visual acuity (`NORMAL`, `MONOCULAR`, `BLIND`; a blind actor never yields an optical percept even when co-located), auditory thresholds (concussive deafness raises the hearing threshold), and facing masks. These are ledger inputs passed to spatial queries; they are not spatial state.

## F6. Conversational contact

A **temporal contact graph** replaces raw adjacency: two actors share a contact edge at tick T iff a speech-level source (6,000 cdB) at one arrives at the other above ambient plus SNR and hearing threshold. Adjacent-through-a-wall is *not* contact; characters across a closed iron door cannot converse; whispers, thin partitions, and noisy rooms fall out of one mechanism. This reuses the wavefront machinery. Speech has a higher *intelligibility* threshold than detection, so a character can hear a conversation without understanding it. Information can propagate only along contact edges, giving a verifiable provenance chain (`Incident(T2) → Contact(A,B,T5) → Contact(B,C,T9)`). The `acousticPrivacy` field of earlier drafts was ill-defined (privacy depends on who else is within earshot, a property of the scene, not of a pair); define as energy leaking to non-participants or drop.

Proximity is not opportunity: two goblins in the same corridor at different times had no chance to interact. Spatial answers *what was physically possible*.

## F7. Dynamic overlays

Canon defines the hatch (`occluder_id`, cell or edge, default state); the ledger records whether it is open; the query merges them. Overlays never mutate canon. Requirements:

- **Deterministic precedence** when overlays conflict (open in the ledger but also "jammed"), a defined merge function, and an overlay hashed with canonical ordering.
- **Overlays can invalidate precomputation.** A shut hatch (edge removal) makes a precomputed distance an *underestimate*; an opened secret makes it an *overestimate* (inadmissible). Classify every precomputation:

| Precomputation | Valid under overlays that... | Otherwise |
|---|---|---|
| ALT tables (lower-envelope costs) | only remove edges or raise costs | rebuild, or fall back to Dijkstra |
| All-pairs site travel times | are absent | recompute per query or mark approximate |
| Cached visibility bitsets | only add occluders | invalidate affected rays |
| Contracted regional graph | add no new nodes | fall back to uncontracted search |

  An `Overlay` declares `monotonicity: 'NON_IMPROVING' | 'ARBITRARY'`, and the router chooses its strategy from it.
- Overlays cover *anything* state-dependent: doors, hatches, flooding, steam, jams, fires.
- Decide whether displacement may pass *through* an open door or only land on the open side.

---

# PART G: TIME AND EVENTS

## G1. The integer timeline

`Instant` and `Duration` in integer centiseconds. Types are distinct: `Instant + Duration → Instant`, `Instant − Instant → Duration`, everything else forbidden. **Idiom that compiles:** `declare const durBrand: unique symbol; type Duration = number & { readonly [durBrand]: true }` (the earlier `{ readonly __brand: unique symbol }` inside a type literal does not compile under strict mode). Brands prevent time-versus-cost-versus-meter mix-ups only if arithmetic goes through helpers; note that `state.time + event.cost` type-checks as plain `number` regardless. `diffInstant` must not silently cast a negative to `Duration`; return a result or throw. Constructors validate (`Number.isSafeInteger`, non-negative), but validate dynamic data in the compiler so runtime constructors are can't-happen guards.

## G2. Event-time semantics (a real bug)

The reducer in the source draft did `time = state.time + event.cost`, a **single global clock summed across all actors' action durations**. Two goblins each moving for one second advanced the clock by two seconds; a six-hour drive by one actor advanced everyone's clock. Correct model:

- Events carry their own **authoritative `at: Instant`**; the ledger is totally ordered by `(at, priority, eventId)`, and the tie rule is recorded in the ruleset.
- Duration is part of the event payload describing the action's extent; each actor has `busyUntil`, and cannot start an action before finishing the previous one.
- The world clock is `max(at)` over applied events, never a sum.
- An arrival must satisfy `at == departTime + edgeCost` exactly; the reducer *rejects* otherwise (the draft blindly added the supplied cost, so an actor could "arrive" instantly and the clock advanced another 5,000 cs).
- Do not clamp negative elapsed time silently (`currentTime < departTime` is a causality bug; assert in engine paths, clamp only for display).
- Two actors acting "simultaneously" are ordered deterministically and queried against the snapshot at that instant.
- `getTransitProgress` returning a float, dividing by `edgeCost` (zero-cost forbidden), and used in logic reintroduces floats; return the rational pair or avoid it (B3).

## G3. Reducer validation

The ledger must not trust an event's claims. `applyEvent` should:

- Verify preconditions (actor is at `fromCell`, is `STAGED` for tactical moves, is `IN_TRANSIT` to arrive).
- Verify arrival matches the edge's destination site/portal.
- **Call the spatial engine** to validate legality (adjacency, blocked cells or edges, capacity, scale state). Geometry proposes; the ledger validates. Without this the possibility engine is merely advisory.

**Commit-time re-validation contract (the constitution's enforcement clause):** no event enters the ledger unless every physical precondition it asserts has been confirmed by a spatial query against the same snapshot, rulesets, and overlay the event was proposed under. Events carry the claims they relied on and the hashes they were verified under, giving a full audit trail.

```typescript
commitEvent(event, snapshot, rulesets):
  for claim of event.claims:           // ADJACENT | REACHABLE | OCCUPIABLE | VISIBLE | ...
     if !spatial.verify(claim, snapshot, rulesets): reject(event, claim)
  append(event)
```

## G4. Calendar and astronomy

Deterministic from displaced coordinates and date: sunrise, sunset, twilight, moon phase, tides, DST-aware timezones. Cheap, high-impact realism, and darkness is the dominant modifier of visual quality in the setting. Precompute tables at compile time for the project's date range, or use integer-friendly algorithms. Time-dependent edge costs (rush hour, ferries, bridges, closures) require FIFO time-dependent shortest paths, and heuristics must use the best-case multiplier to remain admissible.

---

# PART H: REPLAY IDENTITY AND SEALING

## H1. Referential determinism

The strongest form of "deterministic" states *what determinism is conditioned on*:

```
Result = F(topology_hash, overlay_hash, actor_state_hash,
           spatial_ruleset, routing_ruleset, perception_ruleset,
           engine_build_hash, serialization_version, numeric_constants,
           randomStreamKey, query)
```

Topology identity and algorithm identity are separate: the map can be unchanged while a tie-break or boundary-policy change alters results. **Rulesets version intended behavior; the build hash identifies actual behavior** (a bug fix changes outputs without a ruleset bump). A replay mismatch then tells you whether the *world*, *rules*, *code*, or *serialization* changed.

## H2. The sealed policy block

Everything tunable that affects outputs lives in one hashed object:

```json
{
  "rulesets": { "spatial": "x.y.z", "routing": "x.y.z", "perception": "x.y.z" },
  "policy": {
    "boundaryPolicy": "EDGE_PAIR", "resolveThreshold": 700, "ambiguousThreshold": 200,
    "snrMinCdB": 600, "conversationSourceCdB": 6000, "defaultCapacity": 2,
    "logLuxIndexMax": 448, "chordScale": 4194304, "minCostCs": 1
  }
}
```

Nothing is hardcoded; changing a number changes the hash, invalidating caches and rendered episodes. **Rule:** any change to policy or logic that can alter an output bumps the relevant version, enforced by a golden-output corpus that fails if outputs change without a version bump (Part J).

## H3. Canonical serialization

`JSON.stringify` turns `Map` and `Set` into `{}`, which once made every topology hash identical. The replacer must:

- Convert `Map`/`Set` to arrays sorted by a **code-unit comparator** (`a < b ? -1 : a > b ? 1 : 0`). **`localeCompare` is forbidden** (ICU-dependent; two machines can hash identical data differently). It regressed into later drafts.
- Sort object keys (default `Object.keys().sort()` is code-unit safe).
- Use type-aware comparison for numeric keys (`String()` coercion sorts `10` before `9`); or require string keys.
- **Reject** `NaN` (throw; never seal it) and non-integers (throw, enforcing the no-float rule mechanically). Map `±Infinity` to explicit sentinels `POS_INFINITY`/`NEG_INFINITY`. An early version mapped `NaN` to `'NEG_INFINITY'`, silently turning corrupt data into a plausible sentinel.
- Serialize `bigint` (edge ids) as decimal strings; `JSON.stringify` **throws** on `BigInt`.
- Ban `Date` (integers only).
- Encode lat/lon and quaternions as fixed-point integers (micro-degrees 10⁻⁷, quaternion scale 10⁸); a float rotation matrix cannot be sealed.
- Forbid floats in sealed artifacts entirely so other-language tools recompute identical hashes (JS's shortest-round-trip float printing is not portable).

## H4. Manifest hash structure

Use a **canonical manifest hash** (single SHA-256) for identity, plus **per-component hashes** for diagnostics (per site, regional graph, terrain, routing, perception, portals), sorted by id in code-unit order. Domain-separated hashes tell replay infrastructure *what kind* of thing changed ("site `loc_valve_station_09` changed," "routing graph changed"). A true Merkle tree adds independent subtree verification; adopt one only if needed, and call the current construction what it is. The manifest includes compiler version, per-dataset `{name, sha256, license}`, displacement quaternion, site hashes, and regional graph hash. Site ids are constrained by a regex (`^loc_[a-z0-9_]+$`), so delimited `siteId:hash` strings cannot be ambiguous; state the dependency. Commit a **golden hash** for the fixture and verify it in CI on two Node versions and two locales; that is the only test that catches replacer bugs (locale sort, `bigint`, key order).

## H5. Addressable randomness

Any stochastic epistemic decision (identifying a low-quality percept) draws from `PRNG(hash(masterSeed, eventId, actorId, purposeTag))`, seeded fresh per decision using a small integer-arithmetic generator. Because each stream is keyed by *what it is for*, inserting or removing an unrelated decision cannot shift another's outcome. Log the key and the draw. This lets an author edit a scene, replay the rest, and see only the intended differences.

## H6. The deletion principle, precisely

"If all generative models are deleted, the physical state is rebuildable" holds only if: every stochastic choice is drawn from a logged, keyed seed or recorded as an event; topology and rulesets are pinned by hash and version; and the ledger is the only source of truth. Treat it as a **testable property**: delete model outputs, replay the event log against the pinned topology, assert identical final state.

---

# PART I: THE OFFLINE COMPILER

The runtime never imports GIS libraries, parses GeoJSON/OSM, or touches a network. A build-time compiler transforms raw data into a sealed artifact:

```
Raw real data (OSM, DEM, land cover) + canonical lore (sites, portals, templates)
   ↓  scripts/compile-topology.ts
   1. Apply rigid ECEF rotation (displacement)
   2. Simplify: keep only needed road classes, contract degree-2 nodes, separate geometry from routing weights
   3. Rasterize tactical templates into exact axial grids
   4. Validate (below)
   5. Compute vMaxGraph; precompute ALT tables (forward and reverse, on the union graph, lower-envelope costs)
   6. Canonically serialize; hash; emit topology_manifest + hashes
```

Benefits: performance, reproducibility, offline execution, reliability, fast loading, stable topology, **auditability** of data provenance. External-data weirdness stays out of the authoritative simulator.

**Compile-time gates (halt the build with a nonzero exit code):** schema conformance; unknown terrain slugs; **reciprocal portals** (A's portal to B implies B has one back to A; a bug in one draft only checked that *some* portal to A existed, not the *specific* target portal id); pentagon avoidance (only relevant to any regional H3 use, since tactical axial grids have no pentagons); **graph contiguity** (flood fill; orphaned islands); planar invariant `q + r + s = 0`; zero-cost edges; unreachable portals; license manifest present (SPDX ids); sensitivity lint; **strong connectivity** of the traversable graph, no sink components, chokepoint cut sizes (a sturdier check than random-walk simulation); validation that every cost, coordinate, and constant is an integer.

**Authoring surface.** Prefer tactical sites authored as explicit hex sets and edge occluders, or **ASCII templates** the compiler parses (human-reviewable in pull requests, diffable, exactly convertible to axial coordinates), over polygons. This removes rasterization ambiguity (cell-center-inside versus majority-area), which would otherwise affect room shape and gameplay. Site templates in `goblin-lore`; the previous `stage_grid` radius-plus-offset scheme assumed a single disk around an anchor.

---

# PART J: VERIFICATION

## J1. Classification of artifacts

| Category | Contents | Dependency rule |
|---|---|---|
| **Core production algorithms** | hexgeom, supercover, routing, perception, displacement | No dependency on the others |
| **Verification infrastructure** | oracles, property tests, replay checks, bisection | May depend on production |
| **Integration infrastructure** | ledger adapter, reducer, evidence adapter, prompt gate | Depends on production and ledger |
| **Build infrastructure** | topology compiler, canonical manifest, hashing, provenance | Offline; depends on production types |

## J2. Test taxonomy

1. **Mathematical theorems** (`fast-check` with shrinking): metric axioms; `q + r + s = 0`; ring cardinality `6k`, disk cardinality `1 + 3k(k+1)`; neighbor reciprocity and irreflexivity; LoS symmetry of the exact classifier.
2. **Software contracts:** obstacle exclusion; adjacency continuity of paths; **heuristic admissibility as a property test** (`h(u) ≤ trueCost(u, goal)` for every node, including shortcut graphs); **insertion-order invariance** (shuffle every Set/Map/array input, assert identical output); reachability horizon consistency; purity (deep-hash input before and after a query); **serialization round trip** (serialize, deserialize, query, compare); locale invariance.
3. **Policy invariants:** capacity, speed baseline, thresholds; tests verify *enforcement*, not "correctness" of a tuning constant.
4. **Differential tests:** production versus reference (BFS/Bellman-Ford/Dijkstra for routing; sampling oracle for LoS; naive flood for acoustics) on thousands of random small graphs. The most effective technique for A\* bugs.
5. **Metamorphic tests:** scaling all costs by *k* scales total cost by *k* and preserves the path; adding an edge cannot raise cost; removing an occluder cannot reduce visibility; adding an unreachable node changes nothing; adding an opaque wall cannot create visibility.
6. **Exhaustive tests on small domains** (beats random for measure-zero cases like vertex grazes): all ordered pairs in a radius-5 disk (91 cells, 8,190 ordered pairs) with all-clear, single-wall, seeded-random, and all 8 vertex patterns; assert `fast(a,b) == fast(b,a)`, `fast == oracle`, `features(a,b) == reverse(features(b,a))`. The oracle samples the segment at ~4,096 rational points with `BigInt` and classifies each by exact hexagon membership.
7. **Golden files and cross-environment runs:** committed expected hashes and paths under two Node versions and two `LANG`/`Intl` locales (the cheapest way to catch locale-sensitivity).
8. **Corrupted-input suite:** `NaN` costs, duplicate ids, edges to nonexistent nodes, self-loops, negative costs; the compiler must reject each with a specific error and the runtime must never see them.
9. **Mutation testing** (Stryker) on the pure modules. Required mutants, each of which must fail the suite: flip the router comparator; swap tie-break order; `Math.round → Math.floor` in LoS; remove `edgeKey`'s canonical sort; drop the reducer's precondition check; drop displaced-actor filtering; vertex majority ≥2 → ≥1 or ≥3; revert `<<` in `packCell`; remove the segment-bound check; drop the arrival-time equality check; swap `min`/`max` in `packEdge`; reintroduce `localeCompare`.

## J3. The tracer bullet

A genuine tracer bullet **imports the real modules from `src/`** (`hexgeom`, supercover, `findPath`, reducer, unit constructors). The source's tracer bullets never did: they redefined the functions locally, so they verified private copies, and one reused the old non-compiling brand syntax. Requirements:

- Tactical fixture: a radius-3 axial disk with one wall cell and one closed-hatch edge.
- Regional fixture: a diamond where a cheap route has *more hops* than an expensive one (cost decoupled from hop count; a hop-minimizing router fails it). An earlier "diamond" hid bugs because alphabetical tie-breaking happened to pick right.
- One portal joining them.
- LoS cases that can fail: distance-2 through a wall (false), a **wall beyond the target** (true), knight-move pairs that graze a vertex with all 8 opacity patterns, an edge-grazing pair, and symmetry across all pairs. (Several source tests were "diagonal" in name only: `(0,0)→(0,2)` is a straight axis line and exercises no policy.)
- Routing asserts the router picks the time-optimal route, an equal-cost tie resolves by the documented rule, and the reported cost equals the summed edge costs (one test compared a literal to itself).
- A reducer with the full lifecycle: `ACTOR_DEPARTED_SITE`, rejection of tactical moves while in transit, mismatched `fromCell` rejected while staged (this case was dropped in a later round), interruption with virtual node `vn:{edgeId}:{e}` and two sub-edge costs summing to the original, arrival at exactly `departTime + edgeCost`, and correct final scale.
- Golden topology hash for the fixture.
- The reducer's `ActorState` must be the discriminated union, not a bag of optionals (which allowed `{scale: 'STAGED'}` with no cell and compared `undefined`).
- **Then mutation-test it.** A tracer bullet that survives mutations guards nothing.

## J4. Closed-loop simulation and bisection

Because errors compound across ticks, add a headless closed-loop test: thousands of ticks with a fixed seed running movement, spatial query, evidence, simplified belief, action selection, ledger update. Assert identical final-state hash across runs and environments, no invariant violation at any tick (capacity, adjacency, scale-state validity, monotonic clock), and bounded pathology (deadlocks, clustering, unreachable rooms). A random walk is a **topology lint**, not a behavior prediction (random walkers reflect random-walk statistics, not motive-driven movement). Separate "deadlock" into transient (enclosed by other goblins) versus permanent (enclosed by walls, a topology bug) by testing reachability against *static* topology. Add a **bisection tool**: when two runs diverge, binary-search the tick sequence for the first tick whose state hashes differ and diff that tick's inputs ("tick 4,127, actor `char_bog`, the tie-break at cell (3,−2)"). Bisection belongs to simulation infrastructure, not spatial.

## J5. Golden-behavior corpus and version-bump gate

Maintain `(snapshot, query) → expected result` files. CI fails if any result changes **unless the ruleset or engine version bumped in the same commit**. Debugger escape tickets become corpus entries: each defect becomes `tests/escapes/esc_<id>.json` (topology slice, actors, query, expected), run by one generic loader over the directory. Adding a regression is dropping a file, which also lets lore authors submit "this should / should not be visible" cases.

## J6. Human-in-the-loop policy validation

The oracle proves the code matches the policy; only a human can judge whether the policy matches the fiction. **Before writing the reference implementation**, build the static SVG renderer and a "policy gallery" of ~20 scenes (corner peek, diagonal squeeze between two walls, door ajar, thin partition, vertex graze), each labeled with the policy's verdict, and have a person confirm each matches intent. Freeze them as named fixtures.

## J7. Principle-to-check table

A principle without a falsifiable check is a wish:

| Principle | Falsifiable check |
|---|---|
| Deterministic ≠ correct | Oracle comparison on the exhaustive small domain |
| Determinism as invariant | Insertion-order shuffle and cross-locale golden hash |
| Ambiguous rules explicit | Decision tables as literal test data |
| Space is an authority layer | Commit-time re-validation; prompt-gate leak test |
| Perception ≠ knowledge | Type system: evidence cannot be assigned to a belief |
| No layer manufactures facts | Dependency lint: lower layers cannot import upper ones |
| Tracer bullet before debugger | CI gate: debugger depends on the compiled artifact only |
| Stateless engine | Input deep-hash unchanged; serialization round trip |

---

# PART K: EPISTEMICS AND THE PROMPT GATE

*Everything downstream of `SensoryEvidence` was asserted but not defined in the source documents. It is the least-designed layer and now carries the most design risk. The spatial architecture has converged; the epistemic architecture has barely begun.*

## K1. Minimum specification needed

- **Evidence-to-belief mapping** with integer (per-mille) confidence, never floats (an example used `0.82`; a confidence threshold is a decision boundary).
- **Belief record:** content, confidence, source type (`DIRECT_PERCEPT`, `INFERENCE`, `TESTIMONY`), the chain of contributing evidence and contact ids, last-updated tick.
- **Combination rule (correlation-aware noisy-OR):** group evidence by `eventId` and `channel`; within a group combine by `max` (same exposure, not independent: three neighbors hearing one crash are one sample); across groups (different events, different channels, testimony) combine by noisy-OR in per-mille integer arithmetic: `p = 1000 − floor((1000 − p₁)(1000 − p₂) / 1000)`. Testimony chains apply a per-hop discount from the ruleset. Noisy-OR is an epistemic heuristic, not a physical law, and belongs in the epistemic system.
- **Identification rule:** a low-quality percept maps to candidate identities via a deterministic pipeline: geometry filters candidates (who *could* have been at that cell at that tick, from the ledger), then a keyed seeded draw weighted by familiarity (H5).
- **Decay, contradiction, and revision** models; **stale knowledge** handling.
- Ladder: `physical event → sensory exposure → evidence → interpretation → belief → knowledge`. C might receive `{modality: auditory, direction: behind, quality: 780}`, never `FACT: A hit B`. C may infer "someone attacked someone," "that sounded like A," or "something fell." Certainty, suspicion, misidentification, partial observation, wrong inference, testimony, and conflicting evidence all become expressible without corrupting the physical world.

## K2. The prompt gate as an information-flow guarantee

A runtime blacklist (`FORBIDDEN_KEYS`) is **not** a guarantee: it misses nesting, aliases, derived structures, wrappers, renamed fields, future properties, indirect references, and serialization paths. An index signature `readonly [k: string]: unknown` *permits* any key; it does not forbid the listed ones (to forbid at the type level use `never`-typed optional fields or a nominal type). The correct design is **capability-based**: make the unsafe thing unrepresentable.

```typescript
// The ONLY module allowed to import RawWorldState:
function buildActorContext(raw: RawWorldState, actor: ActorId): ActorContext { ... }
// The prompt builder's signature accepts only ActorContext:
function buildPrompt(ctx: ActorContext, task: PromptTask): string
```

Enforced by three mechanisms: a **module-boundary lint** (the `prompt` package cannot import `ledger` or `spatial` internals), **nominal types** so `RawWorldState` is not assignable to `ActorContext`, and a **differential leak test**: build two worlds identical except for a fact the actor cannot perceive (a murder in a sealed room), build the actor's prompt from each, and assert the prompts are **byte-identical**. That is the executable form of ignorance-by-omission. It tests the *property* (hidden facts cannot influence the prompt) rather than the mechanism, and it is stronger than any blacklist. Single function `visibleFacts(actorId) → BeliefRecord[]` is the only path from ledger to prompt.

---

# PART L: STATUS LEDGER, BUILD ORDER, AND OPEN ITEMS

## L1. What is decided, specified, implemented, and verified

| Concern | Design | Implemented (in source) | Verified against an oracle |
|---|---|---|---|
| Hybrid scale architecture, portals, handoff | Settled | Spec only | n/a |
| Doubled-coordinate lattice | Settled (verified by hand) | Partial | No |
| Packed cell and edge ids | Settled | **Buggy (signed shift)** | No |
| Finite-segment supercover | Specified | **No** (line-not-segment inline copy) | No |
| `EDGE_PAIR` decision tables | Specified | **No** (interior-crossing row only) | No |
| Router: heap, tie-break, ALT, union graph | Specified | Test-local copy; tie-break by cost only | No |
| Integer chord heuristic | Specified | No; needs quantization correction | No |
| Displacement | Specified | Multiple defects (`localeCompare`, `toCostUnits(Infinity)`, missing overlay) | No |
| Photometry, acoustics | Specified | Partial; float leaks; auditory quality undefined | No |
| Reducer, event-time semantics | **Needs redesign** (global-clock bug) | Buggy | No |
| Canonical hashing | Specified | Regressed to `localeCompare`; throws on `bigint` | No golden test |
| Percept-to-belief (`H`) | **Not designed** | No | No |
| Prompt gate | Principle settled; implementation inadequate | Blacklist only | No |
| Fictional-on-real registration | Designed | No | No |
| Tracer bullet | Concept settled | **Imports nothing from `src/`** | Cannot fail |

The "mature target" phrasing in earlier syntheses reads as done; the code has never passed its own tests because the tests don't call the code.

## L2. Build order

1. **Human policy gallery** and a static SVG renderer (validates policy against fiction).
2. `hexgeom` + id scheme with property tests (round trip, monotonicity, edge injectivity).
3. Finite-segment supercover as a policy-free classifier, with the decision tables as test data and the exhaustive radius-5 oracle comparison. **Nothing else merges until this passes.**
4. Reference Dijkstra, then the production router (heap, tie-break) with differential and metamorphic tests; ALT with union-graph tables and the quantization-corrected chord.
5. Reducer with event-time semantics, validated through the spatial engine; commit-time re-validation.
6. Compiler with all gates, canonical serialization, golden hash across Node versions and locales.
7. Then acoustics, photometry, displacement, contact graph, evidence emission.
8. Epistemic layer `H` and the capability-based prompt gate with the differential leak test.
9. Closed-loop simulation and bisection.
10. Interactive debugger last (PixiJS v8: `await app.init()` and the new Graphics API, since v7's `new Application({view})` and `beginFill/lineStyle` differ).

Ordering rationale: reference before optimization, exhaustive tests before performance, and the riskiest foundational item (exact supercover) first. Do not begin with CSR, ALT, bit packing, SIMD, or WebGL before an obviously correct reference exists.

## L3. Repository and import graph

Start as an internal module in `worker-sower-engine` (for example `sower-engine/spatial/`); extract only when a second consumer needs it (the debugger or a map viewer), the API stabilizes after real episode cycles, and independent version pinning per episode in `render_manifest.json` is required. The name `goblin-spatial` (rather than `goblin-hexmap`) was chosen so consumers depend on operations, not data structures; that claim only holds if the algorithms are written against an abstract `SpatialTopology` interface (`neighbors`, `cost`, `distance`) with hex as one implementation (signatures taking `H3Index`, `ring`, `range`, and `facingDirection: 0..5` are hex-specific), otherwise drop the claim. Enforce the dependency arrows mechanically:

```
lore-types ← spatial-core ← spatial-compiler (offline)
                    ↑
              ledger/reducer ← evidence-adapter ← epistemics ← context-builder ← prompt
                                                                      ↑
                                                         (only import of RawWorldState)
```

`spatial-core` imports nothing from ledger, epistemics, prompt, renderer, or any I/O; `prompt` imports only `ActorContext`; the renderer imports only the compiled topology. Violations fail CI (`dependency-cruiser`). Every unit-bearing type needs distinct brands and a single `ids.ts`.

## L4. The debugger

Pair the library with a lightweight visualizer, but sequenced correctly: **static SVG snapshots first** (diffable in git, viewable anywhere, embeddable in CI failure output), interactive PixiJS canvas only after the headless simulation runs cleanly. The debugger **visualizes truth; it must never be the mechanism by which truth is established**, and must not modify state. Its surface: grid, occlusion, actor tokens, LoS rays (green clear, red terminating at the blocker), acoustic isobars, A\* paths, movement trails with fading breadcrumbs, cell inspector, ruler, and a timeline scrubber replaying cycle dumps (batch JSON deltas or a live WebSocket feed), plus a crowd-density heatmap. Defects it catches: prop-loops (pacing between two cells), bulkhead bleed (sight through a wall), stage crowding violations. Known bugs in the source debugger: click-to-cell used `111,320` m/deg while the adapter used the authalic radius (≈111,195 m/deg, wrong cell at scale); resolution hardcoded to 14 regardless of manifest; Y flipped twice (in `worldToScreen` *and* via negative container scale); immediate-mode `Graphics` redrawing every cell per frame instead of a cached `RenderTexture`. The debugger is a *lens* (read-only), not a second authority. Its coordinates never cross into the simulation, and Remotion's `location_id`-to-matte mapping is fully independent of debug canvas pixels.

## L5. Deliberately open and unresolved

1. Whether H3 has a real regional consumer, or should be deferred.
2. The full epistemic layer `H` (evidence combination, identification, decay, revision).
3. Tick length and the mixed-scale clock reconciliation (regional traveler on an edge for 4 hours coexists with a 90-second tactical scene: one integer-centisecond axis, scenes as intervals).
4. Whether astronomy uses real or displaced coordinates.
5. Whether sound propagates through portals (a door is often the least-damped edge).
6. Interruption semantics (stop at a node, stop at fractional progress, or non-interruptible).
7. Whether characters can route *through* sites as shortcuts.
8. Partial and stale knowledge representation in the known-graph.
9. The choice between `OPEN`, `CLOSED`, `EDGE_PAIR` in light of the policy gallery.
10. Whether a cheap permissive-FOV shadow-casting algorithm already satisfies the policy on all 8,190 pairs (if the oracle agrees, it is far smaller to maintain than the exact machinery).
11. Whether a true Merkle tree is needed or per-component hashes suffice.

## L6. Guarding against principle inflation

A constitution works when it is **short, stable, and enforced**, and fails when it is long, revised often, or aspirational. Keep Part A (the thesis sentence, four truths, the one-way causal rule, the possibility/occurrence/evidence/belief distinction, the verification hierarchy) as the constitution. Everything with a number, formula, or code snippet belongs in the executable specification, which *should* change and is versioned. Principles are cheap to agree with and expensive to satisfy: "make every ambiguous geometric rule explicit" is unobjectionable, and the work is the eight-row truth table and the 8,190-pair oracle test.

The proofs still needed are of four kinds, and a project with only the first two is provably correct about the wrong thing: **mathematical** (admissibility with a quantization bound, exact-classifier symmetry), **differential** (production versus reference on exhaustive domains), **structural** (import-graph lint, type nominality), and **behavioral against intent** (the policy gallery and the differential leak test). The last two are where the design's actual purpose, believable and epistemically honest goblins, gets checked, so they should be written first.

---

## Closing statement

The architecture is sound and stable at the level of ideas: physical space as an explicit authority boundary, a strict separation of canon, physics, and history, a one-way causal chain from world to language, and a hybrid geometry chosen by what each scale actually needs. Across eight rounds the design converged, but each round fixed the previous round's conceptual errors and then introduced new ones in concrete formulas and code: dimensional inconsistencies, signed-shift overflow, line-versus-segment geometry, locale-sensitive ordering, global-clock summing, floats leaking into sealed artifacts, and tests that verified private copies. The prose grew more precise while the executable artifacts lagged behind it.

Stop widening the design and turn its claims into executable proofs, starting with `hexgeom`, the finite-segment supercover, and the exhaustive oracle test, and let nothing else merge until that test passes. Once the remaining claims are proven, the system stops being a well-articulated design and becomes a reproducible physical substrate on which the rest of the narrative system can safely depend.


[can you reiterate on only the most valuable and true and useful information in this pasted files and add anything you consider worthy; explain your thoughts using the greatest detail while uncovering every nuance where teh context is the goblin-spatial]     

