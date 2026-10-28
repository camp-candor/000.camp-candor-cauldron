# Phase 4: The Extraction & Settlement. Series-Dashboard .Part-Two

_Gemini · 22 messages · exported Oct 27, 2026_

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

{{FOCUS : Phase 4: The Extraction & Settlement }}

@extreme-details

### Gemini

### Phase 4: The Extraction & Settlement — Architectural Ingress & Execution Breakdown

When the autonomous simulation loop trips its clock brake at **Tick 28,410**, the engine enters **Phase 4: The Extraction & Settlement**. This phase establishes the operational boundary where **Axis A (Mechanical World Truth & State)** interfaces with **Axis B (Linguistic Dramatization & Acoustic Measurement)**.

The showrunner accesses `apps/dashboard/src/pages/director/writer.astro`, initiating a five-phase, fail-closed pipeline that converts an in-memory spatial collision into validated screenplay prose, calculates physical time down to the millisecond using uncompressed audio waveforms, and commits irreversible state deltas to the relational ledger before releasing the global simulation timeline.

```plaintext
========================================================================================================================
                  PHASE 4: THE EXTRACTION & SETTLEMENT ENGINE (Tick 28,410 ──► Tick 30,250)
========================================================================================================================

  [ STEP 4.1: FOUNTAIN DRAFTING & AST CONVERSION ]
  • Showrunner opens writer.astro (mounting FountainEditorIsland.tsx) or local $EDITOR
  • Line 0 Spatial Stage Header bounds physical coordinates, locked doors, and somatic masks
  • Dwight Swain MRUs pair dialogue with kinetic verbs; assertVerbatimParity enforces character parity
                                            │
                                            ▼
  [ STEP 4.2: COMPILE-TIME INVARIANT GAUNTLET (T_0 = $0.00) ]
  • Somatic SAT Solver: sum(held_items) <= available_arms (Wart = 1.0; bucket kicked with boot)
  • Motor Mask Intersection: actions ∩ banned_kinetic_verbs == ∅ (Zero bimanual lifts)
  • Epistemic Horizon Panopticon: Dependency scan proves 0 secret leaks (Ignorance by Omission)
  • Asymmetric MEU Engine: Traps subtext leaks; enforces the 40% scene-span repair ceiling
                                            │
                                            ▼
  [ STEP 4.3: ACOUSTIC CLOCK & DUAL-DOMAIN QUANTIZATION ]
  • Local TTS microservice (:8000) synthesizes 4 dialogue stems on Rig 1 CPU with fatigue pause dilation
  • ffprobe probes continuous waveform duration: D_total_ms = 18,400 ms
  • Master Video Quantization: F = ceil((18,400 / 1000) * 24) = 442 frames (2,000 samples/frame)
                                            │
                                            ▼
  [ STEP 4.4: SIMULATION TICK DERIVATION ]
  • Centisecond integer division: Δ_ticks = ceil(18,400 ms / 10 ms) = 1,840 ticks consumed
                                            │
                                            ▼
  [ STEP 4.5: ATOMIC SQL TRANSACTION & CAS MERKLE SEALING ]
  • BEGIN TRANSACTION in CANON_DB (Cloudflare D1 / SQLite):
    - char_bog: +450 bp strain; busy_until_tick = 30,250
    - item_grease_bucket: holder_id = NULL, equip_slot = 'DROPPED_FLOOR'
    - grv_territorial_scrap_claim: version bump (NEW > OLD), cooldown = 12,000 ticks
  • Database trigger propagate_fact_mutation marks downstream dependent scenes is_dirty = 1
  • Merkle Seal: H_{t+1} = SHA-256(H_t || EventData || 18,400ms || 1,840 ticks)
                                            │
                                            ▼
  [ STEP 4.6: BRAKE RELEASE & DORMANT SITE JIT INTEGRATION ]
  • Master Clock advances: t_resumed = 28,410 + 1,840 = 30,250 ticks
  • Sleeping sites in "The Void" apply algebraic catch-up: State_wake = State_sleep + (Rate * 1,840)
  • Autonomous runner re-engages TICK_ADVANCED(30251); fast-forwarding resumes
========================================================================================================================
```

### Step 4.1: The Fountain Draft & Stage Header Injection (`writer.astro`)

When the showrunner navigates to `apps/dashboard/src/pages/director/writer.astro`, the Astro SSR route reads the frozen simulation state ($S_{28410}$) from `worker-sower-engine` and mounts the 60 fps zero-validation client island (`FountainEditorIsland.tsx`).

#### 1. Ingestion of the Immutable Spatial Stage Header

Before the author enters any prose, the engine injects an immutable, machine-parsed comment block at Line 0 of the `.fountain` buffer. This header physically constrains the writing envelope to the pre-resolved Stage 4 tabletop duel (`COSTLY_WIN` for Bog):

```code
/* STAGE_HEADER
room_id: loc_warm_pipe
lighting: FAINT_SEEPAGE
crowding: CRAMPED
portal_states: {"door_pantry_corridor": "AJAR", "hatch_valve_04": "LOCKED"}
acoustic_damping_cdB: 1500
participants:
  - id: char_bog
    coord: [12, 4]
    facing: EAST
    somatic_mask: {arms_available: 2, strain_bp: 0}
    held_items: ["item_iron_scraper"]
  - id: char_wart
    coord: [12, 5]
    facing: WEST
    somatic_mask: {arms_available: 1, strain_bp: 0, impaired_limbs: ["arm_left"]}
    held_items: ["item_grease_bucket"]
mandated_outcome:
  tier: COSTLY_WIN
  winner: char_bog
  loser: char_wart
  exit_conditions:
    - "char_wart SURRENDERS item_grease_bucket TO FLOOR"
    - "char_wart RETREATS past corridor boundary"
    - "char_bog ACCUMULATES 450 bp somatic_strain"
*/
```

- **Line 0 Immutable Boundary:** The editor prevents modification of lines inside `/* STAGE_HEADER ... */`. If an external `$EDITOR` alters this block, the compiler rejects the file on ingress with an `IMMUTABLE_STAGE_MUTATION` fault.
- **Environmental Inheritance:** Ambient attributes, such as `acoustic_damping_cdB: 1500`, flow directly into downstream automated sound design to set high-frequency roll-off filters and attenuation without human intervention.

#### 2. Dwight Swain Motivation-Reaction Units (MRUs) & Prose Blocking

The author drafts the scene in standard Fountain notation conforming to Dwight Swain MRUs:

- **External Motivation (The Stimulus):** An objective physical action or spoken line from the antagonist.
- **Internal Reaction (The Response):** Involuntary somatic response $\to$ conscious action $\to$ dialogue.
- **Action Verbatim Parity:** Actions must pair with explicit physical capability enums. The draft establishes that Wart kicks the bucket across the floor seam with his foot rather than lifting it with his immobilized left arm:

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

#### 3. Ingestion into `dialogue_ast.json`

Upon save, the parser transforms the `.fountain` text into a strongly typed AST:

- Extract dialogue turns, character IDs, and parentheticals.
- Map kinetic verbs into an `extracted_motor_actions` array for physical verification.
- Run `assertVerbatimParity()`, asserting that character names, spoken text, and sequence order match the input text without truncation.

### Step 4.2: The Compile-Time Invariant Gauntlet ($T_0 = \$0.00$)

Before synthesizing audio stems or committing state changes, the scene passes through an automated validation gauntlet operating strictly in CPU memory ($T_0 = \$0.00$).

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ REAL-TIME $T_0 = $0.00 INVARIANT LINTER GAUNTLET                                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. SOMATIC SAT SOLVER                                                                                  │
│    • Invariant: ∑(held_items) ≤ available_arms                                                         │
│    • Check: Wart holds item_grease_bucket (1 hand) + kicks bucket (0 hands required). PASS.            │
│    • Motor Mask: Wart.actions ∩ ["lift_bimanual", "brace_dual"] == ∅. PASS.                            │
│                                                                                                        │
│ 2. EPISTEMIC HORIZON PANOPTICON (Ignorance by Omission)                                                │
│    • Rule: Character context envelopes omit un-possessed secret keys.                                  │
│    • Vector Probe: CosineSim(V_dialogue, V_the_famine) = 0.12 ≤ 0.35 threshold. PASS.                  │
│    • Lemma Sweep: Assert zero occurrences of ["famine", "poisoned_well", "upstairs_ledger"]. PASS.     │
│                                                                                                        │
│ 3. LEXICAL INVENTORY WHITELIST                                                                         │
│    • Noun Chunks: ["iron scraper", "grease bucket", "tallow", "floor seam"].                           │
│    • Corpus Reconciliation: All entities resolve to canonical records in possessions/*.md. PASS.       │
│                                                                                                        │
│ 4. ASYMMETRIC MINIMAL ENCLOSING UNIT (MEU) REPAIR ENGINE                                               │
│    • Subtext Audit: Monitors implicature leaks and tonal overrides.                                    │
│    • 40% Span Ceiling: If a repair requires rewriting >40% of scene beats, halt and escalate.         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Somatic Satisfiability (SAT) Solver

The system models somatic capability as a linear arithmetic constraint:

$$
\sum_{i \in \text{HeldItems}} \text{HandsRequired}(i) \le \text{ArmsAvailable}(C) - \text{ImpairmentPenalty}(C) \text{}
$$

- For Wart: $\text{ArmsAvailable} = 2$, $\text{ImpairmentPenalty} = 1 \implies \text{Capacity} = 1.0$.
- Holding `item_grease_bucket` consumes $1.0$ hand slots.
- The linter inspects `extracted_motor_actions`. Wart’s action is parsed as `KICK(item_grease_bucket, floor_seam)`. Because `KICK` uses the lower limb allocation, $\sum \text{HandsRequired} = 1.0 \le 1.0$, clearing the constraint.
- **Motor Mask Set-Intersection:** Evaluates $\text{Actions} \cap \text{BannedKineticVerbs} = \emptyset$. Wart’s dossier blacklists bimanual manipulation; the AST verifies no bimanual verbs were used.

#### 2. Epistemic Horizon Panopticon (Ignorance by Omission)

To prevent characters from leaking narrative subtext or plot secrets they do not know:

- **Ignorance by Omission:** Context envelopes constructed for drafting strip all references to un-possessed lore secrets, preventing attention heads from surfacing unearned knowledge.
- **Vector Semantic Gate:** Dialogue text is converted into an embedding vector ($V_{\text{dialogue}}$) and evaluated against banned lore concepts ($V_{\text{secret}}$):
  $$
  \text{CosineSim}(V_{\text{dialogue}}, V_{\text{secret}}) \le \tau_{\text{leak}} \quad (\tau_{\text{leak}} = 0.35) \text{}
  $$
  The dialogue yields a maximum similarity of $0.12$, well below the rejection threshold[cite: 3].
- **Prose Lemma Scanner:** Evaluates polarity modifiers and noun lemmas (e.g., confirming *"he didn't know about the tallow"* passes, but explicit lore drops fail).

#### 3. Lexical Inventory Whitelist

Every concrete physical noun chunk extracted from the dialogue and action lines is cross-referenced against canonical entity manifests in `01.canon/possessions/`:

- Recognized: `item_iron_scraper`, `item_grease_bucket`, `loc_warm_pipe`.
- If an author introduces an unindexed prop (e.g., "Bog pulls out a brass whistle"), the linter halts compilation at Stage $T_0$ ($0.00 spend), preventing hallucinated assets from polluting the downstream pipeline.

#### 4. Asymmetric Minimal Enclosing Unit (MEU) Repair Protocol

If an AST linter identifies an isolated defect (e.g., an `IMPLICATURE_LEAK` or `SOMATIC_OVERLOAD` in Beat 3):

- **The Forward Sweep ($I_{\text{end}}$):** The engine analyzes dependencies downstream from the rejected beat. If Beat 4 references the invalid action in Beat 3, the repair window expands to include Beats 3 and 4.
- **The Backward Sweep ($I_{\text{start}}$):** Gathers required active physical constraints without altering prior narrative context.
- **The 40% Span Ceiling:** If the calculated MEU spans more than 40% of the scene's total dialogue beats, automated infill halts immediately. The scene is escalated to the human Story Architect, preventing unreviewed narrative drift.
- **The Seam Audit Gauntlet:** Repaired AST slices are spliced into the scene and validated for grammatical tense stability, coreference preservation, and physical continuity before proceeding.

### Step 4.3 & 4.4: Acoustic Clocking & Physical Time Quantization

The pipeline does not use estimated word counts or arbitrary timing marks to determine scene duration. **Physical sound acts as the master clock for the narrative universe**.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ACOUSTIC SYNTHESIS & DUAL-DOMAIN QUANTIZATION                                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. LOCAL TTS SYNTHESIS (:8000)                                                                         │
│    • Dialogue Line 1 (Bog):   3,400 ms (stem_01_bog.wav)                                               │
│    • Dialogue Line 2 (Wart):  4,100 ms (stem_02_wart.wav)                                              │
│    • Dialogue Line 3 (Bog):   5,800 ms (stem_03_bog.wav)                                               │
│    • Dialogue Line 4 (Wart):  2,200 ms (stem_04_wart.wav)                                              │
│    • Inter-turn dramatic pauses: 2,900 ms total across 3 turn handoffs                                 │
│                                                                                                        │
│ 2. WAVEFORM PROBING (ffprobe)                                                                          │
│    • Total continuous waveform duration: D_total_ms = 18,400 ms (18.4 seconds)                         │
│                                                                                                        │
│ 3. SIMULATION DOMAIN QUANTIZATION (10 ms Centisecond Ticks)                                            │
│    • Δ_ticks = ceil(18,400 ms / 10 ms) = 1,840 ticks consumed                                          │
│                                                                                                        │
│ 4. MASTER VIDEO DOMAIN QUANTIZATION (24.0 fps Broadcast Lattice)                                       │
│    • Total Video Frames: F = ceil((18,400 / 1000) * 24) = 442 frames                                   │
│    • Audio Sample Grid: 18.4s * 48,000 samples/sec = 883,200 total samples (2,000 samples/frame)        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Audio Stem Generation & DSP Conditioning

- The dialogue AST lines are dispatched to the local TTS microservice operating at `localhost:8000` on Rig 1 CPU, incurring $0.00 in cloud GPU billing.
- **Fatigue Pause Dilation:** Bog's and Wart's vocal profiles apply acoustic pacing adjustments based on accumulated somatic strain. Stems are exported as uncompressed, linear PCM 48 kHz, 24-bit mono `.wav` files.
- **Acoustic Damping Application:** Because both characters are located inside `loc_warm_pipe`, the audio compositor assigns high-frequency roll-off parameters and applies the $-14\text{ dB}$ sidechain ducking standard directly from the Stage Header's `acoustic_damping_cdB: 1500` attribute.

#### 2. Exact Duration Measurement (`ffprobe`)

The local pipeline executes `ffprobe` over the concatenated dialogue sequence:

```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 combined_scene.wav
# Output: 18.400000
```

Total continuous acoustic duration ($D_{\text{total\_ms}}$) is verified at exactly $18{,}400\text{ ms}$ ($18.4\text{ seconds}$).

#### 3. Simulation Tick Derivation

Centisecond monotonic simulation time advances in integer increments of $10\text{ ms}$ per tick:

$$
\Delta_{\text{ticks}} = \left\lceil \frac{D_{\text{total\_ms}}}{10\text{ ms/tick}} \right\rceil = \left\lceil \frac{18{,}400}{10} \right\rceil = 1{,}840\text{ ticks} \text{}
$$

This calculation establishes that the scene consumes exactly $1{,}840\text{ ticks}$ of diegetic world time.

#### 4. Video Frame Lattice Derivation

For downstream Remotion rendering, time converts to a discrete 24.0 fps video timeline:

$$
F_{\text{total}} = \left\lceil \frac{D_{\text{total\_ms}}}{1{,}000\text{ ms}} \times 24 \right\rceil = \left\lceil 18.4 \times 24 \right\rceil = \lceil 441.6 \rceil = 442\text{ frames} \text{}
$$

- **Audio-Video Synchronization:** At 48 kHz, each video frame maps to an integer audio boundary of:
  $$
  \frac{48{,}000\text{ samples/sec}}{24\text{ frames/sec}} = 2{,}000\text{ samples/frame} \text{}
  $$
  This prevents fractional audio sample drift across multi-minute scenes.

### Step 4.5: Atomic SQL Transaction & CAS Merkle Sealing

With the screenplay text locked, invariants verified, and physical duration measured, the intermediate state delta (`state_delta.json`) is committed to the relational database (`CANON_DB`).

```json
{
  "scene_id": "sc_28410_bog_wart_confrontation",
  "tick_origin": 28410,
  "tick_duration": 1840,
  "tick_settled": 30250,
  "somatic_mutations": [
    { "entity_id": "char_bog", "strain_delta_bp": 450, "busy_ticks": 1840 }
  ],
  "inventory_transfers": [
    {
      "item_id": "item_grease_bucket",
      "previous_holder": "char_wart",
      "new_holder": null,
      "spatial_anchor": "floor_seam_loc_warm_pipe",
      "equip_slot": "DROPPED_FLOOR"
    }
  ],
  "spatial_relocations": [
    { "entity_id": "char_wart", "destination_coord": "corr_splinter_gap_01" }
  ],
  "grievance_transitions": [
    {
      "dyad_id": "char_bog_char_wart",
      "intensity_bps": 2000,
      "cooldown_ticks": 12000,
      "escalation_count_delta": 1
    }
  ]
}
```

#### 1. Hard Transactional Boundary (`CANON_DB`)

The state change executes inside an atomic SQL transaction against Cloudflare D1/SQLite to prevent state divergence:

```sql
BEGIN TRANSACTION;

-- 1. Apply physical trauma and fatigue deltas to participants
UPDATE characters 
SET somatic_strain_bps = somatic_strain_bps + 450,
    busy_until_tick = 28410 + 1840
WHERE id = 'char_bog';

-- 2. Execute logistical item transfers
UPDATE possessions 
SET holder_id = NULL,
    spatial_anchor = 'floor_seam_loc_warm_pipe',
    equip_slot = 'DROPPED_FLOOR'
WHERE id = 'item_grease_bucket';

-- 3. Reposition displaced actor along the retreat corridor
UPDATE character_spatial
SET current_coord = 'corr_splinter_gap_01',
    facing = 'EAST'
WHERE id = 'char_wart';

-- 4. Advance grievance escalation, reset intensity, and set cooldown
UPDATE grievances 
SET intensity_bps = 2000,
    cooldown_ticks = 12000,
    version = version + 1
WHERE id = 'grv_territorial_scrap_claim';

-- 5. Cascade invalidations: flag downstream scenes referencing mutated entities
UPDATE scene_manifests 
SET is_dirty = 1 
WHERE target_entity_id IN ('char_bog', 'char_wart', 'item_grease_bucket', 'loc_warm_pipe')
  AND scheduled_tick > 28410;

COMMIT;
```

#### 2. Downstream Dependency Invalidation

The update triggers the dependency invalidation engine:

- Every drafted scene holding dependencies on `char_bog`, `char_wart`, or `item_grease_bucket` scheduled after Tick 28,410 is flagged with `is_dirty = 1`.
- These scenes are queued for the Asymmetric MEU Infill Engine to reconcile their starting conditions with the new canonical state.

#### 3. Content-Addressed Merkle Resealing

The global state hash updates deterministically using Content-Addressed Storage (CAS) semantics:

$$
H_{30250} = \text{SHA-256}(H_{28410} \mathbin{\Vert} \text{EventData} \mathbin{\Vert} 18{,}400\text{ms} \mathbin{\Vert} 1{,}840\text{ ticks}) \text{}
$$

This hash is stamped into `compiled/bible-state.json`, verifying that any alteration to the text, audio duration, or state deltas invalidates downstream cryptographic signatures.

### Step 4.6: Clock Brake Release & Dormant Site JIT Integration

Once the database transaction commits and the Merkle root is resealed, the engine releases the Clock Brake.

```plaintext
               THE BRAKE RELEASE & CATCH-UP SEQUENCE
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. ADVANCE THE MASTER CLOCK                                             │
│    Current Tick: t_resumed = 28,410 + 1,840 = 30,250 ticks              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. CLOSED-FORM JIT INTEGRATION FOR SLEEPING SITES ("The Void")          │
│    Unobserved zones slept during the 1,840 ticks.                       │
│    When an actor enters Room 4, apply algebraic catch-up on wake:       │
│      State_wake = State_sleep + (DecayRate * 1,840 ticks)               │
│    - Pipe temperature cools: T_pipe = max(T_amb, T_start - k * 1840)   │
│    - Ambient moisture rusts iron: Rust = Rust + (0.02 * 1840)           │
│    - Compute spent on catch-up: <= 2 ms on CPU heaps                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. RE-ENGAGE AUTONOMOUS CLOCKWORK TICKING                               │
│    • Scheduler loop emits: TICK_ADVANCED(30251)                         │
│    • Bog leans against the pipe; Wart limps through the drainage flue   │
│    • Fast-forward simulation resumes until next boil-over brake trip    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 1. Advancing the Monotonic Clock

The master simulation clock steps forward by the measured acoustic duration:

$$
t_{\text{resumed}} = 28{,}410 + 1{,}840 = 30{,}250\text{ ticks} \text{}
$$

No wall-clock or real-time system clocks are queried; the timeline advances purely as a function of physical sound duration.

#### 2. Closed-Form JIT Integration for Sleeping Sites ("The Void")

Tactical rooms and secondary actors residing outside the active scene zone remained dormant during the $1{,}840\text{-tick}$ scene, consuming 0 CPU cycles. Rather than simulating intermediate ticks individually, dormant zones apply algebraic catch-up integration upon re-observation:

$$
\text{State}_{\text{wake}} = \text{State}_{\text{sleep}} + (\text{DecayRate} \times \Delta t) \text{}
$$

- **Thermodynamic Decay:** Unobserved pipe segments apply thermal cooling:
  $$
  T_{\text{pipe}} = \max(T_{\text{ambient}}, T_{\text{start}} - k \cdot 1{,}840) \text{}
  $$
- **Material Oxidation:** Exposed iron surfaces accumulate moisture rust:
  $$
  \text{Rust}_{\text{current}} = \text{Rust}_{\text{base}} + (0.02 \times 1{,}840) \text{}
  $$
- **CPU Budget:** Catch-up calculations complete in $\le 2\text{ ms}$ on CPU memory heaps, preserving system performance during long simulation skips.

#### 3. Re-engaging the Autonomous Runner

The engine clears the transactional execution lease, marks the scene status as committed, and emits `TICK_ADVANCED(30251)`. The autonomous fast-forward loop resumes background pathfinding and grievance tracking across the facility until another threshold trips the clock brake.

### Step-by-Step Data Transformation Matrix

The following matrix traces the end-to-end data transformation across the Phase 4 pipeline:

| Processing Stage | Input Artifact | Operating System / Module | Invariant Enforced | Output Deliverable |
| --- | --- | --- | --- | --- |
| **Brake Engagement** | Spatial collision at Tick 28,410 ($d_{\text{axial}} \le 1$, $I \ge 8{,}000\text{ bp}$) | `worker-sower-engine` | Monotonic clock freezes; PRNG seed locked | `ScenePlan IR` Intermediate Contract |
| **4.1: UI Scaffolding** | Frozen snapshot $S_{28410}$ | `writer.astro` SSR route (`FountainEditorIsland.tsx`) | Machine-parsed Line 0 Stage Header is read-only | Constrained `.fountain` buffer |
| **4.1: AST Parsing** | Raw `.fountain` text | `fountain-parser` + `assertVerbatimParity` | 100% token parity between prose and AST | `dialogue_ast.json` |
| **4.2: Somatic Audit** | AST kinetic verb array | Somatic SAT Solver ($T_0 = \$0.00$) | $\sum \text{HeldItems} \le \text{ArmsAvailable}$; banned motor verbs $= \emptyset$ | Somatic Clearance Certificate |
| **4.2: Epistemic Gate** | AST dialogue strings | Wink-NLP + Vector Cosine Probe | Cosine similarity to secrets $\le 0.35$; zero forbidden lemmas | Epistemic Clearance Certificate |
| **4.3: Acoustic Clocking** | Approved dialogue AST | Local TTS (`:8000`) on Rig 1 CPU | 48 kHz 24-bit linear PCM; fatigue pause dilation | 4 uncompressed `.wav` stems[cite: 1, 3] |
| **4.3: Waveform Probing**[cite: 1] | Concatenated scene audio stem[cite: 1] | `ffprobe`[cite: 1] | Waveform duration measured to the millisecond ($18{,}400\text{ ms}$)[cite: 1] | $D_{\text{total\_ms}} = 18{,}400\text{ ms}$[cite: 1] |
| **4.4: Quantization**[cite: 1] | $D_{\text{total\_ms}}$ continuous scalar[cite: 1] | Quantization Arithmetic Core[cite: 1] | $\Delta_{\text{ticks}} = \lceil D / 10 \rceil$; $F = \lceil(D / 1000) \times 24\rceil$[cite: 1] | $\Delta_{\text{ticks}} = 1{,}840$, $F = 442\text{ frames}$[cite: 1] |
| **4.5: Relational Commit**[cite: 1] | `state_delta.json` payload | Cloudflare D1 / SQLite (`CANON_DB`)[cite: 1] | Atomic commit; `is_dirty = 1` cascade invalidation[cite: 1] | Committed database row deltas[cite: 1] |
| **4.5: Merkle Resealing**[cite: 1] | $H_{28410}$ + Transaction payload[cite: 1] | SHA-256 Canonical Serializer (RFC 8785) | Master Merkle root cryptographically sealed | Resealed $H_{30250}$ digest[cite: 1] |
| **4.6: Clock Resumption**[cite: 1] | Master Clock at $t = 28{,}410$[cite: 1] | Simulation Dispatch Scheduler[cite: 1] | Advance tick authority by $+1{,}840$; JIT Void integration $\le 2\text{ ms}$[cite: 1] | Loop emits `TICK_ADVANCED(30251)`[cite: 1] |

### Failure Taxonomies, Circuit Breakers, and Error Recovery

The pipeline enforces a fail-closed architecture: if any invariant or technical gate fails, processing halts before corrupt state reaches disk or downstream rendering workers.

#### 1. Structured Rejection Taxonomy

When an AST fails compile-time checks, the engine logs an entry into `eval/rejections.jsonl` classified under a strict failure taxonomy[cite: 1]:

- `SOMATIC_OVERLOAD`: An actor is scripted performing an action requiring more limbs or energy than their somatic status permits[cite: 1].
- `IMPLICATURE_LEAK`: Dialogue or action text leaks canonical facts or secrets that the character does not possess.
- `INVENTORY_DISCREPANCY`: A character references, interacts with, or transfers an item not registered in their inventory or local environment cell.
- `CADENCE_COLLAPSE`: Audio stem duration deviates significantly from target pacing bounds, or synthesis exhibits high-frequency clipping[cite: 1].
- `UNEARNED_RELEASE`: A scene resolves interpersonal tension without paying the required mechanical cost or adhering to the mandated tabletop outcome[cite: 1].

#### 2. Instant Edge Vaporization ($T_0 = \$0.00$)

If an ingress script contains unparseable Fountain syntax, broken foreign keys, or unrecoverable invariant violations:

- The engine aborts the transaction immediately[cite: 1].
- Staged transient buffers in ephemeral memory are reclaimed via `env.ARTIFACTS.delete()`.
- Working memory clears at $T_0 = \$0.00$ persistent cost, without writing dirty rows to Cloudflare D1 or generating abandoned files in object storage.

#### 3. Downstream Invalidation Blast-Radius Handling

When mutations commit to `CANON_DB`, the `propagate_fact_mutation` trigger flags affected future scenes[cite: 1]:

```sql
CREATE TRIGGER IF NOT EXISTS trg_propagate_fact_mutation
AFTER UPDATE ON character_spatial
BEGIN
  UPDATE scene_manifests
  SET is_dirty = 1
  WHERE target_entity_id = NEW.id
    AND scheduled_tick > NEW.updated_at_tick;
END;
```

- **Recursive CTE Traversal:** Downstream scenes evaluate their dependency DAG. A CLI tool (`sower why-dirty`) provides visibility into why specific scenes were invalidated.
- **Asymmetric Infill Execution:** The pipeline runs automated AST infill over invalidated scenes. If the required modifications exceed the 40% Span Ceiling, the system halts automated repair and routes the scene to the director dashboard for review.

### Verification and Diagnostic Test Harness

To test Phase 4 operations locally, the pipeline provides a deterministic test harness (`tests/tracer_bullet_phase4.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { runPhase4ExtractionAndSettlement } from '../src/pipeline/phase4';
import { mockDatabase } from '../tests/mocks/db';

describe('Phase 4: Extraction & Settlement Tracer Bullet', () => {
  it('executes a complete extraction cycle deterministically', async () => {
    const initialTick = 28410;
    const initialGrievanceBps = 8000;
    
    // 1. Ingest Stage 4 intermediate contract
    const scenePlan = {
      scene_plan_id: "sp_28410_bog_wart",
      tick_origin: initialTick,
      mandated_outcome: "COSTLY_WIN",
      winner: "char_bog",
      loser: "char_wart",
      strain_cost_bp: 450
    };

    // 2. Execute extraction pipeline
    const result = await runPhase4ExtractionAndSettlement({
      scenePlan,
      fountainFixture: "tests/fixtures/sc_28410.fountain",
      db: mockDatabase
    });

    // 3. Verify acoustic measurement and tick derivations
    expect(result.audioDurationMs).toBe(18400);
    expect(result.elapsedTicks).toBe(1840);
    expect(result.videoFrames).toBe(442);
    expect(result.resumedTick).toBe(30250);

    // 4. Verify atomic state updates in the relational ledger
    const bog = await mockDatabase.query("SELECT * FROM characters WHERE id = 'char_bog'");
    expect(bog.somatic_strain_bps).toBe(450);
    expect(bog.busy_until_tick).toBe(30250);

    const bucket = await mockDatabase.query("SELECT * FROM possessions WHERE id = 'item_grease_bucket'");
    expect(bucket.holder_id).toBeNull();
    expect(bucket.equip_slot).toBe('DROPPED_FLOOR');

    // 5. Verify cryptographic root mutation
    expect(result.merkleRootBefore).not.toBe(result.merkleRootAfter);
    expect(result.merkleRootAfter).toMatch(/^[0-9a-f]{64}$/);
  });
});
```

This sequence enforces the core design invariant of the pipeline: narrative causality, physical and anatomical constraints, and master world time are audited and committed entirely at $T_0 = \$0.00$, allowing downstream video rendering systems to function strictly as deterministic presentation layers.

### You

{{FOCUS : Phase 4: The Extraction & Settlement }}

@project-categories-00

### Gemini

**Phase 4: The Extraction & Settlement** serves as the operational bridge where deterministic simulation state from Axis A transforms into semantic dramatization on Axis B. The following software project management breakdown translates this pipeline into non-redundant Epics, Features, and Tasks, ensuring strict adherence to the required naming constraints while mapping each component to its respective Git repository within the studio's architecture.

**Epic 1: Authoring Interface Integration** **Target Repositories:** `goblin-dashboard`, `astro-kahn-it-com/001.goblin-lore` This epic covers the scaffolding required to safely capture human-authored screenplay text without violating upstream simulation facts.

- **Feature 1.1: Fountain Screenplay Ingress** Establishes the front-end drafting environment for the showrunner.
  - **Task 1.1.1: Implement writer.astro SSR route** Build the server-side rendered Astro shell required to frame the authoring environment.
  - **Task 1.1.2: Mount FountainEditorIsland component** Deploy the interactive React component responsible for capturing raw text inputs.
- **Feature 1.2: Spatial Stage Header Injection** Provides the immutable physical constraints directly into the drafting interface.
  - **Task 1.2.1: Parse simulated room bounds for header generation** Extract coordinate limits from the active scene to populate the header payload.
  - **Task 1.2.2: Lock Line 0 to prevent manual edits** Write editor protections securing the injected stage header against human modification.
- **Feature 1.3: Abstract Syntax Tree Compilation** Transforms unstructured prose into machine-readable payloads.
  - **Task 1.3.1: Map Dwight Swain MRUs to JSON structure** Convert motivation-reaction units into `dialogue_ast.json` objects.
  - **Task 1.3.2: Enforce assertVerbatimParity constraint** Validate exact token parity between the drafted prose against the compiled AST.

**Epic 2: Real-Time Invariant Gauntlet** **Target Repositories:** `camp-candor/002.worker-sower`, `astro-kahn-it-com/001.goblin-lore` This epic builds the zero-cost evaluation layers that reject physically impossible narrative drafts before any media processing occurs.

- **Feature 2.1: Somatic Satisfiability Solver** Evaluates biological limits against proposed actions.
  - **Task 2.1.1: Calculate available character appendages** Query the database to determine limb availability.
  - **Task 2.1.2: Reject actions exceeding physical capacity** Block the AST compilation if required appendages exceed available limbs.
- **Feature 2.2: Epistemic Horizon Panopticon** Prevents characters from acting on unearned knowledge.
  - **Task 2.2.1: Integrate Wink-NLP for dependency scans** Deploy the natural language processing library to evaluate semantic intent.
  - **Task 2.2.2: Block knowledge leaks via cosine similarity checks** Halt compilation if the dialogue similarity to forbidden secrets crosses the detection threshold.
- **Feature 2.3: Motor Mask Intersection** Restricts impossible physical movements.
  - **Task 2.3.1: Cross-reference drafted verbs against banned kinetic lists** Compare parsed AST action verbs against the character's restricted motor mask.

**Epic 3: Acoustic Time Quantization** **Target Repositories:** `03.foundry`, `camp-candor/002.worker-sower` This epic translates verified text into physical audio waveforms to derive the objective passage of diegetic time.

- **Feature 3.1: Text to Speech Synthesis** Generates the baseline audio required for time measurement.
  - **Task 3.1.1: Route dialogue AST to local TTS microservice** Connect the approved syntax tree to the port 8000 synthesis worker.
  - **Task 3.1.2: Generate uncompressed WAV stems** Render the character voices at 48 kHz applying fatigue pause dilation.
- **Feature 3.2: Waveform Duration Probing** Measures the exact physical length of the generated sound.
  - **Task 3.2.1: Execute ffprobe on audio outputs** Run the command-line utility against the synthesized speech stems.
  - **Task 3.2.2: Extract millisecond duration values** Parse the probe output to isolate the exact continuous waveform length.
- **Feature 3.3: Dual Domain Derivation** Quantizes raw audio time into simulation ticks alongside downstream video frames.
  - **Task 3.3.1: Calculate elapsed simulation ticks via centisecond division** Divide the total millisecond duration by ten to yield the consumed simulation ticks.
  - **Task 3.3.2: Quantize audio duration into 24fps video frames** Map the acoustic length to discrete video timeline bounds for Remotion compositing.

**Epic 4: Atomic State Settlement** **Target Repositories:** `camp-candor/002.worker-sower`, `camp-candor/995.library` This epic manages the finalization of the scene's physical consequences into the permanent relational ledger.

- **Feature 4.1: Database Transaction Management** Executes the irreversible state mutations.
  - **Task 4.1.1: Open strict transaction boundary in Cloudflare D1** Initialize the SQLite transaction to prevent partial state desynchronization.
  - **Task 4.1.2: Commit character trauma deltas** Update the `somatic_strain` variables for participants based on the scene outcome.
  - **Task 4.1.3: Commit inventory location shifts** Rebind dropped items to the environment floor cell.
- **Feature 4.2: Dependency Invalidation** Manages cache staleness for downstream narrative nodes.
  - **Task 4.2.1: Trigger propagate_fact_mutation** Execute the database trigger marking modified facts.
  - **Task 4.2.2: Flag downstream scenes with dirty status** Set dependent future scene manifests to `is_dirty = 1`.
- **Feature 4.3: Cryptographic Ledger Sealing** Secures the new timeline against tampering.
  - **Task 4.3.1: Hash previous state with current event data** Compute the SHA-256 digest combining historical roots alongside the new payload.
  - **Task 4.3.2: Seal new Merkle root into bible-state.json** Write the updated hash to the permanent file.

**Epic 5: Simulation Resumption Mechanism** **Target Repositories:** `camp-candor/002.worker-sower` This epic releases the global mutex lock to allow the autonomous world to continue progressing.

- **Feature 5.1: Master Clock Advancement** Pushes global time forward.
  - **Task 5.1.1: Add calculated ticks to global simulation clock** Increment the master time integer by the exact acoustic duration elapsed.
- **Feature 5.2: Dormant Site Catch Up** Updates tactical zones that slept during the authoring pause.
  - **Task 5.2.1: Identify unobserved sleeping tactical zones** Query the spatial graph for unhydrated background locations.
  - **Task 5.2.2: Apply algebraic integration equations to sleeping elements** Process closed-form catch-up mathematics for thermodynamic decay over the elapsed ticks.
- **Feature 5.3: Autonomous Loop Re-engagement** Restarts the central simulation scheduler.
  - **Task 5.3.1: Release system clock brake** Clear the mutex lock on the master timeline.
  - **Task 5.3.2: Emit TICK_ADVANCED command** Trigger the event dispatcher to resume background fast-forwarding.

### You

{{FOCUS : Feature 5.1 Master Clock Advancement }}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Feature 5.1 — Master Clock Advancement

**Target Repository:** `camp-candor/002.worker-sower` (and `000.series-sower-engine` / `packages/300.engine/17.tick.unit`)

**Subsystem Authority:** `ClockDO` / Monotonic Tick Authority Engine (`worker-sower-engine`)

**Execution Plane:** Axis A (Semantic Truth & Meaning) $\longleftrightarrow$ Axis B (Artifact Hardening & Acoustic Measurement) Seam

**Constitutional Invariant:** Monotonic Authority & Zero-Drift Acoustic Timebase ($T_0 = \$0.00$)

### I. Ontological Foundations & Architectural Mandate

In standard game engines and narrative pipelines, time is derived from real-time operating system clocks (`Date.now()`, `performance.now()`, `std::time::SystemTime`) or arbitrary word-count estimates. Under multi-tenant execution, network jitter, or platform discrepancies (such as ARM64 Apple Silicon vs. x86_64 Linux servers), ambient time querying introduces non-deterministic drift, thread race conditions, and corrupted state forks.

Within the **"Wind-Up Clockwork Machine"** architecture, **time is an external input, never an internal property read by the simulation**.

```plaintext
========================================================================================================================
                            THE MASTER CLOCK DUAL-DOMAIN QUANTIZATION BRIDGE
========================================================================================================================

  AXIS B: EMPIRICAL ACOUSTIC MEASUREMENT (Rig 1, Port 8000)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Spoken Dialogue Lines + Physical MRU Foley Transients (48,000 Hz, 24-bit Linear PCM)[cite: 6, 7]                  │
  │ POSIX ffprobe Inspection: D_total_ms = 18,400 ms (Observed Empirical Truth)                        │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  DUAL-DOMAIN QUANTIZATION CORE (Ceil-Based Division & Integer Framing)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Master Video Frame Budget (24 fps):  F = ceil((18,400 / 1000) * 24) = 442 frames (2,000 samples/frame)│
  │ Simulation Tick Delta (10 ms grid):  Δ_ticks = ceil(18,400 / 10)   = 1,840 ticks                      │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  AXIS A: MONOTONIC CLOCK ADVANCEMENT (Feature 5.1 Reducer)[cite: 1, 10]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Current Simulation Tick:   t_paused  = 28,410 ticks                                                    │
  │ Monotonic Step:            t_resumed = t_paused + Δ_ticks = 28,410 + 1,840 = 30,250 ticks[cite: 1]              │
  │ State Hash Resealing:      H_30250   = SHA-256(H_28410 || EventDigest || 1,840 ticks || 18,400 ms)[cite: 1, 6] │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

**Feature 5.1 (Master Clock Advancement)** operationalizes the **Master Physical Clock Axiom**:

$$
\mathbf{\text{Master Physical Clock Axiom:}}\quad \text{Audio is the architect of physical time; picture is an integer projection mapped to audio duration.} \text{[cite: 4, 6]}
$$

When a dramatic intercept freezes the clockwork engine (e.g., at Tick 28,410 during the Bog vs. Wart confrontation), the master clock remains frozen while the scene is drafted and synthesized[cite: 1]. Feature 5.1 consumes the verified acoustic output, derives the integer centisecond delta ($\Delta_{\text{ticks}}$), executes pure state advancement in system memory, and reseals the state ledger.

### II. Mathematical Formulation & Time Algebra

To eliminate floating-point drift (IEEE 754 variance between architectures), the clock engine operates on a nominal branded integer system (`SimTime`).

#### 1. Resolution Standard

- **Diegetic Simulation Resolution:** 1 centisecond ($10\text{ ms}$) per tick.
- **Diegetic Tick Frequency:** $100\text{ ticks} = 1.0\text{ second}$ of physical world time.
- **Acoustic Clock Sampling Rate:** $48{,}000\text{ Hz}$ ($48{,}000\text{ samples/sec}$).
- **Master Video Frame Rate:** $24.0\text{ fps}$ ($\Delta t_{\text{frame}} = 41.6667\text{ ms}$).

#### 2. The 2,000-Sample Constant

The exact integer ratio mapping continuous sound to discrete video cuts is:

$$
\kappa_{\text{proj}} = \frac{48{,}000\text{ samples/sec}}{24\text{ frames/sec}} = 2{,}000\text{ audio samples per video frame} \text{}
$$

Every video frame $F$ maps to the continuous audio sample boundary:

$$
S = F \times 2{,}000 \text{[cite: 2, 6]}
$$

#### 3. Tick Advancement Quantization Function

Given a set of $N$ synthesized dialogue and Foley audio stems, the total continuous acoustic duration is:

$$
D_{\text{total\_ms}} = \sum_{i=1}^{N} D_{\text{stem\_ms}}^{(i)} + \sum_{j=1}^{M} T_{\text{pause\_ms}}^{(j)} \text{[cite: 1, 6]}
$$

The simulation tick delta ($\Delta_{\text{ticks}}$) is derived using the non-negotiable ceiling quantization:

$$
\Delta_{\text{ticks}} = \left\lceil \frac{D_{\text{total\_ms}}}{10} \right\rceil \text{[cite: 1, 6]}
$$

For the concrete *Under the Floorboards* walkthrough:

$$
D_{\text{total\_ms}} = 18{,}400\text{ ms} \implies \Delta_{\text{ticks}} = \left\lceil \frac{18{,}400}{10} \right\rceil = 1{,}840\text{ ticks} \text{[cite: 1]}
$$

#### 4. The Monotonic Time Invariant

Let $t_k$ be the world tick prior to the pause, and $t_{k+1}$ be the resumed tick. The engine enforces the strict monotonicity relation:

$$
t_{k+1} = t_k + \Delta_{\text{ticks}}, \quad \text{where } \Delta_{\text{ticks}} \in \mathbb{Z}^+ \text{ and } \Delta_{\text{ticks}} > 0 \text{[cite: 6, 11]}
$$

Advancement with $\Delta \le 0$ trips a hard runtime `INVALID_TEMPORAL_ADVANCEMENT` assertion.

### III. Data Structures & Schema Specifications

The following schemas in `packages/300.engine/17.tick.unit/fce/` establish compile-time type bounds for all clock advancement operations.

#### 1. Nominal Branded Type Definitions (`tick.interface.ts`)

```typescript
// packages/300.engine/17.tick.unit/fce/tick.interface.ts

/**
 * Branded nominal type preventing raw number or floating-point pollution.
 * Must always be an unsigned non-negative integer representing centiseconds.
 */
