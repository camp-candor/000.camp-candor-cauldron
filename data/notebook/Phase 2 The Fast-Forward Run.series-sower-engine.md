# Phase 2: The Fast-Forward Run

_Gemini · 16 messages · exported Oct 27, 2026_

### You

{{FOCUS : ### IV. Concrete Narrative Walkthrough: The MVP in Action

To see how this loop operates in practice, trace a single complete cycle of the MVP inside the *Under the Floorboards* storyworld:

```text

┌────────────────────────────────────────────────────────────────────────────────────────┐

│ 1. GENESIS (Tick 0) │

│ Bog sits at The Warm Pipe holding an iron scraper. Wart stands two rooms away in │

│ the pantry scraping tallow. Bog's paranoia is at 2,400 bp. Grievance intensity = 2. │

└───────────────────────────────────┬────────────────────────────────────────────────────┘

│

▼ [Command: Fast-Forward 36,000 Ticks (6 minutes)]

┌────────────────────────────────────────────────────────────────────────────────────────┐

│ 2. FAST-FORWARD RUN (36,000 Ticks process in 410 ms) │

│ • Pantry room sleeps in "The Void" (0 CPU cycles burned). │

│ • Wart finishes scraping, enters corridor, advances along spline p(t). │

│ • Warm Pipe ticks cold: ambient temperature drops -300 bp. │

│ • Bog's paranoia climbs +1,200 bp from acoustic pipe groans. │

│ • Wart arrives at The Warm Pipe at Tick 28,410. │

└───────────────────────────────────┬────────────────────────────────────────────────────┘

│

▼ [Proximity d_axial <= 1 && Grievance >= 8,000 bp]

┌────────────────────────────────────────────────────────────────────────────────────────┐

│ 3. THE DRAMATIC INTERCEPT (Tick 28,410) │

│ • THE CLOCK BRAKE ENGAGES: Global ticking freezes. │

│ • Tabletop Roll: Bog (2d6+2) vs Wart (2d6-1). Result: 9 vs 7 (Margin: +2). │

│ • Outcome: COSTLY_WIN. Bog forces Wart to retreat, but takes +450 bp strain. │

│ • Emits ScenePlan IR: Mandates Wart drops grease bucket; Bog claims floor seam. │

└───────────────────────────────────┬────────────────────────────────────────────────────┘

│

▼ [Showrunner opens writer.astro]

┌────────────────────────────────────────────────────────────────────────────────────────┐

│ 4. THE EXTRACTION & SETTLEMENT │

│ • Fountain draft: Bog bars Wart's path; Wart snarls and kicks the grease bucket. │

│ • Invariant Linter: Asserts Wart used single good arm; verifies 0 secret leaks. │

│ • Local TTS synthesizes 4 dialogue stems; ffprobe measures 18.4 seconds. │

│ • Elapsed Ticks: ceil(18,400 ms / 10) = 1,840 ticks consumed. │

│ • Atomic SQL Commit: Bog +450 bp strain; bucket moved to floor; grievance cooldown. │

│ • Resumption: Master clock jumps to Tick 30,250; world resumes fast-forwarding. │

└────────────────────────────────────────────────────────────────────────────────────────┘

```

}}

@extreme-details

### Gemini

The operational execution of the Minimum Viable Product (MVP)—formally architected as the Minimal Validated Core (MVC) or the end-to-end "Tracer Bullet"—proves the central thesis of the transmedia studio: **simulation determines reality, prose dramatizes the outcome, and causal narrative continuity can be governed as an event-sourced compiler at $T_0 = \$0.00$ without burning GPU compute cycles**.

The walkthrough within the *Under the Floorboards* storyworld traces the complete lifecycle across four deterministic phases, bridging Axis A (Mechanical World Truth & State) and Axis B (Linguistic Dramatization & Acoustic Measurement):

```plaintext
========================================================================================================================
                                     MINIMAL VALIDATED CORE: EXECUTION TIMELINE
========================================================================================================================
  Tick 0                Tick 0 ──► 28,410             Tick 28,410               Tick 28,410 ──► 30,250       Tick 30,250
    │                          │                           │                              │                       │
    ▼                          ▼                           ▼                              ▼                       ▼
┌──────────────┐      ┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────┐
│  1. GENESIS  │ ───► │ 2. FAST-FORWARD │ ────► │ 3. DRAMATIC INTERCEPT│ ────► │ 4. EXTRACTION &      │ ────► │ 5. RESUMPTION│
│  (State S_0) │      │    (Fast Sim)   │       │   (Clock Brake &     │       │    SETTLEMENT        │       │   (S_t+1)    │
│              │      │                 │       │    Stage 4 Duel)     │       │ (Fountain AST & TTS) │       │              │
└──────────────┘      └─────────────────┘       └──────────────────────┘       └──────────────────────┘       └──────────────┘
  Immutable Root        36,000 Ticks /            Axial Proximity d<=1           18.4s Acoustic Audio           Clock advances
  H_root stamped        410 ms wall-clock;        Boil-Over I >= 8,000 bp;       1,840 Ticks quantized;         by +1,840 ticks;
  at zero VRAM          Corridor Splines          Costly Win (Margin +2)         Atomic SQLite Commit           Fast-sim loops
========================================================================================================================
```

### Phase 1: Primordial Genesis ($S_0$) at Tick 0

The universe instantiates from a cold state ($t = 0$) using zero GPU compute and incurring zero runtime API billing. Reality is compiled directly from disk-level, byte-zero frontmatter markdown dossiers into an in-memory relational graph and state snapshot (`compiled/bible-state.json`).

#### 1. Ingress Dossiers and the Byte-Zero Law

Initial conditions are parsed by `scripts/compile.ts`:

- **The Byte-Zero Law:** Every dossier (`bog.md`, `wart.md`, `the_warm_pipe.md`, `the_pantry_wall.md`, `grv_tallow_scraping.md`) must feature the YAML delimiter `---` strictly at byte offset 0 to eliminate byte-order-mark (BOM) corruption and arbitrary whitespace.
- **Integer Basis-Point Normalization:** Floating-point representations are strictly forbidden in character metrics and room attributes to eliminate floating-point drift across execution runtimes. All scalar variables are bounded integers within $[0, 10{,}000]$ basis points (bp).
- **Initial State Matrix ($S_0$):**
  - **Bog (`char_bog`):** Positioned at `loc_warm_pipe`. Paranoia baseline is locked at $2{,}400\text{ bp}$. Equipment slot contains `item_iron_scraper` (Weight class: Weight). Active status: `vigilant_idle`.
  - **Wart (`char_wart`):** Positioned at `loc_pantry_wall` (two topological graph edges away). Somatic capacity: single functional arm (`arms_available: 1`), with his left arm locked in a damaged mask. Equipment slot contains `item_grease_bucket`. Active action: scraping tallow.
  - **Active Grievance (`grv_tallow_scraping`):** Dyad `[char_bog, char_wart]` carries an active resentment intensity of $I_{\text{curr}} = 2$ ($2{,}000\text{ bp}$). Cooldown ticks $= 0$. Escalation ceiling is fixed at $I_{\max} = 8{,}000\text{ bp}$.
  - **Environmental Substrate:** `loc_warm_pipe` ambient temperature is pinned to $6{,}500\text{ bp}$ with an acoustic damping factor of $1{,}500\text{ centi-decibels}$.

#### 2. The Three-Pass Compiler Gauntlet

The compilation harness establishes determinism prior to simulation runtime:

1. **Pass 1 (Bounds, Shapes, and Somatic SAT):** Validates all YAML payloads against strict Zod schemas (`agent.schema.ts`, `spatial.schema.ts`, `debt.schema.ts`). Evaluates somatic satisfiability: an actor cannot hold more items than available functional limbs ($\text{ItemsHeld} \le \text{ArmsAvailable}$).
2. **Pass 2 (Referential Integrity and Graph Acyclicity):** Runs an exhaustive foreign-key index sweep asserting zero orphaned pointers. Executes a three-color Depth-First Search (DFS) across all narrative escalation branches (`spawns_on_max_escalation`) to mathematically guarantee that grievance propagation forms an acyclic Directed Acyclic Graph (DAG) with no infinite cycles ($A \to B \to A$).
3. **Pass 3 (Canonical Serialization and Cryptographic Sealing):** Sorts all keys alphabetically via RFC 8785, removes dynamic wall-clock timestamps, and hashes the normalized UTF-8 payload into the master Merkle root digest:
  $$
  H_{\text{root}} = \text{SHA-256}(\text{CanonicalJSON}(S_0)) \text{}
  $$
  This digest is sealed into `bible-state.json`, deep-frozen with `Object.freeze()`, and stamped into the database as the baseline reality ledger.

### Phase 2: The Fast-Forward Run ("Fast Sim")

A director or automated batch scheduler dispatches an instruction to leap forward 36,000 ticks ($6\text{ minutes}$ of diegetic time at $10\text{ ms}$ centisecond tick intervals). The engine evaluates state transitions without rendering graphics or processing natural language text.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FAST-FORWARD SIMULATION DISPATCH (Ticks 0 ──► 28,410)                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Tick Rate: 100 ticks = 1.0 second diegetic time (Centisecond Monotonic Authority)                   │
│ • Wall-Clock Compute: 36,000 requested ticks evaluate in 410 ms (Throughput: ~87,800 ticks/sec)        │
│                                                                                                        │
│ [Subsystem Delta Trajectory]                                                                           │
│ 1. The Void Partitioning: loc_pantry_wall evaluated analytically; zero CPU burned while unobserved.   │
│ 2. Spline Kinematics: Wart finishes tallow chore; enters corridor on analytical trajectory p(t).      │
│ 3. Thermodynamic Decay: loc_warm_pipe ticks cold (-300 bp ambient heat loss).                         │
│ 4. Acoustic Stress: Thermal contraction groans broadcast; Bog's paranoia climbs +1,200 bp.            │
│ 5. Trajectory Intersect: Wart enters loc_warm_pipe threshold at Tick 28,410.                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Monotonic Tick Authority & Partitioned Dormancy

- **Centisecond Resolution:** Time advances via integer increments through sequential `TICK_ADVANCED(n)` ledger events. Real-time system clocks (`Date.now()`, `performance.now()`) are completely barred from the state machine.
- **Zero-CPU "Void" Execution:** Unobserved tactical zones (such as `loc_pantry_wall`) enter a dormant state. Environmental factors and background tasks evaluate algebraically via closed-form functions ($f(\Delta t)$) rather than running individual per-tick frame simulations, achieving zero CPU cycles burned during idle intervals.
- **Analytical Spline Movement:** Once Wart finishes scraping tallow, his path through the crawlspace corridor does not run collision-detection raycasts on every tick; it follows an analytical spline equation $p(t)$ mapping coordinates to tick intervals.

#### 2. Thermodynamic and Acoustic Escalation

- **Thermal Contraction:** As the human occupants of the house sleep, the central heating pipe cools down. The ambient temperature at `loc_warm_pipe` drops by $-300\text{ bp}$.
- **Acoustic Transients:** Cooling metal causes the pipe joints to contract and groan loudly. Because goblins live in acute terror of discovery from the Upstairs, these acoustic transients register as environmental threats.
- **Psychological Pressure Accumulation:** The acoustic noise triggers Bog’s internal meter. His paranoia scalar spikes by $+1{,}200\text{ bp}$, rising from $2{,}400\text{ bp}$ to $3{,}600\text{ bp}$. Concurrently, the unaddressed grievance between Bog and Wart accumulates friction points as Wart approaches the threshold carrying unwashed kitchen scrapings.

### Phase 3: The Dramatic Intercept at Tick 28,410