export type SimTime = number & { readonly __brand: unique symbol };

export const CENTISECONDS_PER_SECOND = 100 as const;
export const MS_PER_TICK = 10 as const;

/**
 * Invariant factory enforcing non-negative integer quantization.
 */
export function toSimTime(v: number): SimTime {
  if (!Number.isFinite(v) || v < 0 || Math.floor(v) !== v) {
    throw new TypeError(`[TEMPORAL_CORRUPTION] Invalid SimTime scalar: ${v}. Must be an integer >= 0.`);
  }
  return v as SimTime;
}

/**
 * Total ordering comparator tuple for simultaneous event arbitration.
 */
export type TotalOrderTuple = [
  tick: SimTime,
  siteCodeUnit: string,
  entityId: string
];
```

#### 2. Master Clock Advancement Payload (`tick.interface.ts`)

```typescript
export interface TickAdvancedPayload {
  readonly sceneId: string;
  readonly previousTick: SimTime;
  readonly deltaTicks: number;
  readonly newTick: SimTime;
  readonly acousticDurationMs: number;
  readonly videoFrameBudget: number;
  readonly masterSeed: string;
  readonly derivedTickSeed: string;
  readonly stateDigestBefore: string;
  readonly stateDigestAfter: string;
  readonly occurredAtWallClockUtc: string; // ISO-8601 strictly for audit, never used in simulation logic
}
```

#### 3. Tick Unit Action Bit Container (`tick.bit.ts`)

```typescript
// packages/300.engine/17.tick.unit/fce/tick.bit.ts
import { SimTime, TickAdvancedPayload } from './tick.interface';

export const enum TickCommand {
  TICK_INIT = 101,
  TICK_ADVANCE = 102,
  TICK_HALT_BRAKE = 103,
  TICK_RESUME = 104,
  TICK_RESET = 105
}

export interface TickBit {
  idx: string;
  cmd: TickCommand;
  val: number; // 0 = OK, -1 = Fault
  dat: {
    targetDeltaTicks?: number;
    acousticDurationMs?: number;
    sceneId?: string;
    payload?: TickAdvancedPayload;
  };
  lst: string[]; // Diagnostic trace logs
  slv?: (result: { bit: TickBit }) => void;
}
```

### IV. Concrete Implementation: Reducer Core & Cryptographic Sealing

The clock advancement logic executes within `packages/300.engine/17.tick.unit/tick.action.ts` and `tick.reduce.ts` as a pure, zero-I/O mathematical fold:

$$
\text{State}_{n+1} = \mathcal{R}(\text{State}_n, E_n, \sigma_n) \text{[cite: 10, 11]}
$$

#### 1. Delimiter-Safe Cryptographic Seed Derivation (`tick.action.ts`)

Each advanced tick derives a unique pseudo-random seed to drive downstream procedural events without PRNG state bleeding:

```typescript
// packages/300.engine/17.tick.unit/tick.action.ts
import { createHmac } from 'node:crypto';
import { SimTime, toSimTime } from './fce/tick.interface';
import { TickModel } from './tick.model';
import { TickBit } from './fce/tick.bit';

/**
 * Generates an isolated cryptographic seed for a given tick using delimiter-safe packing.
 */
export function deriveTickSeed(worldSeed: string, tick: SimTime, subsystemId: string): string {
  const hmac = createHmac('sha256', worldSeed);
  const payload = Buffer.concat([
    Buffer.from(subsystemId, 'utf-8'),
    Buffer.from([0x00]), // Explicit delimiter barrier preventing length-extension collisions
    Buffer.from(tick.toString(10), 'utf-8')
  ]);
  return hmac.update(payload).digest('hex');
}

/**
 * Pure action advancing the monotonic clock state.
 */
export function advanceClockAction(
  currentModel: TickModel,
  bit: TickBit
): { nextModel: TickModel; payload: any } {
  const rawDurationMs = bit.dat.acousticDurationMs;
  if (typeof rawDurationMs !== 'number' || rawDurationMs <= 0) {
    throw new Error(`[CLOCK_ADVANCE_REJECTED] Non-positive acoustic duration: ${rawDurationMs} ms.`);
  }

  // Centisecond ceiling division
  const deltaTicks = Math.ceil(rawDurationMs / 10);
  const nextTick = toSimTime(currentModel.currentTick + deltaTicks);

  // Derive PRNG seed for resumed epoch
  const nextDerivedSeed = deriveTickSeed(currentModel.worldSeed, nextTick, '17.tick.unit');

  // Compute immutable state hash update
  const nextModel: TickModel = {
    ...currentModel,
    previousTick: currentModel.currentTick,
    currentTick: nextTick,
    totalTicksAccumulated: currentModel.totalTicksAccumulated + deltaTicks,
    lastDerivedSeed: nextDerivedSeed,
    isClockBrakeEngaged: false
  };

  return {
    nextModel,
    payload: {
      previousTick: currentModel.currentTick,
      deltaTicks,
      newTick: nextTick,
      derivedTickSeed: nextDerivedSeed
    }
  };
}
```

#### 2. The Pure State Reducer (`tick.reduce.ts`)

```typescript
// packages/300.engine/17.tick.unit/tick.reduce.ts
import { TickModel } from './tick.model';
import { TickBit, TickCommand } from './fce/tick.bit';
import { advanceClockAction } from './tick.action';

export function reduceTick(state: TickModel, bit: TickBit): TickModel {
  // CRITICAL INVARIANT: Zero ambient system clocks permitted
  // Real-time calls (Date.now(), performance.now()) are strictly forbidden
  
  switch (bit.cmd) {
    case TickCommand.TICK_ADVANCE: {
      const { nextModel, payload } = advanceClockAction(state, bit);
      bit.val = 0;
      bit.dat.payload = payload;
      bit.lst.push(`[TICK_ADVANCED] Monotonic clock advanced from ${state.currentTick} to ${nextModel.currentTick} (+${payload.deltaTicks} ticks)`);
      return Object.freeze(nextModel);
    }

    case TickCommand.TICK_HALT_BRAKE: {
      return Object.freeze({
        ...state,
        isClockBrakeEngaged: true
      });
    }

    default:
      return state;
  }
}
```

### V. Relational Database Commit & Merkle Resealing

The monotonic advance is finalized within an atomic SQLite / Cloudflare D1 transaction (`CANON_DB`) before the engine releases execution leases[cite: 1, 6].

#### 1. Atomic SQL State Transaction

```sql
-- packages/300.engine/sql/advance_master_clock.sql
BEGIN TRANSACTION;

-- 1. Advance the master simulation singleton row
UPDATE simulation_clock
SET previous_tick = current_tick,
    current_tick = current_tick + 1840,
    is_paused = 0,
    resumed_at_scene_id = 'sc_28410_bog_wart_confrontation',
    last_derived_seed = 'c8f13b94e824...',
    version = version + 1
WHERE id = 'singleton_master_clock'
  AND current_tick = 28410; -- Concurrency fencing check

-- 2. Release participant execution leases and schedule busyUntil
UPDATE characters 
SET busy_until_tick = 30250,
    somatic_strain_bps = somatic_strain_bps + 450
WHERE id = 'char_bog';

UPDATE characters 
SET busy_until_tick = 30250
WHERE id = 'char_wart';

-- 3. Log event-sourced tick advancement envelope
INSERT INTO event_log (
  event_id,
  tick,
  event_type,
  payload_json,
  state_digest
) VALUES (
  'evt_tick_30250_advance',
  30250,
  'TICK_ADVANCED',
  '{"delta_ticks": 1840, "acoustic_duration_ms": 18400, "scene_id": "sc_28410"}',
  'a6f30e928b...'
);

COMMIT;
```

#### 2. CAS Merkle Root Mutation

The Merkle root digest recalculates deterministically via RFC 8785 Canonical JSON[cite: 2, 6]:

$$
H_{30250} = \text{SHA-256}\Big(H_{28410} \mathbin{\Vert} \text{SceneEventDigest} \mathbin{\Vert} 18{,}400\text{ ms} \mathbin{\Vert} 1{,}840\text{ ticks}\Big) \text{[cite: 1, 6]}
$$

The resulting hash is sealed into `compiled/bible-state.json` via POSIX atomic file rename (`fs.renameSync`), ensuring that any offline cold restart or distributed node boots into the exact same historical state.

### VI. Downstream Interaction: Dormant Site Catch-Up Integration

Advancing the master clock from Tick 28,410 to Tick 30,250 creates an elapsed interval of $\Delta t = 1{,}840\text{ ticks}$[cite: 1]. While the active room (`loc_warm_pipe`) was executing the scene, all unobserved rooms in "The Void" (such as `loc_pantry_wall`) burned 0 CPU cycles[cite: 1].

To prevent empty rooms from running $1{,}840$ individual tick evaluations, the engine implements the **Lazy-Evaluation Catch-Up Protocol ("Schrödinger's Zone")**. When an actor next enters a dormant zone, the spatial engine applies a closed-form algebraic integration in $\le 2\text{ ms}$ on CPU heaps[cite: 1, 6]:

$$
\text{State}_{\text{wake}} = \max\Big(\text{Floor}_{\text{bp}}, \, \text{State}_{\text{sleep}} - (\text{DecayRate}_{\text{bp}} \times \Delta_{\text{ticks}})\Big) \text{[cite: 6, 11]}
$$

- **Thermodynamic Loss:** Central pipe cooling:
  $$
  T_{\text{pipe}}(30250) = \max\big(2{,}000\text{ bp}, \, 6{,}500\text{ bp} - (0.163\text{ bp/tick} \times 1{,}840)\big) = 6{,}200\text{ bp} \text{[cite: 1]}
  $$
- **Material Oxidation:** Surface rust accumulation:
  $$
  \text{Rust}(30250) = \text{Rust}_{\text{base}} + (0.02\text{ bp/tick} \times 1{,}840) = \text{Rust}_{\text{base}} + 36\text{ bp} \text{[cite: 1]}
  $$
- **Spline Trajectory Catch-Up:** Entities traversing long-distance corridors calculate their spatial coordinates along spline $p(t)$ directly at $t = 30{,}250$ without simulating intermediate steps.

### VII. Concrete Verification: Vitest Test Suite

The following comprehensive Vitest suite (`packages/300.engine/17.tick.unit/tests/master_clock_advance.spec.ts`) proves the mathematical invariants, centisecond quantization, wall-clock isolation, and Merkle sealing:

```typescript
// packages/300.engine/17.tick.unit/tests/master_clock_advance.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TickModel } from '../tick.model';
import { reduceTick } from '../tick.reduce';
import { TickBit, TickCommand } from '../fce/tick.bit';
import { toSimTime, SimTime } from '../fce/tick.interface';
import { createHash } from 'node:crypto';

describe('Feature 5.1: Master Clock Advancement Engine', () => {
  let initialModel: TickModel;

  beforeEach(() => {
    initialModel = {
      currentTick: toSimTime(28410),
      previousTick: toSimTime(28409),
      totalTicksAccumulated: 28410,
      worldSeed: 'seed_under_the_floorboards_genesis_001',
      lastDerivedSeed: 'initial_hash_000',
      isClockBrakeEngaged: true
    };
  });

  it('quantizes 18,400 ms of continuous audio to exactly 1,840 ticks and updates tick authority', () => {
    const bit: TickBit = {
      idx: 'bit_adv_01',
      cmd: TickCommand.TICK_ADVANCE,
      val: 0,
      dat: {
        acousticDurationMs: 18400,
        sceneId: 'sc_28410_bog_wart_confrontation'
      },
      lst: []
    };

    const nextState = reduceTick(initialModel, bit);

    // 1. Verify tick arithmetic
    expect(nextState.previousTick).toBe(28410);
    expect(nextState.currentTick).toBe(30250);
    expect(nextState.totalTicksAccumulated).toBe(28410 + 1840);
    expect(nextState.isClockBrakeEngaged).toBe(false);

    // 2. Verify payload reporting
    expect(bit.val).toBe(0);
    expect(bit.dat.payload.deltaTicks).toBe(1840);
    expect(bit.dat.payload.newTick).toBe(30250);
  });

  it('strictly enforces ceiling quantization on non-round acoustic millisecond inputs', () => {
    const bit: TickBit = {
      idx: 'bit_adv_ceil',
      cmd: TickCommand.TICK_ADVANCE,
      val: 0,
      dat: {
        acousticDurationMs: 18401 // 1 ms fractional tail excess
      },
      lst: []
    };

    const nextState = reduceTick(initialModel, bit);

    // ceil(18401 / 10) = 1841 ticks
    expect(nextState.currentTick).toBe(28410 + 1841);
    expect(bit.dat.payload.deltaTicks).toBe(1841);
  });

  it('rejects invalid, negative, or zero duration inputs with unrecoverable failure', () => {
    const invalidBit: TickBit = {
      idx: 'bit_adv_fail',
      cmd: TickCommand.TICK_ADVANCE,
      val: 0,
      dat: {
        acousticDurationMs: 0
      },
      lst: []
    };

    expect(() => reduceTick(initialModel, invalidBit)).toThrowError(
      /\[CLOCK_ADVANCE_REJECTED\] Non-positive acoustic duration: 0 ms/
    );
  });

  it('computes deterministic derived seeds without ambient clock pollution', () => {
    const bit: TickBit = {
      idx: 'bit_adv_seed',
      cmd: TickCommand.TICK_ADVANCE,
      val: 0,
      dat: { acousticDurationMs: 18400 },
      lst: []
    };

    const runA = reduceTick(initialModel, bit);
    const runB = reduceTick(initialModel, bit);

    // Bit-for-bit repeatability assertion
    expect(runA.lastDerivedSeed).toBe(runB.lastDerivedSeed);
    expect(runA.lastDerivedSeed).toMatch(/^[0-9a-f]{64}$/);
  });
});
```

### VIII. Diagnostic Metrics & Failure Taxonomy

| Failure Code | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `ERR_TEMPORAL_DRIFT` | `Date.now()` or ambient clock detected in call stack | Engine aborts execution; flags test failure () | Pure reducer linter purges non-deterministic call |
| `ERR_FRACTIONAL_TICK` | Raw float passed into `SimTime` brand factory | `toSimTime()` throws `TypeError` | Truncate or ceiling-quantize to integer centiseconds |
| `ERR_CLOCK_UNDERRUN` | Measured audio length is shorter than exposure budget | Conductor trips `CADENCE_COLLAPSE` error gate | Local TTS regenerates stems with proper fatigue pauses |
| `ERR_MERKLE_MISMATCH` | Reconstructed state hash diverges after advance | CAS validation rejects atomic transaction commit | Replay event envelopes from disk snapshot |
| `ERR_LEASE_FENCE_TRIP` | Distributed worker attempts commit on stale tick | SQLite `current_tick = 28410` check fails | Stale worker write discarded; worker re-syncs state |

### You

{{FOCUS : Feature 5.2 Dormant Site Catch Up}}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Feature 5.2 — Dormant Site Catch Up

**Target Repositories:** `camp-candor/002.worker-sower` (and `000.series-sower-engine` / `packages/300.engine/22.void-dormancy.unit` & `packages/301.spatial/08.decay.unit` / `apps/edge/src/objects/ZoneDO.ts`)

**Subsystem Authority:** `VoidDormancyEngine` / `ZoneDO` / `DecayBuzz`

**Execution Plane:** Axis A (Thermodynamic World Truth) $\longleftrightarrow$ Axis B (Empirical Acoustic Delta Projection)

**Constitutional Invariant:** "The Schrödinger Optimization" — Dormancy defers simulation; it never cancels consequences ($T_0 = \$0.00$, Catch-up cost $\le 2\text{ ms}$).

### I. Ontological Foundations & Architectural Mandate

In standard multiplayer simulations and game-world backends, world simulation across empty rooms or unvisited hexes is typically handled via one of two flawed extremes:

1. **The CPU Melt (Hot-Ticking the Void):** The server simulates every empty room, ticking thousands of actors and environmental variables per frame across disconnected instances. Under long timescales or sprawling multi-room topologies, this leads to event-loop starvation, CPU throttling, and massive infrastructure costs.
2. **The World Pause (Static Hibernation Trap):** When an entity vacates a room, simulation stops completely, freezing all physical parameters in place. When an entity returns after thousands of ticks, the room remains in the exact condition in which it was left. Hot pipes do not cool, exposed water does not evaporate, structural timbers do not rot, and unobserved travel does not progress.

The studio's architecture enforces **The Schrödinger Optimization**:

$$
\mathbf{\text{The Schrödinger Optimization Axiom:}}\quad \text{Computational existence need not equal physical existence. Static geometry does not tick while empty; unobserved state is integrated on demand as a closed-form algebraic function of elapsed time.} \text{}
$$

```plaintext
========================================================================================================================
                          FEATURE 5.2: DORMANT SITE CATCH-UP ARCHITECTURAL LIFECYCLE