At Tick 28,410, the continuous background simulation trips a hard mathematical threshold, engaging the **Clock Brake** and halting the fast-forward run.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ THE CLOCK BRAKE TRIPS (Tick 28,410)                                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TRIPWIRE EVALUATION:                                                                                   │
│ 1. Axial Distance: d_axial(Bog, Wart) = 1 (Actors co-located within melee conversational reach)       │
│ 2. Resentment Intensity: I_curr >= 8,000 bp (Ceiling breached; confrontation forced)                  │
│                                                                                                        │
│ ACTION: Global TICK_ADVANCED loop frozen. Memory snapshot S_28410 locked with transactional lease.     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 4 OPPOSED 2d6 PRE-RESOLUTION:                                                                    │
│ Reality is determined BEFORE authoring prose or streaming LLM tokens.                                  │
│                                                                                                        │
│   Bog (Aggressor):  2d6 (Roll: 7) + Spite (+2) - SomaticStrain (0)           = Score 9                │
│   Wart (Defender):  2d6 (Roll: 8) + Cunning (0) - ImpairedArm (-1)           = Score 7                │
│   Net Margin (Δ):   9 - 7 = +2                                                                        │
│                                                                                                        │
│ TAXONOMY CLASSIFICATION: COSTLY_WIN (Margin +1 to +3 band; 35.3% probability mass)                     │
│ MANDATED MUTATIONS:                                                                                    │
│ • Bog achieves territorial objective (holds the pipe seam; forces Wart's retreat).                    │
│ • Winner sustains physical friction: Bog absorbs +450 bp somatic strain.                              │
│ • Wart drops the item_grease_bucket onto the floorboard seam.                                          │
│ • ScenePlan IR emitted as an immutable contract for the authoring layer.                              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Tripping the Clock Brake

The simulation engine evaluates the brake trip predicate on every spatial transition:

```typescript
function evaluateBrakeTripPredicate(
  room: ActiveRoomState,
  dyad: CharacterDyad,
  grievance: GrievanceRecord
): boolean {
  const distance = goblinSpatial.getAxialDistance(dyad.actorA.coord, dyad.actorB.coord);
  const isCollocated = distance <= 1;
  const isBoilingOver = grievance.intensity_bps >= grievance.escalation_ceiling_bps;
  const isEligible = grievance.cooldown_ticks === 0;

  return isCollocated && isBoilingOver && isEligible;
}
```

At Tick 28,410:

- Axial proximity evaluates to $d_{\text{axial}} \le 1$.
- Resentment intensity hits $I_{\text{curr}} \ge 8{,}000\text{ bp}$ ($I_{\max}$).
- The central engine suspends the dispatch loop, freezes the state snapshot $S_{28410}$ in system memory, and acquires an execution lease (`status = 'ENGAGED_IN_SCENE'`) in SQLite/D1.

#### 2. Stage 4 Mechanical Pre-Resolution

Following the studio’s constitutional axiom—**"Simulation determines reality; prose merely dramatizes the outcome"**—the physical consequences of the collision are resolved mathematically before any text is drafted:

$$
\text{Roll}_A = 2\text{d}6 + \text{Hegemony}_A + \text{StringsHeld}_{A \to B} - \text{SomaticStrain}_A \text{}
$$

$$
\text{Roll}_B = 2\text{d}6 + \text{Hegemony}_B + \text{StringsHeld}_{B \to A} - \text{SomaticStrain}_B \text{}
$$

$$
\Delta_{\text{margin}} = \text{Roll}_A - \text{Roll}_B \text{}
$$

- **Bog’s Pool:** Rolls $2\text{d}6 = 7$. Base modifier is $+2$ (Spite/Hegemony bonus). Somatic strain is $0$. Total score $= 9$.
- **Wart’s Pool:** Rolls $2\text{d}6 = 8$. Modifier from single-arm debuff is $-1$. Total score $= 7$.
- **Outcome Margin:** $\Delta_{\text{margin}} = 9 - 7 = +2$.

In the discrete difference distribution across 1,296 permutations, a margin of $+2$ falls into the **`COSTLY_WIN`** band ($\vert D \vert \in \{1, 2, 3\}$):

- Bog wins the confrontation and maintains dominance over the warm pipe seam.
- The victory comes at an immediate biological cost: Bog absorbs $+450\text{ bp}$ of somatic strain from overexertion.
- Wart is repelled and drops the contested `item_grease_bucket`.

#### 3. Compilation of the ScenePlan IR

The resolved tabletop math is stamped into an immutable intermediate representation (`ScenePlan IR`), which establishes the contract that the authoring tool must fulfill:

```json
{
  "scene_plan_id": "sp_28410_bog_wart",
  "tick_origin": 28410,
  "participants": ["char_bog", "char_wart"],
  "location": "loc_warm_pipe",
  "mechanical_tier": "COSTLY_WIN",
  "mandated_winner": "char_bog",
  "mandated_loser": "char_wart",
  "required_exit_conditions": {
    "item_transfers": [
      { "item_id": "item_grease_bucket", "from": "char_wart", "to": "floor_seam" }
    ],
    "somatic_deltas": [
      { "agent_id": "char_bog", "strain_delta_bp": 450 }
    ],
    "spatial_displacements": [
      { "agent_id": "char_wart", "target_exit_corridor": "corr_splinter_gap" }
    ]
  }
}
```

### Phase 4: The Extraction & Settlement

The showrunner opens the authoring interface at `writer.astro` to draft the scene. Text entry is constrained by verification linters, after which acoustic measurement sets the diegetic clock and triggers an atomic state settlement.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ THE EXTRACTION & SETTLEMENT PIPELINE (Phase 4)                                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. FOUNTAIN SCREENPLAY INGRESS:                                                                        │
│    Showrunner drafts dialogue matching the ScenePlan IR exit criteria.                                 │
│    Wart kicks the grease bucket across the timber seam; Bog bars his path.                            │
│                                                                                                        │
│ 2. REAL-TIME $T_0 = $0.00 INVARIANT LINTER:                                                           │
│    • Somatic Linter: Verified Wart used only his single functional arm.                                │
│    • Epistemic Gate: Asserted 0 forbidden secrets leaked (cosine similarity probe < 0.35).             │
│    • Lexical Scanner: Noun chunks verified against possessions/*.md inventory.                         │
│                                                                                                        │
│ 3. ACOUSTIC TIME QUANTIZATION (Local TTS + ffprobe):                                                   │
│    • Audio Service (:8000) synthesizes 4 WAV stems at 48 kHz.                                          │
│    • ffprobe measures raw dialogue duration: exactly 18,400 ms (18.4 seconds).                         │
│    • Simulation Tick Derivation: ceil(18,400 ms / 10 ms) = 1,840 elapsed ticks.                       │
│    • Downstream Video Frame Derivation: ceil(18.4 * 24 fps) = 442 frames.                             │
│                                                                                                        │
│ 4. ATOMIC RELATIONAL COMMIT (S_28410 ──► S_30250):                                                     │
│    • Bog: somatic_strain += 450 bp.                                                                    │
│    • Grease Bucket: holder re-bound to environment floor cell.                                         │
│    • Grievance: cooldown_ticks = 12,000; intensity reset to base.                                      │
│    • Invalidation: downstream dependent scenes marked is_dirty = 1.                                   │
│    • Merkle Root Resealed: H_30250 = SHA-256(H_28410 || EventData).                                    │
│                                                                                                        │
│ 5. RELEASE THE CLOCK BRAKE:                                                                            │
│    Master simulation clock advances: 28,410 + 1,840 = Tick 30,250. Fast-forward resumes.               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Ingress & Screenplay Compilation

The writer drafts the scene in standard `.fountain` screenplay notation:

```code
INT. THE WARM PIPE - NIGHT

Bog stands over the iron floor seam, scraper held low like an axe.

BOG
One step more and I scrape that tallow off your ribs, boy.

Wart halts, breathing shallowly through his nose. His good hand trembles against the bucket handle.

WART
It’s cold in the wall, Bog. Mum wants the grease dried before first light.

BOG
Mum’s asleep. The pipe belongs to whoever's blood can keep it warm. Back into the gap.

Wart bares his teeth, steps back, and kicks the grease bucket across the seam.

WART
Choke on the fat, then.
```

#### 2. Invariant Linter Verification

Before this text is passed downstream, the local linter evaluates structural compliance:

- **Somatic SAT Audit:** Wart has only one functional upper limb (`arms_available: 1`). The linter parses all action verbs and confirms that Wart carried the bucket, gestured, and kicked without invoking two simultaneous hands.
- **Epistemic Gate Probe:** The NLP gate extracts semantic embedding vectors from the dialogue ($V_{\text{probe}}$) and compares them against forbidden canonical lore tokens ($V_{\text{secret}}$, such as the true origin of *the_famine*):
  $$
  \text{CosineSim}(V_{\text{probe}}, V_{\text{secret}}) \le \tau_{\text{leak}} \quad (\tau_{\text{leak}} = 0.35) \text{[cite: 5]}
  $$
  The score passes well below the threshold, confirming zero secret leaks occurred.
- **Lexical Inventory Whitelist:** All tangible physical nouns (`iron scraper`, `grease bucket`, `tallow`, `pipe`) are reconciled against `possessions/*.md` to prevent unindexed hallucinated objects from entering the canon.

#### 3. Acoustic Time Quantization (The Master Clock)

The simulation rejects estimated speaking speeds or arbitrary author timing. **Physical sound acts as the master clock for the narrative universe**:

1. The four spoken dialogue lines are submitted to the local Text-to-Speech (TTS) microservice operating at `localhost:8000`, producing four uncompressed 48 kHz WAV stems.
2. `ffprobe` analyzes the synthesized stems on disk and measures the total acoustic duration down to the millisecond: exactly $18{,}400\text{ ms}$ ($18.4\text{ seconds}$).
3. **Simulation Tick Quantization:** At $10\text{ ms}$ per tick, the diegetic duration converts into discrete integer ticks:
  $$
  \Delta_{\text{ticks}} = \left\lceil \frac{18{,}400\text{ ms}}{10\text{ ms/tick}} \right\rceil = 1{,}840\text{ ticks} \text{}
  $$
4. **Video Timeline Quantization:** For downstream Remotion compositing, the audio duration converts into discrete video frames at 24 fps:
  $$
  \text{Total Frames} = \left\lceil \frac{18{,}400\text{ ms}}{1{,}000} \times 24 \right\rceil = 442\text{ frames} \text{}
  $$

#### 4. Atomic SQL Commit ($S_{28410} \to S_{30250}$)

The engine compiles a `state_delta.json` payload and commits the mutations into Cloudflare D1/SQLite within an isolated transaction:

```sql
BEGIN TRANSACTION;
  -- Apply somatic trauma
  UPDATE agent_state 
  SET somatic_strain_bp = somatic_strain_bp + 450 
  WHERE agent_id = 'char_bog';

  -- Reassign item possession to the floor
  UPDATE inventory_ledger 
  SET holder_entity_id = 'floor_seam_loc_warm_pipe', dropped_at_tick = 28410 
  WHERE item_id = 'item_grease_bucket';

  -- Move Wart into the retreat corridor
  UPDATE agent_spatial 
  SET coord_axial = 'corr_splinter_gap_01' 
  WHERE agent_id = 'char_wart';

  -- Reset grievance tension and apply cooldown
  UPDATE grievance_state 
  SET intensity_bps = 2000, cooldown_ticks = 12000 
  WHERE dyad_id = 'char_bog_char_wart';

  -- Flag downstream scenes touching modified entities as stale
  UPDATE scene_manifests 
  SET is_dirty = 1 
  WHERE target_entity_id IN ('char_bog', 'char_wart', 'item_grease_bucket');
COMMIT;
```

The state hash updates to reflect the new reality:

$$
H_{30250} = \text{SHA-256}(H_{28410} \mathbin{\Vert} \text{EventData}_{28410 \to 30250}) \text{}
$$

#### 5. Releasing the Clock Brake

With the database sealed and the Merkle root updated:

- The engine releases its transactional execution lease.
- The master simulation clock advances forward by the measured scene duration:
  $$
  t_{\text{resume}} = 28{,}410 + 1{,}840 = 30{,}250\text{ ticks} \text{}
  $$
- Dormant zones apply algebraic catch-up integration across the $1{,}840\text{-tick}$ gap.
- The global dispatcher resumes the autonomous fast-forward loop, processing the remaining $5{,}750\text{ ticks}$ of the original $36{,}000\text{-tick}$ instruction.

### Comparative State Matrix Across the Cycle

| Metric / Parameter | Tick 0 (Genesis) | Tick 28,410 (Brake Trip) | Tick 30,250 (Resumption) | Subsystem Authority |
| --- | --- | --- | --- | --- |
| **Global Master Tick** | $0$ | $28{,}410$ | $30{,}250$ | `worker-sower-engine` |
| **World Execution State** | Immutable Cold ($S_0$) | Fast-Forward Frozen | Resumed Autonomous Run | Execution Lease Manager |
| **Bog Spatial Location** | `loc_warm_pipe` | `loc_warm_pipe` | `loc_warm_pipe` | `goblinSpatial`[cite: 1] |
| **Bog Somatic Strain** | $0\text{ bp}$ | $0\text{ bp}$ | $450\text{ bp}$ | Somatic SAT Evaluator[cite: 1] |
| **Bog Paranoia Meter** | $2{,}400\text{ bp}$ | $3{,}600\text{ bp}$ | $3{,}600\text{ bp}$ | Meter Engine |
| **Wart Spatial Location** | `loc_pantry_wall` | `loc_warm_pipe` ($d_{\text{axial}} = 1$) | `corr_splinter_gap` | `goblinSpatial`[cite: 1] |
| **Wart Equipment Slot** | `item_grease_bucket` | `item_grease_bucket` | *Empty* (Dropped) | Relational Inventory Ledger[cite: 1] |
| **Grievance State** | $I = 2{,}000\text{ bp}$ | $I = 8{,}000\text{ bp}$ (Boil-Over) | $I = 2{,}000\text{ bp}$ (Cooldown: 12k) | Dyadic Tension Ledger[cite: 1] |
| **Physical Sound** | Unmodeled | Unmodeled | $18{,}400\text{ ms}$ (4 WAV stems) | `audio-microservice` + `ffprobe`[cite: 1] |
| **Composited Frames** | $0\text{ frames}$ | $0\text{ frames}$ | $442\text{ frames}$ (at 24 fps) | `RemotionPlayerIsland` |
| **Cryptographic Root** | $H_{\text{root}} = H_0$ | $H_0$ | $H_{30250}$ | SHA-256 Merkle Sealer[cite: 1, 6] |
| **Dirty Cache State** | `is_dirty = 0` | `is_dirty = 0` | `is_dirty = 1` (Downstream scenes) | Reactive Dependency Engine[cite: 1] |

This sequence validates the core design invariant: complex emergent narrative, strict anatomical and spatial constraints, and immutable historical continuity are proven and audited completely at $T_0 = \$0.00$, leaving heavier video generation models to act purely as downstream projection workers.

### You

{{FOCUS : Phase 2: The Fast-Forward Run ("Fast Sim") }}

@extreme-details

### Gemini

### I. Operational Philosophy and Theoretical Foundations

Within the studio’s transmedia architecture, **Phase 2: The Fast-Forward Run ("Fast Sim")** represents the core operational realization of the **"Wind-Up Clockwork Machine"**. It operates under the foundational constitutional axiom: **probabilistic models execute constrained tasks, while deterministic systems decide what is allowed to be true**.

Narrative meaning and physical history belong strictly to **Axis A** (the deterministic simulation core and relational ledger), completely decoupled from **Axis B** (sensory media projection, neural speech, and GPU pixel diffusion). Phase 2 advances the physical and psychological state of the universe across thousands of ticks at zero GPU compute cost ($T_0 = \$0.00$), without rendering a single frame of video, sampling neural audio, or streaming LLM dialogue tokens.

```plaintext
========================================================================================================================
                                     AXIS A vs. AXIS B: THE FAST-FORWARD SEAM
========================================================================================================================

  AXIS A: AUTHORITATIVE SIMULATION KERNEL (RIG 1 / CPU / V8 ISOLATES)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Integer Clockwork: TICK_ADVANCED(n) centisecond discrete events                                       │
  │ • The Tri-Tier Spatial Partition: Tactical Hot-Set vs. Analytical Splines vs. The Void[cite: 5, 7, 13]         │
  │ • Pure Mathematical State Reducer: S_{n+1} = R(S_n, E_n, \sigma_n)[cite: 11, 15]                                │
  │ • Unified Pressure Meter Dynamics: Bounded integer stress & thermodynamic decay                   │
  │ • Throughput: 36,000 ticks processed in 410 ms (~87,800 ticks/sec at ~$0.001/event)[cite: 1, 2]                 │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           │ Trips Clock Brake at Tick 28,410
                                                           ▼
  AXIS B: DOWNSTREAM SENSORY PROJECTION (RIG 2 / HIGH-VRAM SILICON) ── [COMPLETELY DORMANT IN PHASE 2]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ❌ 0 MB Dedicated GPU VRAM consumed[cite: 15, 28, 34]                                                           │
  │ ❌ Zero Neural TTS Vocoder threads (:8000) spawned[cite: 4, 9, 34]                                              │
  │ ❌ Zero Large Language Model token generation or ReAct loops[cite: 2, 4, 13]                                   │
  │ ❌ Zero Headless Chromium Remotion compositing passes[cite: 10, 28, 34]                                         │
  │ ❌ Zero ComfyUI / Wan 2.2 diffusion tensor evaluations[cite: 6, 14, 28]                                         │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

#### Why scrubbing to an arbitrary timecode is mathematically forbidden

In traditional non-linear video editing or 3D animation suites (e.g., Blender, Unreal Engine), an operator can scrub directly to an arbitrary timecode (e.g., Minute 06:00.00) because temporal curves are pre-baked. In an event-sourced narrative universe, **Tick 36,000 cannot exist until Ticks 0 through 35,999 have been computed sequentially**.

Reality is an immutable mathematical fold over historical state transitions:

$$
\text{State}_N = \text{fold}(\text{apply}_v, \, \text{State}_0, \, [E_1, E_2, \dots, E_N], \, \sigma) \text{}
$$

Where:

- $\text{State}_0$ is the deep-frozen genesis snapshot ($H_{\text{root}}$) sealed in system memory.
- $E_k$ represents the ordered, discrete state transition events emitted by the simulation loop.
- $\sigma$ is the deterministic pseudo-random number generator (PRNG) seed vector[cite: 6, 11].
- $\text{apply}_v$ is the version-pinned pure reducer function executing with zero network I/O and zero OS-dependent environment calls.

To inspect the universe six minutes into the future, the engine does not wait in real time, nor does it interpolate approximations. It commands the fast-forward runner to process 36,000 discrete integer ticks directly through the reduction kernel, completing the traversal in $410\text{ ms}$ wall-clock time.

### II. The Monotonic Tick Authority & Deterministic Mechanics

The simulation runner completely rejects real-time operating system clocks (`Date.now()`, `performance.now()`, `std::time::SystemTime`). Invoking real-time clocks within the state machine introduces non-deterministic thread jitter, OS scheduling race conditions, and runtime execution discrepancies between platforms.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        CENTISECOND MONOTONIC TIME AUTHORITY ARCHITECTURE                               │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Master Dispatch: TICK_ADVANCED(n) where Δt = 10 ms (100 ticks = 1.0 second diegetic time)    │
│                                                                                                        │
│       Tick 0                 Tick 100               Tick 28,410             Tick 36,000                │
│         │                       │                        │                       │                     │
│         ▼                       ▼                        ▼                       ▼                     │
│  [ Genesis S_0 ] ──────► [ T = +1.00s ] ───────► [ The Intercept ] ────► [ Target Ceiling ]            │
│    H_root locked          100 Ticks folded         Clock Brake Trips        (5,750 Ticks remain)       │
│                                                    Global Freeze                             │
│                                                                                                        │
│ CONCURRENCY & ORDERING LAWS:                                                                           │
│ • Deterministic Total Ordering: GlobalOrder = (T_sim, SiteId_code_unit, S_site)             │
│ • Serialization: Entity temporal locking via integer field busyUntil: Instant[cite: 6]                │
│ • Intra-Tick Tie-Breaking: Priority(A, t) = Truncate32(HMAC-SHA256(seed, A.id || t))   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Centisecond Resolution & Bounded Integer Quantization

- **Integer Centiseconds:** The simulation timeline advances strictly in integer centiseconds ($10\text{ ms}$ per tick)[cite: 6]. One second of diegetic time comprises exactly $100\text{ ticks}$[cite: 6]. A 6-minute fast-forward dispatch represents an exact invariant demand:
  $$
  \Delta_{\text{ticks}} = 6\text{ minutes} \times 60\text{ seconds/minute} \times 100\text{ ticks/second} = 36{,}000\text{ ticks} \text{}
  $$
- **The Bounded Integer Principle:** Floating-point values (`f32`, `f64`) are banned from authoritative branching logic, spatial routing, and psychological meters. IEEE 754 transcendental functions and division rounding behave with subtle sub-bit discrepancies across ARM64 (e.g., Apple Silicon Rig 1) and x86_64 (e.g., AMD Linux Rig 2 or edge servers). Over 36,000 chained ticks, these sub-bit variances accumulate into butterfly divergences that corrupt the Merkle hash. All scalar values are normalized into basis points ($\text{bp} \in [0, 10{,}000]$) or fixed-point centi-decibels ($\text{cdB}$).

#### 2. Intra-Tick Concurrency & Collision Ordering

When multiple agents or physical sub-systems act simultaneously within the same centisecond tick, the engine prevents race conditions via a two-phase protocol:

- **Phase 1 (Read & Propose):** Every entity evaluates its local slice of the state at tick start ($T_{\text{start}}$) and pushes a candidate action envelope into volatile memory.
- **Phase 2 (Arbitration & Commit):** If two actors target the same spatial portal or resource in the same tick, priority is resolved without `Math.random()`. The engine computes an HMAC-SHA256 digest of the master episode seed, the actor’s unique entity ID, and the current tick count[cite: 13, 23]:
  $$
  \text{Priority}(A, t) = \text{Truncate32}\Big(\text{HMAC-SHA256}\big(\text{Seed}_{\text{episode}}, \, A_{\text{id}} \mathbin{\Vert} t\big)\Big) \text{[cite: 13, 23]}
  $$
  Ties are broken deterministically by the unsigned UTF-16 code-unit sort order of the entity IDs. The losing actor emits an explicit `STALL` event, dynamically incrementing frustration without throwing exceptions or stalling the isolate.

### III. The Tri-Tier Spatial Partitioning & "The Void"

To evaluate 36,000 ticks in $410\text{ ms}$ (a throughput exceeding $87{,}800\text{ ticks per second}$), the engine enforces population and spatial stratification: *"Thousands of actors does not mean thousands of tactical simulations"*.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE TRI-TIER SPATIAL PARTITIONING                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: TACTICAL HOT-SET (Active Room: loc_warm_pipe)                                     │
│ • Continuous evaluation of spatial occupancy & acoustic bounds.                                        │
│ • Raycasting & sightline supercover subject to explicit work budgets: maxRaySteps: 64[cite: 10, 13]   │
│ • Bog resides here; paranoia and thermal decay evaluated incrementally.                                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: IN-TRANSIT KINEMATICS (Corridor Spline: corr_splinter_gap)[cite: 5, 6]                        │
│ • Wart completes chore at loc_pantry_wall; enters transit along spline p(t)                  │
│ • Continuous collision raycasting eliminated: 0 CPU per-tick pathfinding checks[cite: 6]              │
│ • Analytical convergence math: x(t) solved via BigInt Banker's Rounding                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: COLD DORMANT SECTORS ("The Void": loc_pantry_wall)[cite: 5, 6]                                │
│ • Completely evicted from active V8 isolate execution                                   │
│ • Zero CPU cycles burned; zero background threads spawned[cite: 1, 6]                                 │
│ • Evaluated lazily on wake via algebraic integration: S_wake = S_sleep + (Rate * Δt)[cite: 6, 7, 8]    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Tier 3: Dormancy in "The Void" (The Schrödinger Optimization)

When Wart finishes his initial task and vacates `loc_pantry_wall`, that topological node possesses zero observer entities.

- Rather than allocating CPU cycles to tick empty space, the engine drops the room into **The Void**.
- Unobserved rooms are unhydrated: background resource growth, dust accumulation, and mold spread are evaluated algebraically as a closed-form function of elapsed time:
  $$
  \text{State}_{\text{wake}} = \text{State}_{\text{sleep}} + \left(\text{DecayRate} \times \Delta t\right) \text{[cite: 6, 7]}
  $$
- This temporal reconstruction executes in $< 2\text{ ms}$ strictly upon an entity re-entering the cell boundary, preventing event-loop starvation within edge isolates.

#### 2. Tier 2: Analytical Spline Kinematics ($p(t)$)

Wart's transition from the pantry to the pipe room does not execute step-by-step hex pathfinding or continuous collision detection per tick.

- Movement along established crawlspaces and corridors conforms to an analytical spline $p(t)$ mapped over the topological edge distance $D_{\text{edge}}$[cite: 1, 5, 6]:
  $$
  P(t) = \frac{t - T_{\text{depart}}}{D_{\text{edge}}} \text{[cite: 5, 7]}
  $$
- **Exact Mid-Edge Convergence:** If another actor were traversing the corridor simultaneously, their encounter would not be detected via per-tick distance checks. The engine calculates the spatial intersection point analytically using BigInt arithmetic to prevent integer overflow, rounding with Banker's Rounding (`divRoundHalfEven`)[cite: 5, 13]:
  $$
  t_{\text{meet}} = \text{divRoundHalfEven}\left(\frac{D_A D_B + T_{A,\text{enter}} D_B + T_{B,\text{enter}} D_A}{D_A + D_B}\right) \text{[cite: 13]}
  $$
- Wart's transit time is determined analytically upon entering the corridor: he will intersect the axial boundary of `loc_warm_pipe` at precisely **Tick 28,410**. Until that exact tick, his kinematic state burns zero pathfinding compute[cite: 5, 6].

### IV. Thermodynamic Decay & Substrate Mechanics

The physical world of *Under the Floorboards* is an active, deteriorating participant in the state machine. The environment does not serve as static decorative lore; it updates within the pure event reducer on every tick interval.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               THERMODYNAMIC & ACOUSTIC STATE TRAJECTORY                                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ T = 0                                                                                   T = 28,410     │
│ [Pipe Temp: 6,500 bp] ──────── Heat Loss (-300 bp) ──────────────────────────► [Pipe Temp: 6,200 bp]   │
│                                      │                                                                 │
│                                      ▼ Contraction Physics                                             │
│                       [ Acoustic Transients: +85 cdB Groans ]                                          │
│                                      │                                                                 │
│                                      ▼ Acoustic Stress Coupling                                        │
│ [Bog Paranoia: 2,400 bp] ── Acoustic Transfer (+1,200 bp) ───────────────────► [Bog Paranoia: 3,600 bp]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Environmental Heat Loss Modeling

At $t = 0$, `loc_warm_pipe` is charged with an ambient temperature metric of $6{,}500\text{ bp}$.

- As human activity in the house Upstairs ceases during the night, hot water flow through the radiator line stops.
- Over the course of the fast-forward run, the radiator pipe sheds thermal energy into the uninsulated crawlspace timber at a rate determined by the structural damping factor.
- By Tick 28,410, ambient heat at `loc_warm_pipe` drops by $-300\text{ bp}$ to $6{,}200\text{ bp}$.

#### 2. Thermal Contraction and Acoustic Emission

- The cooling of the heavy iron pipe induces structural contraction.
- Metal friction over joist brackets produces mechanical slippage, releasing acoustic transients measured in centi-decibels ($+850\text{ cdB}$ raw spike).
- The acoustic wave propagates across the local interior cells according to the topological damping matrix of `goblin-spatial`. Because the floorboards overhead are nailed down tight, the crawlspace acts as an acoustic resonance chamber, trapping sound and elevating local stress.

### V. Psychological Pressure Dynamics: The `PressureMeter` Engine

The simulation rejects psychological drift driven by unconstrained large language models (e.g., prompt directives such as *"Bog becomes increasingly frightened"*). Character stress is managed by the **Shared Abstract Primitive (`PressureMeter`)**, tracking physiological and cognitive strain through bounded integer math[cite: 10, 12].

#### 1. The Concrete Meter Implementation

Bog's psychological state is governed by an active `ParanoiaMeter` instance bound to the local spatial cell:

```typescript
interface PressureMeterState {
  readonly baseline_bps: number;       // Bog's un-alert state: 2,400 bp
  readonly current_bps: number;        // Active evaluated stress
  readonly max_ceiling_bps: number;    // Hard ceiling: 10,000 bp
  readonly decay_rate_per_tick: number;// Passive relaxation rate
  readonly acoustic_coupling_coeff: number; // Sensitivity to noise
}
```

#### 2. Stress Coupling and Integration Across the Fast Sim

During the 28,410 ticks preceding the intercept:

1. **Passive Decay Resistance:** Bog's baseline paranoia is pinned at $2{,}400\text{ bp}$. The ambient dampness and absolute darkness prevent passive relaxation, locking `decay_rate_per_tick` to zero.
2. **Acoustic Transfer Function:** Every thermal contraction groan emitted by the pipe adds an impulse stress vector directly into Bog’s meter:
  $$
  \Delta \text{Paranoia} = \sum_{k} \left\lfloor \frac{\text{AcousticTransients}_k \times \text{CouplingCoeff}}{10{,}000} \right\rfloor \text{}
  $$
3. **The Resulting Delta:** Under continuous pipe groaning and creaking timber, Bog's paranoia meter accumulates an additional $+1{,}200\text{ bp}$ of pressure[cite: 1]. At Tick 28,410, Bog's active paranoia registers at **$3{,}600\text{ bp}$**[cite: 1].
4. **Behavioral Posture Shift:** This increase crosses the threshold from `vigilant_idle` to `defensive_ambush`, tightening his grip on `item_iron_scraper` and altering his engagement stance before Wart arrives[cite: 1].

### VI. Computational Budgets, Volatile Memory & Fault Isolation

Executing tens of thousands of state reductions in hundreds of milliseconds within an edge runtime (Cloudflare Worker V8 Isolate) or a local CPU process (Rig 1 Node.js POSIX) requires isolation controls.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        FAST SIM EXECUTION SANDBOX (V8 ISOLATE / RIG 1)                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MEMORY BOUNDS:                                                                                         │
│ • V8 Heap Budget: <= 128 MB maximum edge ceiling[cite: 13, 34]                                        │
│ • Zero Disk I/O: All 36,000 tick evaluations occur in system RAM[cite: 8, 11]                        │
│ • Pure Reduction: S_{n+1} = R(S_n, E_n, \sigma_n) with ZERO external network fetch calls[cite: 8, 11] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ WORK BUDGET CEILINGS (Replacing Non-Deterministic Wall-Clock Timeouts):                                │
│ • maxCellsExpanded: 512 hexes per spatial sweep                                             │
│ • maxRaySteps: 64 discrete ray-intersection segments                                        │
│ • maxQueueDepth: 1,024 priority nodes in the Dijkstra accumulator                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ATOMIC ISOLATION & ROLLBACK:                                                                           │
│ • State transitions execute in the volatile Mutable Staging Accumulator                  │
│ • Permanent storage (Cloudflare D1 / SQLite) is NOT touched on every tick                │
│ • If an unhandled anomaly occurs, RAM scratchpad is cleared at $0.00 compute penalty[cite: 11]        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Discrete Work Budgets vs. Non-Deterministic Timeouts

Relying on host operating system timeouts (e.g., `setTimeout(abort, 50)`) introduces non-deterministic failure modes[cite: 10]. An isolate executing on a CPU with high system load might hit a wall-clock timeout on tick 12,000, while an unloaded workstation completes all 36,000 ticks cleanly[cite: 10].

- The simulation engine bans wall-clock limits during fast-forward execution.
- All spatial routing and ray-tracing traversals receive an immutable, deterministic `WorkBudget` interface[cite: 10]:
  ```typescript
  export interface WorkBudget {
    readonly maxCellsExpanded: number; // Pinned to 512 hexes
    readonly maxRaySteps: number;      // Pinned to 64 discrete checks
    readonly maxQueueDepth: number;    // Pinned to 1,024 priority nodes
  }
  ```
- If pathfinding exhausts its budget, it returns a deterministic `BUDGET_EXHAUSTED` state rather than terminating the isolate[cite: 13].

#### 2. The Mutable Staging Accumulator

Writing all 36,000 intermediate ticks to a disk-based relational database (such as SQLite or Cloudflare D1) would saturate write channels, trigger I/O bottlenecks, and cause transaction timeouts.

- Throughout Phase 2, the simulation engine modifies state exclusively within the **Mutable Staging Accumulator** resident in system RAM[cite: 4, 11].
- State deltas (thermal reductions, spatial progress, stress updates) are buffered as transient events[cite: 4, 11].
- Persistent storage (Cloudflare D1 `CANON_DB`) remains unburdened until a dramatic intercept freezes the engine and commits an atomic scene transaction.

### VII. The Tripwire Horizon: Converging on Tick 28,410

Throughout the fast-forward run, the scheduler evaluates the simulation's state against the **Clock Brake Trip Predicate** on every tick[cite: 1, 6].

```plaintext
========================================================================================================================
                                     TICK 28,409 ──► TICK 28,410 CONVERGENCE
========================================================================================================================

  TICK 28,409 (Continuous Sim Running)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Spatial: Wart exits spline p(t) at corridor portal; axial distance d_axial(Bog, Wart) = 2.                     │
  │ • Grievance Tension: Resentment intensity at 7,998 bp (Escalation ceiling: 8,000 bp).                            │
  │ • Clock Brake Evaluation: (d_axial <= 1) is FALSE; (I_curr >= 8,000 bp) is FALSE.                                │
  │ • Engine State: FAST_FORWARD_ACTIVE. Scheduler increments TICK_ADVANCED(28410).                                  │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           │ State Reducer evaluates Tick 28,410
                                                           ▼
  TICK 28,410 (The Dramatic Intercept)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Spatial: Wart crosses threshold into loc_warm_pipe; d_axial(Bog, Wart) = 1 (Melee contact)[cite: 1].         │
  │ • Grievance Tension: Unwashed tallow odor & territorial breach spikes resentment to 8,000 bp (Ceiling)[cite: 1].│
  │ • Clock Brake Evaluation:                                                                                        │
  │     (d_axial <= 1 && I_curr >= 8,000 bp && cooldown == 0) === TRUE[cite: 1]                                     │
  │ • Engine State: CLOCK BRAKE ENGAGED. Global ticking freezes instantly[cite: 1, 6].                             │
  │ • Execution Lease Acquired: status = 'ENGAGED_IN_SCENE' in D1/SQLite[cite: 6].                                  │
  │ • Tabletop Handoff: Dispatches Stage 4 Opposed 2d6 Duel pre-resolution before prose is written[cite: 1, 6].     │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

At Tick 28,410, the fast-forward run completes its role[cite: 1]. It has compressed 4.7 minutes of diegetic world time into milliseconds of CPU compute, strictly updated all somatic and environmental vectors without GPU burn, and brought the physical universe to the precise mathematical coordinates where human drama is causally required to erupt.

### You

{{FOCUS : Phase 2: The Fast-Forward Run ("Fast Sim") }}

@project-categories-00

### Gemini

Here is the breakdown of "Phase 2: The Fast-Forward Run ('Fast Sim')" from the `simulated-novel` reference into the Epic, Feature, and Task hierarchy, completely adhering to the rules you provided (avoiding the word "AND", ensuring no redundancy, and mapping to the correct GitHub repositories).

### Epic: The Fast-Forward Simulation Runner

*Description:* Implement the core autonomous execution loop that evaluates thousands of state transitions across the fictional universe without rendering media, bridging the mathematical reality of the world with the discrete chronological timeline. *Target Repositories:* `02.simulation`, `packages/goblin-lore`

#### Feature: Centisecond Monotonic Tick Authority

*Description:* Enforce a strict integer-based time progression system that completely decouples simulation causality from real-world operating system clocks, eliminating cross-platform temporal drift. *Target Repository:* `02.simulation` (specifically `worker-sower-engine`)

- **Task: Implement Discrete `TICK_ADVANCED` Event Ingestion**
  - *Details:* Build the scheduler loop that advances time strictly via `TICK_ADVANCED(n)` discrete integer events rather than reading `Date.now()`.
- **Task: Establish the Centisecond Resolution Standard**
  - *Details:* Quantize all simulation grid timing to integer centiseconds, enforcing the mathematical rule where 100 ticks strictly equals 1.0 second of diegetic time.
- **Task: Build the Deterministic Intra-Tick Arbitration Gate**
  - *Details:* Create the two-phase concurrency resolution protocol where ties within the same centisecond are broken by calculating an HMAC-SHA256 digest of the master episode seed combined with the entity ID.
- **Task: Implement UTF-16 Fallback Tiebreaker**
  - *Details:* Write the fallback arbitration logic that sorts tied entities by their unsigned UTF-16 code-unit strings if the hash priority matches.

#### Feature: Multi-Scale Spatial Partitioning Engine

*Description:* Build the optimization hierarchy that allows thousands of entities to progress through the world simultaneously by varying the computational intensity based on spatial observation status. *Target Repository:* `packages/goblin-spatial`, `02.simulation`

- **Task: Build the Tier 1 Tactical Hot-Set Evaluator**
  - *Details:* Implement the high-fidelity hex-grid evaluator for collocated actors, executing continuous raycasts for line-of-sight bounding.
- **Task: Implement Tier 2 Analytical Spline Kinematics**
  - *Details:* Create the transit solver that moves actors along macro-corridor paths using an analytical equation rather than executing step-by-step collision checks on every tick.
- **Task: Develop BigInt Convergence Solver for Overtakes**
  - *Details:* Write the specific mathematical solver using BigInt Banker's Rounding to analytically determine the exact tick two actors intersect on a spline.
- **Task: Build the Tier 3 Dormancy State Manager ("The Void")**
  - *Details:* Implement the logic that evicts unobserved spatial zones from the active V8 isolate memory heap to ensure zero CPU cycles are burned on empty rooms.
- **Task: Implement Algebraic Catch-Up on Wake**
  - *Details:* Create the function that applies accumulated environmental decay or resource growth in a single scalar operation when a dormant zone is re-entered by an observer.

#### Feature: Thermodynamic Physics Progression

*Description:* Implement the deterministic environmental deterioration logic that runs during the fast-forward skip, treating the physical world as a mutable participant in the ledger. *Target Repository:* `02.simulation`

- **Task: Build the Ambient Heat Loss Modulator**
  - *Details:* Create the system that reduces local ambient temperature basis points incrementally across simulated tick intervals based on structural material damping factors.
- **Task: Implement Thermal Contraction Physics**
  - *Details:* Write the logic that translates temperature drops over specific thresholds into sudden acoustic transients (noise events) measured in integer centi-decibels.
- **Task: Build the Acoustic Wavefront Breadth-First Search**
  - *Details:* Implement the sound propagation engine that calculates audio loss across hexes by subtracting material attenuation integers until the signal falls below the ambient noise floor.

#### Feature: The Unified Pressure Meter Engine

*Description:* Construct the psychological tracking system that uses bounded integer math to accumulate biological fatigue or cognitive stress without relying on unconstrained large language model hallucination. *Target Repository:* `02.simulation`

- **Task: Build the Base `PressureMeter` Interface Primitive**
  - *Details:* Create the core object structure containing `currentValueBp`, `baselineBp`, `decayRatePerCycleBp`, mapping strictly between 0 to 10,000 basis points.
- **Task: Implement the Thermodynamic Flow Accumulator**
  - *Details:* Write the mathematical reduction function that calculates the next tick's stress level by subtracting the decay rate from the current value before adding incoming friction event debits.
- **Task: Build the Paranoia Meter Module**
  - *Details:* Create the specific instantiation of the pressure primitive that receives integer centi-decibel acoustic transients from the environment to increment character dread.

#### Feature: The Fast-Forward Brake Tripwire

*Description:* Implement the boundary detection logic that forces the autonomous simulation skip to halt abruptly when specific relational thresholds are crossed, handing execution over to the tabletop arbitration layer. *Target Repository:* `02.simulation`

- **Task: Build the Axial Proximity Evaluator**
  - *Details:* Write the check that fires continuously during spatial transitions to determine if two adversarial actors have entered a topological distance of one hex or fewer.
- **Task: Implement the Grievance Boil-Over Threshold Sensor**
  - *Details:* Create the monitoring loop that evaluates active `GrievanceRecord` entries to detect when dyadic resentment intensity reaches its fixed maximum escalation ceiling.
- **Task: Build the State Snapshot Locking Mechanism**
  - *Details:* Implement the routine that triggers when the tripwire evaluates to true, instantly freezing the `TICK_ADVANCED` loop.
- **Task: Implement the Transactional SQLite Execution Lease**
  - *Details:* Write the database connector that updates the system status flag to 'ENGAGED_IN_SCENE' in the D1 ledger when the brake is engaged.

### You

{{FOCUS : Feature Centisecond Monotonic Tick Authority}}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

@local-repo-task-list-with-package-00

### Gemini

# Blueprint: Centisecond Monotonic Tick Authority Implementation

**Repository:** `000.series-sower-engine`

**Package:** `packages/300.engine`

**Target Environment:** Local Workstation (`Rig 1` Node.js POSIX Runtime)

**Execution Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`) & Simulation Engine Units

### Phase I: Mathematical Interface Foundation

```plaintext
packages/300.engine/17.tick.unit/
├── fce/
│   ├── tick.interface.ts        ◄── SimTime brand, TickAdvancedPayload, TotalOrderKey
│   └── tick.bit.ts              ◄── Action envelope descriptors for state machine
```

#### Task: Define Bounded Integer SimTime Type Brand

- **Target File:** `packages/300.engine/17.tick.unit/fce/tick.interface.ts`
- **Implementation Details:**
  - Define `SimTime` as a branded integer nominal type (`number & { readonly __brand: unique symbol }`) to prevent raw numeric contamination.
  - Establish invariant conversions asserting integer non-negativity:
    $$
    \text{toSimTime}(v) = \lfloor v \rfloor \quad \text{where } v \ge 0
    $$
  - Explicitly forbid floating-point values in authoritative time boundaries.
  - Define diegetic time scalar constant `CENTISECONDS_PER_SECOND = 100`.

#### Task: Specify Tick Advancement Event Payload Schema

- **Target File:** `packages/300.engine/17.tick.unit/fce/tick.interface.ts`
- **Implementation Details:**
  - Expand `TickAdvancedEventPayload` with strictly typed fields: `previousTick: SimTime`, `newTick: SimTime`, `deltaTicks: number`, `worldSeed: string`, `derivedTickSeed: string`, `occurredAtMs: number`.
  - Declare `busyUntil: SimTime` property interface for simulation entity records.
  - Declare the causal ordering comparator type `TotalOrderTuple = [tick: SimTime, siteCodeUnit: string, entityId: string]`.

#### Task: Expand Tick Unit Action Bit Contracts

- **Target File:** `packages/300.engine/17.tick.unit/fce/tick.bit.ts`
- **Implementation Details:**
  - Define action command indexes: `TICK_INIT`, `TICK_ADVANCE`, `TICK_DERIVE_SEED`, `TICK_RESET`.
  - Ensure the payload resolver contract `TickBit.slv` exposes strongly typed parameters for `TickAdvancedEventPayload`, `currentTick`, and cryptographic seed digests.

### Phase II: Cryptographic Seed Derivation

```plaintext
packages/300.engine/17.tick.unit/
├── tick.model.ts                ◄── Monotonic state storage
└── tick.action.ts               ◄── Delimiter-safe HMAC-SHA256 PRNG generation
```

#### Task: Implement Delimiter Safe HMAC Derivation Function

- **Target File:** `packages/300.engine/17.tick.unit/tick.action.ts`
- **Implementation Details:**
  - Implement `deriveTickSeed(worldSeed: string, tickNumber: number, subsystemId: string): string` using Node.js `node:crypto`.
  - Encode input buffers with explicit delimiter safety:
    $$
    \text{Payload} = \text{Buffer.concat}([\text{Buffer.from}(\text{subsystemId}), \, \text{Buffer.from}([0x00]), \, \text{Buffer.from}(\text{tickNumber}.\text{toString}(10))])
    $$
  - Prevent string concatenation collisions where distinct entity and tick pairings could generate identical digest keys.

#### Task: Build Big Endian Priority Lottery Hash Generator

- **Target File:** `packages/300.engine/17.tick.unit/tick.action.ts`
- **Implementation Details:**
  - Construct deterministic entity lottery generator:
    $$
    \text{Priority}(A, t) = \text{Truncate32UnsignedBigEndian}\Big(\text{HMAC-SHA256}\big(\text{worldSeed}, \, A_{\text{id}} \mathbin{\Vert} 0x00 \mathbin{\Vert} t\big)\Big)
    $$
  - Parse first 4 bytes of raw HMAC digest using `readUInt32BE(0)`.
  - Return numeric priority bracket in range $[0, 2^{32} - 1]$ for deterministic scheduler dispatch.

#### Task: Update Tick State Model Container

- **Target File:** `packages/300.engine/17.tick.unit/tick.model.ts`
- **Implementation Details:**
  - Update `TickModel` class to hold `currentTick: SimTime`, `totalTicksAdvanced: number`, `worldSeed: string`, `lastDerivedSeed: string`, `lastTickAtMs: number`.
  - Seal default initial seeds using immutable constants (`series_world_seed_genesis_alpha`).

### Phase III: Monotonic State Reducer Execution

```plaintext
packages/300.engine/17.tick.unit/
├── tick.reduce.ts               ◄── Pure state transitions
└── tick.buzzer.ts               ◄── Unit boundary dispatcher
```

#### Task: Implement Pure Reducer Advancement Action

- **Target File:** `packages/300.engine/17.tick.unit/tick.action.ts`
- **Implementation Details:**
  - Implement `advanceTickAction(cpy: TickModel, bal: TickBit, ste: State): TickModel`.
  - Reject non-positive advancement requests ($\Delta \le 0$) as invalid operations.
  - Evaluate next monotonic boundary:
    $$
    \text{newTick} = \text{cpy.currentTick} + \Delta_{\text{ticks}}
    $$
  - Generate seed for `newTick` via `deriveTickSeed`.
  - Record execution without querying ambient clocks: `cpy.currentTick = newTick`.

#### Task: Eliminate System Wall Clocks from Pure Reduction Core

- **Target File:** `packages/300.engine/17.tick.unit/tick.reduce.ts`
- **Implementation Details:**
  - Strip internal invocations of `Date.now()` or `performance.now()` from state reducer paths.
  - Enforce that timestamp tracking represents external event metadata passed strictly via incoming `TickBit.dat`.
  - Assert reducer purity: $S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)$.

#### Task: Wire Tick Unit Action Dispatch Table

- **Target File:** `packages/300.engine/17.tick.unit/tick.buzzer.ts`
- **Implementation Details:**
  - Register action cases inside reducer router: `Act.INIT`, `Act.ADVANCE`, `Act.UPDATE`, `Act.RESET`.
  - Deep-clone incoming state models to guarantee immutability prior to state mutation dispatch.

### Phase IV: Intra-Tick Collision Arbitration

```plaintext
packages/300.engine/18.timeline.unit/
├── fce/
│   ├── arbitration.interface.ts  ◄── Collision candidate envelopes
│   └── arbitration.bit.ts        ◄── Arbitration action bits
├── arbitration.action.ts         ◄── Code unit deterministic tiebreaker
├── arbitration.model.ts          ◄── Staging resolution queues
└── arbitration.reduce.ts         ◄── Priority commit queue
```

#### Task: Construct Arbitration Candidate Envelope

- **Target File:** `packages/300.engine/18.timeline.unit/fce/arbitration.interface.ts`
- **Implementation Details:**
  - Declare `ArbitrationEnvelope<TAction>` interface containing `entityId: string`, `requestedTick: SimTime`, `actionClassPriority: number`, `actionPayload: TAction`.
  - Define candidate dispute record structure for simultaneous resource or portal occupancy requests.

#### Task: Implement UTF-16 Code Point Sort Comparator

- **Target File:** `packages/300.engine/18.timeline.unit/arbitration.action.ts`
- **Implementation Details:**
  - Construct deterministic tiebreaker function:
    $$
    \text{compareCodeUnits}(a, b) = (a < b \ ? \ -1 : (a > b \ ? \ 1 : 0))
    $$
  - Strictly forbid `localeCompare()` to prevent runtime divergence across operating system locale configurations.
  - Order resolution queues by:
    1. Highest `actionClassPriority` (Descending)
    2. Highest seeded `Priority(entityId, tick)` (Descending)
    3. Lowest `entityId` UTF-16 code-unit value (Ascending)

#### Task: Build Phase Two Arbitration Commit Reducer

- **Target File:** `packages/300.engine/18.timeline.unit/arbitration.reduce.ts`
- **Implementation Details:**
  - Process candidate actions through a two-phase transaction:
    - Phase 1: Ingest candidate envelopes into volatile priority queue without mutating entity states.
    - Phase 2: Pop top-ranked candidate; mark winning action as committed; emit `STALL` event envelopes for subordinate conflicting candidates.
  - Write updated `busyUntil` timestamps to winning actors.

### Phase V: Local Terminal Operator Interface

```plaintext
apps/terminal/src/
├── cns00/
│   ├── views/
│   │   └── timeline.view.ts     ◄── Blessed terminal UI pane for tick telemetry
│   └── menu/
│       └── simulation.menu.ts   ◄── Blessed interactive menu options
```

#### Task: Construct Blessed Terminal Timeline Telemetry View

- **Target File:** `apps/terminal/src/cns00/views/timeline.view.ts`
- **Implementation Details:**
  - Instantiate Blessed `Box` display element bound to `17.tick.unit`.
  - Render active engine metrics:
    - Monotonic Current Tick (`SimTime`)
    - Calculated Diegetic Time (`T_diegetic = currentTick / 100` seconds)
    - Active Episode PRNG Hash (64-character hex)
    - Total Accumulated Ticks
  - Restrict UI strings to 7-bit ASCII characters to prevent layout breakage on standard terminal emulators.

#### Task: Add Interactive Simulation Step Menu Action

- **Target File:** `apps/terminal/src/cns00/menu/simulation.menu.ts`
- **Implementation Details:**
  - Add Blessed menu options to the terminal controller:
    - `[1] STEP 1 TICK (10 ms diegetic)`
    - `[2] FAST FORWARD 100 TICKS (1.0 sec diegetic)`
    - `[3] FAST FORWARD 36,000 TICKS (6.0 min diegetic)`
    - `[4] RESET TIMELINE TO ZERO`
  - Bind menu selections directly to `packages/300.engine/17.tick.unit/tick.buzzer.ts` via local event bus without spawning network processes.

#### Task: Implement Non-Blocking Telemetry Render Loop

- **Target File:** `apps/terminal/src/cns00/views/timeline.view.ts`
- **Implementation Details:**
  - Implement UI repaint scheduler using `setImmediate()` to ensure the terminal process event loop does not starve during fast simulation runs.
  - Throttle terminal screen redraw operations to 60 FPS while the underlying engine advances at CPU speeds ($>80{,}000\text{ ticks/sec}$).

### Phase VI: Determinism Invariant Verification Gauntlet

```plaintext
packages/300.engine/17.tick.unit/
└── tests/
    ├── tick.monotonic.test.ts   ◄── Monotonic advancement verification
    ├── prng.determinism.test.ts ◄── Bit exact HMAC reproducibility
    └── ordering.tiebreak.test.ts◄── Zero drift cross platform sort verification
```

#### Task: Build Strict Monotonicity Invariant Test Suite

- **Target File:** `packages/300.engine/17.tick.unit/tests/tick.monotonic.test.ts`
- **Implementation Details:**
  - Assert that for any sequential updates $i < j$, the condition $\text{currentTick}_i < \text{currentTick}_j$ strictly holds.
  - Verify that an attempt to advance by negative or zero tick deltas throws an unhandled domain exception.
  - Assert that the simulation state completely ignores host clock shifts by mocking system time mutations.

#### Task: Build PRNG Bit Identical Cross Platform Verification Test

- **Target File:** `packages/300.engine/17.tick.unit/tests/prng.determinism.test.ts`
- **Implementation Details:**
  - Execute a 10,000-tick loop using fixed seed `series_world_seed_genesis_alpha`.
  - Validate that the final derived hex seed at Tick 10,000 matches the predetermined golden hash byte-for-byte.
  - Assert that changing string encoding or character delimiters fails test validation.

#### Task: Build Multi Actor Simultaneous Action Test Suite

- **Target File:** `packages/300.engine/18.timeline.unit/tests/ordering.tiebreak.test.ts`
- **Implementation Details:**
  - Dispatch 128 simultaneous conflicting action requests at `SimTime = 500`.
  - Assert that resolving the conflicting actions produces an identical sequential commit log across 100 repeated executions from raw genesis state.
  - Verify that winning actors receive updated `busyUntil` marks and displaced actors receive deterministic `STALL` tokens.

### You

{{FOCUS : Feature Multi-Scale Spatial Partitioning Engine }}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

@local-repo-task-list-with-package-00

### Gemini

# Blueprint: Multi-Scale Spatial Partitioning Engine Implementation

**Repository:** `000.series-sower-engine`

**Package:** `packages/300.engine`

**Target Environment:** Local Workstation (`Rig 1` Node.js POSIX Runtime)

**Execution Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`) & Simulation Engine Units

### Phase I: Spatial Discriminated Union Representation

```plaintext
packages/300.engine/19.spatial-lattice.unit/
├── fce/
│   ├── spatial-state.interface.ts  ◄── Discriminated scale boundary union types
│   └── spatial-state.bit.ts        ◄── State mutation envelopes
```

#### Task: Define Scale Boundary Discriminated Union Types

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/fce/spatial-state.interface.ts`
- **Implementation Details:**
  - Define the strict runtime discriminated union `ActorSpatialState`:
    ```typescript
    export type ActorSpatialState =
      | { readonly scale: 'STAGED'; readonly siteId: string; readonly cell: number }
      | { readonly scale: 'IN_TRANSIT'; readonly edgeId: string; readonly departTick: number; readonly edgeCostUnits: number };
    ```
  - Assert that an actor can never possess both tactical coordinates and regional edge coordinates simultaneously.
  - Exclude `IN_TRANSIT` entities structurally from room contention, visibility queries, and acoustic propagation pipelines.

#### Task: Implement Spatial State Brand Assertions

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/fce/spatial-state.interface.ts`
- **Implementation Details:**
  - Construct nominal type brands for `SiteId`, `RegionalEdgeId`, and `PackedAxialCell` using unique symbol tags.
  - Build runtime assertion guards (`assertStaged`, `assertInTransit`) to validate scale boundaries prior to query execution.
  - Restrict cell references to positive thirty-two-bit integer ranges.

#### Task: Build Zero Allocation State Transition Transformers

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/fce/spatial-state.bit.ts`
- **Implementation Details:**
  - Implement transition descriptors: `STAGE_ACTOR_INTO_ROOM`, `DISPATCH_ACTOR_TO_TRANSIT`, `EVICT_ACTOR_TO_PORTAL`.
  - Formulate transformation signatures enforcing immutable object spread without triggering garbage collector churn.

### Phase II: Doubled Hexagonal Lattice Coordinate Kernel

```plaintext
packages/300.engine/19.spatial-lattice.unit/
├── lattice.model.ts               ◄── Coordinate storage structures
├── lattice.action.ts              ◄── Exact integer cross products & clipping
└── lattice.reduce.ts              ◄── Reciprocal supercover path traversal
```

#### Task: Construct Pointy Top Doubled Axial Geometry

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/lattice.model.ts`
- **Implementation Details:**
  - Implement doubled Cartesian coordinate conversions for pointy-top hexagons with circumradius $s = 2$:
    $$
    \text{Centroid}(q, r) = (4q + 2r, \, 6r) \text{}
    $$
    $$
    \text{Vertices} = (cx, \, cy \pm 4), \, (cx \pm 2, \, cy \pm 2) \text{}
    $$
    $$
    \text{Edge Midpoints} = (cx \pm 1, \, cy \pm 3), \, (cx \pm 2, \, cy) \text{}
    $$
  - Eliminate floating-point trigonometry (`Math.sin`, `Math.cos`) completely from local tactical space calculations.

#### Task: Implement Integer Cross Product Line Classification

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/lattice.action.ts`
- **Implementation Details:**
  - Construct the two-dimensional integer cross product evaluator:
    $$
    \text{crossProduct}(A, B, C) = (B_x - A_x)(C_y - A_y) - (B_y - A_y)(C_x - A_x) \text{}
    $$
  - Classify segment intersections against the six hexagonal vertices using exact integer signs ($> 0$, $< 0$, or $= 0$) without division.

#### Task: Build Cyrus Beck Finite Segment Convex Clipper

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/lattice.action.ts`
- **Implementation Details:**
  - Implement finite segment convex polygon clipping over integer half-planes.
  - Evaluate parameter $t \in [0, 1]$ intersections by cross-multiplying rational values:
    $$
    \frac{n_1}{d_1} \le \frac{n_2}{d_2} \iff n_1 \cdot d_2 \le n_2 \cdot d_1 \text{}
    $$
  - Classify line contact into interior crossings or boundary-only touches without converting to floating-point numbers.

#### Task: Implement Exhaustive Reciprocal Supercover Traverser

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/lattice.reduce.ts`
- **Implementation Details:**
  - Traverse every hex cell touched by a sightline segment in exact sequence.
  - Guarantee optical reciprocity across all ordered cell pairs:
    $$
    \text{hasLineOfSight}(A, B) \equiv \text{hasLineOfSight}(B, A) \text{[cite: 8, 11]}
    $$
  - Return deterministic lists of crossed cells, crossed edges, and touched vertices.

### Phase III: Spatial Hash Broad Phase Culling

```plaintext
packages/300.engine/20.spatial-hash.unit/
├── hash.model.ts                  ◄── Compact Map spatial buckets
├── hash.action.ts                 ◄── Bit-packed key transforms
└── hash.reduce.ts                 ◄── Fixed radius culling sweeps
```

#### Task: Implement Packed Thirty Two Bit Axial Spatial Key

- **Target File:** `packages/300.engine/20.spatial-hash.unit/hash.action.ts`
- **Implementation Details:**
  - Implement bit-packing conversion for axial coordinates:
    $$
    \text{packAxial}(q, r) = ((q + 32768) \ll 16) \mid (r + 32768) \text{}
    $$
  - Implement reciprocal extraction functions `unpackAxialQ(key)` and `unpackAxialR(key)` using bit shifts.
  - Ban heap-allocated string template keys (`${q},${r}`) from the high-frequency evaluation loop[cite: 8].

#### Task: Build Constant Time Neighbor Ring Query Bucket

- **Target File:** `packages/300.engine/20.spatial-hash.unit/hash.model.ts`
- **Implementation Details:**
  - Store tactical entity spatial placements inside a flat `Map<number, Set<string>>` keyed by packed thirty-two-bit integer coordinates.
  - Implement constant time $O(1)$ adjacency sweeps inspecting the center cell and its six neighboring axial buckets.

#### Task: Implement Manhattan Distance Perception Horizon Cull

- **Target File:** `packages/300.engine/20.spatial-hash.unit/hash.action.ts`
- **Implementation Details:**
  - Implement perceptual broad-phase filter checking axial distance prior to invoking the supercover line-of-sight traversal:
    $$
    d_{\text{axial}}(A, B) = \max(\vert{}q_A - q_B\vert{}, \, \vert{}r_A - r_B\vert{}, \, \vert{}( -q_A - r_A) - ( -q_B - r_B)\vert{}) \text{[cite: 8, 34]}
    $$
  - Cull candidate observer pairs whose distance exceeds perceptual radius limit ($R_{\text{max}} = 15$ cells).

#### Task: Enforce Upper Ceiling Dyadic Mesh Clamping

- **Target File:** `packages/300.engine/20.spatial-hash.unit/hash.reduce.ts`
- **Implementation Details:**
  - Restrict active tactical scene participants to an explicit ceiling of $N_{\text{hot}} \le 12$ actors.
  - Limit dyadic interaction channels to $M \le 66$ pairs, preventing combinatorial compute spikes on the local CPU.

### Phase IV: Rational Progress Edge Spline Motion

```plaintext
packages/300.engine/21.transit-spline.unit/
├── spline.model.ts                ◄── Edge progress structures
├── spline.action.ts               ◄── Rational integer denominators
└── spline.reduce.ts               ◄── Dynamic cost re-integration
```

#### Task: Construct Fixed Precision Denominator Progress Types

- **Target File:** `packages/300.engine/21.transit-spline.unit/spline.model.ts`
- **Implementation Details:**
  - Establish fixed rational denominator constant `DENOM = 1_000_000_000n` ($10^9$).
  - Formulate `TransitIntervalRecord`: `actorId: string`, `edgeId: string`, `direction: 'FORWARD' | 'REVERSE'`, `departTick: bigint`, `baseCostUnits: bigint`, `accumulatedProgress: bigint`.

#### Task: Implement Split Invariant Piecewise Cost Integrator

- **Target File:** `packages/300.engine/21.transit-spline.unit/spline.action.ts`
- **Implementation Details:**
  - Implement progress delta accumulation across elapsed ticks:
    $$
    \Delta P = \left\lfloor \frac{\Delta t \cdot 10^9}{C_i} \right\rfloor \text{[cite: 1, 2, 8]}
    $$
    $$
    \text{where } C_i = \left\lfloor \frac{C_{\text{base}} \cdot \mu_i + 5000}{10000} \right\rfloor \text{[cite: 2, 8, 17]}
    $$
  - Convert remaining progress to time units via ceiling division:
    $$
    \Delta T_{\text{rem}} = \left\lceil \frac{(10^9 - P_{\text{accum}}) \cdot C_{\text{new}}}{10^9} \right\rceil \text{}
    $$
  - Prove split-invariance: splitting an edge transit segment into multiple sub-intervals must yield the identical arrival tick down to the centisecond.

#### Task: Build Dynamic Multiplier Boundary Transition Handler

- **Target File:** `packages/300.engine/21.transit-spline.unit/spline.reduce.ts`
- **Implementation Details:**
  - Compute dynamic arrival time updates when environmental overlays shift edge cost multipliers mid-transit:
    $$
    T_{\text{arrival, new}} = T_{\text{change}} + \Delta T_{\text{rem}} \text{}
    $$
  - Record all intermediate multiplier operations using BigInt to eliminate precision loss.

#### Task: Implement Impassable Route Stranded Event Emission

- **Target File:** `packages/300.engine/21.transit-spline.unit/spline.action.ts`
- **Implementation Details:**
  - Detect washed-out routes or blocked portals when multiplier drops to zero ($\mu_{\text{bps}} = 0$).
  - Halt transit progression immediately and emit the deterministic `ACTOR_STRANDED` state event.

### Phase V: Analytical Sweep Line Encounter Solver

```plaintext
packages/300.engine/21.transit-spline.unit/
├── encounter.model.ts             ◄── Interval collision descriptors
├── encounter.action.ts            ◄── Closed form algebraic intersection
└── encounter.reduce.ts            ◄── Sweep line encounter detection
```

#### Task: Build Head On Analytical Intersection Solver

- **Target File:** `packages/300.engine/21.transit-spline.unit/encounter.action.ts`
- **Implementation Details:**
  - Implement closed-form convergence solver for opposing actors moving along a shared regional edge[cite: 2, 8]:
    $$
    t_{\text{meet}} = \text{divRoundHalfEvenBigInt}\left(\frac{D_A \cdot D_B + T_{A,\text{enter}} \cdot D_B + T_{B,\text{enter}} \cdot D_A}{D_A + D_B}\right) \text{[cite: 2, 8]}
    $$
  - Execute intermediate products strictly in BigInt to guard against safe-integer overflow ($> 2^{53} - 1$) across long campaigns.

#### Task: Implement Same Direction Overtake Tick Derivation

- **Target File:** `packages/300.engine/21.transit-spline.unit/encounter.action.ts`
- **Implementation Details:**
  - Implement overtake convergence solver where actor $A$ passes actor $B$[cite: 2, 8]:
    $$
    t_{\text{overtake}} = \text{divRoundHalfEvenBigInt}\left(\frac{T_{A,\text{enter}} \cdot D_B - T_{B,\text{enter}} \cdot D_A}{D_B - D_A}\right) \text{[cite: 2, 8]}
    $$
  - Verify encounter validity by asserting that the exact rational intersection falls inside the temporal overlap window $[\max(T_{\text{enter}}), \, \min(T_{\text{exit}})]$ prior to rounding.

#### Task: Construct BigInt Banker Rounding Integer Division

- **Target File:** `packages/300.engine/21.transit-spline.unit/encounter.action.ts`
- **Implementation Details:**
  - Implement true round-half-even division to eliminate directional rounding creep:
    ```typescript
    export function divRoundHalfEvenBigInt(numerator: bigint, denominator: bigint): bigint {
      if (denominator === 0n) throw new RangeError('Division by zero');
      if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
      const q = numerator / denominator;
      const r = numerator % denominator;
      if (r === 0n) return q;
      const doubleR = r * 2n;
      if (doubleR < denominator) return q;
      if (doubleR > denominator) return q + 1n;
      return (q % 2n === 0n) ? q : q + 1n;
    }
    ```

#### Task: Implement One Dimensional Sweep Line Traversal

- **Target File:** `packages/300.engine/21.transit-spline.unit/encounter.reduce.ts`
- **Implementation Details:**
  - Detect collisions across traveling actors using an $O(N \log N)$ sweep line sort over edge entry timestamps[cite: 2, 8].
  - Break temporal entry ties deterministically using code-unit character comparisons (`a.actorId < b.actorId ? -1 : 1`) to eliminate locale dependency[cite: 2, 8].

### Phase VI: Void Dormancy Algebraic Wake Integration

```plaintext
packages/300.engine/22.void-dormancy.unit/
├── dormancy.model.ts              ◄── Last active tick records
├── dormancy.action.ts             ◄── Closed form environmental catch-up
└── dormancy.reduce.ts             ◄── Zero CPU hibernation state lifecycle
```

#### Task: Build Site Presence Observer Tracking Counter

- **Target File:** `packages/300.engine/22.void-dormancy.unit/dormancy.model.ts`
- **Implementation Details:**
  - Track active observer counts per authored tactical site (`activeActorCount: number`, `lastActiveTick: number`).
  - Trigger immediate dormancy transitions when `activeActorCount` drops to zero, burning zero per-tick iteration cycles on unobserved sites.

#### Task: Implement Closed Form Heat Loss Calculation

- **Target File:** `packages/300.engine/22.void-dormancy.unit/dormancy.action.ts`
- **Implementation Details:**
  - Calculate thermal degradation on site wake as a single closed-form scalar operation:
    $$
    \text{Temp}_{\text{wake}} = \max\left(\text{Temp}_{\text{ambient}}, \, \text{Temp}_{\text{initial}} - \left\lfloor \frac{k_{\text{decay}} \cdot \Delta t}{10000} \right\rfloor\right) \text{[cite: 4]}
    $$
  - Complete environmental catch-up calculations in sub-millisecond envelopes ($< 2\text{ ms}$) on local memory heaps.

#### Task: Implement Ambient Rust Degradation Step

- **Target File:** `packages/300.engine/22.void-dormancy.unit/dormancy.action.ts`
- **Implementation Details:**
  - Calculate material moisture and oxidation buildup over elapsed dormant ticks:
    $$
    \text{Rust}_{\text{wake}} = \min\left(10000, \, \text{Rust}_{\text{initial}} + \left\lfloor \frac{R_{\text{rate}} \cdot \Delta t}{10000} \right\rfloor\right) \text{[cite: 4]}
    $$
  - Apply evaluated structural deltas to site overlays prior to admitting entering actors.

#### Task: Construct Zero CPU Rehydration Transition Dispatcher

- **Target File:** `packages/300.engine/22.void-dormancy.unit/dormancy.reduce.ts`
- **Implementation Details:**
  - Ingest the `ACTOR_ENTERED_SITE` boundary event.
  - Execute algebraic catch-up across the elapsed tick delta ($\Delta t = t_{\text{current}} - t_{\text{last\_active}}$) before resolving spatial occupancy.
  - Update `lastActiveTick` and transition the site status from dormant to active.

### Phase VII: Blessed Terminal Spatial Partition Inspector

```plaintext
apps/terminal/src/
├── cns00/
│   ├── views/
│   │   └── spatial-partition.view.ts ◄── Blessed layout for spatial tiers
│   └── menu/
│       └── spatial.menu.ts           ◄── Blessed interactive menu options
```

#### Task: Construct Blessed Spatial Partition Matrix View

- **Target File:** `apps/terminal/src/cns00/views/spatial-partition.view.ts`
- **Implementation Details:**
  - Build a dedicated Blessed terminal interface displaying the three population tiers:
    - Tier 1: Staged Active Hot Set (Site ID, Axial Coordinates, Occupancy)
    - Tier 2: In-Transit Spline Traversal (Edge ID, Rational Progress %, Intercept ETA)
    - Tier 3: Cold Dormant Sites in The Void (Elapsed Sleep Ticks, Deferred Catch-Up Deltas)
  - Restrict all visual elements to 7-bit ASCII characters to prevent layout clipping.

#### Task: Build Interactive Partition Inspector Menu

- **Target File:** `apps/terminal/src/cns00/menu/spatial.menu.ts`
- **Implementation Details:**
  - Provide interactive controls within the Blessed interface:
    - `[1] INSPECT ACTIVE TACTICAL SITE (Tier 1)`
    - `[2] LIST REGIONAL TRAVEL SPLINES (Tier 2)`
    - `[3] WAKE DORMANT SITE MANUALLY (Tier 3 Catch-Up)`
    - `[4] RUN RECIPROCAL SUPERCOVER AUDIT`
  - Bind menu selections directly to `packages/300.engine/19.spatial-lattice.unit` without invoking remote network calls.

#### Task: Implement Real Time Hot Set Visualizer Element

- **Target File:** `apps/terminal/src/cns00/views/spatial-partition.view.ts`
- **Implementation Details:**
  - Render an ASCII representation of the active axial lattice showing character tokens (`@` for Bog, `W` for Wart).
  - Display line-of-sight status indicators and proximity distances between actors in the active site.

### Phase VIII: Multi Scale Partition Invariant Test Suite

```plaintext
packages/300.engine/19.spatial-lattice.unit/tests/
├── oracle.reciprocal.test.ts      ◄── 8,190-pair line-of-sight oracle
├── transit.split-invariance.test.ts◄── Rational progress verification
├── bigint.overflow.test.ts        ◄── Large timeline arithmetic checks
└── void.wake-catchup.test.ts      ◄── Instantaneous algebraic catch-up checks
```

#### Task: Build Eight Thousand One Hundred Ninety Pair Oracle Suite

- **Target File:** `packages/300.engine/19.spatial-lattice.unit/tests/oracle.reciprocal.test.ts`
- **Implementation Details:**
  - Test optical reciprocity across all 8,190 ordered pairs within a radius-5 hex disk ($91\text{ cells}$):
    $$
    \forall (a, b): \text{hasLineOfSight}(a, b) \equiv \text{hasLineOfSight}(b, a) \text{[cite: 8, 11]}
    $$
  - Assert zero directional visibility asymmetry regardless of obstructing occluder configurations[cite: 2, 8, 11].

#### Task: Implement Piecewise Split Invariance Rational Test

- **Target File:** `packages/300.engine/21.transit-spline.unit/tests/transit.split-invariance.test.ts`
- **Implementation Details:**
  - Execute regional movement traversals across edges with changing cost multipliers[cite: 2, 8].
  - Validate that splitting a trip into arbitrary intermediate evaluation slices generates the exact same arrival tick down to the centisecond[cite: 2, 8].

#### Task: Verify BigInt Integer Overflow Protection Thresholds

- **Target File:** `packages/300.engine/21.transit-spline.unit/tests/bigint.overflow.test.ts`
- **Implementation Details:**
  - Simulate transit intervals with large simulation tick counts ($T \ge 10^9\text{ cs}$) where products exceed $2^{53} - 1$.
  - Assert that integer calculations execute without bit truncation or silent precision drift.

#### Task: Assert Zero State Drift During Void Awakening

- **Target File:** `packages/300.engine/22.void-dormancy.unit/tests/void.wake-catchup.test.ts`
- **Implementation Details:**
  - Compare an unobserved room updated via single-step algebraic wake against a control room ticked iteratively for 50,000 centiseconds.
  - Verify that both rooms produce bit-identical temperature and rust values upon re-entry.

### You

{{FOCUS : Feature Thermodynamic Physics Progression }}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

### Gemini

# Blueprint: Thermodynamic Physics Progression Implementation

**Repository:** `000.series-sower-engine`

**Package:** `packages/300.engine`

**Target Environment:** Local Workstation (`Rig 1` Node.js POSIX Runtime)

**Execution Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`) & Simulation Engine Units

### Phase I: Thermodynamic State Field Contracts

```plaintext
packages/300.engine/23.thermodynamics.unit/
├── fce/
│   ├── thermal-node.interface.ts     ◄── Basis-point thermal state structures
│   └── thermal-action.bit.ts         ◄── Thermal mutation action bit descriptors
```

#### Task: Define Thermal Node Basis Point State Interface

- **Target File:** `packages/300.engine/23.thermodynamics.unit/fce/thermal-node.interface.ts`
- **Implementation Details:**
  - Define `ThermalNodeState` using branded integer nominal types for all scalar metrics:
    ```typescript
    export type TempBasisPoints = number & { readonly __brand: unique symbol };
    export interface ThermalNodeState {
      readonly nodeId: string;
      readonly currentTempBp: TempBasisPoints;       // Bounded: [0, 10,000] bp
      readonly ambientFloorBp: TempBasisPoints;      // Asymptotic baseline
      readonly thermalMassUnits: number;             // Inertial resistance scalar
      readonly conductivityBps: number;             // Heat transfer rate per centisecond
      readonly lastUpdatedTick: number;              // SimTime monotonic timestamp
    }
    ```
  - Enforce standard calibration boundaries: $0\text{ bp} \equiv 0\text{ K}$ (absolute zero), $2{,}731\text{ bp} \equiv 273.15\text{ K}$ ($0^\circ\text{C}$), $3{,}731\text{ bp} \equiv 373.15\text{ K}$ ($100^\circ\text{C}$), $10{,}000\text{ bp} \equiv 1{,}000\text{ K}$ (thermal combustion maximum).
  - Strictly forbid JavaScript `number` floating-point values in state contracts to eliminate cross-platform serialization divergences.

#### Task: Specify Structural Material Thermal Conductivity Constants

- **Target File:** `packages/300.engine/23.thermodynamics.unit/fce/thermal-node.interface.ts`
- **Implementation Details:**
  - Define canonical material conductivity table mapping material identifiers to basis-point transfer rates:
    - `MATERIAL_HEAVY_CAST_IRON`: $850\text{ bps}$ conductivity, $9{,}200$ thermal mass units.
    - `MATERIAL_STRUCTURAL_TIMBER`: $120\text{ bps}$ conductivity, $3{,}400$ thermal mass units.
    - `MATERIAL_LATH_PLASTER`: $95\text{ bps}$ conductivity, $2{,}100$ thermal mass units.
    - `MATERIAL_OPEN_AIR_CAVITY`: $45\text{ bps}$ conductivity, $500$ thermal mass units.
  - Lock data structures using `Object.freeze()` to preserve runtime immutability.

#### Task: Define Thermal State Action Bit Types

- **Target File:** `packages/300.engine/23.thermodynamics.unit/fce/thermal-action.bit.ts`
- **Implementation Details:**
  - Specify action enumerations: `THERMAL_INIT`, `THERMAL_DECAY_TICK`, `THERMAL_INTEGRATE_VOID`, `THERMAL_IMPULSE_INJECT`.
  - Formulate parameter bit payloads carrying `nodeId`, `elapsedTicks`, `sourceImpulseBp`, and deterministic PRNG seeds.

### Phase II: Deterministic Heat Dissipation Solver

```plaintext
packages/300.engine/23.thermodynamics.unit/
├── thermal.model.ts                  ◄── Thermal field storage containers
├── thermal.action.ts                 ◄── Fixed-point cooling reduction math
└── thermal.reduce.ts                 ◄── Monotonic state reduction loop
```

#### Task: Implement Discrete Exponential Newton Cooling Reduction

- **Target File:** `packages/300.engine/23.thermodynamics.unit/thermal.action.ts`
- **Implementation Details:**
  - Implement single-tick incremental temperature dissipation using integer basis-point decay:
    $$
    \Delta T = \left\lfloor \frac{(T_{\text{curr}} - T_{\text{ambient}}) \times K_{\text{conductivity}}}{M_{\text{mass}} \times 10{,}000} \right\rfloor \text{[cite: 4, 7]}
    $$
    $$
    T_{t+1} = \max(T_{\text{ambient}}, \, T_t - \Delta T) \text{}
    $$
  - Replace transcendental $e^{-kt}$ float calls with discrete integer fractional approximations.
  - Ensure cooling strictly terminates when $T_{\text{curr}} \le T_{\text{ambient}}$, preventing negative heat generation.

#### Task: Build Closed Form Heat Loss Calculation Across Tick Deltas

- **Target File:** `packages/300.engine/23.thermodynamics.unit/thermal.action.ts`
- **Implementation Details:**
  - Implement closed-form analytical integration for dormant zones in "The Void" across arbitrary tick jumps ($\Delta t \le 10^8\text{ ticks}$) without running per-tick loops:
    $$
    T_{\text{wake}} = T_{\text{ambient}} + \left\lfloor (T_{\text{start}} - T_{\text{ambient}}) \times \left(1 - \frac{K_{\text{conductivity}}}{M_{\text{mass}}}\right)^{\Delta t} \right\rfloor \text{}
    $$
  - Compute powers using deterministic integer exponentiation with BigInt accumulators to maintain bit-exact parity with sequential iterative ticking.

#### Task: Enforce Non Negative Basis Point Temperature Bounds

- **Target File:** `packages/300.engine/23.thermodynamics.unit/thermal.reduce.ts`
- **Implementation Details:**
  - Execute validation assertions clamping mutated state within $[0, 10{,}000]\text{ bp}$.
  - Emit domain breach violations if thermal runaway thresholds ($T > 10{,}000\text{ bp}$) are detected, halting execution before memory corruption occurs.

### Phase III: Thermal Contraction Structural Stress Accumulator

```plaintext
packages/300.engine/24.acoustic-transient.unit/
├── fce/
│   ├── transient.interface.ts        ◄── Stress threshold & cdB emission types
│   └── transient.bit.ts              ◄── Transient event dispatch payloads
├── transient.model.ts                ◄── Elastic strain storage models
├── transient.action.ts               ◄── Stick-slip friction mathematics
└── transient.reduce.ts               ◄── Acoustic impulse generator
```

#### Task: Implement Material Thermal Gradient Stress Evaluator

- **Target File:** `packages/300.engine/24.acoustic-transient.unit/transient.action.ts`
- **Implementation Details:**
  - Calculate physical contraction stress generated by rapid temperature drops:
    $$
    \Delta \sigma_{\text{shear}} = \left\lfloor \frac{\vert{}T_{t} - T_{t-\Delta t}\vert{} \times \alpha_{\text{expansion}} \times E_{\text{modulus}}}{10{,}000} \right\rfloor \text{[cite: 4, 7]}
    $$
  - Accumulate mechanical tension in integer basis points within the node's `structural_strain_bp` register.
  - Map material-specific expansion coefficients ($\alpha_{\text{iron}} = 120\text{ bps}$, $E_{\text{iron}} = 8{,}000\text{ bps}$).

#### Task: Construct Slip Stick Mechanical Shear Threshold Checker

- **Target File:** `packages/300.engine/24.acoustic-transient.unit/transient.action.ts`
- **Implementation Details:**
  - Evaluate structural bracket slippage when accumulated shear crosses static friction limits:
    $$
    \text{isSlipTriggered} \iff \sigma_{\text{shear}} \ge \sigma_{\text{yield\_threshold}} \quad (\sigma_{\text{yield}} = 4{,}500\text{ bp}) \text{}
    $$
  - Reset `structural_strain_bp` to base residual values ($300\text{ bp}$) upon slippage, modeling instant mechanical release.

#### Task: Emit Discrete Acoustic Impulse Centi Decibel Events

- **Target File:** `packages/300.engine/24.acoustic-transient.unit/transient.reduce.ts`
- **Implementation Details:**
  - Convert mechanical release energy into an uncompressed acoustic impulse rating:
    $$
    I_{\text{emission\_cdB}} = \text{baseImpulseCdB} + \left\lfloor \frac{\sigma_{\text{released}} \times 4{,}000}{10{,}000} \right\rfloor \text{[cite: 8, 9]}
    $$
  - Dispatch the `ACOUSTIC_IMPULSE_EMITTED` event with `sourceNodeId: 'loc_warm_pipe'`, `intensityCdB: 8500` ($85.0\text{ dB}$ groans), and `frequencyBand: 'LOW_RESONANCE_METALLIC'`.

### Phase IV: Acoustic Wavefront Breadth First Search Kernel

```plaintext
packages/300.engine/25.acoustic-wavefront.unit/
├── fce/
│   ├── wavefront.interface.ts        ◄── Wavefront receipt & edge damping types
│   └── wavefront.bit.ts              ◄── Propagation query descriptors
├── wavefront.model.ts                ◄── Room adjacency topology graphs
├── wavefront.action.ts               ◄── Max-energy Dijkstra integer solver
└── wavefront.reduce.ts               ◄── Energy dissipation traversal engine
```

#### Task: Construct Integer Centi Decibel Topological Wavefront Traversal

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/wavefront.action.ts`
- **Implementation Details:**
  - Implement maximum-energy path expansion over topological room graphs using priority queue dispatch:
    $$
    I(v) = I(u) - \Delta_{\text{distance}} - \Gamma_{\text{partition}}(u, v) \text{}
    $$
  - Represent all audio variables strictly in integer centi-decibels ($0\text{ dB} = 0\text{ cdB}$, $120\text{ dB} = 12{,}000\text{ cdB}$) to prevent rounding drift.
  - Apply air propagation loss: $\Delta_{\text{distance}} = 150\text{ cdB}$ per topological step.

#### Task: Implement Undirected Boundary Partition Attenuation Subtraction

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/wavefront.action.ts`
- **Implementation Details:**
  - Build symmetric partition attenuation lookup using canonical sorted-pair edge keys (`canonicalEdgeKey(u, v) = u < v ? u + '::' + v : v + '::' + u`):
    $$
    \Gamma_{\text{partition}}(u, v) \equiv \Gamma_{\text{partition}}(v, u) \text{}
    $$
  - Ingest structural partition damping values:
    - `open_archway`: $0\text{ cdB}$
    - `wood_lath_partition`: $1{,}500\text{ cdB}$ ($15.0\text{ dB}$)
    - `sheet_tin_duct`: $2{,}200\text{ cdB}$ ($22.0\text{ dB}$)
    - `riveted_iron_pipe_sleeve`: $2{,}500\text{ cdB}$ ($25.0\text{ dB}$)
    - `solid_stone_foundation`: $9{,}500\text{ cdB}$ ($95.0\text{ dB}$)

#### Task: Enforce Physics Driven Noise Floor Traversal Termination

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/wavefront.reduce.ts`
- **Implementation Details:**
  - Prune priority queue expansion paths the instant arriving intensity drops below local room noise floor:
    $$
    \text{terminatePath} \iff I(v) \le N_{\text{ambient}}(v) \text{[cite: 3, 8, 12]}
    $$
  - Bound graph traversals to $O(\vert{}V_{\text{audible}}\vert{})$ runtime, preventing unbounded flood fills across distant sectors.

### Phase V: Dual Criterion Audibility Verification Engine

```plaintext
packages/300.engine/25.acoustic-wavefront.unit/
├── audibility.model.ts               ◄── Auditory receipt schemas
├── audibility.action.ts              ◄── SNR & arrival bearing calculators
└── audibility.reduce.ts              ◄── Percept witness emission pipeline
```

#### Task: Implement Threshold Hearing Margin Comparator

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/audibility.action.ts`
- **Implementation Details:**
  - Evaluate the absolute somatic auditory threshold of listening entities:
    $$
    \text{clearsHearing} \iff I_{\text{arrival}}(v) \ge T_{\text{hearing}}(\text{actor}) \text{}
    $$
  - Ingest somatic debuffs: baseline goblin hearing threshold ($1{,}500\text{ cdB}$), concussive auditory trauma ($+1{,}500\text{ cdB}$ penalty).

#### Task: Construct Signal To Noise Ambient Floor Discriminator

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/audibility.action.ts`
- **Implementation Details:**
  - Verify signal-to-noise ratio margin against local room background noise:
    $$
    \text{clearsMasking} \iff I_{\text{arrival}}(v) - N_{\text{ambient}}(v) \ge \text{SNR}_{\min} \quad (\text{SNR}_{\min} = 600\text{ cdB}) \text{}
    $$
  - Calculate auditory evidence quality index clamped between $0$ and $1{,}000$ per-mille:
    $$
    Q_{\text{auditory}} = \text{clamp}\left(\left\lfloor \frac{I_{\text{arrival}} - (N_{\text{ambient}} + \text{SNR}_{\min})}{I_{\text{ref}} - (N_{\text{ambient}} + \text{SNR}_{\min})} \times 1000 \right\rfloor, \, 0, \, 1000\right) \text{[cite: 3, 6, 12]}
    $$

#### Task: Derive Listener Relative Hexagonal Arrival Bearing

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/audibility.action.ts`
- **Implementation Details:**
  - Trace previous node on the maximum-energy path arriving at the listener cell[cite: 3, 6, 8].
  - Map incoming vector to absolute hex lattice orientation ($0\dots 5$).
  - Break equal-energy path ties deterministically by selecting the lowest direction index[cite: 3, 6, 8].
  - Compute listener-relative bearing adjusted by character facing direction:
    $$
    \text{Bearing}_{\text{relative}} = (D_{\text{arrival}} - D_{\text{facing}} + 6) \pmod 6 \text{[cite: 6]}
    $$
  - Emit structured `AuditoryPerceptReceipt` into character perception mailboxes.

### Phase VI: Blessed Terminal Thermodynamic Inspection Console

```plaintext
apps/terminal/src/
├── cns00/
│   ├── views/
│   │   └── thermodynamics.view.ts    ◄── Blessed UI dashboard for thermal grids
│   └── menu/
│       └── thermodynamics.menu.ts    ◄── Interactive Blessed terminal controls
```

#### Task: Construct Blessed Terminal Thermal Topology View

- **Target File:** `apps/terminal/src/cns00/views/thermodynamics.view.ts`
- **Implementation Details:**
  - Render a dedicated terminal dashboard containing live thermodynamic gauges:
    - Node Identifier & Structural Material Type
    - Current Temperature ($T_{\text{bp}}$) with bar meter `[■■■■■□□□□□]`
    - Structural Shear Stress Accumulator ($\sigma_{\text{shear}}\text{ bp}$)[cite: 9]
    - Ambient Noise Floor ($N_{\text{ambient}}\text{ cdB}$)
  - Constrain interface layout strictly to standard 7-bit ASCII characters.

#### Task: Implement Interactive Physics Simulation Menu Options

- **Target File:** `apps/terminal/src/cns00/menu/thermodynamics.menu.ts`
- **Implementation Details:**
  - Register interactive operator actions inside the Blessed menu tree:
    - `[1] TICK THERMAL DISSIPATION 100 TICKS`
    - `[2] FORCE THERMAL SHOCK DROP (-1,500 bp)`
    - `[3] FIRE ACOUSTIC TEST IMPULSE (8,500 cdB)`
    - `[4] AUDIT AUDIBILITY MATRIX FOR BOG AND WART`
  - Dispatch actions directly to `packages/300.engine/23.thermodynamics.unit` and `packages/300.engine/25.acoustic-wavefront.unit` without executing network requests.

#### Task: Build Real Time Acoustic Wavefront ASCII Visualizer

- **Target File:** `apps/terminal/src/cns00/views/thermodynamics.view.ts`
- **Implementation Details:**
  - Render an ASCII topological schematic showing sound decay rings traversing across rooms:
    ```plaintext
    [loc_warm_pipe: 8500 cdB] ──(2500 cdB Iron)──► [loc_splinter_gap: 5850 cdB]
                                                        │
                                                 (1500 cdB Wood)
                                                        ▼
                                              [loc_pantry_wall: 4200 cdB]
    ```
  - Display auditory status tags: `AUDIBLE (CLEAR)`, `MASKED BY NOISE FLOOR`, or `BELOW HEARING THRESHOLD`.

### Phase VII: Physical Invariant Validation Suite

```plaintext
packages/300.engine/23.thermodynamics.unit/tests/
├── thermal.decay.test.ts             ◄── Monotonic decay verification
packages/300.engine/24.acoustic-transient.unit/tests/
├── stress.slip.test.ts               ◄── Stick-slip friction emission checks
packages/300.engine/25.acoustic-wavefront.unit/tests/
├── wavefront.reciprocal.test.ts      ◄── Symmetric acoustic path verification
└── performance.budget.test.ts        ◄── Sub-millisecond compute gauntlet
```

#### Task: Verify Monotonic Temperature Decay Determinism

- **Target File:** `packages/300.engine/23.thermodynamics.unit/tests/thermal.decay.test.ts`
- **Implementation Details:**
  - Advance a heated node ($8{,}000\text{ bp}$) toward ambient baseline ($2{,}000\text{ bp}$) over 50,000 centiseconds[cite: 1, 4].
  - Assert that for every sequential step, $T_{t+1} \le T_t$ holds without exception[cite: 1, 7].
  - Verify that single-step closed-form wake calculations yield bit-identical values compared to 50,000 iterative steps.

#### Task: Validate Acoustic Wavefront Reciprocal Symmetry

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/tests/wavefront.reciprocal.test.ts`
- **Implementation Details:**
  - Compute total attenuation between room pairs: $\text{PathLoss}(A \to B)$ and $\text{PathLoss}(B \to A)$[cite: 3, 6, 8].
  - Assert that $\text{PathLoss}(A \to B) \equiv \text{PathLoss}(B \to A)$ across all undirected graph topologies, verifying that partitions attenuate sound identically in both directions[cite: 3, 6, 8].
  - Confirm that a loud steam noise floor ($5{,}000\text{ cdB}$) correctly masks a $4{,}200\text{ cdB}$ arriving signal.

#### Task: Assert Sub Millisecond Execution Budget Compliance

- **Target File:** `packages/300.engine/25.acoustic-wavefront.unit/tests/performance.budget.test.ts`
- **Implementation Details:**
  - Execute 1,000 consecutive thermal dissipation steps and wavefront propagation sweeps on local CPU.
  - Assert that the mean execution time per cycle remains under $0.5\text{ ms}$, ensuring 36,000 ticks complete in $< 500\text{ ms}$ on workstation hardware.

### You

{{FOCUS : The Unified Pressure Meter Engine}}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

@local-repo-task-list-with-package-00

### Gemini

# Blueprint: Unified Pressure Meter Engine Implementation

**Repository:** `000.series-sower-engine`

**Package:** `300.engine`

**Target Environment:** Local Workstation (`Rig 1` Node.js POSIX Runtime)

**Execution Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`) & Simulation Engine Units

### Phase I: Mathematical Basis Point Primitive Foundation

```plaintext
packages/300.engine/12.paranoia.unit/
├── fce/
│   ├── pressure-meter.interface.ts   ◄── 0-10,000 bp bounds & domain categories
│   └── pressure-meter.bit.ts         ◄── Action envelope descriptors
```

#### Task: Define Bounded Integer Basis Point Nominal Type Brand

- **Target File:** `packages/300.engine/12.paranoia.unit/fce/pressure-meter.interface.ts`
- **Implementation Details:**
  - Define branded integer nominal type `BasisPoint` (`number & { readonly __brand: unique symbol }`).
  - Implement assertion helper `toBasisPoint(n: number): BasisPoint` enforcing integer constraints ($0 \le n \le 10{,}000$).
  - Strictly ban IEEE 754 floating-point operations from stress calculations to eliminate cross-platform divergence.

#### Task: Construct Polymorphic PressureMeter Interface Specification

- **Target File:** `packages/300.engine/12.paranoia.unit/fce/pressure-meter.interface.ts`
- **Implementation Details:**
  - Implement the standardized primitive interface:
    ```typescript
    export type PressureCategory =
      | 'SOMATIC_FATIGUE'
      | 'PHYSICAL_PAIN'
      | 'REFUSAL_STRAIN'
      | 'PARANOIA_CLOCK';
    export interface PressureMeter {
      readonly meter_id: string;
      readonly entity_id: string;
      readonly category: PressureCategory;
      readonly currentValueBp: BasisPoint;
      readonly baselineBp: BasisPoint;
      readonly decayRatePerCycleBp: BasisPoint;
      readonly thresholdLimitBp: BasisPoint;
      readonly postBreakState: string | null;
    }
    ```
  - Maintain domain decoupling: ensure somatic fatigue alters motor verbs without corrupting ideological refusal vectors.

#### Task: Specify Pressure Action Bit Envelopes

- **Target File:** `packages/300.engine/12.paranoia.unit/fce/pressure-meter.bit.ts`
- **Implementation Details:**
  - Define state dispatch action identifiers: `METER_INIT`, `METER_INJECT_FRICTION`, `METER_DECAY_STEP`, `METER_TRIP_BREAK`.
  - Declare payload contracts containing `entityId`, `meterCategory`, `deltaBp`, `cycleCount`, and `auditSequence`.

### Phase II: Thermodynamic Accumulator Reduction Kernel

```plaintext
packages/300.engine/12.paranoia.unit/
├── pressure.model.ts                 ◄── In-memory volatile meter storage
├── pressure.action.ts                ◄── Discrete thermodynamic decay math
└── pressure.reduce.ts                ◄── Pure deterministic state fold
```

#### Task: Implement Thermodynamic Flow Reduction Equation

- **Target File:** `packages/300.engine/12.paranoia.unit/pressure.action.ts`
- **Implementation Details:**
  - Implement the pure thermodynamic calculation:
    $$
    \text{Meter}_{t+1} = \max\left(\text{baselineBp}, \, \text{Meter}_t - \text{DecayRatePerCycleBp}\right) + \sum \text{FrictionEvents}
    $$
  - Ensure natural cooling cannot reduce the meter below its chronic floor (`baselineBp`).
  - Clamp upper evaluation results prior to post-break verification:
    $$
    \text{clampedValue} = \min(10{,}000, \, \text{evaluatedValue}) \text{}
    $$

#### Task: Implement Pure Reducer State Fold

- **Target File:** `packages/300.engine/12.paranoia.unit/pressure.reduce.ts`
- **Implementation Details:**
  - Implement pure state transition reducer without disk I/O or network dependencies:
    $$
    S_{n+1} = \mathcal{R}(S_n, \, E_n, \, \sigma_n)
    $$
  - Process incoming friction debits sequentially using immutable state cloning (`clone-deep`).
  - Strip operating system clock queries; derive temporal advancement strictly from incoming monotonic ticks.

#### Task: Construct Half Life Dissipation Scheduler

- **Target File:** `packages/300.engine/12.paranoia.unit/pressure.action.ts`
- **Implementation Details:**
  - Calculate discrete decay intervals across rest cycles without floating-point transcendental functions.
  - Support integer-based decay quantization during scene transitions and rest periods.

### Phase III: Inter-Meter Coupling Bridges

```plaintext
packages/300.engine/12.paranoia.unit/
├── bridge.interface.ts               ◄── Cross-domain coupling descriptors
├── bridge.action.ts                  ◄── Deterministic transfer calculators
└── bridge.reduce.ts                  ◄── Cross-contamination pipeline
```

#### Task: Implement Step Threshold Compression Bridge

- **Target File:** `packages/300.engine/12.paranoia.unit/bridge.action.ts`
- **Implementation Details:**
  - Build the somatic-to-psychological threshold compression logic:
    $$
    \text{effectiveThreshold} = \begin{cases} \text{scaleBasisPoints}(\text{thresholdLimitBp}, \, 8{,}000), & \text{if } \text{SOMATIC\_FATIGUE} \ge 8{,}000\text{ bp} \\ \text{thresholdLimitBp}, & \text{otherwise} \end{cases}
    $$
  - Compress refusal capacity by $20\%$ ($8{,}000\text{ bps}$) when physical exhaustion redlines.

#### Task: Build Dynamic Strain Transfer Drag Calculator

- **Target File:** `packages/300.engine/12.paranoia.unit/bridge.action.ts`
- **Implementation Details:**
  - Implement cross-contamination transfer between pain and paranoia in unlit rooms:
    $$
    \Delta \text{PARANOIA\_CLOCK} = \left\lfloor \frac{\Delta \text{PHYSICAL\_PAIN} \times K_{\text{bridge}}}{10{,}000} \right\rfloor \quad (K_{\text{bridge}} = 2{,}500) \text{}
    $$
  - Evaluate integer remainder preservation using Banker's Rounding to eliminate upward drift.

#### Task: Construct Entangled Caregiver Heat Sink Buffer

- **Target File:** `packages/300.engine/12.paranoia.unit/bridge.reduce.ts`
- **Implementation Details:**
  - Implement sacrificial stress redirection across entities sharing resonance lock `:ENTANGLED`:
    $$
    \text{Meter}_{\text{target}, \, t+1} = \text{Meter}_{\text{target}, \, t}
    $$
    $$
    \text{Meter}_{\text{caregiver}, \, t+1} = \text{Meter}_{\text{caregiver}, \, t} + \Delta \text{FrictionEvent}
    $$
  - Intercept catastrophic terminal breaks by transferring delta debits to the caregiver buffer.

### Phase IV: Post-Break Terminal State Execution

```plaintext
packages/300.engine/12.paranoia.unit/
├── break.model.ts                    ◄── Permanent mutation definitions
├── break.action.ts                   ◄── Rule breach tripwire evaluators
└── break.reduce.ts                   ◄── Permanent state transition applicator
```

#### Task: Implement Ceiling Overflow Tripwire Sensor

- **Target File:** `packages/300.engine/12.paranoia.unit/break.action.ts`
- **Implementation Details:**
  - Evaluate trigger predicate after applying friction events:
    $$
    \text{isTripped} \iff \text{currentValueBp} \ge \text{thresholdLimitBp}
    $$
  - Forbid silent resetting of stress counters when capacity limits are crossed.

#### Task: Construct Action Vocabulary Clamp Mutation

- **Target File:** `packages/300.engine/12.paranoia.unit/break.action.ts`
- **Implementation Details:**
  - Apply somatic motor restrictions when `SOMATIC_FATIGUE` breaches limits:
    - Downgrade allowable locomotion verbs from `RUN` to `SHUFFLE` or `LIMP`.
    - Throw validation assertion failures if prohibited verbs are attempted downstream.

#### Task: Build Permanent Refusal Vector Mutation Committer

- **Target File:** `packages/300.engine/12.paranoia.unit/break.reduce.ts`
- **Implementation Details:**
  - Execute irreversible transition to declared `postBreakState` (e.g., `PARALYZED`, `SUBSERVIENT`, `MANIC_RAGE`).
  - Remove banned token masks from character dialogue generation constraints.
  - Write the `PostBreakMutation` event into the mutable staging accumulator.

### Phase V: Acoustic Digital Signal Processing Bridge

```plaintext
packages/300.engine/27.somatic-dsp.unit/
├── fce/
│   ├── dsp-modifier.interface.ts     ◄── Pause dilation & vocal fry types
│   └── dsp-modifier.bit.ts           ◄── Telemetry payload descriptors
├── dsp.action.ts                     ◄── Algebraic modifier composition
└── dsp.reduce.ts                     ◄── Acoustic parameter packaging
```

#### Task: Implement Somatic Pause Dilation Formulations

- **Target File:** `packages/300.engine/27.somatic-dsp.unit/dsp.action.ts`
- **Implementation Details:**
  - Calculate respiratory pause frequency dilation from somatic exhaustion:
    $$
    \Pi_{\text{eff}} = \Pi_{\text{base}} \times \left(1.0 + \frac{\text{SOMATIC\_FATIGUE}_{\text{bps}}}{10{,}000} \times \kappa_{\text{exhaust}}\right) \text{}
    $$
  - Scale `pause_frequency_multiplier` up to $2.8\times$ when fatigue exceeds $8{,}000\text{ bp}$.

#### Task: Build Vocal Fry Tension Density Modulator

- **Target File:** `packages/300.engine/27.somatic-dsp.unit/dsp.action.ts`
- **Implementation Details:**
  - Calculate subharmonic glottal rattle density from physical pain and threat:
    $$
    \Phi_{\text{eff}} = \text{clamp}\left(\Phi_{\text{base}} + \frac{\text{PHYSICAL\_PAIN}_{\text{bps}}}{10{,}000} \times 0.6, \, 0.0, \, 1.0\right) \text{[cite: 2, 6]}
    $$
  - Inject glottal rattle at sentence decay to reflect somatic depletion.

#### Task: Implement Acoustic Master Clock Quantization Packager

- **Target File:** `packages/300.engine/27.somatic-dsp.unit/dsp.reduce.ts`
- **Implementation Details:**
  - Package calculated DSP modifiers for IPC handoff to the local TTS microservice (`localhost:8000`).
  - Calculate expected duration expansion to inform downstream 24 fps timeline allocation.

### Phase VI: Blessed Terminal Telemetry Inspection Console

```plaintext
apps/terminal/src/
├── cns00/
│   ├── views/
│   │   └── pressure-telemetry.view.ts ◄── Blessed UI dashboard for meters
│   └── menu/
│       └── pressure.menu.ts           ◄── Blessed interactive menu options
```

#### Task: Construct Blessed Terminal Multi Meter HUD View

- **Target File:** `apps/terminal/src/cns00/views/pressure-telemetry.view.ts`
- **Implementation Details:**
  - Build a 12-column Blessed terminal layout rendering live character stress gauges:
    - Entity Identifier & Selected Character Target
    - Parallel Gauges: `SOMATIC_FATIGUE`, `PHYSICAL_PAIN`, `REFUSAL_STRAIN`, `PARANOIA_CLOCK`
    - Visual Bar Graph: `[■■■■■■■□□□] 7,200 / 10,000 bp`
    - Active Status Badges: `NOMINAL`, `STRAINED`, `ACUTE DEGRADATION`, `TERMINAL BREAK`[cite: 3]
  - Restrict terminal output to 7-bit clean ASCII characters.

#### Task: Implement Interactive Terminal Pressure Menu

- **Target File:** `apps/terminal/src/cns00/menu/pressure.menu.ts`
- **Implementation Details:**
  - Add menu options inside `98.menu.unit`:
    - `[1] INJECT SOMATIC EXERTION (+2,500 bp)`
    - `[2] INJECT PSYCHOLOGICAL REFUSAL STRAIN (+3,000 bp)`[cite: 2]
    - `[3] EXECUTE REST CYCLE DECAY STEP`
    - `[4] FORCE POST BREAK TERMINAL TRANSITION`
  - Route selections to `packages/300.engine/12.paranoia.unit` via the internal event bus without network calls.

#### Task: Build Non Blocking Telemetry Feed Streamer

- **Target File:** `apps/terminal/src/cns00/views/pressure-telemetry.view.ts`
- **Implementation Details:**
  - Connect view to `83.console.unit` (`cns00`) to log meter state transitions.
  - Throttle UI updates using `setImmediate()` to maintain 60 FPS terminal responsiveness during batch runs.

### Phase VII: Pressure Engine Invariant Test Suite

```plaintext
packages/300.engine/12.paranoia.unit/tests/
├── basis-point.bounds.test.ts        ◄── 0 to 10,000 bp clamp verification
├── domain.isolation.test.ts          ◄── Decoupling verification
├── post-break.irreversibility.test.ts◄── Terminal transition permanence checks
└── dsp.coupling.test.ts              ◄── Acoustic dilation parameter checks
```

#### Task: Build Basis Point Arithmetic Invariant Test Suite

- **Target File:** `packages/300.engine/12.paranoia.unit/tests/basis-point.bounds.test.ts`
- **Implementation Details:**
  - Test edge boundary conditions ($0$, $5{,}000$, $10{,}000\text{ bp}$).
  - Verify that injecting values exceeding $10{,}000\text{ bp}$ clamps correctly and flags terminal transitions.
  - Assert that attempting to assign floating-point numbers triggers compile-time and runtime type violations.

#### Task: Validate Domain Isolation Invariant

- **Target File:** `packages/300.engine/12.paranoia.unit/tests/domain.isolation.test.ts`
- **Implementation Details:**
  - Simulate 50 sequential high-friction physical exertion events ($+9{,}000\text{ bp}$ `SOMATIC_FATIGUE`).
  - Assert that `REFUSAL_STRAIN` remains completely unaffected in the absence of explicit bridge rules.
  - Verify that motor verbs clamp to `SHUFFLE` while moral taboos remain intact.

#### Task: Verify Post Break Irreversibility Invariant

- **Target File:** `packages/300.engine/12.paranoia.unit/tests/post-break.irreversibility.test.ts`
- **Implementation Details:**
  - Force `REFUSAL_STRAIN` across the threshold limit ($10{,}000\text{ bp}$).
  - Assert that the character trips into the designated `postBreakState`.
  - Verify that subsequent rest cycles and decay reductions do not revert the applied state mutation[cite: 1, 2].

#### Task: Validate Somatic Acoustic Dilation Parameters

- **Target File:** `packages/300.engine/12.paranoia.unit/tests/dsp.coupling.test.ts`
- **Implementation Details:**
  - Ingest a `SOMATIC_FATIGUE` state of $8{,}500\text{ bp}$.
  - Assert that calculated `pause_frequency_multiplier` equals $2.8\times$ and `vocalFryDensity` clears $0.85$.
  - Confirm that baseline speech profiles ($0\text{ bp}$) evaluate to neutral multipliers ($1.0\times$).

### You

{{FOCUS : Feature The Fast-Forward Brake Tripwire}}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

@local-repo-task-list-with-package-00

### Gemini

# Blueprint: The Fast-Forward Brake Tripwire Implementation

**Repository:** `000.series-sower-engine`

**Package:** `packages/300.engine`

**Target Environment:** Local Workstation (`Rig 1` Node.js POSIX Runtime)

**Execution Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`) & Simulation Engine Units

### Phase I: Mathematical Tripwire Predicate Foundation

```plaintext
packages/300.engine/28.tripwire.unit/
├── fce/
│   ├── tripwire.interface.ts         ◄── Predicate contracts, TripwireTriggerRecord
│   └── tripwire.bit.ts               ◄── Action bit descriptors for brake dispatch
```

#### Task: Define Bounded Tripwire Condition Interface

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.interface.ts`
- **Implementation Details:**
  - Define `TripwirePredicateRecord` using branded integer nominal types for all coordinate and tension fields:
    ```typescript
    export type TripwireCategory =
      | 'AXIAL_PROXIMITY'
      | 'GRIEVANCE_BOIL_OVER'
      | 'PARANOIA_SATURATION'
      | 'SOMATIC_COLLAPSE';
    export interface TripwireCondition {
      readonly tripwire_id: string;
      readonly category: TripwireCategory;
      readonly participant_ids: readonly [string, string];
      readonly axial_threshold_units: number;
      readonly grievance_ceiling_bp: number;
      readonly cooldown_ticks_required: number;
      readonly is_armed: boolean;
    }
    ```
  - Assert strict integer basis-point normalization $[0, 10{,}000]\text{ bp}$ for grievance metrics.
  - Ban floating-point math and runtime system clock queries (`Date.now()`, `performance.now()`).

#### Task: Construct Fast Sim Tripwire Trigger Payload Schema

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.interface.ts`
- **Implementation Details:**
  - Declare `TripwireTriggerReceipt`:
    - `tripped_at_tick: number` (`SimTime` integer)
    - `primary_entity_id: string` (`char_bog`)
    - `secondary_entity_id: string` (`char_wart`)
    - `location_id: string` (`loc_warm_pipe`)
    - `observed_axial_distance: number` ($d_{\text{axial}} \le 1$)
    - `observed_grievance_intensity_bp: number` ($I_{\text{curr}} \ge 8{,}000\text{ bp}$)
    - `master_hash_anchor: string` (64-character SHA-256 state seal)

#### Task: Define Brake Action Bit Enumerations

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.bit.ts`
- **Implementation Details:**
  - Declare action indices: `TRIPWIRE_INIT`, `TRIPWIRE_ARM`, `TRIPWIRE_POLL`, `TRIPWIRE_ENGAGE_BRAKE`, `TRIPWIRE_DISARM`.
  - Expose strong typing in `TripwireBit.slv` for `TripwireTriggerReceipt` and simulation state handles.

### Phase II: Multi-Vector Predicate Evaluation Kernel

```plaintext
packages/300.engine/28.tripwire.unit/
├── tripwire.model.ts                 ◄── Predicate rule registries
├── tripwire.action.ts                ◄── Pure boolean evaluation logic
└── tripwire.reduce.ts                ◄── Clock brake state transitions
```

#### Task: Implement Pure Dyadic Proximity Evaluator

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.action.ts`
- **Implementation Details:**
  - Ingest actor coordinate entries from `10.location.unit` and compute axial hex distance:
    $$
    d_{\text{axial}}(A, B) = \max(\vert{}q_A - q_B\vert{}, \, \vert{}r_A - r_B\vert{}, \, \vert{}(-q_A - r_A) - (-q_B - r_B)\vert{})
    $$
  - Evaluate proximity trip predicate without allocating intermediate heap objects:
    $$
    \text{isProximityTripped} \iff d_{\text{axial}}(A, B) \le C_{\text{axial\_threshold}} \quad (C_{\text{threshold}} = 1) \text{}
    $$

#### Task: Build Grievance Boil-Over Ceiling Detector

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.action.ts`
- **Implementation Details:**
  - Read dyadic grievance records from relational working state:
    $$
    \text{isBoilingOver} \iff (I_{\text{curr}} \ge I_{\text{ceiling}}) \land (\text{cooldown\_ticks} === 0) \text{}
    $$
  - Verify that `char_bog` and `char_wart` breach the threshold at $8{,}000\text{ bp}$ upon spatial convergence.

#### Task: Assemble Compound Tripwire Evaluation Gate

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.action.ts`
- **Implementation Details:**
  - Implement short-circuit logical conjunct:
    $$
    \text{TripCondition} = \text{isProximityTripped} \land \text{isBoilingOver} \land \text{isArmed} \text{}
    $$
  - Execute evaluation in $O(1)$ operations per tick within the centisecond loop.
  - Return deterministic trigger flag immediately upon condition satisfaction.

### Phase III: Clock Brake State Freeze & Volatile Sealing

```plaintext
packages/300.engine/28.tripwire.unit/
├── freeze.model.ts                   ◄── Immutable snapshot state cache
├── freeze.action.ts                  ◄── Deep-freeze & SHA-256 state sealing
└── freeze.reduce.ts                  ◄── Simulation clock freeze handler
```

#### Task: Construct Clock Brake Loop Halting Interceptor

- **Target File:** `packages/300.engine/28.tripwire.unit/freeze.action.ts`
- **Implementation Details:**
  - Intercept `17.tick.unit` dispatch loop directly when `TripCondition` evaluates to `true`.
  - Freeze global tick advancement at the current tick ($t = 28{,}410$).
  - Calculate and record remaining unconsumed ticks ($\Delta_{\text{remaining}} = 36{,}000 - 28{,}410 = 7{,}590\text{ ticks}$) for downstream restoration.

#### Task: Implement Recursive In-Memory State Deep Freeze

- **Target File:** `packages/300.engine/28.tripwire.unit/freeze.action.ts`
- **Implementation Details:**
  - Clone the working simulation slice ($S_{28410}$) using `clone-deep`.
  - Apply recursive `Object.freeze()` traversal across all entities, inventory items, and meter states.
  - Assert that subsequent accidental property mutations on $S_{28410}$ throw runtime `TypeError` exceptions.

#### Task: Build Cryptographic Snapshot Merkle Anchor Sealer

- **Target File:** `packages/300.engine/28.tripwire.unit/freeze.action.ts`
- **Implementation Details:**
  - Canonicalize frozen snapshot JSON using RFC 8785 lexicographical key ordering.
  - Compute the SHA-256 digest:
    $$
    H_{28410} = \text{SHA-256}(\text{CanonicalJSON}(S_{28410})) \text{}
    $$
  - Stamp $H_{28410}$ into `04.envelope.unit` as the immutable baseline anchor for the dramatic encounter.

### Phase IV: Local Relational Execution Lease Management

```plaintext
packages/300.engine/02.database.unit/
├── fce/
│   ├── lease.interface.ts            ◄── Lease lock schema & status enums
│   └── lease.bit.ts                  ◄── Lease action envelopes
├── lease.action.ts                   ◄── SQLite CAS lock acquisition
└── lease.reduce.ts                   ◄── Transactional state transitions
```

#### Task: Define Local Execution Lease Relational Table Schema

- **Target File:** `packages/300.engine/02.database.unit/fce/lease.interface.ts`
- **Implementation Details:**
  - Define SQLite schema contract for execution governance:
    ```sql
    CREATE TABLE IF NOT EXISTS world_execution_leases (
      lease_id TEXT PRIMARY KEY,
      series_slug TEXT NOT NULL,
      status TEXT CHECK(status IN ('FREE_RUNNING', 'ENGAGED_IN_SCENE', 'HALTED_BREACH')) NOT NULL,
      locked_at_tick INTEGER NOT NULL,
      lease_owner TEXT NOT NULL,
      fencing_token INTEGER NOT NULL,
      created_at_ms INTEGER NOT NULL
    );
    ```
  - Assert zero nullable columns on integrity-critical fields.

#### Task: Implement Compare-And-Swap Execution Lease Acquisition

- **Target File:** `packages/300.engine/02.database.unit/lease.action.ts`
- **Implementation Details:**
  - Implement atomic lock acquisition in local SQLite:
    ```sql
    UPDATE world_execution_leases
    SET status = 'ENGAGED_IN_SCENE',
        locked_at_tick = 28410,
        lease_owner = 'stage4_duel_resolver',
        fencing_token = fencing_token + 1
    WHERE series_slug = 'under-the-floorboards' 
      AND status = 'FREE_RUNNING';
    ```
  - Verify that exactly 1 row was mutated; throw an execution collision exception if the status was already claimed.

#### Task: Build Execution Fencing Token Validator

- **Target File:** `packages/300.engine/02.database.unit/lease.action.ts`
- **Implementation Details:**
  - Validate `fencing_token` on every state write during the brake window.
  - Reject out-of-order writes from background tasks or expired execution contexts with a hard state abort.

### Phase V: Tabletop Arbitration Handoff Pipeline

```plaintext
packages/300.engine/29.arbitration-handoff.unit/
├── handoff.model.ts                  ◄── IR transport queues
├── handoff.action.ts                 ◄── Stage 4 duel payload synthesis
└── handoff.reduce.ts                 ◄── Dispatcher to 2d6 resolver
```

#### Task: Synthesize Stage Four Duel Initiation Payload

- **Target File:** `packages/300.engine/29.arbitration-handoff.unit/handoff.action.ts`
- **Implementation Details:**
  - Assemble the conflict descriptor from $S_{28410}$:
    - `actor_a`: `char_bog` (Modifier: Spite $+2$, Somatic Strain $0\text{ bp}$)
    - `actor_b`: `char_wart` (Modifier: Cunning $0$, Somatic Impairment $-1$)
    - `contested_item`: `item_grease_bucket`
    - `location_id`: `loc_warm_pipe`
  - Format payload for the Stage 4 dual-set 2d6 mechanical gauntlet.

#### Task: Construct Pre-Resolution ScenePlan Intermediate Representation

- **Target File:** `packages/300.engine/29.arbitration-handoff.unit/handoff.action.ts`
- **Implementation Details:**
  - Structure the ScenePlan IR contract:
    ```typescript
    export interface ScenePlanIR {
      readonly scene_plan_id: string;
      readonly tick_origin: number;
      readonly mechanical_tier: 'COSTLY_WIN';
      readonly mandated_winner: 'char_bog';
      readonly mandated_loser: 'char_wart';
      readonly required_exit_conditions: {
        readonly item_transfers: readonly [{ item_id: 'item_grease_bucket'; to: 'floor_seam' }];
        readonly somatic_deltas: readonly [{ agent_id: 'char_bog'; strain_delta_bp: 450 }];
      };
    }
    ```
  - Enforce immutability prior to handing off to authoring tools.

#### Task: Build Immutable Outbox Handoff Buffer

- **Target File:** `packages/300.engine/29.arbitration-handoff.unit/handoff.reduce.ts`
- **Implementation Details:**
  - Buffer the synthesized ScenePlan IR into an isolated volatile outbox queue.
  - Lock the simulation pipeline until the external dramatic resolution or authoring review signals release.

### Phase VI: Blessed Terminal Tripwire Flight Deck

```plaintext
apps/terminal/src/
├── cns00/
│   ├── views/
│   │   └── tripwire-sentinel.view.ts ◄── Blessed UI dashboard for brake status
│   └── menu/
│       └── tripwire.menu.ts          ◄── Interactive Blessed terminal controls
```

#### Task: Construct Blessed Tripwire Sentinel Telemetry View

- **Target File:** `apps/terminal/src/cns00/views/tripwire-sentinel.view.ts`
- **Implementation Details:**
  - Build a dedicated terminal dashboard containing live tripwire monitors:
    - Clock State: `RUNNING` vs. `BRAKE_ENGAGED (TICK: 28,410)`
    - Active Proximity: `d_axial = 1 (MELEE CONTACT)`
    - Dyadic Grievance: `[■■■■■■■■□□] 8,000 / 8,000 bp (BOIL-OVER)`
    - Lease Lock: `STATUS = ENGAGED_IN_SCENE | OWNER: stage4_duel_resolver`
  - Constrain interface layout strictly to standard 7-bit ASCII characters.

#### Task: Implement Interactive Tripwire Menu Options

- **Target File:** `apps/terminal/src/cns00/menu/tripwire.menu.ts`
- **Implementation Details:**
  - Register interactive operator actions inside the Blessed menu tree:
    - `[1] ARM ALL PROXIMITY & GRIEVANCE TRIPWIRES`
    - `[2] FORCE MANUAL CLOCK BRAKE ENGAGEMENT`
    - `[3] INSPECT FROZEN SNAPSHOT STATE (S_28410)`
    - `[4] RELEASE BRAKE & JUMP SIMULATION CLOCK (+1,840 ticks)`
  - Route selections to `packages/300.engine/28.tripwire.unit` via the internal event bus without network calls.

#### Task: Build Non-Blocking Tripwire Alert Banner Streamer

- **Target File:** `apps/terminal/src/cns00/views/tripwire-sentinel.view.ts`
- **Implementation Details:**
  - Connect view to `83.console.unit` (`cns00`) to log brake engagement telemetry.
  - Render ASCII emergency brake frame upon tripwire activation:
    ```plaintext
    >> ==============================================================
    >> [CLOCK BRAKE TRIPPED]: Tick 28,410
    >> Cause: Axial Proximity (d=1) & Grievance Boil-Over (8,000 bp)
    >> Entities: char_bog vs char_wart at loc_warm_pipe
    >> State snapshot S_28410 sealed with SHA-256 hash.
    >> Fast-forward halted. Handoff to Stage 4 Mechanical Duel.
    >> ==============================================================
    ```

### Phase VII: Clock Brake Invariant Verification Gauntlet

```plaintext
packages/300.engine/28.tripwire.unit/tests/
├── tripwire.predicate.test.ts        ◄── Axial & grievance boolean evaluation
├── clock.freeze.test.ts              ◄── Monotonic tick freeze verification
├── state.deep-freeze.test.ts         ◄── Object.freeze & Merkle hash validation
└── lease.sqlite-cas.test.ts          ◄── Transactional lease acquisition tests
```

#### Task: Verify Multi-Vector Tripwire Predicate Bounds

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/tripwire.predicate.test.ts`
- **Implementation Details:**
  - Evaluate test scenarios with $d_{\text{axial}} = 2$ and $I = 8{,}000\text{ bp}$; assert that the tripwire remains unengaged.
  - Evaluate $d_{\text{axial}} = 1$ with $I = 7{,}999\text{ bp}$; assert that the tripwire remains unengaged.
  - Evaluate $d_{\text{axial}} = 1$ with $I = 8{,}000\text{ bp}$; assert that the tripwire engages at the exact evaluation cycle.

#### Task: Assert Strict Clock Freeze Monotonicity

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/clock.freeze.test.ts`
- **Implementation Details:**
  - Advance the simulation toward a planned 36,000-tick run with an armed tripwire set for Tick 28,410.
  - Assert that `currentTick` halts at $28{,}410$ and refuses further advancement while the brake is engaged.
  - Confirm that background environmental integrators stop accumulating ticks.

#### Task: Verify Snapshot Immutability and Merkle Hash Integrity

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/state.deep-freeze.test.ts`
- **Implementation Details:**
  - Attempt to mutate property fields on $S_{28410}$ inside a test assertion; verify that a `TypeError` is thrown.
  - Recompute SHA-256 canonical hash across multiple runs; assert bit-exact hash parity.

#### Task: Validate SQLite CAS Execution Lease Concurrency

- **Target File:** `packages/300.engine/02.database.unit/tests/lease.sqlite-cas.test.ts`
- **Implementation Details:**
  - Execute two simultaneous lease acquisition attempts against `:memory:` SQLite.
  - Assert that the first transaction claims `ENGAGED_IN_SCENE` and increments `fencing_token`.
  - Verify that the competing transaction fails with a lease acquisition collision error.