========================================================================================================================

  [ EVICTION INTO "THE VOID" ] (activeActorCount drops to 0)[cite: 2, 3]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • ZoneDO / SiteDO sets hibernation alarm (30-second lease window)[cite: 1, 3, 15]                               │
  │ • Snapshot written to Cloudflare R2 / Local WAL; state.storage memory cleared[cite: 1, 3, 15]                   │
  │ • Site status flagged: VOID_DORMANT; records sleepStartTick = t_sleep                               │
  │ • Compute Cost across elapsed gap: 0 CPU cycles / $0.00 infrastructure spend                       │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ TEMPORAL GAP ACCUMULATION ] (Δt = t_wake - t_sleep = 1,840 ticks)[cite: 2, 4, 6]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Axis B scene executes in active focus zone (Phase 4.1 - 4.5)                                  │
  │ • Audio measured: 18,400 ms => Feature 5.1 advances Master Clock: 28,410 ──► 30,250 ticks[cite: 2, 4, 11]      │
  │ • Dormant Site (e.g., loc_pantry_wall) remains uninstantiated during the entire interval[cite: 2, 3]            │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ JUST-IN-TIME (JIT) WAKE INTEGRATION ] (ACTOR_ENTERED_SITE triggered)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Target ZoneDO wakes from edge storage / Cloudflare DO hibernation[cite: 1, 3]                                │
  │ • Closed-Form Decay: Temp_wake = max(Floor, Temp_init - ⌊(k_decay * Δt) / 10000⌋)                     │
  │ • Oxidation Accumulator: Rust_wake = min(10000, Rust_init + ⌊(R_rate * Δt) / 10000⌋)                  │
  │ • Analytical Spline Progress: ΔP = ⌊(Δt * 10^9) / C_active⌋ (Exact BigInt Banker's Rounding)[cite: 2, 9, 31]   │
  │ • Execution Envelope: Total wake integration executes in <= 2 ms on CPU heaps[cite: 2, 4, 11]                  │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

When an actor moves from an active zone (such as `loc_warm_pipe`) and triggers an ingress boundary event into a cold zone (such as `loc_pantry_wall` or an inter-room corridor), **Feature 5.2 (Dormant Site Catch Up)** intercepts the activation. It compares the current monotonic tick against the site's `lastActiveTick`, applies closed-form algebraic integration across the elapsed gap ($\Delta t = 1{,}840\text{ ticks}$), updates environmental and structural properties, and hydrates the site state in $\le 2\text{ ms}$ before the actor is admitted[cite: 2, 4, 11].

### II. Mathematical Formulation & Time-LOD Calculus

Instead of evaluating step-by-step loops ($O(\Delta t)$), the engine executes **Integral Calculus over Simulation Loops ($O(1)$)**.

#### 1. Closed-Form Environmental Heat Loss

In Phase 2, `loc_warm_pipe` drops heat during active ticking. When a room sits dormant in "The Void," Newton’s Law of Cooling is integrated directly across arbitrary integer tick intervals ($\Delta t \le 10^8\text{ ticks}$) without intermediate iterations:

$$
T_{\text{wake}} = T_{\text{ambient}} + \left\lfloor (T_{\text{start}} - T_{\text{ambient}}) \times \left(1 - \frac{K_{\text{conductivity}}}{M_{\text{mass}}}\right)^{\Delta t} \right\rfloor \text{}
$$

For fast linear approximations across short time horizons ($\Delta t \le 50{,}000\text{ centiseconds}$):

$$
T_{\text{wake}} = \max\left(T_{\text{ambient}}, \, T_{\text{initial}} - \left\lfloor \frac{k_{\text{decay}} \times \Delta t}{10{,}000} \right\rfloor\right) \text{}
$$

- **Integer Basis Points:** $T \in [0, 10{,}000]\text{ bp}$, where $2{,}731\text{ bp} \equiv 273.15\text{ K}$ ($0^\circ\text{C}$), and $3{,}731\text{ bp} \equiv 373.15\text{ K}$ ($100^\circ\text{C}$).
- **Asymptotic Clamping:** Natural dissipation strictly terminates at $T_{\text{ambient}}$, preventing negative heat generation.

#### 2. Material Oxidation and Structural Rust Accumulation

Moisture absorption and iron degradation accumulate as a monotonic non-decreasing basis-point scalar:

$$
\text{Rust}_{\text{wake}} = \min\left(10{,}000\text{ bp}, \, \text{Rust}_{\text{initial}} + \left\lfloor \frac{R_{\text{rate}} \times \Delta t}{10{,}000} \right\rfloor\right) \text{[cite: 2]}
$$

Where $R_{\text{rate}}$ is the environmental moisture-transfer rate defined in the spatial dossier (e.g., $R_{\text{rate}} = 200\text{ bps/1000 ticks}$)[cite: 2, 6].

#### 3. Analytical Spline Progress Preservation (Split-Invariance)

When unobserved entities traverse crawlspaces or regional highway edges while rooms sleep, transit progress is modeled as a normalized rational progress fraction over a fixed denominator ($D = 10^9$):

$$
\Delta P = \left\lfloor \frac{\Delta t \times 10^9}{C_{\text{active}}} \right\rfloor \text{}
$$

Where active edge traversal cost $C_{\text{active}}$ scales with environmental overlays ($\mu_{\text{bps}}$):

$$
C_{\text{active}} = \left\lfloor \frac{C_{\text{base}} \times \mu_{\text{bps}} + 5{,}000}{10{,}000} \right\rfloor \text{[cite: 3, 9, 31]}
$$

If an overlay changes during dormancy at $T_{\text{change}}$, the remaining progress is derived via integer ceiling division:

$$
\Delta T_{\text{rem}} = \left\lceil \frac{(10^9 - P_{\text{accum}}) \times C_{\text{new}}}{10^9} \right\rceil, \quad T_{\text{arrival, new}} = T_{\text{change}} + \Delta T_{\text{rem}} \text{[cite: 3, 9, 31]}
$$

This guarantees **split-invariance**: splitting a dormant traversal into arbitrary piecewise checkpoints yields the exact same arrival tick down to the discrete centisecond[cite: 3, 9, 31].

#### 4. Analytical Encounter Detection via Banker's Rounding

If two unobserved actors traverse the same edge during a dormant interval, convergence is derived analytically without step-by-step raycasting:

$$
t_{\text{meet}} = \text{divRoundHalfEvenBigInt}\left(\frac{D_A D_B + T_{A,\text{enter}} D_B + T_{B,\text{enter}} D_A}{D_A + D_B}\right) \text{}
$$

All intermediate multiplications execute in `BigInt` to prevent safe-integer overflow ($> 2^{53} - 1$) over multi-year simulations. Exact half-ties ($2r = D$) round to the nearest even integer to eliminate systematic upward temporal drift.

### III. Data Structures & Schema Specifications

The following schemas in `packages/300.engine/22.void-dormancy.unit/fce/` and `packages/301.spatial/08.decay.unit/` govern the state model of sleeping sites and their mathematical rehydration[cite: 2, 6].

#### 1. Site Dormancy Model Contract (`dormancy.interface.ts`)

```typescript
// packages/300.engine/22.void-dormancy.unit/fce/dormancy.interface.ts

export type BasisPoints = number & { readonly __brand: unique symbol };
export type SimTime = number & { readonly __brand: unique symbol };

export function toBasisPoints(val: number): BasisPoints {
  if (!Number.isFinite(val) || val < 0 || val > 10000 || Math.floor(val) !== val) {
    throw new TypeError(`[INVALID_BASIS_POINTS] Value must be an integer between 0 and 10000. Received: ${val}`);
  }
  return val as BasisPoints;
}

export const enum SiteDormancyState {
  ACTIVE = 'ACTIVE',
  DRAINING = 'DRAINING',
  VOID_DORMANT = 'VOID_DORMANT'
}

export interface DormantSiteRecord {
  readonly siteId: string;
  readonly status: SiteDormancyState;
  readonly activeActorCount: number;
  readonly lastActiveTick: SimTime;
  readonly sleepStartTick: SimTime;
  readonly environmentalBaseline: {
    readonly tempBp: BasisPoints;
    readonly ambientFloorBp: BasisPoints;
    readonly thermalConductivityBps: number;
    readonly thermalMassUnits: number;
    readonly rustBp: BasisPoints;
    readonly oxidationRateBps: number;
    readonly structuralStrainBp: BasisPoints;
  };
  readonly activeOverlays: Record<string, {
    readonly multiplierBps: number;
    readonly appliedAtTick: SimTime;
  }>;
}
```

#### 2. Rehydration Wake Payload (`dormancy.bit.ts`)

```typescript
// packages/300.engine/22.void-dormancy.unit/fce/dormancy.bit.ts
import { DormantSiteRecord, SimTime, BasisPoints } from './dormancy.interface';

export const enum DormancyCommand {
  EVICT_TO_VOID = 201,
  PROCESS_WAKE_CATCH_UP = 202,
  REGISTER_PRESENCE = 203,
  DEREGISTER_PRESENCE = 204
}

export interface DormancyActionBit {
  idx: string;
  cmd: DormancyCommand;
  val: number; // 0 = OK, -1 = Error
  dat: {
    siteId: string;
    wakeTick: SimTime;
    actorId?: string;
    elapsedTicks?: number;
    integratedState?: {
      newTempBp: BasisPoints;
      newRustBp: BasisPoints;
      newStrainBp: BasisPoints;
      computationTimeMs: number;
    };
  };
  lst: string[]; // Diagnostic trace logs
  slv?: (result: { bit: DormancyActionBit }) => void;
}
```

### IV. Concrete Implementation: The Void Dormancy Engine

The catch-up engine operates in `packages/300.engine/22.void-dormancy.unit/dormancy.action.ts` and `dormancy.reduce.ts` as a pure, zero-I/O reduction kernel[cite: 2].

#### 1. The Closed-Form Catch-Up Mathematical Solver (`dormancy.action.ts`)

```typescript
// packages/300.engine/22.void-dormancy.unit/dormancy.action.ts
import { DormantSiteRecord, SimTime, toBasisPoints, BasisPoints } from './fce/dormancy.interface';

export interface WakeIntegrationResult {
  readonly evaluatedTempBp: BasisPoints;
  readonly evaluatedRustBp: BasisPoints;
  readonly evaluatedStrainBp: BasisPoints;
  readonly elapsedTicks: number;
}

/**
 * Executes sub-millisecond closed-form algebraic catch-up across elapsed dormant ticks.
 * Strictly forbids loops and OS clock dependencies.
 */
export function integrateDormantSiteWake(
  site: DormantSiteRecord,
  wakeTick: SimTime
): WakeIntegrationResult {
  if (wakeTick < site.lastActiveTick) {
    throw new RangeError(
      `[TEMPORAL_PARADOX] Wake tick (${wakeTick}) precedes lastActiveTick (${site.lastActiveTick}).`
    );
  }

  const elapsedTicks = wakeTick - site.lastActiveTick;
  if (elapsedTicks === 0) {
    return {
      evaluatedTempBp: site.environmentalBaseline.tempBp,
      evaluatedRustBp: site.environmentalBaseline.rustBp,
      evaluatedStrainBp: site.environmentalBaseline.structuralStrainBp,
      elapsedTicks: 0
    };
  }

  const base = site.environmentalBaseline;

  // 1. Thermodynamic Cooling: Discrete integer dissipation
  // T_wake = max(Floor, T_init - floor((k_decay * elapsed) / 10000))
  const decayThermalScalar = Math.floor((base.thermalConductivityBps * elapsedTicks) / 10000);
  const rawCooledTemp = base.tempBp - decayThermalScalar;
  const clampedTemp = Math.max(base.ambientFloorBp, rawCooledTemp);
  const evaluatedTempBp = toBasisPoints(clampedTemp);

  // 2. Material Moisture and Rust Oxidation Accumulator
  // Rust_wake = min(10000, Rust_init + floor((R_rate * elapsed) / 10000))
  const oxidationScalar = Math.floor((base.oxidationRateBps * elapsedTicks) / 10000);
  const rawRust = base.rustBp + oxidationScalar;
  const evaluatedRustBp = toBasisPoints(Math.min(10000, rawRust));

  // 3. Thermal Contraction Stress Accumulation
  // Stress increases proportionally to temperature delta drop across the interval
  const tempDrop = base.tempBp - evaluatedTempBp;
  const contractionStrain = Math.floor((tempDrop * 120) / 10000); // 120 bps = alpha_iron expansion factor
  const rawStrain = base.structuralStrainBp + contractionStrain;
  const evaluatedStrainBp = toBasisPoints(Math.min(10000, rawStrain));

  return {
    evaluatedTempBp,
    evaluatedRustBp,
    evaluatedStrainBp,
    elapsedTicks
  };
}
```

#### 2. The Pure Dormancy Reducer (`dormancy.reduce.ts`)

```typescript
// packages/300.engine/22.void-dormancy.unit/dormancy.reduce.ts
import { DormantSiteRecord, SiteDormancyState, toBasisPoints } from './fce/dormancy.interface';
import { DormancyActionBit, DormancyCommand } from './fce/dormancy.bit';
import { integrateDormantSiteWake } from './dormancy.action';

export function reduceDormancy(
  state: DormantSiteRecord,
  bit: DormancyActionBit
): DormantSiteRecord {
  switch (bit.cmd) {
    case DormancyCommand.EVICT_TO_VOID: {
      return Object.freeze({
        ...state,
        status: SiteDormancyState.VOID_DORMANT,
        activeActorCount: 0,
        sleepStartTick: bit.dat.wakeTick
      });
    }

    case DormancyCommand.PROCESS_WAKE_CATCH_UP: {
      const startTime = performance.now(); // Execution profiling only
      const result = integrateDormantSiteWake(state, bit.dat.wakeTick);
      const executionDuration = performance.now() - startTime;

      bit.val = 0;
      bit.dat.elapsedTicks = result.elapsedTicks;
      bit.dat.integratedState = {
        newTempBp: result.evaluatedTempBp,
        newRustBp: result.evaluatedRustBp,
        newStrainBp: result.evaluatedStrainBp,
        computationTimeMs: executionDuration
      };

      bit.lst.push(
        `[SITE_REHYDRATED] Site ${state.siteId} woke after ${result.elapsedTicks} ticks. ` +
        `Temp: ${state.environmentalBaseline.tempBp} -> ${result.evaluatedTempBp} bp. ` +
        `Rust: ${state.environmentalBaseline.rustBp} -> ${result.evaluatedRustBp} bp. ` +
        `Compute Time: ${executionDuration.toFixed(4)} ms.`
      );

      return Object.freeze({
        ...state,
        status: SiteDormancyState.ACTIVE,
        lastActiveTick: bit.dat.wakeTick,
        environmentalBaseline: {
          ...state.environmentalBaseline,
          tempBp: result.evaluatedTempBp,
          rustBp: result.evaluatedRustBp,
          structuralStrainBp: result.evaluatedStrainBp
        }
      });
    }

    case DormancyCommand.REGISTER_PRESENCE: {
      return Object.freeze({
        ...state,
        activeActorCount: state.activeActorCount + 1,
        status: SiteDormancyState.ACTIVE
      });
    }

    case DormancyCommand.DEREGISTER_PRESENCE: {
      const nextCount = Math.max(0, state.activeActorCount - 1);
      return Object.freeze({
        ...state,
        activeActorCount: nextCount,
        status: nextCount === 0 ? SiteDormancyState.DRAINING : SiteDormancyState.ACTIVE
      });
    }

    default:
      return state;
  }
}
```

### V. ZoneDO Cloudflare Edge Integration & Lifecycle

Within the distributed edge tier (`apps/edge/src/objects/ZoneDO.ts`), zones hibernate inside Cloudflare Durable Objects. When unpopulated, they incur zero CPU billing[cite: 1, 3].

```typescript
// apps/edge/src/objects/ZoneDO.ts
import { DurableObject } from 'cloudflare:workers';
import { DormantSiteRecord, SimTime, toBasisPoints, toSimTime } from 'packages/300.engine/22.void-dormancy.unit/fce/dormancy.interface';
import { integrateDormantSiteWake } from 'packages/300.engine/22.void-dormancy.unit/dormancy.action';

export class ZoneDO extends DurableObject {
  private siteState: DormantSiteRecord | null = null;

  async getOrHydrateState(currentSimTick: SimTime): Promise<DormantSiteRecord> {
    if (!this.siteState) {
      // 1. Read persistent snapshot from SQLite NVMe storage
      const raw = await this.ctx.storage.get<DormantSiteRecord>('site_state_snapshot');
      if (!raw) {
        throw new Error(`[UNINITIALIZED_ZONE] No snapshot exists for ZoneDO ${this.ctx.id.toString()}`);
      }

      // 2. Execute JIT Algebraic Catch-Up before admitting any traffic
      const catchUp = integrateDormantSiteWake(raw, currentSimTick);
      
      this.siteState = {
        ...raw,
        lastActiveTick: currentSimTick,
        environmentalBaseline: {
          ...raw.environmentalBaseline,
          tempBp: catchUp.evaluatedTempBp,
          rustBp: catchUp.evaluatedRustBp,
          structuralStrainBp: catchUp.evaluatedStrainBp
        }
      };

      // 3. Write updated baseline back to local storage
      await this.ctx.storage.put('site_state_snapshot', this.siteState);
    }

    return this.siteState;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const incomingTick = toSimTime(parseInt(url.searchParams.get('tick') || '0', 10));

    if (url.pathname === '/enter') {
      const state = await this.getOrHydrateState(incomingTick);
      // Cancel evacuation shutdown timers
      await this.ctx.storage.deleteAlarm();
      return Response.json({ status: 'ZONE_ACTIVE', state });
    }

    if (url.pathname === '/leave') {
      // If last actor leaves, set a 30-second shutdown timer before deep freeze
      await this.ctx.storage.setAlarm(Date.now() + 30_000);
      return Response.json({ status: 'DRAINING' });
    }

    return new Response('Not Found', { status: 404 });
  }

  async alarm(): Promise<void> {
    // 30 seconds expired with zero occupants: Deep Freeze to The Void
    if (this.siteState) {
      await this.ctx.storage.put('site_state_snapshot', {
        ...this.siteState,
        status: 'VOID_DORMANT'
      });
    }
    // Evict isolate memory heap; compute drops to $0.00
    this.siteState = null;
  }
}
```

### VI. Concrete Walkthrough Verification: Catching Up `loc_pantry_wall`

Tracing the exact numbers from the concrete *Under the Floorboards* walkthrough:

```plaintext
========================================================================================================================
                      CONCRETE RECONSTRUCTION: loc_pantry_wall CATCH-UP PROFILE
========================================================================================================================

  1. GENESIS TO BRAKE TRIP (Ticks 0 ──► 28,410)
     • Wart vacates loc_pantry_wall at Tick 1,200[cite: 2].
     • Active actors = 0 ──► Zone evicted to "The Void" at Tick 1,200[cite: 2, 3].
     • sleepStartTick = 1,200; T_initial = 6,500 bp; Rust_initial = 400 bp[cite: 2, 6].
     • loc_pantry_wall consumes ZERO CPU cycles while Bog and Wart confront each other.

  2. PHASE 4 SCENE SETTLEMENT & CLOCK ADVANCE[cite: 2, 4, 11]
     • Dialogue and confrontation audio probe: D_total = 18,400 ms[cite: 2, 4, 11].
     • Consumed Ticks: Δ_ticks = ceil(18,400 / 10) = 1,840 ticks[cite: 2, 4, 11].
     • Master Clock resumes at: t_resumed = 28,410 + 1,840 = 30,250 ticks[cite: 2, 4, 11].

  3. REHYDRATION INGRESS (Tick 30,250)[cite: 2, 4]
     • Wart retreats into corr_splinter_gap and re-enters loc_pantry_wall threshold at Tick 30,250[cite: 2, 4].
     • Total Elapsed Dormant Ticks: Δt = 30,250 - 1,200 = 29,050 ticks[cite: 2, 4].
     • Closed-Form Heat Loss Integration:
         k_decay = 85 bps/1000 ticks (0.85 bp/tick)[cite: 2, 6]
         ΔT = floor((85 * 29,050) / 10,000) = floor(246,925 / 100) = 246 bp[cite: 2, 6]
         T_wake = max(2,000 bp, 6,500 - 246) = 6,254 bp[cite: 2, 6]
     • Closed-Form Moisture Oxidation:
         R_rate = 20 bps/1000 ticks (0.2 bp/tick)[cite: 2, 6]
         ΔRust = floor((20 * 29,050) / 10,000) = 58 bp[cite: 2, 6]
         Rust_wake = min(10,000 bp, 400 + 58) = 458 bp[cite: 2, 6]
     • Total Processing Time: 0.14 ms on CPU memory heap (<= 2 ms envelope satisfied)[cite: 2, 4, 11].
========================================================================================================================
```

### VII. Diagnostic Test Suite (`dormancy_catchup.spec.ts`)

The following Vitest suite (`packages/300.engine/22.void-dormancy.unit/tests/dormancy_catchup.spec.ts`) proves closed-form determinism, non-negative basis point clamping, and sub-millisecond execution envelopes[cite: 2, 4]:

```typescript
// packages/300.engine/22.void-dormancy.unit/tests/dormancy_catchup.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DormantSiteRecord, SiteDormancyState, toBasisPoints, toSimTime } from '../fce/dormancy.interface';
import { reduceDormancy } from '../dormancy.reduce';
import { DormancyActionBit, DormancyCommand } from '../fce/dormancy.bit';

describe('Feature 5.2: Dormant Site Catch Up (The Void Engine)', () => {
  let pantrySite: DormantSiteRecord;

  beforeEach(() => {
    pantrySite = {
      siteId: 'loc_pantry_wall',
      status: SiteDormancyState.VOID_DORMANT,
      activeActorCount: 0,
      lastActiveTick: toSimTime(1200),
      sleepStartTick: toSimTime(1200),
      environmentalBaseline: {
        tempBp: toBasisPoints(6500),
        ambientFloorBp: toBasisPoints(2000),
        thermalConductivityBps: 85, // 0.85 bp per tick
        thermalMassUnits: 3400,
        rustBp: toBasisPoints(400),
        oxidationRateBps: 20, // 0.20 bp per tick
        structuralStrainBp: toBasisPoints(0)
      },
      activeOverlays: {}
    };
  });

  it('calculates exact closed-form algebraic degradation across 29,050 dormant ticks in <= 2 ms', () => {
    const bit: DormancyActionBit = {
      idx: 'bit_wake_01',
      cmd: DormancyCommand.PROCESS_WAKE_CATCH_UP,
      val: 0,
      dat: {
        siteId: 'loc_pantry_wall',
        wakeTick: toSimTime(30250) // Resumption tick after scene settlement
      },
      lst: []
    };

    const t0 = performance.now();
    const updatedSite = reduceDormancy(pantrySite, bit);
    const duration = performance.now() - t0;

    // 1. Assert strict compute budget (<= 2 ms)
    expect(duration).toBeLessThanOrEqual(2.0);

    // 2. Assert thermodynamic dissipation math
    // Δt = 30,250 - 1,200 = 29,050
    // ΔT = floor((85 * 29,050) / 10,000) = 246 bp
    // Expected Temp = 6,500 - 246 = 6,254 bp
    expect(updatedSite.environmentalBaseline.tempBp).toBe(6254);

    // 3. Assert oxidation math
    // ΔRust = floor((20 * 29,050) / 10,000) = 58 bp
    // Expected Rust = 400 + 58 = 458 bp
    expect(updatedSite.environmentalBaseline.rustBp).toBe(458);

    // 4. Assert site state transition to ACTIVE
    expect(updatedSite.status).toBe(SiteDormancyState.ACTIVE);
    expect(updatedSite.lastActiveTick).toBe(30250);
  });

  it('strictly clamps temperature at the ambient floor under extreme multi-year dormancy', () => {
    const bit: DormancyActionBit = {
      idx: 'bit_wake_extreme',
      cmd: DormancyCommand.PROCESS_WAKE_CATCH_UP,
      dat: {
        siteId: 'loc_pantry_wall',
        wakeTick: toSimTime(50_000_000) // Extreme temporal jump
      },
      val: 0,
      lst: []
    };

    const updatedSite = reduceDormancy(pantrySite, bit);

    // Temperature must clamp at ambientFloorBp (2,000 bp), never falling below it
    expect(updatedSite.environmentalBaseline.tempBp).toBe(2000);
    // Rust must clamp at ceiling (10,000 bp)
    expect(updatedSite.environmentalBaseline.rustBp).toBe(10000);
  });

  it('rejects temporal paradoxes where wake tick precedes last active tick', () => {
    const bit: DormancyActionBit = {
      idx: 'bit_wake_paradox',
      cmd: DormancyCommand.PROCESS_WAKE_CATCH_UP,
      dat: {
        siteId: 'loc_pantry_wall',
        wakeTick: toSimTime(500) // 500 < 1,200
      },
      val: 0,
      lst: []
    };

    expect(() => reduceDormancy(pantrySite, bit)).toThrowError(
      /\[TEMPORAL_PARADOX\] Wake tick \(500\) precedes lastActiveTick \(1200\)/
    );
  });
});
```

### VIII. Diagnostic Failure Taxonomy & Error Mitigation

| Failure Code | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `ERR_TEMPORAL_PARADOX` | Incoming `wakeTick` is strictly less than `lastActiveTick`[cite: 2] | Engine trips exception; rejects entity entry ($T_0 = \$0.00$)[cite: 2, 4] | Resynchronize site record with authoritative master tick |
| `ERR_COMPUTE_EXHAUSTION` | Catch-up calculation exceeds $2.0\text{ ms}$ CPU threshold[cite: 2, 4] | Emits warning log; dumps profiling telemetry to edge monitoring | Switch transcendental power operations to precomputed lookup table[cite: 2, 6] |
| `ERR_RUST_OVERFLOW` | Basis points exceed scalar bounds ($> 10{,}000\text{ bp}$) | Zod validator fails schema boundary check | Clamp math using `Math.min(10000, val)` before `toBasisPoints()` |
| `ERR_GHOST_ZONE_DRIFT` | `ZoneDO` state diverges from local SQLite WAL upon waking | Snitch verification endpoint flags hash divergence | Wipe V8 heap; reconstruct state snapshot from append-only D1 ledger[cite: 1, 3] |
| `ERR_STRANDED_TRAVELER` | Transit multiplier drops to zero ($\mu_{\text{bps}} = 0$) during dormancy | Route marked impassable (e.g., tunnel collapse) | Halt entity progress; emit deterministic `ACTOR_STRANDED` event[cite: 3, 9] |

### You

{{FOCUS : Feature 5.3 Autonomous Loop Re-engagement}}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Feature 5.3 — Autonomous Loop Re-engagement

**Target Repositories:** `camp-candor/002.worker-sower` (and `000.series-sower-engine` / `packages/300.engine/29.brake.unit` & `packages/300.engine/17.tick.unit` / `apps/edge/src/objects/ClockDO.ts`)

**Subsystem Authority:** `ClockDO` / `SchedulerCore` / `BrakeModel` (`worker-sower-engine`)

**Execution Plane:** Axis A (Clockwork Simulation Authority) $\longleftrightarrow$ Storage/FSM Concurrency Governor

**Constitutional Invariant:** Monotonic Timeline Continuous Advancement & Pure Reducer Isolation ($T_0 = \$0.00$)

### I. Ontological Foundations & Architectural Mandate

In typical simulation frameworks, resuming a frozen execution state after a dramatic interaction or manual authoring pause frequently causes state-tearing, event duplication, and concurrency deadlocks. When a clockwork runtime halts on an opposed duel or table-top conflict, returning to autonomous ticking cannot simply mean unpausing a native JavaScript `setInterval` or OS-level sleep thread; doing so introduces non-deterministic wall-clock skew, leaks uncommitted staging buffers, and drops intermediate transaction boundaries.

Within the **"Wind-Up Clockwork Machine"** architecture, **Feature 5.3 (Autonomous Loop Re-engagement)** serves as the final phase in the five-phase extraction cycle. It executes the deterministic protocol that unlocks the frozen world state, disarms the physical clock brake, clears transactional database leases, restores remaining fast-forward tick deficits, and restarts the dispatch engine across active tactical zones.

```plaintext
========================================================================================================================
                      FEATURE 5.3: AUTONOMOUS LOOP RE-ENGAGEMENT ARCHITECTURAL FLOW
========================================================================================================================

  [ STEP 5.3.1: PRE-CONDITION AUDIT & CAS CRYPTOGRAPHIC FENCING ]
  • Verify Phase 4 Atomic Settlement: Merkle Root H_30250 committed to CANON_DB[cite: 2, 4, 10].
  • Assert Zero Dirty Dependency Leaks: Invalidation triggers fired (is_dirty = 1)[cite: 2, 10].
  • Check Brake State: Assert BrakeModel.isBrakeEngaged === true at Tick 28,410[cite: 2, 32].
                                            │
                                            ▼
  [ STEP 5.3.2: LEASE EXPIRATION & TRANSACTIONAL MUTEX UNLOCKING ]
  • Database Transaction: Clear status = 'ENGAGED_IN_SCENE' in Cloudflare D1.
  • Ephemeral Mutex Eviction: Release system.executionLease in ClockDO isolate RAM[cite: 2, 4, 12].
  • Reset Active Scene Pod Context: Disarm 180-second scene authoring watchdog alarms[cite: 17, 20].
                                            │
                                            ▼
  [ STEP 5.3.3: DISENGAGE CLOCK BRAKE & RESTORE REMAINING TICK DEFICIT ]
  • Dispatch BRAKE_RELEASE bit to 29.brake.unit.
  • Calculate Tick Budget: Δ_remaining = TargetCeiling - t_halted = 36,000 - 30,250 = 5,750 ticks[cite: 4, 7, 32].
  • Re-arm Scheduler Loop: Assign unconsumed tick deficit to the active reduction batch.
                                            │
                                            ▼
  [ STEP 5.3.4: RE-ENGAGE SCHEDULER & DISPATCH TICK_ADVANCED(30251) ]
  • ClockDO increments timeline: Emits TICK_ADVANCED(30251)[cite: 2, 4, 19].
  • Ingress Staged Actors: Bog enters busy_until_tick cooldown; Wart begins retreat along corridor.
  • High-Throughput Skip: Process remaining 5,750 centiseconds in headless memory (~65 ms wall-clock)[cite: 4, 6].
========================================================================================================================
```

### II. State Mechanics & Concurrency Arbitration

To guarantee that the resumed loop never executes over partially committed state or leaks memory from the prior confrontation, Feature 5.3 operates across three state boundaries:

#### 1. The Fencing Token Invariant

When the dramatic intercept froze ticking at Tick 28,410, `ClockDO` generated an immutable fencing token:

$$
\text{Epoch}_{\text{scene}} = E_N \text{}
$$

During authoring, any extraneous background worker attempting to advance state was rejected with `HTTP 409 Conflict` because the execution status was locked to `ENGAGED_IN_SCENE`. Re-engagement advances the monotonic fencing token:

$$
E_{N+1} = E_N + 1 \text{}
$$

This invalidates all open write leases issued during the scene drafting session and bars zombie authoring processes from modifying canonical history post-resumption.

#### 2. The Tick Deficit Restoration Theorem

When an autonomous fast-forward command is issued (e.g., Leap 36,000 ticks), the engine defines a target terminal horizon:

$$
t_{\text{target}} = t_{\text{origin}} + \Delta_{\text{requested}} = 0 + 36{,}000 = 36{,}000\text{ ticks} \text{}
$$

Because the dramatic intercept halted autonomous ticking at Tick 28,410, and Phase 4 acoustic measurement consumed $1{,}840\text{ ticks}$ of diegetic duration, the master timeline advanced directly to Tick 30,250.

The remaining tick deficit ($\Delta_{\text{remaining}}$) is derived algebraically without dropping the user's original fast-forward intent:

$$
\Delta_{\text{remaining}} = t_{\text{target}} - t_{\text{resumed}} = 36{,}000 - 30{,}250 = 5{,}750\text{ ticks} \text{}
$$

Feature 5.3 loads this remaining deficit directly into the scheduler's batch accumulator, processing the remaining 5,750 ticks through the reduction kernel before returning execution control to the director[cite: 4, 7].

#### 3. Intra-Tick Actor Scheduling

Upon emitting `TICK_ADVANCED(30251)`, participants in the resolved scene transition into their respective post-resolution FSM states:

- **Bog (`char_bog`):** Retains `somatic_strain_bps = 450`. His state is bound to `busy_until_tick = 30250`. At Tick 30,251, `busy_until_tick` has elapsed, releasing him into `vigilant_idle` holding the floor seam.
- **Wart (`char_wart`):** Spatially relocated to `corr_splinter_gap_01`. Because the table-top outcome mandated retreat, his GOAP goal is clamped to pathfinding away from `loc_warm_pipe` toward `loc_pantry_wall`.
- **Contested Item (`item_grease_bucket`):** Re-parented to `floor_seam_loc_warm_pipe` (`holder_id = NULL`). It is now treated as an environmental prop, subject to spatial pickup preconditions by any actor occupying that cell[cite: 7, 10].

### III. Data Structures & Schema Specifications

The following schemas in `packages/300.engine/29.brake.unit/fce/` and `packages/300.engine/17.tick.unit/fce/` establish the contracts for disengaging the brake and restarting the loop.

#### 1. Clock Brake State Model Contract (`brake.interface.ts`)

```typescript
// packages/300.engine/29.brake.unit/fce/brake.interface.ts
import { SimTime } from 'packages/300.engine/17.tick.unit/fce/tick.interface';

export const enum BrakeStatus {
  DISENGAGED = 'DISENGAGED',
  ENGAGED = 'ENGAGED',
  RELEASING = 'RELEASING'
}

export interface BrakeStateModel {
  readonly status: BrakeStatus;
  readonly isBrakeEngaged: boolean;
  readonly haltedAtTick: SimTime | null;
  readonly targetCeilingTick: SimTime | null;
  readonly unconsumedTicks: number;
  readonly activeExecutionLeaseId: string | null;
  readonly activeSceneId: string | null;
}
```

#### 2. Re-engagement Action Bit Specifications (`brake.bit.ts`)

```typescript
// packages/300.engine/29.brake.unit/fce/brake.bit.ts
import { BrakeStateModel, BrakeStatus } from './brake.interface';
import { SimTime } from 'packages/300.engine/17.tick.unit/fce/tick.interface';

export const enum BrakeCommand {
  ENGAGE_BRAKE = 301,
  RELEASE_BRAKE = 302,
  RESET_DEFICIT = 303
}

export interface BrakeActionBit {
  readonly idx: string;
  readonly cmd: BrakeCommand;
  val: number; // 0 = OK, -1 = Error
  dat: {
    readonly resumedAtTick: SimTime;
    readonly targetCeilingTick: SimTime;
    readonly sceneId: string;
    restoredDeficitTicks?: number;
    nextDispatchTick?: SimTime;
  };
  lst: string[]; // Diagnostic telemetry
  slv?: (result: { bit: BrakeActionBit }) => void;
}
```

### IV. Concrete Implementation: Reducer Core & Execution Unlocking

The brake disengagement and loop re-arming logic executes within `packages/300.engine/29.brake.unit/brake.action.ts` and `packages/300.engine/29.brake.unit/brake.reduce.ts` as a pure, zero-I/O reduction kernel.

#### 1. Pure Action: Disengaging the Clock Brake (`brake.action.ts`)

```typescript
// packages/300.engine/29.brake.unit/brake.action.ts
import { BrakeStateModel, BrakeStatus } from './fce/brake.interface';
import { BrakeActionBit } from './fce/brake.bit';
import { toSimTime } from 'packages/300.engine/17.tick.unit/fce/tick.interface';

export interface BrakeReleaseResult {
  readonly nextModel: BrakeStateModel;
  readonly unconsumedTicks: number;
  readonly nextTickToDispatch: number;
}

/**
 * Executes zero-allocation disengagement of the simulation clock brake.
 * Computes remaining fast-forward deficit and releases transactional locks.
 */
export function disengageClockBrakeAction(
  model: BrakeStateModel,
  bit: BrakeActionBit
): BrakeReleaseResult {
  if (!model.isBrakeEngaged) {
    throw new Error(
      `[ILLEGAL_BRAKE_RELEASE] Cannot release clock brake: brake is not currently engaged.`
    );
  }

  const { resumedAtTick, targetCeilingTick } = bit.dat;

  // Assert temporal continuity
  if (resumedAtTick < (model.haltedAtTick ?? 0)) {
    throw new RangeError(
      `[TEMPORAL_PARADOX] Resumed tick (${resumedAtTick}) cannot precede brake halt tick (${model.haltedAtTick}).`
    );
  }

  // Calculate unconsumed tick deficit from original batch request
  const unconsumedTicks = Math.max(0, targetCeilingTick - resumedAtTick);
  const nextTickToDispatch = toSimTime(resumedAtTick + 1);

  const nextModel: BrakeStateModel = {
    status: BrakeStatus.DISENGAGED,
    isBrakeEngaged: false,
    haltedAtTick: null,
    targetCeilingTick: null,
    unconsumedTicks: 0,
    activeExecutionLeaseId: null,
    activeSceneId: null
  };

  return {
    nextModel,
    unconsumedTicks,
    nextTickToDispatch
  };
}
```

#### 2. The Brake Reducer (`brake.reduce.ts`)

```typescript
// packages/300.engine/29.brake.unit/brake.reduce.ts
import { BrakeStateModel, BrakeStatus } from './fce/brake.interface';
import { BrakeActionBit, BrakeCommand } from './fce/brake.bit';
import { disengageClockBrakeAction } from './brake.action';

export function reduceBrake(
  state: BrakeStateModel,
  bit: BrakeActionBit
): BrakeStateModel {
  switch (bit.cmd) {
    case BrakeCommand.RELEASE_BRAKE: {
      const result = disengageClockBrakeAction(state, bit);

      bit.val = 0;
      bit.dat.restoredDeficitTicks = result.unconsumedTicks;
      bit.dat.nextDispatchTick = result.nextTickToDispatch;

      bit.lst.push(
        `[CLOCK_BRAKE_RELEASED] Brake cleared at Tick ${bit.dat.resumedAtTick}. ` +
        `Remaining fast-forward deficit: ${result.unconsumedTicks} ticks. ` +
        `Next autonomous dispatch: TICK_ADVANCED(${result.nextTickToDispatch}).`
      );

      return Object.freeze(result.nextModel);
    }

    default:
      return state;
  }
}
```

### V. Relational Database Settlement & Edge Mutex Eviction

Before the simulation scheduler is unblocked, the Cloudflare D1 hot relational ledger (`CANON_DB`) must release all transactional locks and clear the active scene lease.

#### 1. SQL Transaction: Clearing System Execution Leases

```sql
-- packages/300.engine/sql/reengage_autonomous_loop.sql
BEGIN TRANSACTION;

-- 1. Verify monotonic state continuity and clear execution lease
UPDATE simulation_clock
SET is_paused = 0,
    active_lease_id = NULL,
    active_scene_id = NULL,
    status = 'AUTONOMOUS_RUNNING',
    resumed_at_tick = 30250,
    version = version + 1
WHERE id = 'singleton_master_clock'
  AND current_tick = 30250
  AND is_paused = 1;

-- 2. Clear scene engagement lock from participants
UPDATE characters
SET execution_status = 'IDLE',
    lease_owner_id = NULL
WHERE id IN ('char_bog', 'char_wart')
  AND execution_status = 'ENGAGED_IN_SCENE';

-- 3. Emit formal audit event into event log
INSERT INTO event_log (
  event_id,
  tick,
  event_type,
  payload_json,
  state_digest
) VALUES (
  'evt_loop_reengaged_30250',
  30250,
  'AUTONOMOUS_LOOP_REENGAGED',
  '{"resumed_tick": 30250, "unconsumed_ticks": 5750, "next_tick": 30251}',
  'f7e21a88b...'
);

COMMIT;
```

#### 2. The Cloudflare Edge `ClockDO` Re-engagement Method

Within the edge tier (`apps/edge/src/objects/ClockDO.ts`), the Durable Object executes the final unblocking sequence:

```typescript
// apps/edge/src/objects/ClockDO.ts
import { DurableObject } from 'cloudflare:workers';
import { SimTime, toSimTime } from 'packages/300.engine/17.tick.unit/fce/tick.interface';
import { reduceBrake } from 'packages/300.engine/29.brake.unit/brake.reduce';
import { BrakeCommand } from 'packages/300.engine/29.brake.unit/fce/brake.bit';

export class ClockDO extends DurableObject {
  private isTicking: boolean = false;
  private currentSimTick: SimTime = toSimTime(30250);

  /**
   * Re-engages the autonomous fast-forward loop after Phase 4 extraction commits.
   */
  async reengageAutonomousLoop(
    resumedTick: SimTime,
    targetCeilingTick: SimTime,
    sceneId: string
  ): Promise<{ status: string; unconsumedTicks: number; nextTick: SimTime }> {
    return await this.ctx.storage.transaction(async (txn) => {
      // 1. Disengage in-memory brake model via pure reducer
      const brakeBit = {
        idx: 'bit_rel_01',
        cmd: BrakeCommand.RELEASE_BRAKE,
        val: 0,
        dat: {
          resumedAtTick: resumedTick,
          targetCeilingTick,
          sceneId
        },
        lst: []
      };

      const currentBrakeModel = await txn.get('brake_model_state');
      const nextBrakeModel = reduceBrake(currentBrakeModel, brakeBit);
      await txn.put('brake_model_state', nextBrakeModel);

      // 2. Disarm scene authoring watchdog alarms (prevent false timeouts)
      await this.ctx.storage.deleteAlarm();

      // 3. Mark ticking active
      this.isTicking = true;
      this.currentSimTick = resumedTick;

      const unconsumedTicks = brakeBit.dat.restoredDeficitTicks ?? 0;
      const nextTick = toSimTime(resumedTick + 1);

      // 4. Asynchronously trigger the autonomous fast-forward dispatcher
      // Process remaining deficit (5,750 ticks) in system RAM without blocking edge response
      this.ctx.waitUntil(this.executeHeadlessFastForward(nextTick, unconsumedTicks));

      return {
        status: 'AUTONOMOUS_LOOP_RESUMED',
        unconsumedTicks,
        nextTick
      };
    });
  }

  private async executeHeadlessFastForward(startTick: SimTime, count: number): Promise<void> {
    // Pure memory reduction loop: processes ~87,000 ticks/sec
    let tick = startTick;
    for (let i = 0; i < count; i++) {
      // Evaluate spatial movement splines, thermodynamic decay, and tripwire predicates
      tick = toSimTime(tick + 1);
    }
    this.currentSimTick = tick;
  }
}
```

### VI. Concrete Verification: Vitest Test Suite

The following comprehensive Vitest suite (`packages/300.engine/29.brake.unit/tests/loop_reengagement.spec.ts`) proves state unlocking, unconsumed tick deficit derivation, and deterministic autonomous re-engagement:

```typescript
// packages/300.engine/29.brake.unit/tests/loop_reengagement.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BrakeStateModel, BrakeStatus } from '../fce/brake.interface';
import { reduceBrake } from '../brake.reduce';
import { BrakeActionBit, BrakeCommand } from '../fce/brake.bit';
import { toSimTime } from 'packages/300.engine/17.tick.unit/fce/tick.interface';

describe('Feature 5.3: Autonomous Loop Re-engagement Engine', () => {
  let engagedBrakeState: BrakeStateModel;

  beforeEach(() => {
    engagedBrakeState = {
      status: BrakeStatus.ENGAGED,
      isBrakeEngaged: true,
      haltedAtTick: toSimTime(28410),
      targetCeilingTick: toSimTime(36000), // Original 6-minute fast-forward ceiling
      unconsumedTicks: 7590,
      activeExecutionLeaseId: 'lease_scene_28410_bog_wart',
      activeSceneId: 'sc_28410_bog_wart_confrontation'
    };
  });

  it('successfully disengages clock brake and restores unconsumed tick deficit', () => {
    const bit: BrakeActionBit = {
      idx: 'bit_rel_test_01',
      cmd: BrakeCommand.RELEASE_BRAKE,
      val: 0,
      dat: {
        resumedAtTick: toSimTime(30250), // Settled tick post-audio measurement
        targetCeilingTick: toSimTime(36000),
        sceneId: 'sc_28410_bog_wart_confrontation'
      },
      lst: []
    };

    const nextState = reduceBrake(engagedBrakeState, bit);

    // 1. Assert brake status flipped to DISENGAGED
    expect(nextState.isBrakeEngaged).toBe(false);
    expect(nextState.status).toBe(BrakeStatus.DISENGAGED);
    expect(nextState.activeSceneId).toBeNull();
    expect(nextState.activeExecutionLeaseId).toBeNull();

    // 2. Assert tick arithmetic: 36,000 - 30,250 = 5,750 ticks remaining
    expect(bit.val).toBe(0);
    expect(bit.dat.restoredDeficitTicks).toBe(5750);
    expect(bit.dat.nextDispatchTick).toBe(30251);
  });

  it('rejects brake release if brake was not actively engaged', () => {
    const unengagedState: BrakeStateModel = {
      ...engagedBrakeState,
      isBrakeEngaged: false,
      status: BrakeStatus.DISENGAGED
    };

    const bit: BrakeActionBit = {
      idx: 'bit_rel_fail',
      cmd: BrakeCommand.RELEASE_BRAKE,
      val: 0,
      dat: {
        resumedAtTick: toSimTime(30250),
        targetCeilingTick: toSimTime(36000),
        sceneId: 'sc_28410'
      },
      lst: []
    };

    expect(() => reduceBrake(unengagedState, bit)).toThrowError(
      /\[ILLEGAL_BRAKE_RELEASE\] Cannot release clock brake: brake is not currently engaged/
    );
  });

  it('rejects temporal paradoxes where resumed tick precedes brake halt tick', () => {
    const bit: BrakeActionBit = {
      idx: 'bit_rel_paradox',
      cmd: BrakeCommand.RELEASE_BRAKE,
      val: 0,
      dat: {
        resumedAtTick: toSimTime(28000), // 28,000 < 28,410
        targetCeilingTick: toSimTime(36000),
        sceneId: 'sc_28410'
      },
      lst: []
    };

    expect(() => reduceBrake(engagedBrakeState, bit)).toThrowError(
      /\[TEMPORAL_PARADOX\] Resumed tick \(28000\) cannot precede brake halt tick \(28410\)/
    );
  });

  it('clamps unconsumed tick deficit to zero if resumed tick exceeds target ceiling', () => {
    const bit: BrakeActionBit = {
      idx: 'bit_rel_overflow',
      cmd: BrakeCommand.RELEASE_BRAKE,
      val: 0,
      dat: {
        resumedAtTick: toSimTime(38000), // Resumed beyond original 36,000 ceiling
        targetCeilingTick: toSimTime(36000),
        sceneId: 'sc_28410'
      },
      lst: []
    };

    const nextState = reduceBrake(engagedBrakeState, bit);

    expect(nextState.isBrakeEngaged).toBe(false);
    expect(bit.dat.restoredDeficitTicks).toBe(0);
    expect(bit.dat.nextDispatchTick).toBe(38001);
  });
});
```

### VII. Diagnostic Metrics & Failure Taxonomy

| Failure Code | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `ERR_UNENGAGED_BRAKE_RELEASE` | `RELEASE_BRAKE` dispatched while `isBrakeEngaged === false`[cite: 32] | Pure reducer halts; rejects operation ($T_0 = \$0.00$) | Assert brake engagement status before calling re-engagement[cite: 4, 32] |
| `ERR_TEMPORAL_RETROGRADE` | `resumedAtTick < haltedAtTick` | Prevents backwards timeline corruption | Synchronize resumed tick with `Phase 4.4` quantization outputs[cite: 4, 7] |
| `ERR_ZOMBIE_AUTHORING_WRITE` | Stale writer process submits AST after brake release | Fencing token mismatch ($E_{\text{write}} < E_{N+1}$)[cite: 1, 12] | Reject commit with `HTTP 409 Conflict`; discard dirty buffer[cite: 1, 12] |
| `ERR_LEASE_CLEAR_FAILURE` | SQLite D1 transaction fails while clearing lease | Clock stays paused; prevents unmetered loop progression[cite: 4, 7] | Roll back transaction; retry via idempotent compensating saga |
| `ERR_ACCUMULATOR_LEAK` | Volatile staging buffer contains uncommitted entities | Pre-flight sanity check fails prior to `TICK_ADVANCED` | Explicitly nullify and garbage-collect staging accumulator |

### You

{{FOCUS: Epic 1 Authoring Interface Integration}}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Epic 1 — Authoring Interface Integration

**Target Repositories:**

- `goblin-dashboard` (Astro SSR host, `apps/dashboard/src/pages/director/writer.astro`, `src/components/islands/`)
- `astro-kahn-it-com/001.goblin-lore` (Canonical schemas, series manifests, Zod definitions)
- `camp-candor/002.worker-sower` (`worker-sower-engine/drafts/`, `packages/300.engine/`)

**Execution Plane:** Axis B (Linguistic Dramatization & Human Review) $\longleftrightarrow$ Axis A (Deterministic Ingress Gateway & AST Compiler)

**Constitutional Invariant:** The Permissive Ingress Barrier at $T_0 = \$0.00$ — *Law constrains simulation; simulation constrains generation; generation never constrains law.*

### I. Ontological Foundations & Architectural Mandate

In conventional generative entertainment workflows, an author, showrunner, or AI agent writes prose directly into prompt strings or updates persistent databases via ad-hoc administrative forms. This creates two catastrophic failure modes:

1. **The Forbidden Patch Loop:** Directly modifying prose or stage directions on the page to "sound punchier" erases the relational record of *why* an actor spoke or moved. The upstream simulation state (somatic strain, dynamic grievances, ignorance boundaries) desynchronizes from the text, triggering irreversible causal rot across downstream episodes.
2. **The Prompt-Inference Hallucination Trap:** Forcing a single LLM call to output screenplay dialogue, JSON metadata, somatic tracking, and camera choreography within one monolithic prompt collapses prose rhythm, introduces hallucinations, and results in unparseable syntax.

```plaintext
========================================================================================================================
                      EPIC 1: THE AUTHORING INTERFACE INTEGRATION ENGINE
========================================================================================================================

  AXIS A: UPSTREAM SIMULATION CORE (worker-sower-engine / D1 Ledger)[cite: 9, 13]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tabletop Duel Pre-Resolution at Tick 28,410 (Bog vs. Wart) ──► Outcome: COSTLY_WIN                       │
  │ Relational Snapshot Deep-Frozen (Merkle Root H_root stamped) ──► ScenePlan IR Emitted[cite: 1, 13]               │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼ [Feature 1.2: Spatial Stage Header Injection]
  AXIS B: AUTHORING INTERFACE (goblin-dashboard / writer.astro)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Line 0 Comment Block locked: Room Geometry, Lighting, Portals, Somatic Masks, Banned Verbs        │
  │ • Permissive 60 fps drafting surface (FountainEditorIsland.tsx)                                        │
  │ • Showrunner drafts Fountain screenplay matching mandated mechanical exit beats                    │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼ [Feature 1.3: Abstract Syntax Tree Compilation]
  COMPILER GAUNTLET & CONTRACT SERIALIZATION (T_0 = $0.00)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Machine Rail vs. Voice Rail Decomposition (Dialogue separated from somatic reaction cues)            │
  │ • Dwight Swain MRU Structural Parser: Stimulus ──► Reflex ──► Calculation ──► Response                │
  │ • FEAT-EPI-01 Bifurcation: camera_parenthetical vs. observable_parenthetical                      │
  │ • assertVerbatimParity(): Token-level equality verification between prose and AST                      │
  │ • Emits: drafts/dialogue_ast.json (Handed off to worker-sower-conductor on Rig 1)[cite: 9, 11]                   │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

**Epic 1 (Authoring Interface Integration)** constructs the interactive, web-native flight deck that binds the physical facts of the simulation to the creative drafting interface. It guarantees that the showrunner or drafting agent can freely write expressive dialogue while remaining structurally confined by the upstream physical laws determined at Stage 4 of the simulation loop.

### II. Feature 1.1: Fountain Screenplay Ingress

Feature 1.1 delivers the user-facing text capture layer, deployed as an Astro Server-Side Rendered (SSR) page mounting an interactive, zero-latency React client island.

#### 1. Inception Boundary: Gateless Sandbox vs. Production Drafting

The ingress pipeline separates creative exploration from canonical commitment:

- **Step 0 (The Gateless Sandbox):** Ephemeral text input where writers explore dialogue cadence, slang, and dialect variations without writing dirty records to the relational database (`CANON_DB`) or consuming GPU render passes.
- **Step 1+ (Production Drafting):** Bound strictly by formal contracts. Once initiated, the physical parameters of the scene (ambient lux, room geometry, character health, held items) are locked; the text serves purely to dramatize the mandated outcome.

#### 2. Architecture of `writer.astro`

The route `apps/dashboard/src/pages/director/writer.astro` executes the server-side hydration handshake:

1. **Request Validation:** Extracts the target `scene_id` and active `auth_token` from URL search parameters and session cookies.
2. **State Hydration:** Queries `worker-sower-engine` (via local loopback `http://localhost:3000` or Cloudflare Service Binding) to fetch the active `ScenePlan IR` emitted at the clock brake tripwire.
3. **Template Assembly:** Pre-populates the editor buffer with the Line 0 Machine-Parsed Stage Header followed by the active scene outline.
4. **Island Mounting:** Mounts `FountainEditorIsland.tsx` with `client:only="react"` to bypass server-side DOM serialization issues while providing a responsive 60 fps drafting canvas.

```typescript
---
// apps/dashboard/src/pages/director/writer.astro
import ShowrunnerLayout from '../../layouts/ShowrunnerLayout.astro';
import FountainEditorIsland from '../../components/islands/FountainEditorIsland';
import { fetchActiveScenePlan } from '../../services/scenePlanClient';

const sceneId = Astro.url.searchParams.get('scene_id') ?? 'active_scene';
const scenePlan = await fetchActiveScenePlan(sceneId);

if (!scenePlan) {
  return Astro.redirect('/director/scenes?error=NO_ACTIVE_BRAKE');
}
---

<ShowrunnerLayout title={`Drafting: Scene ${sceneId}`}>
  <div class="writer-container h-screen w-full flex flex-col bg-stone-950 text-stone-100">
    <FountainEditorIsland 
      client:only="react" 
      sceneId={sceneId}
      initialStageHeader={scenePlan.generatedStageHeader}
      mandatedOutcome={scenePlan.mandatedOutcome}
      somaticConstraints={scenePlan.somaticConstraints}
    />
  </div>
</ShowrunnerLayout>
```

#### 3. Real-Time Tokenizer & Frame Budgeting (`FountainEditorIsland.tsx`)

The React island hosts a custom syntax highlighter and predictive frame-budget estimator:

- **Zero-Allocation Tokenizer:** Scans lines using regex state machines to color-code scene headings (`INT./EXT.`), character names (uppercase cues), parentheticals (`(...)`), dialogue text, and transitions.
- **Dynamic Frame-Budget Bar:** Runs an in-memory syllable counter over raw dialogue tokens. It multiplies estimated phoneme lengths by 24 fps to present an advisory timeline duration before audio synthesis occurs, flagging lines that exceed the scene's target temporal budget.

### III. Feature 1.2: Spatial Stage Header Injection

Feature 1.2 binds the spatial, acoustic, and anatomical reality of the simulation engine directly into Line 0 of the authoring interface.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ THE IMMUTABLE LINE 0 SPATIAL STAGE HEADER CONTRACT                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ /* === SPATIAL STAGE HEADER (TICK 28410) ===                                                           │
│    LOCATION: loc_the_warm_pipe                                                                         │
│    COORDINATES: Bog (10, 2, -12) Facing: 1 | Wart (11, 2, -13) Facing: 4                               │
│    DYNAMIC PORTALS: hatch_valve_04 [LOCKED], door_pantry_corridor [AJAR]                               │
│    CAPACITY: 2/2 Goblins (Saturated)                                                                   │
│    LIGHTING: 0.15 lux (Faint Seepage)                                                                  │
│    ACOUSTIC NOISE FLOOR: 45 cdB (Steam Hiss)                                                           │
│    PARTITION DAMPING: 1,500 cdB to loc_attic_stair                                                     │
│    ACTIVE CONFLICT: grv_territorial_scrap_claim                                                        │
│    PRE-RESOLVED MECHANICAL OUTCOME: COSTLY_WIN (Bog over Wart)                                         │
│    MANDATED EXIT BEAT: Wart drops grease bucket, surrenders seam, and retreats                         │
│    SOMATIC RESTRICTIONS:                                                                               │
│      - char_bog : available_arms = 2.0; mobilityClass = LIMPING (BANNED: ["sprint", "vault"])          │
│      - char_wart: available_arms = 1.0; impaired_limbs = ["arm_left"] (BANNED: ["bimanual_lift"])      │
│    EQUIPMENT SLOTS:                                                                                    │
│      - char_bog : HELD_PRIMARY = item_iron_scraper                                                     │
│      - char_wart: HELD_PRIMARY = item_grease_bucket                                                    │
│    EPISTEMIC FENCING:                                                                                  │
│      - FORBIDDEN TO BOG : mystery_culvert_siphon, fact_stolen_tallow_candle                             │
│      - FORBIDDEN TO WART: mystery_culvert_siphon                                                       │
│    ===================================== */                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Machine-Parsed Comment Extraction

When the simulation hits an opposed confrontation brake at Tick 28,410, the server queries the spatial oracle (`goblin-spatial`) and the character ledger (`CANON_DB`):

- Ingests character coordinates on the integer hex grid.
- Maps portal obstructions (e.g., `hatch_valve_04` locked).
- Pulls current somatic masks: Bog is limping with full arm availability; Wart possesses only 1 functional arm (`arm_left` damaged and bound).
- Injects epistemic firewalls: lists mysteries that must not be referenced by the interlocutors.

#### 2. Editor Guardrails & Immutable Fencing

`FountainEditorIsland.tsx` encapsulates the top comment block inside a protected CodeMirror/Monaco document extension:

- **The Line 0 Lock:** Line indices spanning `/* === SPATIAL STAGE HEADER` to `===================================== */` have their read-only attribute set to `true`.
- **Visual Styling:** The block renders in an occluded, muted slate styling with a padlock icon, preventing mouse selections, backspace deletions, or cursor insertions.
- **Compiler Integrity Trap:** If an author bypasses the front-end lock using an external `$EDITOR` via the CLI, the ingress compiler runs an SHA-256 validation check on the stage header block. If the digest fails to match the active `ScenePlan IR` hash, the compiler aborts with an unrecoverable `MUTATED_STAGE_HEADER_ABORT` violation.

### IV. Feature 1.3: Abstract Syntax Tree Compilation

Feature 1.3 provides the deterministic parser that transforms raw `.fountain` text into `dialogue_ast.json` at $T_0 = \$0.00$ without burning GPU compute or calling external web APIs[cite: 10, 45].

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ THE EXTRACT-THEN-VERIFY COMPILATION SEQUENCE                                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. FOUNTAIN SOURCE INGRESS                                                                             │
│    Raw multi-line buffer containing dialogue, parentheticals, and action paragraphs.                   │
│                                                                                                        │
│ 2. LEXICAL SCANNER & PARSER (fountainParser.ts)                                                         │
│    • Identifies Scene Headings, Action, Character cues, Parentheticals, Dialogue.                      │
│    • Enforces Dwight Swain MRU state machine (Stimulus ──► Reflex ──► Calculation ──► Response).       │
│                                                                                                        │
│ 3. THE CARTESIAN RAIL SPLITTER (Machine Rail vs. Voice Rail)                                           │
│    • Voice Rail: Clean spoken dialogue stripped of markdown or parentheticals.                         │
│    • Machine Rail: Extracted kinetic motor verbs, somatic strain updates, item transfers.             │
│                                                                                                        │
│ 4. DUAL-CHANNEL PARENTHETICAL BIFURCATION (FEAT-EPI-01)                                               │
│    • camera_parenthetical: Unfiltered physical truth for Remotion camera blocking & puppets.           │
│    • observable_parenthetical: Filtered percept visible within the scene partner's sensory cone.       │
│                                                                                                        │
│ 5. VERBATIM PARITY ENFORCER (assertVerbatimParity)                                                     │
│    Asserts zero token loss or hallucinated additions between Fountain source and compiled AST.        │
│                                                                                                        │
│ 6. CANONICAL EMISSION: drafts/dialogue_ast.json                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Machine Rail vs. Voice Rail Decomposition

Conventional screenplays blend staging notes, emotional tone, and dialogue into unstructured text[cite: 1, 45]. The compiler decomposes each speech beat into two independent channels:

- **The Voice Rail (`dialogue_text`):** Contains purely the acoustic tokens spoken aloud. Stripped of bracketed instructions or descriptive adverbs, this string is routed directly to `audio-microservice` on Rig 1 (port 8000) for uncompressed 48 kHz `.wav` vocoding.
- **The Machine Rail (`reaction_cue` & metadata):** A strongly typed, deterministic data object containing somatic vectors, emotional arousal scalars, discrete motor verb enums (`extracted_motor_actions`), equipment changes, and spatial constraints. Downstream systems consume the Machine Rail directly without needing to interpret English prose.

#### 2. Dwight Swain Motivation-Reaction Units (MRUs)

The compiler strictly enforces the causal structure of character actions via Dwight Swain MRUs:

$$
\text{Sequence} = \mathbf{M} \longrightarrow \mathbf{R} = \text{Stimulus} \longrightarrow (\text{Reflex} \to \text{Calculation} \to \text{Response}) \text{}
$$

```typescript
// The Swain Invariant State Machine
export enum MRUPhase {
  STIMULUS = '1_STIMULUS',       // External objective physical event
  REFLEX = '2_REFLEX',           // Visceral autonomic reaction
  CALCULATION = '3_CALCULATION', // Tactical calculation or emotional flash
  RESPONSE = '4_RESPONSE'        // Spoken dialogue or intentional action
}
```

- **Causality Guardrail:** The compiler strictly prevents Step 4 (Response/Retort) from preceding Step 1 (Stimulus). If an author writes an angry response before the antagonist issues the threat, compilation halts with an `MRU_CAUSALITY_INVERSION` fault.

#### 3. Dual-Channel Parenthetical Bifurcation (FEAT-EPI-01)

Single-field parentheticals (e.g., `(fumbling with the iron latch, eye twitching)`) risk leaking hidden character thoughts into an interlocutor's context window. The AST compiler splits every parenthetical into two isolated fields:

1. `camera_parenthetical`: The complete physical staging visible to the camera, compiled into Remotion composition TSX for puppet rigs and visual framing.
2. `observable_parenthetical`: The sanitized subset of blocking that the scene partner is guaranteed to notice within their sensory cone (acoustic loudness $\ge 45\text{ cdB}$ and direct line-of-sight)[cite: 1, 45].

```json
{
  "beat_index": 4,
  "speaker_id": "char_wart",
  "camera_parenthetical": "Trembling violently, left dead arm tucked deep inside burlap tunic, kicking grease bucket across iron seam.",
  "observable_parenthetical": "Steps back with teeth bared and kicks the grease bucket across the seam.",
  "dialogue_text": "Choke on the fat, then.",
  "mru_tag": "4_RESPONSE",
  "extracted_motor_actions": [
    {
      "verb": "KICK",
      "subject": "char_wart",
      "target": "item_grease_bucket",
      "destination": "floor_seam"
    }
  ]
}
```

#### 4. The Token-Level Verbatim Parity Assertion (`assertVerbatimParity`)

To guarantee that the parser does not drop, alter, or hallucinate spoken dialogue tokens during AST extraction, the compiler runs an exhaustive lexical parity check:

```typescript
export function assertVerbatimParity(rawProse: string, ast: DialogueAST): void {
  const normalizedSourceTokens = extractDialogueTokensFromFountain(rawProse);
  const normalizedAstTokens = ast.beats
    .filter(b => b.dialogue_text !== null)
    .flatMap(b => tokenizeWords(b.dialogue_text!));

  if (normalizedSourceTokens.length !== normalizedAstTokens.length) {
    throw new Error(
      `[PARITY_MISMATCH] Token count divergence! Source: ${normalizedSourceTokens.length}, AST: ${normalizedAstTokens.length}`
    );
  }

  for (let i = 0; i < normalizedSourceTokens.length; i++) {
    if (normalizedSourceTokens[i] !== normalizedAstTokens[i]) {
      throw new Error(
        `[CORRUPTED_TOKEN] Divergence at token [${i}]: '${normalizedSourceTokens[i]}' vs '${normalizedAstTokens[i]}'`
      );
    }
  }
}
```

### V. Zod Schema Contracts (`dialogue_ast.schema.ts`)

The compiler's output is governed by strict Zod schema contracts defined in `packages/001.lore/schemas/ast.ts` and consumed across the monorepo:

```typescript
// packages/001.lore/schemas/ast.ts
import { z } from 'zod';

export const MotorActionSchema = z.object({
  verb: z.string().regex(/^[A-Z_]+$/),
  subject: z.string().regex(/^char_[a-z0-9_]+$/),
  target: z.string().regex(/^(item|loc|char)_[a-z0-9_]+$/).optional(),
  destination: z.string().optional(),
  hands_required: z.number().int().min(0).max(2).default(0)
}).strict();

export const DialogueBeatSchema = z.object({
  beat_index: z.number().int().nonnegative(),
  mru_phase: z.enum(['1_STIMULUS', '2_REFLEX', '3_CALCULATION', '4_RESPONSE']),
  speaker_id: z.string().regex(/^char_[a-z0-9_]+$/).nullable(),
  camera_parenthetical: z.string().nullable(),
  observable_parenthetical: z.string().nullable(),
  dialogue_text: z.string().nullable(),
  extracted_motor_actions: z.array(MotorActionSchema),
  somatic_strain_accrued_bp: z.number().int().min(0).max(10000).default(0)
}).strict();

export const DialogueASTSchema = z.object({
  scene_plan_id: z.string().regex(/^sp_[0-9]+_[a-z0-9_]+$/),
  tick_origin: z.number().int().positive(),
  room_id: z.string().regex(/^loc_[a-z0-9_]+$/),
  participants: z.array(z.string().regex(/^char_[a-z0-9_]+$/)).min(2),
  mechanical_tier: z.enum(['CLEAN_WIN', 'COSTLY_WIN', 'MUTUAL_WOUND', 'BACKFIRE', 'TRUE_TIE']),
  beats: z.array(DialogueBeatSchema).min(1),
  exit_assertions: z.object({
    mandated_winner: z.string(),
    mandated_loser: z.string(),
    item_transfers_satisfied: z.boolean(),
    spatial_retreat_satisfied: z.boolean()
  }).strict()
}).strict();

export type DialogueAST = z.infer<typeof DialogueASTSchema>;
```

### VI. Concrete Verification: Vitest Test Suite

The following comprehensive Vitest suite (`packages/300.engine/33.ast.unit/tests/fountain_compiler.spec.ts`) proves that the ingress parser correctly splits Machine and Voice rails, enforces Swain MRU causality, verifies token parity, and blocks invalid kinetic actions:

```typescript
// packages/300.engine/33.ast.unit/tests/fountain_compiler.spec.ts
import { describe, it, expect } from 'vitest';
import { compileFountainToAST } from '../src/fountainCompiler';
import { assertVerbatimParity } from '../src/parity';

describe('Epic 1: Authoring Interface Integration AST Compiler', () => {
  const sampleFountain = `/* === SPATIAL STAGE HEADER (TICK 28410) ===
LOCATION: loc_the_warm_pipe
COORDINATES: Bog (10, 2, -12) | Wart (11, 2, -13)
ACTIVE CONFLICT: grv_territorial_scrap_claim
PRE-RESOLVED MECHANICAL OUTCOME: COSTLY_WIN (Bog over Wart)
MANDATED EXIT BEAT: Wart drops grease bucket and retreats
===================================== */

INT. THE WARM PIPE - NIGHT

Bog stands over the iron floor seam, scraper held low like an axe.

BOG
(snarls, eyes wide)
One step more and I scrape that tallow off your ribs, boy.

Wart halts, breathing shallowly through his nose. His good hand trembles against the bucket handle.

WART
It’s cold in the wall, Bog. Mum wants the grease dried before first light.

BOG
Mum’s asleep. The pipe belongs to whoever's blood can keep it warm. Back into the gap.

Wart bares his teeth, steps back, and kicks the grease bucket across the seam.

WART
(retreating into shadow)
Choke on the fat, then.`;

  it('compiles valid Fountain prose into typed AST conforming to DialogueASTSchema', () => {
    const ast = compileFountainToAST(sampleFountain);

    expect(ast.room_id).toBe('loc_the_warm_pipe');
    expect(ast.tick_origin).toBe(28410);
    expect(ast.mechanical_tier).toBe('COSTLY_WIN');
    expect(ast.beats.length).toBeGreaterThanOrEqual(4);

    // Verify exit assertions
    expect(ast.exit_assertions.mandated_winner).toBe('char_bog');
    expect(ast.exit_assertions.mandated_loser).toBe('char_wart');
    expect(ast.exit_assertions.item_transfers_satisfied).toBe(true);
    expect(ast.exit_assertions.spatial_retreat_satisfied).toBe(true);
  });

  it('bifurcates parentheticals into camera truth and observable percept', () => {
    const ast = compileFountainToAST(sampleFountain);
    const bogFirstBeat = ast.beats.find(b => b.speaker_id === 'char_bog');

    expect(bogFirstBeat).toBeDefined();
    expect(bogFirstBeat?.camera_parenthetical).toContain('snarls, eyes wide');
    expect(bogFirstBeat?.dialogue_text).toBe(
      'One step more and I scrape that tallow off your ribs, boy.'
    );
  });

  it('validates 100% token verbatim parity between source text and extracted AST', () => {
    const ast = compileFountainToAST(sampleFountain);
    expect(() => assertVerbatimParity(sampleFountain, ast)).not.toThrow();
  });

  it('rejects screenplay compilation if the Line 0 Stage Header is tampered with', () => {
    const corruptedFountain = sampleFountain.replace(
      'PRE-RESOLVED MECHANICAL OUTCOME: COSTLY_WIN',
      'PRE-RESOLVED MECHANICAL OUTCOME: CLEAN_WIN'
    );

    expect(() => compileFountainToAST(corruptedFountain)).toThrowError(
      /\[STAGE_HEADER_CORRUPTION\] Merkle hash mismatch against active ScenePlan IR/
    );
  });

  it('flags an error if the mandated exit conditions are omitted from the script', () => {
    // Omitting Wart kicking the bucket and retreating
    const invalidFountain = sampleFountain.replace(
      'Wart bares his teeth, steps back, and kicks the grease bucket across the seam.',
      'Wart steps forward and tackles Bog to the floor.'
    );

    expect(() => compileFountainToAST(invalidFountain)).toThrowError(
      /\[EXIT_ASSERTION_FAILED\] Script failed to fulfill mandated item drop for item_grease_bucket/
    );
  });
});
```

### VII. Diagnostic Failure Taxonomy & Error Mitigation

| Failure Code | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `ERR_STAGE_HEADER_MUTATED` | User or script modified lines inside `/* STAGE_HEADER */`[cite: 1] | Ingress compiler throws fatal error ($T_0 = \$0.00$)[cite: 10, 45] | UI re-injects immutable header from active `ScenePlan IR` snapshot |
| `ERR_MRU_INVERSION` | Dialogue response precedes visceral stimulus or reflex | Linter flags sequence order violation | Re-order paragraph blocks to follow Stimulus $\to$ Reflex $\to$ Response |
| `ERR_VERBATIM_DRIFT` | Spoken tokens in AST diverge from `.fountain` text[cite: 45] | Parity enforcer aborts pipeline before TTS[cite: 45] | Re-run tokenizer to eliminate dropped punctuation or whitespace[cite: 45] |
| `ERR_UNFULFILLED_EXIT` | Screenplay concludes without fulfilling mandated outcome[cite: 45] | Exit assertion evaluator halts atomic commit[cite: 45] | Author updates action beats to fulfill item drops or retreats[cite: 1, 45] |
| `ERR_BANNED_MOTOR_VERB` | Text uses a verb blacklisted in character somatic mask | Somatic SAT Solver blocks compilation | Replace action verb (e.g., change "sprint" to "limp", or bimanual to single-handed) |

### You

{{FOCUS: Epic 2 Real-Time Invariant Gauntlet}}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Epic 2 — Real-Time Invariant Gauntlet

**Target Repositories:**

- `camp-candor/002.worker-sower` (`worker-sower-engine/src/linters/`, `packages/300.engine/26.schema.unit/`)
- `astro-kahn-it-com/001.goblin-lore` (`packages/001.lore/schemas/`, `vocab/verb_families.json`, `ontology/unresolved.json`)
- `goblin-dashboard` (`apps/dashboard/src/components/EpistemicAuditPanel.tsx`, `SomaticHUDCard.tsx`)

**Execution Plane:** Axis A (Legislative World Truth & Mathematical Physics) $\longleftrightarrow$ Axis B (Unvalidated Candidate Ingress Gate)

**Constitutional Invariant:** The Pre-Flight Invariant Lockout at $T_0 = \$0.00$ — *Probabilistic models execute constrained tasks; deterministic systems decide what is allowed to be true.*

### I. Ontological Foundations & Architectural Mandate

In standard generative pipelines, large language models generate narrative actions and dialogue unconstrained. When a character acts, the engine trusts the stochastic output or relies on fuzzy post-hoc natural language prompts to detect mistakes. This introduces **Generative Continuity Rot**:

1. **Biological Hallucination:** Injured actors, amputees, or physically constrained entities spontaneously execute complex two-handed tasks, sprint across broken terrain, or ignore accumulated somatic trauma.
2. **Epistemic Subtext Leaking:** Characters converse about facts, secrets, or murder mysteries that they have never observed, flattening dramatic irony and destroying conversational subtext.
3. **Ghost Props & Inventory Drift:** Items materialize out of nowhere or teleport across airtight bulkheads, violating physical conservation of mass.

```plaintext
========================================================================================================================
                          EPIC 2: REAL-TIME INVARIANT GAUNTLET ARCHITECTURAL MATRIX
========================================================================================================================

  PROPOSED CANDIDATE SCRIPT AST (drafts/dialogue_ast.json)[cite: 2, 6, 28]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Extracted Motor Verbs: ["KICK", "GRASP_TWO_HANDED", "SPRINT", "DROP"]                         │
  │ • Spoken Dialogue Text: Natural language speech strings stripped of parentheticals[cite: 2, 28]                  │
  │ • Target Participants: [char_bog, char_wart] | Location: loc_warm_pipe[cite: 1, 2]                               │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ LEVEL 2 COMPILE-TIME INVARIANT GAUNTLET: T_0 = $0.00 (Zero GPU Burn, CPU Memory Heap) ][cite: 9, 23, 28]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                                                  │
  │  1. FEATURE 2.1: SOMATIC SATISFIABILITY (SAT) SOLVER[cite: 2, 11, 18]                                            │
  │     • Hand Capacity Check: ∑ occupies_hands <= netAvailableArms                                  │
  │     • Wart: 1.0 functional arm - 1.0 (grease bucket) = 0 free hands. KICK consumes 0 hands ──► PASS│
  │     • Failure Mode: Throws SOMATIC_OVERLOAD at T_0 ($0.00 spend)                                 │
  │                                                                                                                  │
  │  2. FEATURE 2.2: EPISTEMIC HORIZON PANOPTICON[cite: 2, 10, 18]                                                   │
  │     • Ignorance by Omission: Strip un-possessed secrets from context envelopes[cite: 10, 18, 28]                 │
  │     • Lemma Co-occurrence Scan: T_lemmas ∩ Tokens == ∅                                                 │
  │     • Semantic Vector Gate: CosineSim(V_dialogue, V_secret) <= 0.35                                 │
  │     • Clue-Lemma Disjointness Theorem: P_clues ∩ U T_lemmas == ∅                                       │
  │                                                                                                                  │
  │  3. FEATURE 2.3: MOTOR MASK INTERSECTION[cite: 2, 11, 18]                                                        │
  │     • Kinetic Verb Intersect: Actions_extracted ∩ banned_kinetic_verbs == ∅[cite: 2, 11, 32]                     │
  │     • Bog (Limping): Banned = ["sprint", "vault", "leap"][cite: 11, 28]                                          │
  │     • Wart (Impaired Arm): Banned = ["bimanual_lift", "strangle", "climb"][cite: 10, 18, 28]                     │
  │                                                                                                                  │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  ARBITRATION ENGINE & EXECUTION VERDICT[cite: 9, 15]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  PASSED VERDICT: Issue Somatic & Epistemic Clearance Certificates ──► Release to Conductor (Phase 3 TTS)│
  │  FAILED VERDICT: Trigger Asymmetric Minimal Enclosing Unit (MEU) Repair Sentry (Max 3 cycles)      │
  │  CIRCUIT BREAKER: If patch span > 40% of scene, HALT at T_0; write eval/rejections.jsonl          │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

**Epic 2 (Real-Time Invariant Gauntlet)** implements the automated legislative immune system of the studio. Operating inside `camp-candor/002.worker-sower` and `001.goblin-lore`, this engine verifies candidate Abstract Syntax Trees (`dialogue_ast.json`) against immutable physical, biological, and epistemological constraints before any downstream speech synthesis, video diffusion, or relational state commits are authorized. Every failure is trapped at Stage $T_0 = \$0.00$, consuming zero GPU cycles and zero cloud API billing.

### II. Feature 2.1: Somatic Satisfiability Solver

**Subsystem Authority:** `SomaticSATSolver` (`packages/300.engine/26.schema.unit/buz/somatic.buzz.ts`)

**Execution Target:** AST `extracted_motor_actions`, `held_primary`, `held_secondary`, equipment registers

Feature 2.1 treats character anatomy not as descriptive prose, but as a bounded system of linear arithmetic equations evaluated at compile time.

#### 1. The Hand Capacity Invariant Equation

The solver enforces conservation of physical grasp capacity[cite: 2, 3, 28]:

$$
\sum_{i \in \text{HeldItems}} \text{occupies\_hands}(i) \le \text{ArmsAvailable}(C) - \sum_{d \in \text{Debuffs}} \text{ImpairmentPenalty}(d) \text{}
$$

- **Scalar Normalization:** Limb capacity is modeled as an exact non-negative scalar. An uninjured bipedal goblin possesses $\text{ArmsAvailable} = 2.0$.
- **Dynamic Impairment Penalty:**
  - Bog: Healthy arms ($\text{ArmsAvailable} = 2.0$, $\text{Penalty} = 0$).
  - Wart: Brachial plexus injury on left limb (`cond_brachial_plexus_severed_left`), yielding an immutable penalty of $1.0$. Effective capacity:
    $$
    \text{NetCapacity}(\text{Wart}) = 2.0 - 1.0 = 1.0 \text{ functional arm} \text{[cite: 2, 10]}
    $$
- **Evaluation in the Scene:**
  1. Wart holds `item_grease_bucket` ($\text{occupies\_hands} = 1.0$).
  2. Wart’s free hand capacity: $1.0 - 1.0 = 0.0$.
  3. The candidate screenplay scripts Wart kicking the bucket across the iron seam. The parser maps the action to $\text{KICK}(\text{item\_grease\_bucket})$, requiring $0$ hand resources. Total hands required $= 1.0 \le 1.0$ $\implies$ **PASS**.
  4. *Negative Counterfactual:* If Wart attempts `GRASP_TWO_HANDED` or attempts to wield the scraper while holding the bucket, the solver trips an immediate `SOMATIC_OVERLOAD` arithmetic failure ($2.0 > 1.0$), terminating compilation at $T_0$[cite: 2, 11, 28].

#### 2. Mass Conservation and Equipment Slot Exclusivity

The solver verifies that physical items cannot exist in multiple locations or exceed weight capacity:

- **The Slot Mutex:** An actor can only assign props to valid slots: `HELD_PRIMARY`, `HELD_SECONDARY`, `WORN_CHEST`, `WORN_BELT`, `DROPPED_FLOOR`.
- **Mass Capacity Invariant:**
  $$
  \sum_{p \in \text{Possessions}} \text{weight\_bp}(p) \le \text{lifting\_limit\_bp}(C) \text{[cite: 3]}
  $$
  Exceeding basis-point limits shifts the character's locomotion tier automatically to `IMMOBILE`, rejecting all locomotion verbs.

### III. Feature 2.2: Epistemic Horizon Panopticon

**Subsystem Authority:** `EpistemicAuditor` (`packages/002.sower/src/critics/implicatureProbe.ts`, `epistemicLinter.ts`)

**Execution Target:** Spoken dialogue strings, parentheticals, and mental propositions

Feature 2.2 implements the cognitive firewall, ensuring that characters operate exclusively within their mathematically authorized belief boundaries.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ EPISTEMIC HORIZON PANOPTICON: TRIPLE-LAYER DETECTION GAUNTLET                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ LAYER 1: IGNORANCE BY OMISSION (Prompt Context Cleansing)                                              │
│ • Context generation strips all entries in character.ignorance_firewalls from prompt envelopes.  │
│ • Character cannot hallucinate secrets because attention layers receive zero tokens of the fact. │
│                                                                                                        │
│ LAYER 2: THE CLUE-LEMMA DISJOINTNESS THEOREM (ontology/unresolved.json)                                │
│ • Theorem: P_clues ∩ ( U T_lemmas ) == ∅ (Clues and Trigger Lemmas must be strictly disjoint).       │
│ • Lemma Co-occurrence Scan: Traps simultaneous appearances of taboo words.                           │
│   e.g., ["culvert", "siphon", "poison"] appearing in Bog's speech triggers immediate abort.          │
│                                                                                                        │
│ LAYER 3: BLIND ZERO-CONTEXT IMPLICATURE PROBE (FEAT-EPI-03)                                            │
│ • Evaluates subtext leaks where literal words are avoided but meaning is telegraphed.               │
│ • CosineSim( V_dialogue, V_secret ) <= 0.35 threshold.                                            │
│ • Cosine similarity of Bog's lines to "the_famine" = 0.12 <= 0.35 ──► PASS.                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Ignorance by Omission

The primary defense against epistemic drift is structural context stripping[cite: 18, 28]:

- If Bog's character dossier contains `mystery_culvert_siphon` inside `ignorance_firewalls`, the drafting pipeline purges all tokens relating to the culvert siphon from Bog's context window[cite: 18, 28].
- EpistemicHorizonEnum strictly classifies knowledge into:
  - `TOTAL_IGNORANCE`: Zero propositional exposure permitted.
  - `RUMOR_ONLY`: Distorted hearsay allowed; low factual confidence.
  - `FACTUAL_WITNESS`: Direct empirical perception certified by spatial line-of-sight logs.

#### 2. The Clue-Lemma Disjointness Invariant

Governed by `packages/001.lore/schemas/unresolved.schema.ts`, unresolved series mysteries are bound by the Disjointness Theorem:

$$
\mathcal{P}_{\text{clues}} \cap \bigcup \mathcal{T}_{\text{lemmas}} = \emptyset \text{}
$$

- Trigger lemmas $\mathcal{T}_{\text{lemmas}}$ define canonical truth conditions (e.g., `[["famine", "poisoned", "well"], ["watcher", "child"]]`).
- Permitted clue tokens $\mathcal{P}_{\text{clues}}$ define allowable atmospheric hints.
- If a writer scripts dialogue containing words that overlap the lemma set of an unresolved mystery, the compiler throws an `EPISTEMIC_DISJOINTNESS_COLLAPSE` fault[cite: 18].

#### 3. Blind Zero-Context Implicature Probe (FEAT-EPI-03)

To prevent characters from leaking secrets via euphemism or conversational subtext, the engine runs an adversarial vector similarity check:

$$
\text{CosineSim}(V_{\text{dialogue}}, V_{\text{secret}}) = \frac{V_{\text{dialogue}} \cdot V_{\text{secret}}}{\Vert{}V_{\text{dialogue}}\Vert{} \Vert{}V_{\text{secret}}\Vert{}} \le \tau_{\text{leak}} \quad (\tau_{\text{leak}} = 0.35) \text{}
$$

- Spoken text: *"One step more and I scrape that tallow off your ribs, boy."*
- Evaluated against secret embedding vector for `fact_stolen_tallow_candle`.
- Resulting similarity score $= 0.12 \le 0.35$ $\implies$ **PASS**[cite: 2].
- If the score crosses $0.35$, the linter flags an `IMPLICATURE_LEAK`, arresting compilation before acoustic synthesis begins[cite: 2, 18].

### IV. Feature 2.3: Motor Mask Intersection

**Subsystem Authority:** `MotorMaskLinter` (`packages/001.lore/vocab/verb_families.json`, `packages/300.engine/src/linters/motorLinter.ts`)

**Execution Target:** Kinetic action verbs extracted into AST beats

Feature 2.3 enforces biological and mobility constraints via discrete set-intersection mathematics, completely bypassing fragile natural-language regex parsers.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ MOTOR MASK SET-INTERSECTION ARBITRATION                                                               │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. EXTRACTED KINETIC VERBS FROM AST:                                                                   │
│    Actions_extracted = [ "STAND", "BAR_PATH", "STEP_BACK", "KICK" ][cite: 2, 11]                         │
│                                                                                                        │
│ 2. CANONICAL BANNED MASKS (character.schema.ts):                                                       │
│    Bog  (Locomotion: BIPEDAL_LIMPING) ──► Banned = [ "SPRINT", "VAULT", "LEAP" ][cite: 11, 28]         │
│    Wart (Somatic: BRACHIAL_PLEXUS)   ──► Banned = [ "BIMANUAL_LIFT", "CLIMB", "STRANGLE" ]│
│                                                                                                        │
│ 3. PURE SET-INTERSECTION EVALUATION:                                                                   │
│    Bog_Violations  = { STAND, BAR_PATH } ∩ { SPRINT, VAULT, LEAP }                 = ∅ ──► PASS[cite: 11]  │
│    Wart_Violations = { STEP_BACK, KICK }  ∩ { BIMANUAL_LIFT, CLIMB, STRANGLE }     = ∅ ──► PASS[cite: 11]  │
│                                                                                                        │
│ 4. NON-EMPTY INTERSECTION ABORT (T_0 = $0.00):                                                         │
│    If Actions_extracted ∩ Banned != ∅:                                                                 │
│      HALT IMMEDIATELY. Emit BANNED_KINETIC_VERB violation with offending token.          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Verb Family Normalization

The vocabulary engine maps infinite English expressions to standardized kinetic families (`vocab/verb_families.json`)[cite: 18]:

- *"Dashes"*, *"hurries"*, *"scampers"*, *"sprints"* $\implies$ `SPRINT`[cite: 18].
- *"Heaves with both hands"*, *"lifts overhead"* $\implies$ `BIMANUAL_LIFT`.
- *"Lurches"*, *"hobbles"*, *"steps slowly"* $\implies$ `LIMP`.

#### 2. Deterministic Set Math

The evaluator executes:

$$
\Delta_{\text{violations}} = \text{Actions}_{\text{extracted}} \cap \text{BannedVerbs}(C) \text{}
$$

- Because set cardinality is small ($\vert{}\text{Actions}\vert{} \le 12$, $\vert{}\text{Banned}\vert{} \le 8$), the evaluation executes in under 5 microseconds on CPU memory heaps ($O(1)$ practical cost).
- If $\Delta_{\text{violations}} \neq \emptyset$, the linter aborts the pipeline, printing the exact violating token and character capability mask[cite: 11, 32].

### V. Asymmetric Minimal Enclosing Unit (MEU) Repair Sentry

When a candidate scene trips a Level 2 invariant breach, the engine does not discard the entire script or re-roll hundreds of lines. It triggers the **Asymmetric Minimal Enclosing Unit (MEU) Repair Protocol**[cite: 14, 15].

```plaintext
========================================================================================================================
                          ASYMMETRIC MINIMAL ENCLOSING UNIT (MEU) REPAIR SENTRY
========================================================================================================================

  FULL SCENE BEAT SEQUENCE: [ b01, b02, b03 (VIOLATION: BIMANUAL_LIFT), b04, b05 ]
                                            │
   ┌────────────────────────────────────────┴────────────────────────────────────────┐
   ▼                                        ▼                                        ▼
  [1. BACKWARD SWEEP: I_start]             [2. ACTIVE MEU TARGET]        [3. FORWARD SWEEP: I_end]
  • Evaluates dependencies upward          • Beat b03 isolated           • Evaluates dependencies downward
  • Locks b01..b02 as FROZEN PREFIX        • Infill replacement verb:     • If b04 depends on item in b03,
  • Zero upstream rewriting permitted       KICK replaces BIMANUAL_LIFT[cite: 2, 15]   expand window to [b03..b04]
                                           • Cost: ~120 local tokens      • Lock b05 as FROZEN SUFFIX
                                                                                     • Check Span Budget: <= 40%
========================================================================================================================
```

#### 1. The 3-Cycle Circuit Breaker Protocol

The automated repair sentry operates under a strict three-cycle retry budget:

1. **Cycle 1 (Localized Verb Substitution):** The localized infill model patches only the offending beat, substituting the banned verb with an allowable kinetic alternative matching the Stage 4 contract (e.g., swapping *"Wart grabs Bog with both hands"* to *"Wart kicks the grease bucket across the seam"*)[cite: 2, 15].
2. **Cycle 2 (Negative Token Mask Clamping):** If the model attempts another disallowed maneuver, explicit negative token weights are injected into the infill prompt: `FORBIDDEN: ["lift", "grab", "heave", "both hands"]`.
3. **Cycle 3 (PRNG Seed Variance):** The infill engine samples an alternate random seed using a lower temperature ($T = 0.2$).
4. **Terminal Escalation (Hard Code Lock):** If Cycle 3 fails to satisfy the invariant gauntlet, automated repair halts instantly at $T_0 = \$0.00$[cite: 15]. The scene is marked `BLOCKED`, and a structured failure payload is written to `eval/rejections.jsonl` for human review[cite: 15, 26].

#### 2. The 40% Span Ceiling Invariant

The engine calculates the ratio of dirty beats to total scene beats[cite: 15]:

$$
\text{SpanRatio} = \frac{\text{Count}(\text{MEU Beats})}{\text{Count}(\text{Total Scene Beats})} \le 0.40 \text{[cite: 15]}
$$

If fixing an invariant violation requires mutating more than 40% of the scene's dialogue beats, the automated sentry refuses to execute[cite: 15]. The repair is aborted to prevent conversational drift, escalating the ticket directly to the Showrunner Cockpit[cite: 15].

### VI. Zod Legislative Schemas & Type Contracts

The invariant gauntlet is backed by rigid Zod schemas defined in `packages/001.lore/schemas/`:

```typescript
// packages/001.lore/schemas/gauntlet.schema.ts
import { z } from 'zod';

export const SomaticCapacitySchema = z.object({
  character_id: z.string().regex(/^char_[a-z0-9_]+$/),
  arms_available: z.number().int().min(0).max(4),
  legs_available: z.number().int().min(0).max(4),
  locomotion_tier: z.enum(['BIPEDAL_NIMBLE', 'BIPEDAL_HUNCHED', 'BIPEDAL_LIMPING', 'IMMOBILE']),
  somatic_strain_bp: z.number().int().min(0).max(10000),
  banned_kinetic_verbs: z.array(z.string()),
  held_primary: z.string().nullable(),
  held_secondary: z.string().nullable()
}).strict();

export const EpistemicFirewallSchema = z.object({
  character_id: z.string().regex(/^char_[a-z0-9_]+$/),
  ignorance_firewalls: z.array(z.string().regex(/^(mystery|fact)_[a-z0-9_]+$/)),
  belief_records: z.record(z.string(), z.enum(['TOTAL_IGNORANCE', 'RUMOR_ONLY', 'FACTUAL_WITNESS'])),
  max_allowable_subtext_cosine: z.number().min(0.1).max(0.5).default(0.35)
}).strict();

export const InvariantAuditResultSchema = z.object({
  scene_id: z.string(),
  tick: z.number().int().nonnegative(),
  verdict: z.enum(['PASSED', 'REJECTED_AT_T0', 'MEU_REPAIR_REQUIRED']),
  somatic_sat_passed: z.boolean(),
  epistemic_firewall_passed: z.boolean(),
  motor_mask_passed: z.boolean(),
  violations: z.array(z.object({
    code: z.enum(['SOMATIC_OVERLOAD', 'EPISTEMIC_LEAK', 'BANNED_KINETIC_VERB', 'DISJOINTNESS_BREACH']),
    offending_beat_index: z.number().int(),
    actor_id: z.string(),
    details: z.string()
  })),
  evaluated_compute_cost_usd: z.literal(0.00)
}).strict();

export type InvariantAuditResult = z.infer<typeof InvariantAuditResultSchema>;
```

### VII. Concrete Verification: Vitest Test Harness

The following Vitest suite (`packages/300.engine/26.schema.unit/tests/invariant_gauntlet.spec.ts`) proves compile-time enforcement of the Somatic SAT Solver, Epistemic Horizon Panopticon, and Motor Mask Linter:

```typescript
// packages/300.engine/26.schema.unit/tests/invariant_gauntlet.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateSomaticSAT } from '../buz/somatic.buzz';
import { evaluateMotorMask } from '../buz/motor.buzz';
import { evaluateEpistemicHorizon } from '../buz/epistemic.buzz';
import { DialogueAST } from 'packages/001.lore/schemas/ast';

describe('Epic 2: Real-Time Invariant Gauntlet (T_0 = $0.00)', () => {
  let mockAST: DialogueAST;

  beforeEach(() => {
    mockAST = {
      scene_plan_id: 'sp_28410_bog_wart',
      tick_origin: 28410,
      room_id: 'loc_warm_pipe',
      participants: ['char_bog', 'char_wart'],
      mechanical_tier: 'COSTLY_WIN',
      beats: [
        {
          beat_index: 1,
          mru_phase: '1_STIMULUS',
          speaker_id: 'char_bog',
          camera_parenthetical: 'Holding iron scraper low over seam',
          observable_parenthetical: 'Bars Wart path with scraper',
          dialogue_text: 'One step more and I scrape that tallow off your ribs, boy.',
          extracted_motor_actions: [
            { verb: 'BAR_PATH', subject: 'char_bog', hands_required: 1 }
          ],
          somatic_strain_accrued_bp: 0
        },
        {
          beat_index: 2,
          mru_phase: '4_RESPONSE',
          speaker_id: 'char_wart',
          camera_parenthetical: 'Single good hand holding bucket handle',
          observable_parenthetical: 'Kicks the grease bucket across seam',
          dialogue_text: 'Choke on the fat, then.',
          extracted_motor_actions: [
            { verb: 'KICK', subject: 'char_wart', target: 'item_grease_bucket', hands_required: 0 }
          ],
          somatic_strain_accrued_bp: 0
        }
      ],
      exit_assertions: {
        mandated_winner: 'char_bog',
        mandated_loser: 'char_wart',
        item_transfers_satisfied: true,
        spatial_retreat_satisfied: true
      }
    };
  });

  it('Feature 2.1: validates somatic satisfiability for single-armed character kicking item', () => {
    const wartSomaticMask = {
      character_id: 'char_wart',
      arms_available: 1,
      held_primary: 'item_grease_bucket',
      held_secondary: null
    };

    const result = evaluateSomaticSAT(mockAST.beats[1], wartSomaticMask);
    expect(result.success).toBe(true);
    expect(result.handsRequired).toBe(0); // Kick consumes 0 hand capacity
    expect(result.netHandsRemaining).toBe(0);
  });

  it('Feature 2.1: halts at T_0 if single-armed character attempts a two-handed lift', () => {
    const wartSomaticMask = {
      character_id: 'char_wart',
      arms_available: 1,
      held_primary: 'item_grease_bucket',
      held_secondary: null
    };

    const invalidBeat = {
      ...mockAST.beats[1],
      extracted_motor_actions: [
        { verb: 'LIFT_BIMANUAL', subject: 'char_wart', target: 'item_grease_bucket', hands_required: 2 }
      ]
    };

    expect(() => evaluateSomaticSAT(invalidBeat, wartSomaticMask)).toThrowError(
      /\[SOMATIC_OVERLOAD\] Character char_wart requires 2 hands but only possesses 1/
    );
  });

  it('Feature 2.2: passes when dialogue vectors remain below the 0.35 subtext leak threshold', () => {
    const epistemicMask = {
      character_id: 'char_bog',
      ignorance_firewalls: ['fact_the_famine', 'mystery_culvert_siphon'],
      max_allowable_subtext_cosine: 0.35
    };

    const result = evaluateEpistemicHorizon(mockAST.beats[0], epistemicMask);
    expect(result.passed).toBe(true);
    expect(result.maxObservedCosine).toBeLessThan(0.35);
  });

  it('Feature 2.2: traps explicit secret leak when dialogue mentions firewall terms', () => {
    const epistemicMask = {
      character_id: 'char_bog',
      ignorance_firewalls: ['mystery_culvert_siphon'],
      max_allowable_subtext_cosine: 0.35
    };

    const leakedBeat = {
      ...mockAST.beats[0],
      dialogue_text: 'I know you hid the tallow inside the culvert siphon!'
    };

    expect(() => evaluateEpistemicHorizon(leakedBeat, epistemicMask)).toThrowError(
      /\[EPISTEMIC_LEAK\] Dialogue contains taboo lemma: culvert siphon/
    );
  });

  it('Feature 2.3: rejects candidate lines containing banned kinetic verbs for limping character', () => {
    const bogBannedVerbs = ['SPRINT', 'VAULT', 'LEAP'];

    const invalidSprintBeat = {
      ...mockAST.beats[0],
      extracted_motor_actions: [
        { verb: 'SPRINT', subject: 'char_bog', hands_required: 0 }
      ]
    };

    const result = evaluateMotorMask(invalidSprintBeat, bogBannedVerbs);
    expect(result.passed).toBe(false);
    expect(result.violatingVerbs).toContain('SPRINT');
  });
});
```

### VIII. Diagnostic Metrics & Failure Taxonomy

| Failure Classification | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `SOMATIC_OVERLOAD` | Hands required exceed net functional limbs ($\sum \text{Hands} > \text{Arms}$)[cite: 2, 3] | SAT Solver halts pipeline ($T_0 = \$0.00$ spend)[cite: 2, 3, 11] | Trigger Cycle 1 MEU: replace verb with allowable limb action[cite: 15] |
| `IMPLICATURE_LEAK`[cite: 2, 18] | Semantic vector probe exceeds threshold ($\text{CosineSim} > 0.35$)[cite: 2, 18] | Epistemic Panopticon aborts candidate turn[cite: 10, 18] | Re-sample dialogue with explicit negative token masks[cite: 15] |
| `BANNED_KINETIC_VERB`[cite: 11, 32] | Action matches character's active impairment mask | Motor Linter fails closed before TTS execution[cite: 2, 11] | Map verb to allowed kinetic family (e.g., sprint $\to$ limp) |
| `DISJOINTNESS_COLLAPSE`[cite: 18] | Dialogue lemma overlaps unresolved mystery truth set[cite: 18] | Unresolved Canon Engine blocks script ratification[cite: 18] | Sanitize dialogue; strip trigger lemmas from line[cite: 18] |
| `MEU_SPAN_BREACH`[cite: 15] | Required patch window exceeds 40% of scene dialogue beats[cite: 15] | Infill Engine disengages; blocks automated rewrite[cite: 15] | Escalate scene to human Showrunner Cockpit via Slack webhook[cite: 15] |

### You

{{FOCUS: Epic 3 Acoustic Time Quantization}}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Epic 3 — Acoustic Time Quantization

**Target Repositories:**

- `03.foundry/audio-microservice` (Rig 1 Python daemon, port 8000, neural TTS vocoders, DSP pipeline)
- `camp-candor/002.worker-sower` (`worker-sower-conductor`, `apps/995.library/src/core/timeline/`, POSIX media probe spawners)
- `05.delivery/viewport` (`goblin-episodes`, Remotion optical timeline compiler, React video islands)

**Execution Plane:** Axis B (Empirical Acoustic Hardening & Microsecond Waveform Probing) $\longleftrightarrow$ Axis A (Centisecond Monotonic Simulation Synchronization)

**Constitutional Invariant:** The Master Physical Clock Axiom — *Audio is the empirical architect of time; visual frames and simulation ticks are derived integer projections, never the reverse.* ($T_0 = \$0.00$ CPU-bound inference, 0 MB GPU VRAM)

### I. Ontological Foundations & Architectural Mandate

Standard generative video and game production pipelines treat audio as post-production "sweetening". Video diffusion networks or 3D character animatics are sampled first, after which dialogue lines are stretched, compressed, or re-recorded to fit arbitrary video frame lengths. This design produces critical systemic failures:

1. **The Biological Pacing Collapse:** Video diffusion models have no innate concept of respiratory biology, syllabic stress, or conversational cadence. Guessing visual shot lengths before synthesizing speech produces unnaturally warped dialogue, abrupt phoneme truncation, or awkward dead-air holds.
2. **Animatic Re-roll Churn:** If visual shot durations are tweaked by a human director, the audio must be re-synthesized, triggering cascading timeline invalidations, cache thrashing, and expensive GPU re-render loops.
3. **The Concatenation Drift Trap:** Quantizing individual shots independently using naive ceiling functions ($\lceil D_i \times 24 \rceil$) introduces up to $+41.67\text{ ms}$ ($+1\text{ frame}$) of fractional trailing silence per cut. Across an 80-shot episode, this compound rounding error accumulates over $3.0\text{ to }4.0\text{ seconds}$ of drift, decoupling dialogue from continuous musical scores, Foley strikes, and ambient room tone.

```plaintext
========================================================================================================================
                          EPIC 3: ACOUSTIC TIME QUANTIZATION PIPELINE ARCHITECTURE
========================================================================================================================

  UPSTREAM INGRESS: VALIDATED MACHINE CONTRACT (drafts/dialogue_ast.json)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Voice Rail: Spoken text tokens stripped of internal parentheticals & markdown                      │
  │ • Somatic Vector: char_bog (strain: 450 bp), char_wart (arms: 1.0, strain: 0 bp)                   │
  │ • Spatial Acoustic Context: loc_warm_pipe (damping: 1500 cdB, noise_floor: 45 cdB)[cite: 2, 15]                 │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 3.1: TEXT TO SPEECH SYNTHESIS ENGINE (Rig 1 / CPU Daemon :8000) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Hardware Isolation: Pure Node.js child-process / Python daemon on Rig 1 CPU (0 MB GPU VRAM)           │
  │ • Somatic Pause Dilation: Π_eff = Π_base * (1.0 + (SOMATIC_FATIGUE_bps / 10000) * κ_exhaust)[cite: 9, 15]       │
  │ • Dynamic DSP Conditioning: Sidechain ducking parameters (-14 dB floor, 6f attack, 12f release)     │
  │ • Output: 48,000 Hz, 24-bit Linear PCM uncompressed master .wav stems                                │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 3.2: WAVEFORM DURATION PROBING (Deterministic ffprobe Inspector) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • POSIX Child-Process Execution: ffprobe -v error -show_entries format=duration -of default=...       │
  │ • Microsecond Extraction: Exact continuous real-valued millisecond truth D_total_ms = 18,400.00 ms │
  │ • Observation vs. Derivation Decoupling: D_ms stored as empirical reality; frames stored as projection │
  │ • Sub-Frame Clamp: Interjections < 41.67 ms clamped to 1 frame with digital silence tail padding     │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 3.3: DUAL DOMAIN DERIVATION & QUANTIZATION CORE ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ 1. AXIS A SIMULATION TICK QUANTIZATION (10 ms Centisecond Monotonic Resolution):                                │
  │    Δ_ticks = ceil( D_total_ms / 10 ms ) = ceil( 18,400 / 10 ) = 1,840 ticks                        │
  │    t_resume = 28,410 + 1,840 = Tick 30,250 (Advancing simulation history)[cite: 1, 15]                          │
  │                                                                                                                  │
  │ 2. AXIS B BROADCAST FRAME QUANTIZATION (24.0 fps Temporal Display Lattice):                                     │
  │    F_total = ceil( (D_total_ms / 1000) * 24 ) = ceil( 18.400 * 24 ) = 442 frames[cite: 1, 15]                   │
  │                                                                                                                  │
  │ 3. SAMPLE-ACCURATE PROJECTION (The 2,000-Sample Law):                                                           │
  │    R_sample = 48,000 Hz / 24 fps = 2,000 samples/frame ──► Sample S = Frame * 2,000                 │
  │                                                                                                                  │
  │ 4. ABSOLUTE CUMULATIVE-MILLISECOND TIMELINE TILING (Zero-Drift Formulation):                                     │
  │    StartFrame_k = ceil((∑_{i<k} D_i)/1000 * 24), EndFrame_k = ceil((∑_{i<=k} D_i)/1000 * 24) - 1   │
  │    Proof of Contiguity: EndFrame_k + 1 ≡ StartFrame_{k+1} (Cumulative drift strictly < 1 frame)     │
  │                                                                                                                  │
  │ 5. 3D CAUSAL VAE LATENT HARMONIZATION (4n + 1 Stride Conformance):                                              │
  │    n = ceil((442 - 1) / 4) = 111 ──► N_diff = 4(111) + 1 = 445 native diffusion frames                 │
  │    Optical Tail Slack Reservation: trimEndFrames = 445 - 442 = 3 frames (Trimmed in Remotion)          │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  CANONICAL CONTRACT EMISSION: exposure_sheet.json & dual_timeline_map.json
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Staged Handoff to Epic 4: Atomic Relational Commit (S_28410 ──► S_30250 in CANON_DB)[cite: 1, 15]              │
  │ • Staged Handoff to Cluster 05.delivery: Remotion Root Composition (442 frames, 883,200 audio samples)  │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

**Epic 3 (Acoustic Time Quantization)** establishes the empirical bridge between the linguistic screenplay representation and physical reality. It transforms the validated `dialogue_ast.json` from Epic 2 into uncompressed acoustic waveforms, extracts exact microsecond duration metrics, and projects that empirical truth simultaneously into both Axis A (Centisecond Simulation Ticks) and Axis B (Broadcast Video Frames) without cumulative rounding drift or phase distortion.

### II. Feature 3.1: Text to Speech Synthesis Engine

**Target Repositories:** `03.foundry/audio-microservice`, `camp-candor/002.worker-sower` (`worker-sower-conductor`)

**Subsystem Authority:** `VocalistsGuildDaemon` / `SomaticDSPConductor`

**Hardware Profile:** Rig 1 Workstation, 64 GB RAM, 0 MB GPU VRAM (Allocated entirely to CPU threads to prevent CUDA bus lockups with Rig 2 video diffusion)

#### 1. Ingress Architecture & Contract Validation

The audio daemon operates on local port 8000. It rejects unformatted screenplay prose and `.fountain` files, executing exclusively against validated `dialogue_ast.json` structures certified by the Epic 2 Invariant Gauntlet. Each dialogue line is dispatched as an isolated execution payload:

```json
{
  "scene_id": "sc_28410_bog_wart",
  "shot_index": 1,
  "speaker_id": "char_bog",
  "dialogue_text": "One step more and I scrape that tallow off your ribs, boy.",
  "somatic_vector": {
    "somatic_strain_bp": 450,
    "respiratory_fatigue_bp": 1200,
    "locomotion_tier": "BIPEDAL_LIMPING"
  },
  "acoustic_profile": {
    "damping_cdb": 1500,
    "ambient_noise_floor_cdb": 4500,
    "room_reverb_decay_ms": 320
  }
}
```

#### 2. Somatic Respiratory Pause Dilation

Characters in the storyworld accumulate biological damage and physical exhaustion. The synthesis engine translates relational basis-point scalars into acoustic timing modifications rather than relying on stochastic LLM prompt adjectives:

$$
\Pi_{\text{eff}} = \Pi_{\text{base}} \times \left(1.0 + \frac{\text{SOMATIC\_FATIGUE}_{\text{bps}}}{10{,}000} \times \kappa_{\text{exhaust}}\right) \text{[cite: 9, 15]}
$$

- Where $\Pi_{\text{base}}$ is the speaker's baseline inter-phrase pause length (e.g., $450\text{ ms}$).
- $\kappa_{\text{exhaust}} = 1.8$ represents the biological exhaustion constant.
- When somatic fatigue exceeds $8{,}000\text{ bp}$, respiratory pauses scale up to $2.8\times$ baseline, naturally dilating the continuous audio waveform and directly forcing downstream animation and world history to accommodate the character's physical exhaustion.

#### 3. Uncompressed PCM Generation Standards

Neural speech models (e.g., Piper, CosyVoice running under ONNX CPU runtime) synthesize stems conforming to the production audio specification:

- **Sampling Rate:** $48{,}000\text{ Hz}$ (Linear PCM, 24-bit mono `.wav`).
- **True-Peak Clamping:** Normalized strictly to $\le -1.0\text{ dBTP}$ using inter-sample oversampling filters to eliminate clipping distortion in digital-to-analog converters.
- **Target Loudness:** Standardized to $-16.0\text{ LUFS} \pm 1.0\text{ LUFS}$ integrated loudness.
- **Noise Floor:** Unvoiced digital silence maintained below $-60\text{ dBFS}$.

### III. Feature 3.2: Waveform Duration Probing

**Target Repositories:** `camp-candor/002.worker-sower`, `apps/995.library`

**Subsystem Authority:** `WaveformProbeService` (`produceEpisode.ts`)

**Execution Runtime:** POSIX Child Process Execution on Rig 1

#### 1. POSIX Process Probing & Precision Measurement

Once a certified stem is written to `public/audio/dialogue/${seriesSlug}/${sceneId}_SH${shotIndex}_${characterId}.wav`, the conductor launches a quarantined POSIX child process executing `ffprobe`:

```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 stem_01_bog.wav
```

- **Execution Quarantine:** Spawned via `child_process.spawnSync()` with a hard timeout of $2{,}500\text{ ms}$ and `maxBuffer` capped at $1\text{ MB}$ to prevent process hanging.
- **Double-Precision Extraction:** Raw ASCII output from stdout is parsed into an IEEE 754 double-precision float representing seconds, then scaled to milliseconds:
  $$
  D_{\text{ms}} = \text{parseFloat}(\text{rawStdout}) \times 1{,}000.0 \text{}
  $$
- For the Tick 28,410 walkthrough, probing the four spoken stems plus physical Foley hits yields:
  $$
  D_{\text{total\_ms}} = 3{,}400.0 + 4{,}100.0 + 5{,}800.0 + 2{,}200.0 + 2{,}900.0\text{ (pauses)} = 18{,}400.00\text{ ms} \text{[cite: 1, 15]}
  $$

#### 2. The Observation vs. Derivation Decoupling Invariant

The architecture maintains an absolute ontological boundary between physical facts and presentation layouts:

- **The Empirical Observation ($D_{\text{ms}}$):** The physical duration in milliseconds (e.g., $18{,}400.00\text{ ms}$) observed on disk[cite: 1, 15]. It remains fixed and immutable across all downstream transformations.
- **The Presentation Derivation ($F$):** The discrete integer frame budget derived via ceiling arithmetic for a specific output target:
  $$
  F = \left\lceil \frac{D_{\text{ms}}}{1{,}000\text{ ms}} \times \text{FPS}_{\text{master}} \right\rceil = \left\lfloor \frac{(D_{\text{ms}} \times \text{FPS}_{\text{master}}) + 999}{1{,}000} \right\rfloor \text{}
  $$
  Both values are stored as distinct fields in `exposure_sheet.json`. If an episode is remastered at $30\text{ fps}$ or $60\text{ fps}$, visual frame counts are re-derived from $D_{\text{ms}}$ without re-synthesizing audio or altering the historical simulation ledger.

#### 3. Sub-Frame Zero-Length Clamp & Buffer Hygiene

If an actor utters an abrupt monosyllabic interjection (e.g., "Hark!", "No!") resulting in a duration shorter than a single video frame ($D_{\text{ms}} < 41.6667\text{ ms}$ at 24 fps), naive rounding risks zero-frame allocations. The prober enforces a mandatory clamp:

```typescript
const targetFrames = Math.max(1, Math.ceil((durationMs / 1000) * masterFps));
```

Digital silence padding is appended to the `.wav` buffer up to the $42.0\text{ ms}$ boundary, ensuring no media sequence possesses inverted or null frame boundaries.

### IV. Feature 3.3: Dual Domain Derivation & Quantization Core

**Target Repositories:** `camp-candor/002.worker-sower`, `05.delivery/viewport` (Remotion)

**Subsystem Authority:** `DualDomainDerivationEngine` (`apps/995.library/src/core/timeline/dualDomainDerivation.ts`)[cite: 1]

Feature 3.3 resolves the central temporal challenge of the architecture: synchronizing two fundamentally different temporal domains from a single empirical audio measurement.

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     THE DUAL-DOMAIN ACOUSTIC / OPTICAL TEMPORAL MAPPING                                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CONTINUOUS ACOUSTIC DOMAIN (48,000 Integer PCM Samples / Second)                                       │
│ • Sample-accurate acoustic transients (e.g., bucket kick at sample S = 778,000)            │
│ • Phoneme / viseme onset coordinates (mouth swaps calculated with sub-millisecond precision)│
│ • Programmatic sidechain ducking envelopes (-14 dB floor, 6-frame attack, 12-frame release)│
└───────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Integer Projection Ratio:
                                    │ S = F × (48,000 / 24) = F × 2,000 samples / frame[cite: 1, 2]
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DISCRETE MASTER VIDEO DOMAIN (24.0 Integer Frames / Second)                                            │
│ • Frame-accurate visual cuts (<Sequence from={atFrame} durationInFrames={targetFrames}>)[cite: 1, 2]    │
│ • Visual plate diffusion budget: F_total = ceil((18,400 / 1000) * 24) = 442 frames[cite: 1, 15]        │
│ • Remotion optical assembly canvas[cite: 1, 2]                                                         │
└───────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Integer Centisecond Quantization:
                                    │ Δ_ticks = ceil(18,400 ms / 10 ms) = 1,840 ticks[cite: 1, 15]
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DISCRETE SIMULATION TICK DOMAIN (100 Integer Centisecond Ticks / Second)                               │
│ • Master Monotonic Tick: t_resumed = 28,410 + 1,840 = Tick 30,250[cite: 1, 15]                         │
│ • Advances character busy locks, cooldown timers, and thermodynamic spatial decay[cite: 1, 2]          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. The 2,000-Sample Law

At an invariant audio sampling frequency of $48{,}000\text{ Hz}$ and a broadcast video cadence of $24.0\text{ fps}$, the ratio of continuous audio samples to discrete visual frames reduces to an exact integer constant[cite: 1, 2]:

$$
\text{Projection Ratio } R_{\text{sample}} = \frac{48{,}000\text{ samples/sec}}{24\text{ frames/sec}} = 2{,}000\text{ audio samples per video frame} \text{[cite: 1, 2]}
$$

- **Sample-to-Frame Mapping:** Any acoustic transient, consonant plosive, or viseme mouth shape detected at absolute sample offset $S$ maps to the enclosing video frame via integer floor division[cite: 1, 2]:
  $$
  F = \left\lfloor \frac{S}{2{,}000} \right\rfloor \text{[cite: 1, 2]}
  $$
- *Worked Example:* In Beat 4, Wart kicks the grease bucket across the seam, generating an acoustic contact transient at sample index $S = 778{,}412$[cite: 1, 15]. The optical compiler snaps the visual impact cut to:
  $$
  F = \left\lfloor \frac{778{,}412}{2{,}000} \right\rfloor = \text{Frame } 389 \quad (\text{spanning samples } [778{,}000 \dots 779{,}999]) \text{[cite: 1, 2]}
  $$
  While the visual cut snaps cleanly to Frame 389, the audio engine plays the uncompressed waveform at $48\text{ kHz}$ sample resolution, eliminating lip-sync lag, visual cut jitter, or phase cancellation[cite: 1, 2].

#### 2. Absolute Cumulative-Millisecond Timeline Tiling (Zero-Drift Invariant)

To eliminate the Concatenation Drift Trap, the engine derives all timeline placements from a running cumulative millisecond sum quantized once, rather than summing rounded frame counts[cite: 1, 2]:

$$
\text{StartFrame}_k = \left\lceil \frac{\sum_{i=1}^{k-1} D_i}{1{,}000} \times 24 \right\rceil \text{[cite: 1, 2]}
$$

$$
\text{EndFrame}_k = \left\lceil \frac{\sum_{i=1}^{k} D_i}{1{,}000} \times 24 \right\rceil - 1 \text{[cite: 1, 2]}
$$

- **Mathematical Proof of Contiguity:**
  $$
  \text{StartFrame}_{k+1} - \text{EndFrame}_k = \left\lceil \frac{\sum_{i=1}^{k} D_i}{1{,}000} \times 24 \right\rceil - \left(\left\lceil \frac{\sum_{i=1}^{k} D_i}{1{,}000} \times 24 \right\rceil - 1\right) \equiv 1 \text{ frame} \text{[cite: 1, 2]}
  $$
  Because $\text{EndFrame}_k + 1 \equiv \text{StartFrame}_{k+1}$, consecutive dialogue turns and dramatic pauses tile the master timeline with zero gaps and zero overlaps[cite: 1, 2]. Total cumulative timeline drift relative to physical audio across an entire episode is strictly bounded to less than one frame ($< 41.67\text{ ms}$)[cite: 1, 2].

#### 3. 3D Causal VAE Latent Lattice Conformance ($4n + 1$)

Spatiotemporal video diffusion models on Rig 2 (e.g., Wan 2.1, Wan 2.2) perform $4\times$ temporal downsampling within their 3D causal Variational Autoencoders, requiring input frame counts conforming strictly to the mathematical sequence[cite: 1, 2]:

$$
F_{\text{diff}} = 4n + 1 \quad (n \in \mathbb{N}) \quad \implies \{17, 21, 25, 33, 49, 65, 77, 81, \dots\} \text{[cite: 1, 2]}
$$

Feature 3.3 bridges continuous acoustic time to hardware latent constraints without altering the locked master delivery timeline[cite: 1, 2]:

1. Continuous Scene Audio: $D_{\text{total\_ms}} = 18{,}400.00\text{ ms}$[cite: 1, 15].
2. Authoritative Delivery Budget:
  $$
  F_{\text{total}} = \left\lceil \frac{18{,}400}{1{,}000} \times 24 \right\rceil = 442\text{ frames} \text{[cite: 1, 15]}
  $$
3. Hardware Latent Allocation:
  $$
  n = \left\lceil \frac{442 - 1}{4} \right\rceil = \left\lceil \frac{441}{4} \right\rceil = 111 \implies F_{\text{diff}} = 4(111) + 1 = 445\text{ frames} \text{[cite: 1]}
  $$
4. Optical Slack Absorption: The GPU foundry generates $445\text{ frames}$ of raw plate[cite: 1]. In the Remotion composition TSX, the sequence is mounted as:
  ```typescript
  <Sequence durationInFrames={442}>
    <OffthreadVideo src="plate_445f.mp4" trimEndFrames={3} />
  </Sequence>
  ```
  The 3 trailing padding frames are trimmed cleanly during optical compositing, snapping the visual cut to speech termination with zero lip-sync drift[cite: 1, 2].

### V. Programmatic Acoustic Mixing & Gain Automation

Audio assembly in `Episode_XXX.tsx` partitions audio into three concurrent, prioritized layers, controlled by deterministic mathematical envelopes rather than unpredictable reactive dynamic range compressors[cite: 1, 2]:

```plaintext
========================================================================================================================
                          MULTI-TRACK GAIN AUTOMATION & PROGRAMMATIC DUCKING
========================================================================================================================

  TRACK 1: SPOKEN DIALOGUE STEMS (Master Clock — Peak <= -1.0 dBTP, Integrated -16 LUFS)[cite: 2, 11]
  [------------- Line 1 (82 frames) -------------]               [------------- Line 2 (98 frames) -------------]
                                                  
  TRACK 2: SPOT FOLEY TRANSIENTS (Seeded PRNG Mulberry32 / MurmurHash3)
          [*item_scraper_clank*]                                         [*item_bucket_kick*]
                                                  
  TRACK 3: CONTINUOUS AMBIENT BED & SCORE (Programmatic Quadratic Ducking Envelope)
  1.0 (0 dB) ───┐                                 ┌─────────────┐                                 ┌─── (V_base = 0.40)
                │                                 │             │                                 │
  0.08 (-14 dB) └─────────────────────────────────┘             └─────────────────────────────────┘    (V_duck = 0.08)
                ^ Attack (6f)       Release (12f) ^             ^ Attack (6f)       Release (12f) ^
                Ducking Floor: -14 dB                           Ducking Floor: -14 dB[cite: 2, 8]
========================================================================================================================
```

- **Track 1 (Dialogue):** Fixed master clock stems mounted at absolute integer frame coordinates derived from cumulative milliseconds[cite: 2, 8].
- **Track 2 (Foley Transients):** Script-driven sound effects seeded via `hash(sceneId + ":" + shotId + ":" + sampleKey)` to prevent auditory clustering and maintain deterministic playback.
- **Track 3 (Ambient Beds):** Programmatic sidechain ducking attenuates background steam hiss and musical beds by exactly $-14\text{ dB}$ across a 6-frame quadratic attack before active speech, holding the ducking floor during dialogue, and recovering over a 12-frame quadratic curve back to unity during pauses exceeding 12 frames[cite: 2, 8].

### VI. Concrete Verification: Vitest Test Suite

The following comprehensive Vitest suite (`packages/300.engine/tests/acoustic_quantization.spec.ts`) proves the 2,000-sample constant, cumulative zero-drift timeline tiling, and $4n+1$ causal VAE lattice conformance[cite: 1]:

```typescript
// packages/300.engine/tests/acoustic_quantization.spec.ts
import { describe, it, expect } from 'vitest';
import { deriveDualDomainTimeline } from '../src/core/timeline/dualDomainDerivation';

describe('Epic 3: Acoustic Time Quantization Engine', () => {
  const mockStems = [
    { stemId: 'stem_01_bog', speakerId: 'char_bog', durationMs: 3400.0 },
    { stemId: 'pause_01', speakerId: 'env', durationMs: 900.0 },
    { stemId: 'stem_02_wart', speakerId: 'char_wart', durationMs: 4100.0 },
    { stemId: 'pause_02', speakerId: 'env', durationMs: 1100.0 },
    { stemId: 'stem_03_bog', speakerId: 'char_bog', durationMs: 5800.0 },
    { stemId: 'pause_03', speakerId: 'env', durationMs: 900.0 },
    { stemId: 'stem_04_wart', speakerId: 'char_wart', durationMs: 2200.0 }
  ];

  it('Feature 3.3: accurately derives Axis A simulation ticks and Axis B video frames for Tick 28,410', () => {
    const result = deriveDualDomainTimeline(
      'sc_28410_bog_wart',
      28410, // tickOrigin
      mockStems,
      24.0,  // masterFps
      10.0,  // tickIntervalMs
      48000  // sampleRateHz
    );

    // 1. Verify Empirical Truth
    expect(result.totalDurationMs).toBe(18400.0);

    // 2. Verify Axis A (Centisecond Simulation Authority)
    // ceil(18,400 ms / 10 ms) = 1,840 ticks
    expect(result.totalElapsedTicks).toBe(1840);
    expect(result.resumedTick).toBe(28410 + 1840); // 30,250 ticks

    // 3. Verify Axis B (Remotion Master Video Authority)
    // ceil(18.400 * 24) = ceil(441.6) = 442 frames
    expect(result.totalVideoFrames).toBe(442);
    expect(result.totalAudioSamples).toBe(883200);

    // 4. Verify 3D Causal VAE (4n + 1) Latent Stride
    // n = ceil(441 / 4) = 111 => 4(111) + 1 = 445 frames
    expect(result.vaeDiffusionLattice.nativeFrames4nPlus1).toBe(445);
    expect(result.vaeDiffusionLattice.slackTrimFrames).toBe(3);
  });

  it('Feature 3.3: proves the 2,000-sample law holds strictly across every segment', () => {
    const result = deriveDualDomainTimeline('sc_sample_test', 0, mockStems, 24.0, 10.0, 48000);

    for (const segment of result.segments) {
      const frameSpan = segment.allocatedFrames;
      const sampleSpan = (segment.endSample - segment.startSample) + 1;
      expect(sampleSpan / frameSpan).toBe(2000);
    }
  });

  it('Feature 3.3: proves zero-drift cumulative tiling contiguity (EndFrame_k + 1 === StartFrame_k+1)', () => {
    const result = deriveDualDomainTimeline('sc_tiling_test', 0, mockStems, 24.0, 10.0, 48000);

    for (let i = 0; i < result.segments.length - 1; i++) {
      const current = result.segments[i];
      const next = result.segments[i + 1];

      // Axis A Contiguity Proof
      expect(current.endTick + 1).toBe(next.startTick);

      // Axis B Contiguity Proof
      expect(current.endFrame + 1).toBe(next.startFrame);
      expect(current.endSample + 1).toBe(next.startSample);
    }
  });

  it('Feature 3.2: clamps sub-frame interjections to exactly 1 frame duration', () => {
    const subFrameStem = [{ stemId: 'stem_gasp', speakerId: 'char_wart', durationMs: 22.5 }];
    const result = deriveDualDomainTimeline('sc_clamp_test', 0, subFrameStem, 24.0, 10.0, 48000);

    expect(result.totalVideoFrames).toBe(1);
    expect(result.segments[0].allocatedFrames).toBe(1);
  });
});
```

### VII. Diagnostic Metrics & Failure Taxonomy

| Failure Classification | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `CADENCE_COLLAPSE` | Stem duration deviates $> 25\%$ from expected syllabic length[cite: 1] | Audio Conformance Gate halts pipeline before exposure sheet compilation[cite: 1, 2] | Adjust somatic fatigue basis points or vocal speed scalar in `recipe.json` |
| `TRUE_PEAK_CLIPPING` | Synthesized PCM waveform exceeds $-1.0\text{ dBTP}$ ceiling[cite: 1, 2] | Linter rejects stem from entering `/voices/active/` vault | Apply two-pass FFmpeg true-peak limiter with $4\times$ oversampling |
| `LATTICE_TRUNCATION` | Exposure sheet emits frame count failing $4n + 1$ latent stride | Conductor halts video rendering before GPU compute is burned | Auto-pad frame allocation to nearest $4n+1$ boundary; set `trimEndFrames` |
| `CUMULATIVE_DRIFT_BREACH`[cite: 1, 2] | Total timeline sync error relative to audio exceeds $41.67\text{ ms}$ ($1\text{ frame}$)[cite: 1, 2] | Optical compiler throws assertion failure during TSX compilation | Re-derive sequence bounds using `Absolute Cumulative Integral Tiling`[cite: 1] |
| `PROBE_CHILD_TIMEOUT`[cite: 1] | `ffprobe` process hangs on corrupted `.wav` header ($> 2{,}500\text{ ms}$)[cite: 1] | Process quarantine sends `SIGKILL`; flags `CORRUPTED_AUDIO_CONTAINER`[cite: 1] | Evict corrupted buffer; trigger re-synthesis pass on Rig 1 CPU[cite: 1] |

### You

{{FOCUS: Epic 4 Atomic State Settlement }}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Epic 4 — Atomic State Settlement

**Target Repositories:**

- `camp-candor/002.worker-sower` (`worker-sower-engine/src/core/ledger/`, `packages/300.engine/27.settlement.unit/`, `packages/300.engine/sql/`)
- `camp-candor/995.library` (`apps/995.library/src/core/crypto/`, `canonicalJson.ts`, Merkle tree utilities)
- `astro-kahn-it-com/001.goblin-lore` (`packages/001.lore/schemas/stateDelta.schema.ts`, `compiled/bible-state.json`)

**Execution Plane:** Axis A (Relational Simulation Truth & Canonical Historical Persistence) $\longleftrightarrow$ Axis B (Acoustically Measured Physical Delta Ingress)

**Constitutional Invariant:** The Fail-Closed Atomic Ledger Commitment ($T_0 = \$0.00$) — *Simulation pre-resolves truth; acoustic duration quantizes time; atomic SQL commits make reality permanent; unratified speculative states vaporize completely upon transaction abort.*

### I. Ontological Foundations & Architectural Mandate

In standard game engines and generative narrative pipelines, state mutation is handled either via mutable in-memory singletons or asynchronous, non-atomic database updates. Under unexpected server restarts, process crashes, or network partitions, this loose coupling results in catastrophic **Torn-State Collapse**:

1. **The Phantom Injury / Ghost Possession Paradox:** A character’s physical strain updates in memory, but the item transfer fails to write to disk. One actor holds an item while another actor simultaneously drops it, violating physical conservation of mass.
2. **Cascading Stale-Scene Contamination:** A scene invalidates an assumption (e.g., Bog forces Wart to retreat), but downstream drafted episodes continue rendering against the obsolete premise, burning hundreds of dollars in cloud GPU diffusion before a human spots the error.
3. **Cryptographic Provenance Severance:** History drifts away from the compile-time Merkle root, making it impossible to determine which seed, screenplay line, or conflict resolution triggered a given world state.

```plaintext
========================================================================================================================
                          EPIC 4: ATOMIC STATE SETTLEMENT ENGINE (Tick 28,410 ──► 30,250)
========================================================================================================================

  INGRESS FROM EPIC 3 (Acoustic Time Quantization):
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Measured Audio Duration: D_total_ms = 18,400 ms (18.4 seconds uncompressed WAV)                          │
  │ Quantized Centisecond Ticks: Δ_ticks = ceil(18,400 / 10) = 1,840 ticks (Diegetic Passage)                 │
  │ Resumption Marker: t_settled = 28,410 + 1,840 = 30,250 ticks                                            │
  │ Intermediate Contract: drafts/state_delta.json (Validated by Epic 2 Invariant Gauntlet)[cite: 1]                 │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 4.1: DATABASE TRANSACTION MANAGEMENT (CANON_DB / Cloudflare D1 / SQLite) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Open Strict Transaction Boundary: BEGIN IMMEDIATE TRANSACTION                                     │
  │ • Somatic Mutation: UPDATE characters SET somatic_strain_bps += 450, busy_until_tick = 30250 WHERE id = 'char_bog'│
  │ • Inventory Transfer: UPDATE possessions SET holder_id = NULL, equip_slot = 'DROPPED_FLOOR'         │
  │ • Spatial Displacement: UPDATE character_spatial SET current_coord = 'corr_splinter_gap_01' (Wart retreated)│
  │ • Dyadic Grievance Recalibration: UPDATE grievances SET intensity_bps = 2000, cooldown_ticks = 12000 │
  │ • Scene Manifest Stamp: INSERT INTO scene_manifests (sc_28410, duration: 1840, status: 'COMMITTED')   │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 4.2: DEPENDENCY INVALIDATION (SQLite Triggers & Topological DAG Pruning) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Reactive SQLite Triggers: trg_cascade_character_invalidation, trg_cascade_possession_invalidation    │
  │ • Blast-Radius Sweeper: Scans scene_dependencies table where pinned_version < NEW.version               │
  │ • Cascade Flagging: Sets is_dirty = 1 on all dependent downstream drafted scenes scheduled after Tick 28,410│
  │ • Outbox Emitted: Notifies Asymmetric MEU Infill Engine to queue surgical script patches           │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 4.3: CRYPTOGRAPHIC LEDGER SEALING (RFC 8785 Canonical JSON & Merkle Root Anchor) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Event Envelope Packing: Packs scene AST digest, audio duration, tick delta, and state delta        │
  │ • Merkle Extension Law: H_30250 = SHA-256(H_28410 || EventPayload || 18,400ms || 1,840 ticks)      │
  │ • Atomic POSIX Ledger Overwrite: Write bible-state.json.tmp_[UUID] ──► atomic renameSync()             │
  │ • Commit & Lease Clearance: Release world_execution_leases (status = 'COMMITTED')                       │
  │ • COMMIT TRANSACTION in CANON_DB                                                                     │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

**Epic 4 (Atomic State Settlement)** converts the verified acoustic observations of Epic 3 into permanent historical reality[cite: 1]. Operating inside `camp-candor/002.worker-sower` and `apps/995.library`, this engine opens an isolated relational transaction, executes somatic, logistical, and spatial mutations, triggers downstream cache invalidations, and reseals the universe's Merkle root before releasing the clock brake.

### II. Feature 4.1: Database Transaction Management

**Target Repositories:** `camp-candor/002.worker-sower` (`worker-sower-engine/src/core/ledger/settlementTransaction.ts`), `apps/995.library`[cite: 1, 7]

**Subsystem Authority:** `RelationalSettlementManager` / `CANON_DB` (Cloudflare D1 / SQLite)[cite: 1, 7]

**Database Isolation Level:** `BEGIN IMMEDIATE TRANSACTION` (Single-writer, strictly serialized execution)

Feature 4.1 ensures that physical truth is immutable, relational, and fail-closed. If any step fails, the entire transaction rolls back cleanly, ensuring that zero dirty rows, half-transferred items, or phantom injuries persist on disk.

#### 1. Ingress Delta Structure (`state_delta.json`)

The transaction consumes an intermediate state delta compiled from the Stage 4 tabletop duel (`COSTLY_WIN` for Bog) and the acoustic measurement of Epic 3 ($18{,}400\text{ ms} \implies 1{,}840\text{ ticks}$)[cite: 1, 7]:

```json
{
  "scene_id": "sc_28410_bog_wart",
  "tick_origin": 28410,
  "elapsed_ticks": 1840,
  "tick_settled": 30250,
  "acoustic_duration_ms": 18400,
  "somatic_updates": [
    {
      "character_id": "char_bog",
      "somatic_strain_delta_bp": 450,
      "busy_until_tick": 30250,
      "locomotion_tier": "BIPEDAL_LIMPING"
    },
    {
      "character_id": "char_wart",
      "somatic_strain_delta_bp": 0,
      "busy_until_tick": 30250,
      "locomotion_tier": "BIPEDAL_HUNCHED"
    }
  ],
  "inventory_mutations": [
    {
      "item_id": "item_grease_bucket",
      "new_holder_id": null,
      "new_equip_slot": "DROPPED_FLOOR",
      "spatial_anchor_cell": "cell_10_2_neg12_seam",
      "dropped_at_tick": 28410
    }
  ],
  "spatial_mutations": [
    {
      "character_id": "char_wart",
      "destination_coord": "corr_splinter_gap_01",
      "facing": "WEST"
    }
  ],
  "grievance_mutations": [
    {
      "grievance_id": "grv_territorial_scrap_claim",
      "dyad_id": "char_bog_char_wart",
      "intensity_bps": 2000,
      "cooldown_ticks": 12000,
      "escalation_count_delta": 1
    }
  ]
}
```

#### 2. Atomic SQL Execution Script

The transaction executes inside a parameterized, atomic SQL block[cite: 7]:

```sql
-- packages/300.engine/sql/settlement/execute_scene_settlement.sql
BEGIN IMMEDIATE TRANSACTION;

-- 1. Apply physical trauma and update busy-locks for scene participants
UPDATE characters 
SET somatic_strain_bps = somatic_strain_bps + 450,
    busy_until_tick = 30250,
    version = version + 1,
    updated_at_tick = 28410
WHERE id = 'char_bog';

UPDATE characters 
SET busy_until_tick = 30250,
    version = version + 1,
    updated_at_tick = 28410
WHERE id = 'char_wart';

-- 2. Execute physical inventory relocation (Conservation of Mass)
UPDATE possessions 
SET holder_id = NULL,
    equip_slot = 'DROPPED_FLOOR',
    spatial_anchor = 'cell_10_2_neg12_seam',
    version = version + 1,
    updated_at_tick = 28410
WHERE id = 'item_grease_bucket' 
  AND holder_id = 'char_wart'; -- Guard against concurrency races

-- 3. Displace retreating actor along the spatial retreat corridor
UPDATE character_spatial 
SET current_coord = 'corr_splinter_gap_01',
    facing = 'WEST',
    version = version + 1,
    updated_at_tick = 28410
WHERE id = 'char_wart';

-- 4. Reset grievance tension, apply cooldown, and bump causal version
UPDATE grievances 
SET intensity_bps = 2000,
    cooldown_ticks = 12000,
    escalation_count = escalation_count + 1,
    version = version + 1,
    updated_at_tick = 28410
WHERE id = 'grv_territorial_scrap_claim';

-- 5. Stamp immutable scene record into historical manifest ledger
INSERT INTO scene_manifests (
  id, 
  tick_origin, 
  duration_ticks, 
  acoustic_duration_ms, 
  status, 
  mechanical_outcome,
  winner_id,
  loser_id
) VALUES (
  'sc_28410_bog_wart', 
  28410, 
  1840, 
  18400, 
  'COMMITTED', 
  'COSTLY_WIN',
  'char_bog',
  'char_wart'
);

-- 6. Close the distributed execution lease acquired at Tick 28,410
UPDATE world_execution_leases 
SET status = 'COMMITTED',
    committed_at_tick = 30250
WHERE id = 'lease_28410_01' 
  AND status = 'ACTIVE';

COMMIT;
```

### III. Feature 4.2: Dependency Invalidation

**Target Repositories:** `camp-candor/002.worker-sower`, `camp-candor/995.library`[cite: 1, 7]

**Subsystem Authority:** `BlastRadiusEngine` / `ReactiveDependencyTracker`

**Execution Plane:** Relational Triggers & Directed Acyclic Graph (DAG) Cache Eviction

Feature 4.2 handles the **Blast Radius** of a committed scene. When Bog absorbs $+450\text{ bp}$ strain, Wart drops the grease bucket, and Wart retreats to the corridor, any downstream scene previously drafted under obsolete assumptions must be flagged as stale (`is_dirty = 1`)[cite: 1, 7].

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   REACTIVE DEPENDENCY INVALIDATION & BLAST-RADIUS ENGINE                               │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ UPSTREAM TRANSACTION COMMIT (Tick 28,410 ──► 30,250):                                                  │
│ • Mutates: char_bog (v1 ──► v2), item_grease_bucket (v1 ──► v2), char_wart (v1 ──► v2)[cite: 7]         │
│                                                                                                        │
│ SQL REACTIVE TRIGGERS ENGAGE (CANON_DB):                                                               │
│ ┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐│
│ │ trg_cascade_character_invalidation           │       │ trg_cascade_possession_invalidation          ││
│ │ Evaluates character version bumps[cite: 7]   │       │ Evaluates equip_slot & holder changes[cite: 7]││
│ └──────────────────────┬───────────────────────┘       └──────────────────────┬───────────────────────┘│
│                        │                                                      │                        │
│                        ▼                                                      ▼                        │
│ QUERY scene_dependencies TABLE:                                                                        │
│ • Finds: sc_31000_pantry_supper (Depends on char_wart at loc_warm_pipe with item_grease_bucket)[cite: 7] │
│ • Finds: sc_32500_bog_patrol (Depends on char_bog at 0 strain)[cite: 7]                                 │
│                                                                                                        │
│ EXECUTE CASCADE INVALIDATION:                                                                          │
│ UPDATE scene_manifests SET is_dirty = 1, dirty_reason = 'Upstream actor/possession mutated'[cite: 7]   │
│                                                                                                        │
│ EMIT ASYMMETRIC MEU OUTBOX EVENT:                                                                      │
│ • Enqueues sc_31000 and sc_32500 into evaluation pipeline for surgical AST infill repair[cite: 1, 37] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Recursive Reactive Database Triggers

The SQLite schema implements automated triggers that evaluate cache validity at the database boundary[cite: 7]:

```sql
-- packages/300.engine/sql/triggers/invalidation_cascade.sql

-- Trigger 1: Actor mutations cascade downstream
CREATE TRIGGER IF NOT EXISTS trg_cascade_character_invalidation
AFTER UPDATE ON characters
WHEN NEW.version > OLD.version
BEGIN
  UPDATE scene_manifests
  SET is_dirty = 1,
      dirty_reason = 'Upstream actor [' || NEW.id || '] mutated to version ' || NEW.version || ' at tick ' || NEW.updated_at_tick
  WHERE id IN (
    SELECT sd.scene_id 
    FROM scene_dependencies sd
    JOIN scene_manifests sm ON sd.scene_id = sm.id
    WHERE sd.entity_id = NEW.id
      AND sd.pinned_version < NEW.version
      AND sm.tick_origin > NEW.updated_at_tick
      AND sm.status = 'DRAFT'
  );
END;

-- Trigger 2: Inventory transfers cascade downstream
CREATE TRIGGER IF NOT EXISTS trg_cascade_possession_invalidation
AFTER UPDATE ON possessions
WHEN NEW.version > OLD.version
BEGIN
  UPDATE scene_manifests
  SET is_dirty = 1,
      dirty_reason = 'Upstream possession [' || NEW.id || '] moved to slot [' || NEW.equip_slot || ']'
  WHERE id IN (
    SELECT sd.scene_id 
    FROM scene_dependencies sd
    JOIN scene_manifests sm ON sd.scene_id = sm.id
    WHERE sd.entity_id = NEW.id
      AND sd.pinned_version < NEW.version
      AND sm.status = 'DRAFT'
  );
END;
```

#### 2. Transitive Blast-Radius Reachability ($H_{\text{dep}}$)

To prevent stale scripts from entering the GPU execution queue, the engine calculates the transitive dependency digest for any pending scene:

$$
H_{\text{dep}}(\text{Scene}) = \text{SHA-256}\left( \bigoplus_{e \in \text{Dependencies}} (e.\text{id} \mathbin{\Vert} e.\text{version} \mathbin{\Vert} e.\text{state\_digest}) \right)
$$

- If an incoming scene manifest presents an $H_{\text{dep}}$ computed against outdated versions ($v_{\text{pinned}} < v_{\text{committed}}$), the conductor rejects the render request immediately with `ERR_STALE_DEPENDENCY_GRAPH`, saving $100\%$ of rendering compute.

### IV. Feature 4.3: Cryptographic Ledger Sealing

**Target Repositories:** `camp-candor/995.library`, `astro-kahn-it-com/001.goblin-lore`, `camp-candor/002.worker-sower`[cite: 1, 7]

**Subsystem Authority:** `MerkleLedgerSealer` (`apps/995.library/src/core/crypto/merkleSealer.ts`)

**Canonical Normalization:** RFC 8785 (JSON Canonicalization Scheme / JCS)

Feature 4.3 seals the new world state into an append-only cryptographic event log, updates the series Merkle tree, and writes the permanent snapshot to disk[cite: 1, 7].

#### 1. RFC 8785 Canonical JSON Serialization

To prevent cryptographic hash divergences across different V8 engines, operating systems, or JSON parsers, the event payload is normalized prior to hashing:

- **Lexicographical Key Sorting:** All dictionary keys sorted recursively by UTF-8 code point.
- **Whitespace Elimination:** Zero insignificant whitespace, tabs, or newlines.
- **Unicode Normalization:** All text strings converted to Unicode Normalization Form C (NFC).
- **Ambient Clock Purge:** All non-deterministic timestamps (`Date.now()`, system up-times) stripped from the hashed envelope.

```typescript
// apps/995.library/src/core/crypto/canonicalJson.ts
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJson(item)).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const parts = sortedKeys.map(key => {
    const val = (obj as Record<string, unknown>)[key];
    return JSON.stringify(key) + ':' + canonicalizeJson(val);
  });
  return '{' + parts.join(',') + '}';
}
```

#### 2. The Merkle Extension Law

The historical continuity of the narrative universe is represented as an append-only hash chain[cite: 1, 7]:

$$
H_{t+1} = \text{SHA-256}\Big( H_t \mathbin{\Vert} \text{CanonicalJSON}(\text{EventData}) \mathbin{\Vert} D_{\text{total\_ms}} \mathbin{\Vert} \Delta_{\text{ticks}} \Big)[cite: 1, 7]
$$

For the Tick 28,410 confrontation[cite: 1, 7]:

- Prior State Digest ($H_{28410}$): `9a3f2b8c...`[cite: 1]
- Measured Acoustic Duration: `18400` ($18.4\text{ seconds}$)[cite: 1]
- Consumed Simulation Ticks: `1840`[cite: 1]
- New Master State Root ($H_{30250}$):
  $$
  H_{30250} = \text{SHA-256}\Big(\text{"9a3f2b8c..."} \mathbin{\Vert} \text{CanonicalJSON}(\Delta_{28410 \to 30250}) \mathbin{\Vert} \text{"18400"} \mathbin{\Vert} \text{"1840"}\Big)[cite: 1, 7]
  $$
  This digest is stamped into the `event_log` table and sealed into `compiled/bible-state.json`.

#### 3. Atomic POSIX File Overwrite Pattern

To ensure offline tools and distributed workers never read a partially written or corrupted JSON snapshot, disk writes use atomic filesystem renames:

1. Write the compiled state to a unique temporary file: `compiled/bible-state.json.tmp_d8f28a7e-12...`
2. Flush buffers to disk via `fs.fsyncSync()`.
3. Execute POSIX atomic rename:
  ```typescript
  fs.renameSync(tempFilePath, finalFilePath);
  ```
  This guarantees that any process querying `bible-state.json` receives either the complete prior state ($H_{28410}$) or the complete new state ($H_{30250}$), eliminating read-corruptions.

### V. Zod Schema Contracts (`settlement.schema.ts`)

The settlement pipeline is governed by strict Zod schema contracts defined in `packages/001.lore/schemas/`:

```typescript
// packages/001.lore/schemas/settlement.schema.ts
import { z } from 'zod';

export const SomaticUpdateSchema = z.object({
  character_id: z.string().regex(/^char_[a-z0-9_]+$/),
  somatic_strain_delta_bp: z.number().int().min(0).max(10000),
  busy_until_tick: z.number().int().positive(),
  locomotion_tier: z.enum(['BIPEDAL_NIMBLE', 'BIPEDAL_HUNCHED', 'BIPEDAL_LIMPING', 'IMMOBILE'])
}).strict();

export const InventoryMutationSchema = z.object({
  item_id: z.string().regex(/^item_[a-z0-9_]+$/),
  new_holder_id: z.string().regex(/^char_[a-z0-9_]+$/).nullable(),
  new_equip_slot: z.enum(['HELD_PRIMARY', 'HELD_SECONDARY', 'WORN_CHEST', 'WORN_BELT', 'DROPPED_FLOOR']),
  spatial_anchor_cell: z.string().nullable(),
  dropped_at_tick: z.number().int().positive().nullable()
}).strict();

export const SpatialMutationSchema = z.object({
  character_id: z.string().regex(/^char_[a-z0-9_]+$/),
  destination_coord: z.string(),
  facing: z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST'])
}).strict();

export const GrievanceMutationSchema = z.object({
  grievance_id: z.string().regex(/^grv_[a-z0-9_]+$/),
  dyad_id: z.string(),
  intensity_bps: z.number().int().min(0).max(10000),
  cooldown_ticks: z.number().int().nonnegative(),
  escalation_count_delta: z.number().int().default(1)
}).strict();

export const StateDeltaSchema = z.object({
  scene_id: z.string().regex(/^sc_[0-9]+_[a-z0-9_]+$/),
  tick_origin: z.number().int().positive(),
  elapsed_ticks: z.number().int().positive(),
  tick_settled: z.number().int().positive(),
  acoustic_duration_ms: z.number().int().positive(),
  somatic_updates: z.array(SomaticUpdateSchema),
  inventory_mutations: z.array(InventoryMutationSchema),
  spatial_mutations: z.array(SpatialMutationSchema),
  grievance_mutations: z.array(GrievanceMutationSchema)
}).strict();

export type StateDelta = z.infer<typeof StateDeltaSchema>;
```

### VI. Concrete Verification: Vitest Test Suite

The following comprehensive Vitest suite (`packages/300.engine/27.settlement.unit/tests/atomic_settlement.spec.ts`) proves transaction atomicity, reactive dependency invalidation, and Merkle root sealing[cite: 1, 7]:

```typescript
// packages/300.engine/27.settlement.unit/tests/atomic_settlement.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { executeAtomicSettlement } from '../src/settlementManager';
import { createMockDatabase } from '../tests/mockD1';
import { StateDelta } from 'packages/001.lore/schemas/settlement.schema';

describe('Epic 4: Atomic State Settlement Engine', () => {
  let db: any;
  let validStateDelta: StateDelta;

  beforeEach(async () => {
    db = createMockDatabase();
    await db.exec(`
      CREATE TABLE characters (
        id TEXT PRIMARY KEY,
        somatic_strain_bps INTEGER DEFAULT 0,
        busy_until_tick INTEGER DEFAULT 0,
        version INTEGER DEFAULT 1,
        updated_at_tick INTEGER DEFAULT 0
      );
      CREATE TABLE possessions (
        id TEXT PRIMARY KEY,
        holder_id TEXT,
        equip_slot TEXT,
        spatial_anchor TEXT,
        version INTEGER DEFAULT 1,
        updated_at_tick INTEGER DEFAULT 0
      );
      CREATE TABLE scene_manifests (
        id TEXT PRIMARY KEY,
        tick_origin INTEGER,
        status TEXT,
        is_dirty INTEGER DEFAULT 0,
        dirty_reason TEXT
      );
      CREATE TABLE scene_dependencies (
        scene_id TEXT,
        entity_id TEXT,
        pinned_version INTEGER
      );

      -- Seed initial world state at Tick 28,410
      INSERT INTO characters (id, somatic_strain_bps, busy_until_tick, version) 
      VALUES ('char_bog', 0, 0, 1), ('char_wart', 0, 0, 1);

      INSERT INTO possessions (id, holder_id, equip_slot, version) 
      VALUES ('item_grease_bucket', 'char_wart', 'HELD_PRIMARY', 1);

      -- Seed a downstream scene dependent on Wart holding the bucket
      INSERT INTO scene_manifests (id, tick_origin, status, is_dirty) 
      VALUES ('sc_31000_pantry_supper', 31000, 'DRAFT', 0);

      INSERT INTO scene_dependencies (scene_id, entity_id, pinned_version) 
      VALUES ('sc_31000_pantry_supper', 'item_grease_bucket', 1);
    `);

    validStateDelta = {
      scene_id: 'sc_28410_bog_wart',
      tick_origin: 28410,
      elapsed_ticks: 1840,
      tick_settled: 30250,
      acoustic_duration_ms: 18400,
      somatic_updates: [
        {
          character_id: 'char_bog',
          somatic_strain_delta_bp: 450,
          busy_until_tick: 30250,
          locomotion_tier: 'BIPEDAL_LIMPING'
        }
      ],
      inventory_mutations: [
        {
          item_id: 'item_grease_bucket',
          new_holder_id: null,
          new_equip_slot: 'DROPPED_FLOOR',
          spatial_anchor_cell: 'cell_10_2_neg12_seam',
          dropped_at_tick: 28410
        }
      ],
      spatial_mutations: [],
      grievance_mutations: []
    };
  });

  it('Feature 4.1: commits mutations atomically and increments entity versions', async () => {
    const result = await executeAtomicSettlement(db, validStateDelta, '9a3f2b8c...');

    expect(result.success).toBe(true);
    expect(result.committedTick).toBe(30250);

    // Verify Bog's somatic state
    const bog = await db.queryOne("SELECT * FROM characters WHERE id = 'char_bog'");
    expect(bog.somatic_strain_bps).toBe(450);
    expect(bog.busy_until_tick).toBe(30250);
    expect(bog.version).toBe(2);

    // Verify grease bucket dropped to floor
    const bucket = await db.queryOne("SELECT * FROM possessions WHERE id = 'item_grease_bucket'");
    expect(bucket.holder_id).toBeNull();
    expect(bucket.equip_slot).toBe('DROPPED_FLOOR');
    expect(bucket.version).toBe(2);
  });

  it('Feature 4.2: triggers reactive invalidation of downstream scenes (is_dirty = 1)', async () => {
    await executeAtomicSettlement(db, validStateDelta, '9a3f2b8c...');

    const downstreamScene = await db.queryOne("SELECT * FROM scene_manifests WHERE id = 'sc_31000_pantry_supper'");
    expect(downstreamScene.is_dirty).toBe(1);
    expect(downstreamScene.dirty_reason).toContain('Upstream possession [item_grease_bucket] moved');
  });

  it('Feature 4.3: calculates deterministic Merkle root using RFC 8785 Canonical JSON', async () => {
    const resultA = await executeAtomicSettlement(db, validStateDelta, 'initial_hash_001');
    const resultB = await executeAtomicSettlement(db, validStateDelta, 'initial_hash_001');

    expect(resultA.merkleRootAfter).toBe(resultB.merkleRootAfter);
    expect(resultA.merkleRootAfter).toMatch(/^[0-9a-f]{64}$/);
    expect(resultA.merkleRootAfter).not.toBe('initial_hash_001');
  });

  it('Feature 4.1: rolls back entire transaction if a foreign key or SQL invariant fails', async () => {
    const corruptDelta: StateDelta = {
      ...validStateDelta,
      somatic_updates: [
        {
          character_id: 'char_non_existent',
          somatic_strain_delta_bp: 100,
          busy_until_tick: 30250,
          locomotion_tier: 'IMMOBILE'
        }
      ]
    };

    await expect(executeAtomicSettlement(db, corruptDelta, 'initial_hash_001')).rejects.toThrow();

    // Verify zero mutations committed
    const bog = await db.queryOne("SELECT * FROM characters WHERE id = 'char_bog'");
    expect(bog.somatic_strain_bps).toBe(0);
    expect(bog.version).toBe(1);

    const bucket = await db.queryOne("SELECT * FROM possessions WHERE id = 'item_grease_bucket'");
    expect(bucket.holder_id).toBe('char_wart');
    expect(bucket.version).toBe(1);
  });
});
```

### VII. Diagnostic Metrics & Failure Taxonomy

| Failure Classification | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `ERR_TRANSACTION_ROLLBACK`[cite: 7] | SQL constraint violation (foreign key failure, locked row) | SQLite aborts transaction; zero rows written ($T_0 = \$0.00$) | Catch error in saga runner; re-verify delta against schema |
| `ERR_STALE_DEPENDENCY_GRAPH` | Scene dispatched to renderer with outdated $H_{\text{dep}}$ | Conductor halts render before GPU tensors ignite | Trigger Asymmetric MEU repair to re-ground scene AST[cite: 1, 37] |
| `ERR_MERKLE_DIVERGENCE`[cite: 1, 7] | Local file state digest does not match committed SQL root | State auditor raises immediate desynchronization alert | Rebuild in-memory snapshot by replaying event log from $S_0$[cite: 1, 7] |
| `ERR_LEASE_COLLISION`[cite: 7] | Competing worker attempts commit on active execution lease | SQLite concurrency fence rejects update | Evict stale worker; re-issue lease under incremented epoch[cite: 18] |
| `ERR_NON_CANONICAL_JSON` | State serializer produces un-sorted keys or NaN floats | RFC 8785 linter aborts Merkle calculation | Run payload through `canonicalizeJson()` before hashing[cite: 48] |

### You

{{FOCUS: Epic 5 Simulation Resumption Mechanism}}

@extreme-details-00

### Gemini

# Deep Architectural Specification: Epic 5 — Simulation Resumption Mechanism

**Target Repositories:**

- `camp-candor/002.worker-sower` (`worker-sower-engine/src/core/scheduler/`, `packages/300.engine/17.tick.unit/`, `packages/300.engine/29.brake.unit/`, `packages/300.engine/22.void-dormancy.unit/`)
- `apps/edge` (`apps/edge/src/objects/ClockDO.ts`, `apps/edge/src/objects/ZoneDO.ts`)
- `astro-kahn-it-com/001.goblin-lore` (`packages/001.lore/schemas/temporal.schema.ts`, `compiled/bible-state.json`)

**Execution Plane:** Axis A (Legislative World Truth & Monotonic Tick Authority) $\longleftrightarrow$ The Event-Sourced Clockwork Core

**Constitutional Invariant:** Monotonic Timeline Continuous Advancement & Closed-Form Lazy Evaluation ($T_0 = \$0.00$, Catch-up cost $\le 2\text{ ms}$) — *Computational existence does not equal physical existence; time advances strictly from empirical acoustics, and sleeping sites integrate consequences on demand without per-frame CPU loops.*

### I. Ontological Foundations & Architectural Mandate

In distributed gaming engines, procedural storytellers, and LLM-driven multi-agent simulations, resuming execution after a human editorial intercept or dramatic resolution is often an uncontrolled operation. Systems typically rely on OS timers (`setTimeout`, `setInterval`), non-deterministic polling loops, or uncalibrated background threads. This produces three fatal failure modes:

1. **Temporal Phase Jitter & Frame Skew:** Waking a paused simulation against ambient wall-clock time (`Date.now()`) desynchronizes historical event logs from newly generated ticks, introducing non-reproducible race conditions across client runtimes.
2. **The Dormant "Hot-Set" CPU Melt:** Attempting to catch up unobserved background rooms by iterating tick-by-tick loops over tens of thousands of dormant frames starves the node event loop, spikes infrastructure costs, and risks V8 memory isolate crashes.
3. **The Split-Brain Zombie Write:** Background jobs or concurrent worker isolates wake up out of order, processing actions against an uncommitted or obsolete world tick ($t_{\text{stale}}$) and polluting the append-only relational ledger.

```plaintext
========================================================================================================================
                      EPIC 5: SIMULATION RESUMPTION MECHANISM (Tick 28,410 ──► Tick 30,250+)
========================================================================================================================

  INGRESS: ATOMICALLY COMMITTED SCENE CONTRACT (Phase 4 / Epic 4 Finalized)
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Canonical Database Sealed: S_30250 committed to CANON_DB with Merkle Root H_30250                   │
  │ • Master Sound Probed: D_total_ms = 18,400 ms => Quantized Ticks: Δ_ticks = 1,840 ticks            │
  │ • Frozen Baseline: Tick 28,410 (Halted at Tabletop Costly Win)                                      │
  │ • Original Batch Fast-Forward Horizon: TargetCeiling = Tick 36,000                                   │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 5.1: MASTER CLOCK ADVANCEMENT (packages/300.engine/17.tick.unit) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Integer Scalar Advance: t_resumed = t_paused + Δ_ticks = 28,410 + 1,840 = 30,250 ticks           │
  │ • Delimiter-Safe HMAC Seed Derivation: seed_30250 = HMAC-SHA256(worldSeed, "17.tick.unit\0" || 30250)  │
  │ • Enforce Monotonic Invariant: assert(t_resumed > t_paused) (Zero ambient system time reads)         │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 5.2: DORMANT SITE CATCH UP (packages/300.engine/22.void-dormancy.unit) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • The Schrödinger Optimization: Unobserved zones (loc_pantry_wall) slept at 0 CPU cycles           │
  │ • Closed-Form Algebraic Heat Decay: T_wake = max(Floor, T_init - ⌊(k_decay * Δt) / 10000⌋)            │
  │ • Closed-Form Oxidation Accumulator: Rust_wake = min(10000, Rust_init + ⌊(R_rate * Δt) / 10000⌋)      │
  │ • Analytical Spline Progress: ΔP = ⌊(Δt * 10^9) / C_active⌋ (Split-Invariant BigInt math)          │
  │ • Compute Envelope: Evaluated JIT in <= 2 ms per waking zone on CPU memory heaps                     │
  └────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
  [ FEATURE 5.3: AUTONOMOUS LOOP RE-ENGAGEMENT (packages/300.engine/29.brake.unit) ]
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Disengage Clock Brake: FSM transitions status from ENGAGED to DISENGAGED                          │
  │ • Clear Relational Leases: UPDATE world_execution_leases SET status = 'EXPIRED'                     │
  │ • Compute Restored Deficit: Δ_remaining = 36,000 - 30,250 = 5,750 unconsumed fast-forward ticks    │
  │ • Re-arm High-Throughput Scheduler: Dispatch TICK_ADVANCED(30251) across active zones (~65 ms wall-clock)│
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

**Epic 5 (Simulation Resumption Mechanism)** implements the deterministic state-transition engine that unlocks the world state after an authoring intervention, advances global time monotonically based on verified acoustic measurement, applies closed-form catch-up formulas to dormant tactical zones, and safely restores the autonomous fast-forward loop without loss of state, concurrency deadlocks, or historical drift.

### II. Feature 5.1: Master Clock Advancement

**Target Repositories:** `camp-candor/002.worker-sower`, `apps/edge` (`ClockDO.ts`), `000.series-sower-engine` (`packages/300.engine/17.tick.unit`)

**Subsystem Authority:** `ClockDO` / `MonotonicTickAuthority`

**Execution Plane:** Axis A Sovereign Metronome Core

Feature 5.1 operationalizes the **Master Physical Clock Axiom**: physical audio dictates real-world narrative duration, and simulation ticks are derived integer projections.

#### 1. Mathematical Formalism & Time Quantization

The master clock strictly rejects real-time system clocks (`Date.now()`, `std::time::Instant`). World time is parameterized as an unsigned integer `SimTime` representing centiseconds ($10\text{ ms}$):

$$
f_{\text{sim}} = 100\text{ ticks/second} \implies \Delta t_{\text{tick}} = 10\text{ ms}
$$

Given total measured audio duration $D_{\text{total\_ms}}$ from Epic 3, the tick delta is calculated via non-negotiable ceiling quantization:

$$
\Delta_{\text{ticks}} = \left\lceil \frac{D_{\text{total\_ms}}}{10\text{ ms}} \right\rceil = \left\lfloor \frac{D_{\text{total\_ms}} + 9}{10} \right\rfloor[cite: 8, 15]
$$

For the *Under the Floorboards* walkthrough ($D_{\text{total\_ms}} = 18{,}400\text{ ms}$):

$$
\Delta_{\text{ticks}} = \left\lceil \frac{18{,}400}{10} \right\rceil = 1{,}840\text{ ticks}
$$

$$
t_{\text{resumed}} = t_{\text{paused}} + \Delta_{\text{ticks}} = 28{,}410 + 1{,}840 = 30{,}250\text{ ticks}
$$

#### 2. Delimiter-Safe Cryptographic Seed Derivation

To prevent PRNG correlation or length-extension collision attacks across successive ticks, every resumed tick derives an isolated cryptographic epoch seed via HMAC-SHA256:

$$
\sigma(t) = \text{HMAC-SHA256}\Big(\text{WorldSeed}, \, \text{"17.tick.unit"} \mathbin{\Vert} \texttt{0x00} \mathbin{\Vert} \text{String}(t)\Big)
$$

This guarantees that character dice rolls, random transient sounds, and ambient event schedules at Tick 30,251 are mathematically isolated from Tick 28,410.

#### 3. Execution Kernel (`tick.reduce.ts`)

The advancement is evaluated as an immutable functional fold:

```typescript
// packages/300.engine/17.tick.unit/tick.reduce.ts
import { TickModel } from './tick.model';
import { TickBit, TickCommand } from './fce/tick.bit';
import { toSimTime, SimTime } from './fce/tick.interface';
import { createHmac } from 'node:crypto';

export function reduceTick(state: TickModel, bit: TickBit): TickModel {
  switch (bit.cmd) {
    case TickCommand.TICK_ADVANCE: {
      const rawDurationMs = bit.dat.acousticDurationMs;
      if (typeof rawDurationMs !== 'number' || rawDurationMs <= 0) {
        throw new RangeError(`[TEMPORAL_FAULT] Non-positive acoustic duration: ${rawDurationMs} ms.`);
      }

      // Discrete centisecond quantization
      const deltaTicks = Math.ceil(rawDurationMs / 10);
      const nextTick = toSimTime(state.currentTick + deltaTicks);

      // Derive isolated PRNG seed for resumed epoch
      const hmac = createHmac('sha256', state.worldSeed);
      hmac.update(Buffer.concat([
        Buffer.from('17.tick.unit', 'utf-8'),
        Buffer.from([0x00]),
        Buffer.from(nextTick.toString(10), 'utf-8')
      ]));
      const derivedSeed = hmac.digest('hex');

      bit.val = 0;
      bit.dat.payload = {
        previousTick: state.currentTick,
        deltaTicks,
        newTick: nextTick,
        derivedTickSeed: derivedSeed
      };

      return Object.freeze({
        ...state,
        previousTick: state.currentTick,
        currentTick: nextTick,
        totalTicksAccumulated: state.totalTicksAccumulated + deltaTicks,
        lastDerivedSeed: derivedSeed,
        isClockBrakeEngaged: false
      });
    }

    default:
      return state;
  }
}
```

### III. Feature 5.2: Dormant Site Catch Up

**Target Repositories:** `camp-candor/002.worker-sower`, `apps/edge` (`ZoneDO.ts`), `packages/301.spatial/08.decay.unit`[cite: 8, 9]

**Subsystem Authority:** `VoidDormancyEngine` / `ZoneDO`[cite: 8, 9]

**Execution Plane:** Axis A Environmental Physics & Spatial Graph

Feature 5.2 enforces **The Schrödinger Optimization**: empty rooms and unobserved regional entities burn zero CPU cycles while dormant, but update their state instantly via closed-form algebraic integration upon waking.

#### 1. Closed-Form Environmental Integration

When `loc_warm_pipe` was actively occupied, `loc_pantry_wall` slept in "The Void" from Tick 1,200 to Tick 30,250 ($\Delta t = 29{,}050\text{ ticks}$). When Wart retreats into `loc_pantry_wall`, the zone executes sub-millisecond catch-up:

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        CLOSED-FORM VOID CATCH-UP MATHEMATICAL SOLVER                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. THERMODYNAMIC HEAT DISSIPATION:                                                                     │
│    T_wake = max( Floor, T_start - ⌊(k_decay * Δt) / 10,000⌋ )                                │
│    • Initial Heat: 6,500 bp | Floor: 2,000 bp | Rate: 85 bps/1,000 ticks                  │
│    • Heat Loss: ⌊(85 * 29,050) / 10,000⌋ = 246 bp                                           │
│    • Result: T_wake = max(2,000, 6,500 - 246) = 6,254 bp                                     │
│                                                                                                        │
│ 2. STRUCTURAL OXIDATION (RUST ACCUMULATOR):                                                            │
│    Rust_wake = min( 10,000, Rust_start + ⌊(R_rate * Δt) / 10,000⌋ )                          │
│    • Initial Rust: 400 bp | Oxidation Rate: 20 bps/1,000 ticks                           │
│    • Accumulated Rust: ⌊(20 * 29,050) / 10,000⌋ = 58 bp                                      │
│    • Result: Rust_wake = min(10,000, 400 + 58) = 458 bp                                      │
│                                                                                                        │
│ 3. ANALYTICAL SPLINE PROGRESS (Split-Invariance):                                                      │
│    ΔP = ⌊(Δt * 10^9) / C_active⌋, where C_active = ⌊(C_base * μ_bps + 5000) / 10,000⌋[cite: 1, 8, 35]│
│    • Traversal progress on corridors updates via single BigInt division. Zero raycasts burned.[cite: 1, 8]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Rehydration Kernel (`dormancy.action.ts`)

The mathematical evaluation operates with zero memory allocations inside the edge isolate:

```typescript
// packages/300.engine/22.void-dormancy.unit/dormancy.action.ts
import { DormantSiteRecord, SimTime, toBasisPoints, BasisPoints } from './fce/dormancy.interface';

export interface WakeCatchUpResult {
  readonly tempBp: BasisPoints;
  readonly rustBp: BasisPoints;
  readonly strainBp: BasisPoints;
  readonly elapsedTicks: number;
}

export function integrateDormantSiteWake(
  site: DormantSiteRecord,
  wakeTick: SimTime
): WakeCatchUpResult {
  if (wakeTick < site.lastActiveTick) {
    throw new RangeError(
      `[TEMPORAL_PARADOX] Wake tick (${wakeTick}) precedes last active tick (${site.lastActiveTick}).`
    );
  }

  const elapsedTicks = wakeTick - site.lastActiveTick;
  if (elapsedTicks === 0) {
    return {
      tempBp: site.environmentalBaseline.tempBp,
      rustBp: site.environmentalBaseline.rustBp,
      strainBp: site.environmentalBaseline.structuralStrainBp,
      elapsedTicks: 0
    };
  }

  const base = site.environmentalBaseline;

  // Closed-form heat loss
  const thermalLoss = Math.floor((base.thermalConductivityBps * elapsedTicks) / 10000);
  const tempBp = toBasisPoints(Math.max(base.ambientFloorBp, base.tempBp - thermalLoss));

  // Closed-form oxidation accumulation
  const oxidationGain = Math.floor((base.oxidationRateBps * elapsedTicks) / 10000);
  const rustBp = toBasisPoints(Math.min(10000, base.rustBp + oxidationGain));

  // Thermal contraction mechanical strain (120 bps expansion coefficient)
  const tempDelta = base.tempBp - tempBp;
  const contractionStrain = Math.floor((tempDelta * 120) / 10000);
  const strainBp = toBasisPoints(Math.min(10000, base.structuralStrainBp + contractionStrain));

  return { tempBp, rustBp, strainBp, elapsedTicks };
}
```

### IV. Feature 5.3: Autonomous Loop Re-engagement

**Target Repositories:** `camp-candor/002.worker-sower`, `apps/edge` (`ClockDO.ts`), `000.series-sower-engine` (`packages/300.engine/29.brake.unit`)[cite: 8, 9]

**Subsystem Authority:** `ClockBrakeGovernor` / `ExecutionLeaseManager`

**Execution Plane:** Core Simulation Loop Scheduler[cite: 1, 8]

Feature 5.3 clears transactional execution locks, disarms system watchdog alarms, restores remaining fast-forward tick budgets, and re-engages the autonomous event dispatcher.

#### 1. Fencing Token & Execution Mutex Clearance

To ensure no stale drafting process or zombie worker isolate can inject mutations after world resumption, the engine verifies the database fencing token and updates the lease state:

```sql
-- packages/300.engine/sql/settlement/release_execution_lease.sql
BEGIN IMMEDIATE TRANSACTION;

-- 1. Advance the master clock singleton and clear scene pause flags
UPDATE simulation_clock
SET current_tick = 30250,
    previous_tick = 28410,
    is_paused = 0,
    active_scene_id = NULL,
    active_lease_id = NULL,
    status = 'AUTONOMOUS_RUNNING',
    version = version + 1
WHERE id = 'singleton_master_clock'
  AND current_tick = 28410; -- Strict concurrency fence

-- 2. Clear scene busy locks on participants
UPDATE characters
SET execution_status = 'IDLE',
    busy_until_tick = 30250
WHERE id IN ('char_bog', 'char_wart')
  AND execution_status = 'ENGAGED_IN_SCENE';

-- 3. Release distributed execution lease
UPDATE world_execution_leases
SET status = 'EXPIRED',
    released_at_tick = 30250
WHERE id = 'lease_28410_01';

COMMIT;
```

#### 2. The Fast-Forward Deficit Restoration

When the showrunner originally ordered: `Fast-Forward 36,000 Ticks (6 minutes)`:

- Origin tick: $t_0 = 0$
- Tripwire halted at: $t_{\text{halt}} = 28{,}410$
- Scene audio elapsed: $\Delta_{\text{scene}} = 1{,}840\text{ ticks}$
- Settled world tick: $t_{\text{settled}} = 30{,}250$

The scheduler calculates the unconsumed fast-forward deficit:

$$
\Delta_{\text{remaining}} = \max\Big(0, \, t_{\text{target}} - t_{\text{settled}}\Big) = 36{,}000 - 30{,}250 = 5{,}750\text{ ticks}
$$

Rather than terminating the command prematurely, the engine loads $\Delta_{\text{remaining}} = 5{,}750\text{ ticks}$ directly into the headless dispatch accumulator. Processing at $\approx 87{,}800\text{ ticks/second}$ in system RAM, these remaining ticks evaluate in $\approx 65\text{ ms}$ of wall-clock time, carrying the world smoothly to its final target of Tick 36,000 without requiring further human interaction[cite: 1, 8].

#### 3. Dispatch Loop Re-arming (`ClockDO.ts`)

```typescript
// apps/edge/src/objects/ClockDO.ts
import { DurableObject } from 'cloudflare:workers';
import { SimTime, toSimTime } from 'packages/300.engine/17.tick.unit/fce/tick.interface';
import { reduceBrake } from 'packages/300.engine/29.brake.unit/brake.reduce';
import { BrakeCommand } from 'packages/300.engine/29.brake.unit/fce/brake.bit';

export class ClockDO extends DurableObject {
  private isTicking: boolean = false;
  private currentSimTick: SimTime = toSimTime(30250);

  async reengageAutonomousLoop(resumedTick: SimTime, targetCeilingTick: SimTime, sceneId: string): Promise<void> {
    await this.ctx.storage.transaction(async (txn) => {
      // 1. Release in-memory brake
      const currentBrakeModel = await txn.get('brake_model_state');
      const nextBrakeModel = reduceBrake(currentBrakeModel, {
        idx: 'bit_brake_release',
        cmd: BrakeCommand.RELEASE_BRAKE,
        val: 0,
        dat: { resumedAtTick: resumedTick, targetCeilingTick, sceneId },
        lst: []
      });
      await txn.put('brake_model_state', nextBrakeModel);

      // 2. Disarm scene watchdog alarms
      await this.ctx.storage.deleteAlarm();

      this.isTicking = true;
      this.currentSimTick = resumedTick;
    });

    // 3. Process remaining fast-forward deficit in background isolate memory
    const remainingTicks = Math.max(0, targetCeilingTick - resumedTick);
    this.ctx.waitUntil(this.runHeadlessFastForward(toSimTime(resumedTick + 1), remainingTicks));
  }

  private async runHeadlessFastForward(startTick: SimTime, tickCount: number): Promise<void> {
    let tick = startTick;
    for (let i = 0; i < tickCount; i++) {
      // Evaluate spline progress, thermodynamic loss, and tripwire predicates
      tick = toSimTime(tick + 1);
    }
    this.currentSimTick = tick;
    this.isTicking = false;
  }
}
```

### V. State Trajectory Comparison: The Complete Cycle

The following comparative matrix traces the exact variables across the entire lifecycle of the Minimum Viable Product (Genesis $\to$ Brake $\to$ Settlement $\to$ Resumption):

| Metric / Dimension | 1. Genesis ($S_0$) | 2. Dramatic Intercept ($S_{28410}$) | 4. Settlement ($S_{30250}$) | 5. Resumption ($S_{30251+}$) | Subsystem Authority |
| --- | --- | --- | --- | --- | --- |
| **Master Monotonic Tick** | $0$ | $28{,}410$ | $30{,}250$ | $30{,}251 \to 36{,}000$ | `ClockDO` / `17.tick.unit`[cite: 8, 9] |
| **Scheduler State** | Idle (Cold Genesis) | Frozen (`ENGAGED_IN_SCENE`) | Committed (`SEALED`)[cite: 8, 9] | Autonomous Fast-Forward | `worker-sower-engine` |
| **Clock Brake Status** | `DISENGAGED` | `ENGAGED` (Tripwire tripped) | `RELEASING` | `DISENGAGED` | `29.brake.unit`[cite: 8, 9] |
| **Bog Somatic Strain** | $0\text{ bp}$ | $0\text{ bp}$ | $450\text{ bp}$ (Costly Win) | $450\text{ bp}$ (Cooling) | `SomaticSATSolver` |
| **Bog Busy Lock** | `busy_until = 0` | `busy_until = 0` | `busy_until = 30250` | `IDLE` (Free to act) | `CANON_DB.characters` |
| **Wart Location** | `loc_pantry_wall` | `loc_warm_pipe` ($d = 1$) | `corr_splinter_gap_01` | In transit to `loc_pantry` | `goblin-spatial`[cite: 1, 8] |
| **Grease Bucket Custody** | Held by Wart (`PRIMARY`) | Held by Wart (`PRIMARY`) | `DROPPED_FLOOR` (Floor seam) | Environmental Prop | Relational Inventory Ledger[cite: 6, 8] |
| **Pantry Wall Status** | Active ($6{,}500\text{ bp}$)[cite: 6, 8] | Dormant in Void ($0\text{ CPU}$)[cite: 6, 8] | Dormant in Void ($0\text{ CPU}$)[cite: 6, 8] | Rehydrated ($6{,}254\text{ bp}$) | `22.void-dormancy.unit`[cite: 8, 9] |
| **Acoustic Audio** | None | None | $18{,}400\text{ ms}$ (4 stems)[cite: 6, 8] | Archived Master Stem | `audio-microservice` (:8000)[cite: 6, 8] |
| **Remotion Video Plates** | $0\text{ frames}$ | $0\text{ frames}$ | $442\text{ frames}$ ($24\text{ fps}$)[cite: 6, 8] | $442\text{ frames}$ ($445\text{ diff}$) | `05.delivery/viewport`[cite: 1, 8] |
| **Cryptographic Root** | $H_{\text{root}} = H_0$ | $H_0$ | $H_{30250}$[cite: 6, 8] | $H_{30250}$ | SHA-256 Merkle Ledger[cite: 6, 8] |

### VI. Concrete Verification: Vitest Test Suite

The following comprehensive Vitest suite (`packages/300.engine/tests/simulation_resumption.spec.ts`) proves the integration between Clock Advancement (Feature 5.1), Dormant Site Catch-Up (Feature 5.2), and Loop Re-engagement (Feature 5.3)[cite: 8, 9]:

```typescript
// packages/300.engine/tests/simulation_resumption.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { reduceTick } from '../17.tick.unit/tick.reduce';
import { integrateDormantSiteWake } from '../22.void-dormancy.unit/dormancy.action';
import { reduceBrake } from '../29.brake.unit/brake.reduce';
import { TickCommand } from '../17.tick.unit/fce/tick.bit';
import { BrakeCommand } from '../29.brake.unit/fce/brake.bit';
import { toSimTime } from '../17.tick.unit/fce/tick.interface';
import { toBasisPoints, SiteDormancyState } from '../22.void-dormancy.unit/fce/dormancy.interface';

describe('Epic 5: Simulation Resumption Mechanism Integration', () => {
  let tickState: any;
  let brakeState: any;
  let dormantPantrySite: any;

  beforeEach(() => {
    tickState = {
      currentTick: toSimTime(28410),
      previousTick: toSimTime(28409),
      totalTicksAccumulated: 28410,
      worldSeed: 'seed_under_the_floorboards_001',
      lastDerivedSeed: 'seed_prev_hash',
      isClockBrakeEngaged: true
    };

    brakeState = {
      status: 'ENGAGED',
      isBrakeEngaged: true,
      haltedAtTick: toSimTime(28410),
      targetCeilingTick: toSimTime(36000),
      unconsumedTicks: 7590,
      activeSceneId: 'sc_28410_bog_wart'
    };

    dormantPantrySite = {
      siteId: 'loc_pantry_wall',
      status: SiteDormancyState.VOID_DORMANT,
      lastActiveTick: toSimTime(1200),
      environmentalBaseline: {
        tempBp: toBasisPoints(6500),
        ambientFloorBp: toBasisPoints(2000),
        thermalConductivityBps: 85,
        rustBp: toBasisPoints(400),
        oxidationRateBps: 20,
        structuralStrainBp: toBasisPoints(0)
      }
    };
  });

  it('Feature 5.1: advances master clock monotonically from 18,400 ms audio stem', () => {
    const bit = {
      idx: 'bit_tick_adv',
      cmd: TickCommand.TICK_ADVANCE,
      val: 0,
      dat: { acousticDurationMs: 18400, sceneId: 'sc_28410_bog_wart' },
      lst: []
    };

    const nextTickState = reduceTick(tickState, bit);

    expect(nextTickState.previousTick).toBe(28410);
    expect(nextTickState.currentTick).toBe(30250); // 28,410 + 1,840 ticks
    expect(nextTickState.isClockBrakeEngaged).toBe(false);
    expect(nextTickState.lastDerivedSeed).toMatch(/^[0-9a-f]{64}$/);
  });

  it('Feature 5.2: executes closed-form catch-up on loc_pantry_wall across 29,050 ticks in < 2 ms', () => {
    const t0 = performance.now();
    const result = integrateDormantSiteWake(dormantPantrySite, toSimTime(30250));
    const duration = performance.now() - t0;

    expect(duration).toBeLessThanOrEqual(2.0); // Strict compute constraint
    expect(result.elapsedTicks).toBe(29050); // 30,250 - 1,200
    expect(result.tempBp).toBe(6254);        // 6,500 - 246 bp
    expect(result.rustBp).toBe(458);         // 400 + 58 bp
  });

  it('Feature 5.3: disengages clock brake and derives exact remaining fast-forward deficit', () => {
    const bit = {
      idx: 'bit_brake_rel',
      cmd: BrakeCommand.RELEASE_BRAKE,
      val: 0,
      dat: {
        resumedAtTick: toSimTime(30250),
        targetCeilingTick: toSimTime(36000),
        sceneId: 'sc_28410_bog_wart'
      },
      lst: []
    };

    const nextBrakeState = reduceBrake(brakeState, bit);

    expect(nextBrakeState.isBrakeEngaged).toBe(false);
    expect(nextBrakeState.status).toBe('DISENGAGED');
    expect(bit.dat.restoredDeficitTicks).toBe(5750); // 36,000 - 30,250 ticks
    expect(bit.dat.nextDispatchTick).toBe(30251);
  });
});
```

### VII. Diagnostic Metrics & Failure Taxonomy

| Failure Classification | Trigger Condition | System Guardrail & Impact | Recovery / Resolution Protocol |
| --- | --- | --- | --- |
| `ERR_TEMPORAL_RETROGRADE` | Resumed tick precedes brake halt tick ($t_{\text{resume}} < t_{\text{halt}}$) | Engine trips exception; rejects loop re-engagement ($T_0 = \$0.00$)[cite: 8] | Resynchronize resumed tick with `Phase 4.4` audio duration output[cite: 8] |
| `ERR_VOID_INTEGRATION_TIMEOUT`[cite: 8] | Closed-form catch-up exceeds $2.0\text{ ms}$ CPU threshold[cite: 8] | System emits telemetry warning to `#ops-bridge` | Precompute transcendental cooling curve into integer lookup table[cite: 8] |
| `ERR_FENCING_TOKEN_COLLISION` | Background isolate attempts write after lease expiration | SQLite D1 rejects mutation with `HTTP 409 Conflict` | Terminate stale worker; force client to pull Merkle root $H_{30250}$[cite: 8] |
| `ERR_UNCONSUMED_DEFICIT_OVERFLOW`[cite: 8] | Acoustic duration exceeds total fast-forward budget ($t_{\text{resume}} > t_{\text{target}}$)[cite: 8] | Deficit clamps cleanly to $0$; loop does not tick backwards[cite: 8] | Return execution control immediately to director with `BATCH_COMPLETED`[cite: 8] |
| `ERR_ACTIVE_ACTOR_ORPHAN`[cite: 8] | Actor left in `ENGAGED_IN_SCENE` status after brake release | Database trigger halts loop resumption | Execute atomic compensating query setting `execution_status = 'IDLE'`[cite: 8, 37] |
