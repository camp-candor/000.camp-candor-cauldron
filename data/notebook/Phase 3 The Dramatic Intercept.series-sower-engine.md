# Phase 3: The Dramatic Intercept.U-need-to-plugin-the-dahboard

_Gemini · 12 messages · exported Oct 27, 2026_

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

{{FOCUS : Phase 3: The Dramatic Intercept at Tick 28,410 }}

@extreme-details

### Gemini

### Phase 3: The Dramatic Intercept at Tick 28,410

Phase 3 is the core structural pivot of the Minimal Validated Core (MVC), marking the boundary where continuous, headless simulation is arrested and physical reality is mathematically settled before any prose or dialogue can be drafted. It bridges **Cluster 02.simulation (`worker-sower-engine`)** and **Cluster 05.delivery (`writer.astro`)**, enforcing the studio's constitutional axiom: **"Simulation determines reality; prose merely dramatizes the outcome"**.

```plaintext
========================================================================================================================
                                PHASE 3: THE DRAMATIC INTERCEPT PIPELINE
========================================================================================================================

   TICK 28,409 (Fast-Forward Active)
   • Wart on spline p(t); d_axial = 2
   • Grievance tension = 7,998 bp
   • Tripwire Predicate: FALSE
                    │
                    ▼ Tick increment (+1 tick)
   TICK 28,410 (Threshold Breach)
   • Wart crosses threshold into loc_warm_pipe; d_axial = 1 (Melee contact)
   • Grievance tension reaches 8,000 bp (Escalation ceiling I_max)
   • Tripwire Predicate: TRUE
                    │
                    ▼
   [ STEP 3.1: ENGAGING THE CLOCK BRAKE ]
   • Emit SIMULATION_PAUSED(28410) to internal bus
   • Freeze TICK_ADVANCED dispatch loop
   • Deep-freeze S_28410 in-memory snapshot
   • Acquire transactional lease (status = 'ENGAGED_IN_SCENE') in Cloudflare D1/SQLite
                    │
                    ▼
   [ STEP 3.2: STAGE 4 OPPOSED 2d6 PRE-RESOLUTION ]
   • Bog:  2d6 (7) + Spite (+2) - Strain (0) = 9
   • Wart: 2d6 (8) + Cunning (0) - ImpairedArm (-1) = 7
   • Margin Δ = 9 - 7 = +2 ──► COSTLY_WIN (Winner takes goal, incurs +450 bp strain)
                    │
                    ▼
   [ STEP 3.3: SCENEPLAN IR COMPILATION ]
   • Compile immutable JSON intermediate representation
   • Lock mandatory exit mutations: bucket dropped to floor, Wart displaced to corridor
   • Hand off immutable contract to writer.astro / local LLM draft pipeline
========================================================================================================================
```

### 1. The Tripwire Horizon & Convergence Logic

During the 36,000-tick fast-forward instruction, the simulation advances diegetic time at 100 ticks per second (10 ms centisecond tick resolution). The autonomous dispatch loop does not pause arbitrarily or poll an unconstrained language model. Instead, it evaluates the **Clock Brake Trip Predicate** across all active character dyads at the conclusion of every tick update.

#### The Predicate Contract

The predicate gate in `worker-sower-engine` requires the simultaneous satisfaction of three deterministic conditions:

```typescript
function evaluateBrakeTripPredicate(
  room: ActiveRoomState,
  dyad: CharacterDyad,
  grievance: GrievanceRecord
): boolean {
  // 1. Axial Proximity Invariant: Melee or conversational boundary
  const distance = goblinSpatial.getAxialDistance(dyad.actorA.coord, dyad.actorB.coord);
  const isCollocated = distance <= 1;

  // 2. Resentment Ceiling Breach: Tension reaches systemic threshold
  const isBoilingOver = grievance.intensity_bps >= grievance.escalation_ceiling_bps;

  // 3. Channel Saturation & Cooldown Audit
  const isEligible = grievance.cooldown_ticks === 0 && dyad.boredom_score <= 6500;

  return isCollocated && isBoilingOver && isEligible;
}
```

#### The Tick 28,409 to Tick 28,410 State Transition

The precise threshold breach is governed by spatial kinematics and accumulated resentment:

- **At Tick 28,409:**
  - **Spatial Coordinates:** Wart finishes his tallow chore at `loc_pantry_wall` and traverses spline trajectory $p(t)$, arriving at the corridor portal two steps from the heat source ($d_{\text{axial}}(\text{Bog}, \text{Wart}) = 2$).
  - **Tension Metric:** Resentment intensity sits at $7{,}998\text{ bp}$ against an escalation ceiling of $I_{\max} = 8{,}000\text{ bp}$.
  - **Predicate Output:** Proximity condition ($d_{\text{axial}} \le 1$) is `FALSE`; ceiling breach condition ($I \ge 8{,}000\text{ bp}$) is `FALSE`.
  - **Engine State:** Fast-forward execution remains `ACTIVE`; the scheduler increments to `TICK_ADVANCED(28410)`.
- **At Tick 28,410:**
  - **Spatial Coordinates:** Wart crosses the threshold boundary into `loc_warm_pipe`, entering adjacent hex proximity ($d_{\text{axial}} = 1$).
  - **Tension Metric:** The physical intrusion of unwashed kitchen scrapings into the territory of a goblin with $3{,}600\text{ bp}$ paranoia adds the final $+2\text{ bp}$, driving resentment to $I_{\text{curr}} = 8{,}000\text{ bp}$.
  - **Cooldown Audit:** Cooldown counter is $0\text{ ticks}$, and dyad boredom index satisfies $J_{\text{boredom}} \le 0.65$ ($6{,}500\text{ bp}$).
  - **Predicate Output:** `isCollocated && isBoilingOver && isEligible === TRUE`.

### 2. Clock Brake Engagement & State Mutex

The transition from a truth predicate to a simulation halt executes synchronously in system RAM, preventing race conditions or speculative timeline drift:

1. **Bus Event Emission:** The engine emits `SIMULATION_PAUSED(28410)` to the system message bus.
2. **Loop Suspension:** The monotonic tick counter suspends execution of `TICK_ADVANCED(n)`.
3. **Snapshot Isolation ($S_{28410}$):** The active world-state matrix at Tick 28,410 is cloned and wrapped in `Object.freeze()`, sealing character coordinates, inventory references, and environmental basis-point meters against asynchronous mutation.
4. **Relational Lease Acquisition:** The engine executes a write operation against Cloudflare D1/SQLite:
  ```sql
  UPDATE world_execution_leases 
  SET status = 'ENGAGED_IN_SCENE', 
      locked_at_tick = 28410, 
      lease_owner = 'worker-sower-engine' 
  WHERE lease_id = 'global_timeline';
  ```
  This prevents any external process from stepping time forward while the confrontation is unspooled.

### 3. Stage 4 Opposed $2\text{d}6$ Tabletop Pre-Resolution

Before prose is drafted or tokens are requested, the mechanical outcome is calculated using a tabletop resolution model. The system does not allow an author or LLM to determine the winner based on narrative convenience.

#### Opposed Tabletop Formulation

Both agents roll $2\text{d}6$, incorporating somatic strain, directional debt strings, and personal hegemony ratings:

$$
\text{Roll}_A = 2\text{d}6 + \text{Hegemony}_A + \text{StringsHeld}_{A \to B} - \text{SomaticStrain}_A \text{}
$$

$$
\text{Roll}_B = 2\text{d}6 + \text{Hegemony}_B + \text{StringsHeld}_{B \to A} - \text{SomaticStrain}_B \text{}
$$

$$
\Delta_{\text{margin}} = \text{Roll}_A - \text{Roll}_B \text{}
$$

#### Discrete Permutation Curve Across 1,296 States

Across the 1,296 possible roll configurations, the differential outcome $\Delta$ maps into four structural tiers:

| Margin Condition ($\Delta$) | Outcome Tier | Probability Mass | Mandated State Mutation |
| --- | --- | --- | --- |
| $\Delta \ge +4$ | `DECISIVE_WIN` | 31.79% | Target completely yields territorial/social objective; instigator incurs zero strain. |
| $+1 \le \Delta \le +3$ | `COSTLY_WIN` | 35.30% | Winner achieves primary objective, but absorbs $+450\text{ bp}$ physical/somatic strain. |
| $\Delta = 0$ | `STANDOFF` / `DEFLECTION` | 11.27% | Neither yields; both absorb $+200\text{ bp}$ paranoia; grievance resets to cooldown without spatial change. |
| $\Delta \le -1$ | `HUMILIATING_LOSS` | 21.64% | Instigator repelled; loses Hegemony; target claims directional String over instigator. |

#### The Bog vs. Wart Mechanical Evaluation

At Tick 28,410, the engine resolves the confrontation between Bog (Aggressor defending the warm seam) and Wart (Defender encroaching with tallow):

- **Bog’s Roll Evaluation:**
  - Raw $2\text{d}6$ roll: $7$.
  - Territorial Hegemony & Spite modifier: $+2$.
  - Directional Strings held over Wart: $0$.
  - Current Somatic Strain: $0\text{ bp}$ ($0$ penalty).
  - **Bog Total:** $7 + 2 + 0 - 0 = 9$.
- **Wart’s Roll Evaluation:**
  - Raw $2\text{d}6$ roll: $8$.
  - Hegemony modifier: $0$.
  - Somatic Mask / Physical debuff (single functional arm; left arm trapped in mask): $-1$.
  - Directional Strings held over Bog: $0$.
  - **Wart Total:** $8 + 0 - 1 + 0 = 7$.
- **Outcome Margin & Tier Assignment:**
  $$
  \Delta_{\text{margin}} = 9 - 7 = +2 \implies \mathbf{COSTLY\_WIN} \text{ for Bog}
  $$

Because $\Delta = +2$ falls squarely in the $[+1, +3]$ band, the conflict cannot result in an effortless triumph. Bog must prevail, but the victory demands an immediate somatic extraction.

### 4. Compilation of the ScenePlan IR

The simulation translates the mechanical result into an immutable intermediate contract—the `ScenePlan IR`. This JSON payload binds the authoring layer, preventing writers or generative LLMs from deviating from established physical truths.

```json
{
  "scene_plan_id": "sp_28410_bog_wart",
  "tick_origin": 28410,
  "participants": [
    "char_bog",
    "char_wart"
  ],
  "location": "loc_warm_pipe",
  "mechanical_tier": "COSTLY_WIN",
  "mandated_winner": "char_bog",
  "mandated_loser": "char_wart",
  "required_exit_conditions": {
    "item_transfers": [
      {
        "item_id": "item_grease_bucket",
        "from": "char_wart",
        "to": "floor_seam"
      }
    ],
    "somatic_deltas": [
      {
        "agent_id": "char_bog",
        "strain_delta_bp": 450
      }
    ],
    "spatial_displacements": [
      {
        "agent_id": "char_wart",
        "target_exit_corridor": "corr_splinter_gap"
      }
    ]
  }
}
```

#### Contractual Rules Enforced by the IR

- **Item Relocation:** The `item_grease_bucket` must exit Wart's inventory and transfer to the floorboard seam. The authoring layer cannot allow Wart to escape with the bucket.
- **Biological Debt:** Bog must absorb exactly $+450\text{ bp}$ of somatic strain, which will degrade his motor capabilities and stamina in subsequent simulation cycles.
- **Spatial Displacement:** Wart must retreat from `loc_warm_pipe` into the egress corridor (`corr_splinter_gap`), leaving Bog in possession of the pipe seam.

### 5. Downstream Handshake to Phase 4

With the `ScenePlan IR` compiled, the engine completes Phase 3 by preparing the workspace for **Phase 4: The Extraction & Settlement**[cite: 1, 3]:

- **Mounting the Workspace:** The execution context mounts `writer.astro` in the dashboard[cite: 1, 3].
- **Spatial Stage Header Injection:** The compiler injects Line 0 spatial coordinates, acoustic dampening constraints, lighting levels, and somatic masks (`arms_available: 1` for Wart) directly into the authoring environment[cite: 1, 3].
- **Holding the Clock:** The world clock remains frozen at Tick 28,410 until the written scene is checked by invariant linters, synthesized by local TTS, and clocked down to the exact millisecond by `ffprobe`[cite: 1, 3].

### You

{{FOCUS : Phase 3: The Dramatic Intercept at Tick 28,410 }}

@project-categories-00

### Gemini

To execute the architectural vision of **Phase 3: The Dramatic Intercept at Tick 28,410**, we must avoid the "Category Error" of conflating generative media with mathematical state. Because the transmedia studio strictly separates **Axis A (Semantic Meaning)** from **Axis B (Representation)**, the simulation engine must determine the physical reality of the confrontation *before* any prose is drafted or rendered.

Applying the **Software Project Categorization Mapping**, the engineering requirements for the Dramatic Intercept decompose into a single **Epic**, tracking down into **3 Features** and **9 Atomic Tasks**, targeted strictly at the `worker-sower-engine` within the `02.simulation` cluster.

### EPIC: DRAMATIC INTERCEPT & PRE-RESOLUTION MUTEX (TICK 28,410)

**Architectural Mandate:** Arrest the fast-forward continuous simulation precisely at the threshold of conflict, resolve the mechanical outcome mathematically in a zero-compute RAM environment, and compile an immutable contract (ScenePlan IR) that upstream presentation layers cannot violate.

#### FEATURE 1: The Clock Brake & Spatial-Tension Tripwire Engine

*Target Repositories: `worker-sower-engine/src/core/stages/` & `packages/sim-core/`*

At Tick 28,410, the fast-forward run must be abruptly halted. This feature implements the deterministic truth predicates that evaluate every tick to trigger the intercept.

- **Task 1.1: Implement Continuous Tripwire Predicate Evaluator (`stage3_selection.ts`)**
  - **Specification:** Build the deterministic gate that polls the `goblin-spatial` adapter. At Tick 28,410, Wart traverses to $d_{\text{axial}} \le 1$ relative to Bog, crossing the melee threshold.
  - **Logic:** Concurrently evaluate the dyadic tension in the `D1 grievance_runtime_state Ledger`. The physical intrusion adds the final $+2\text{ bp}$, triggering the escalation ceiling: $I_{\text{curr}} \ge 8{,}000\text{ bp}$.
  - **Acceptance Criteria:** The predicate must return `TRUE` at exactly Tick 28,410, forcing the `TICK_ADVANCED` dispatch loop to freeze.
- **Task 1.2: Snapshot Deep-Freeze ($S_{28410}$) & Memory Sealing**
  - **Specification:** Clone the active world-state matrix at Tick 28,410 into an isolated read-cache. Apply `Object.freeze()` to lock somatic strain, character coordinates, and inventory references against asynchronous mutation.
  - **Acceptance Criteria:** Any attempt to mutate $S_{28410}$ during Phase 3 must throw a strict TypeError.
- **Task 1.3: Relational Execution Lease Acquisition (`src/core/ledger/`)**
  - **Specification:** Dispatch an atomic `UPDATE` to the Cloudflare D1/SQLite relational state client.
  - **Logic:** Set `status = 'ENGAGED_IN_SCENE'` on the `world_execution_leases` table.
  - **Acceptance Criteria:** Distributed lease fencing ensures no external background chron-job can advance the world clock while Bog and Wart's confrontation remains unresolved.

#### FEATURE 2: Stage 4 Opposed 2d6 Duel Resolver & State Matrix

*Target Repository: `worker-sower-engine/src/core/stages/stage4_resolution.ts`*

Operating strictly in **Column 2: The Sovereign Ledger**, this feature calculates the mechanical outcome of the Bog vs. Wart collision using pure integer tabletop math, untainted by LLM hallucination.

- **Task 2.1: Opposed Math & Modifier Ingestion (The 2d6 Resolver)**
  - **Specification:** Implement the `Opposed 2d6 Duel Resolver` to ingest Bog and Wart's stat blocks from the frozen memory snapshot.
  - **Logic:** Calculate Bog's Roll (Roll $7$ + $2$ Spite Hegemony - $0$ Strain = $9$) and Wart's Roll (Roll $8$ + $0$ Hegemony - $1$ Arm Impairment = $7$). Compute the margin: $\Delta = +2$.
- **Task 2.2: Tiered Margin Classification (`COSTLY_WIN`)**
  - **Specification:** Map the $\Delta = +2$ margin against the discrete difference distribution curve.
  - **Logic:** A margin of $+1 \le \Delta \le +3$ mathematically locks the outcome into the `COSTLY_WIN` taxonomy band. Bog achieves the territorial objective, but physical friction is mandatory.
- **Task 2.3: Mutation Matrix Application & Biological Debt**
  - **Specification:** Calculate the exact scalar consequences required by the `COSTLY_WIN` tier.
  - **Logic:** Mandate a biological debt of $+450\text{ bp}$ somatic strain onto Bog. Mandate the `item_grease_bucket` is dropped from Wart's inventory slot.
  - **Acceptance Criteria:** Mutations are logged into temporary memory as pending state-transition events, pending Phase 4 acoustic settlement.

#### FEATURE 3: ScenePlan IR Compilation & Dashboard Handoff

*Target Repositories: `worker-sower-engine/src/parsers/` & `goblin-dashboard`*

To bridge the pure simulation of Axis A with the generative prose authoring of Axis B, the mechanical outcome must be compiled into an unforgeable JSON schema contract.

- **Task 3.1: Immutable JSON Intermediate Representation (ScenePlan IR)**
  - **Specification:** Serialize the pending state mutations into a strict Zod-validated `ScenePlan IR` payload.
  - **Logic:** Define `mandated_winner`, `mandated_loser`, and explicit `required_exit_conditions` (e.g., `item_grease_bucket` $\to$ `floor_seam`; `char_wart` $\to$ `corr_splinter_gap`).
  - **Acceptance Criteria:** Validated via `tsc --noEmit` and Zod `.strict()` gates to ensure zero structural deviations.
- **Task 3.2: 15/70/15 Attention Sandwich & Context Assembly**
  - **Specification:** Package the `ScenePlan IR`, the Line 0 spatial coordinates (`loc_warm_pipe`), and the biological constraints (`arms_available: 1`).
  - **Acceptance Criteria:** Assemble the context array using the "15/70/15 Attention Sandwich" to guarantee the downstream LLM or Showrunner respects the specific physical boundaries.
- **Task 3.3: Asymmetric Staging Handoff to `writer.astro`**
  - **Specification:** Surface the compiled contract to the Blessed terminal OS (`00.goblin.unit`) and the `goblin-dashboard` UI.
  - **Acceptance Criteria:** The UI must display the required exit conditions to the human Showrunner, blocking any scene draft submission that fails to fulfill the exact mechanical toll exacted at Tick 28,410.

### You

{{FOCUS : The Clock Brake & Spatial-Tension Tripwire Engine}}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

@local-repo-task-list-with-package-00

### Gemini

# Blueprint: The Clock Brake Spatial-Tension Tripwire Engine

**Repository:** `000.series-sower-engine`

**Package:** `300.engine`

**Target Runtime:** Local Workstation (Rig 1 Node.js POSIX Environment)

**Control Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`)

**Architectural Scope:** Local Execution Development Cycle (Prior to Cloudflare Durable Objects Deployment)

### Phase I: Mathematical Domain Foundations

```plaintext
packages/300.engine/28.tripwire.unit/
├── fce/
│   ├── tripwire.interface.ts     ◄── Branded spatial distance, tension metrics, trigger contracts
│   └── tripwire.bit.ts           ◄── Bit envelope indices for tripwire initialization
```

#### Task: Declare Axial Proximity Coordinate Typings

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.interface.ts`
- **Implementation:**
  - Define branded nominal type `AxialDistance` (`number & { readonly __brand: unique symbol }`).
  - Declare hex grid coordinate boundary interfaces using cubic coordinates $(q, r, s)$ where $q + r + s = 0$.
  - Assert non-negative integer constraints for axial distance computations.
  - Define physical melee boundary constant `AXIAL_COLLOCATION_LIMIT = 1`.

#### Task: Declare Integer Basis Point Tension Types

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.interface.ts`
- **Implementation:**
  - Define branded nominal integer type `BasisPoints` (`number & { readonly __brand: unique symbol }`).
  - Enforce scalar bounds $[0, 10000]\text{ bp}$ representing physical, psychological, or social pressure.
  - Define boiling-point threshold constant `DEFAULT_ESCALATION_CEILING_BP = 8000`.
  - Ban floating-point scalar representations across all tripwire threshold interfaces.

#### Task: Define Compound Tripwire Condition Contract

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.interface.ts`
- **Implementation:**
  - Construct `TripwireConditionRecord` interface:
    - `tripwireId: string`
    - `participantPair: readonly [string, string]`
    - `spatialThresholdAxial: AxialDistance`
    - `tensionCeilingBp: BasisPoints`
    - `requiredCooldownTicks: number`
    - `boredomCeilingBp: BasisPoints`
    - `isArmed: boolean`

#### Task: Specify Tripwire Intercept Event Receipt Structure

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.interface.ts`
- **Implementation:**
  - Construct `TripwireInterceptReceipt` interface:
    - `trippedAtTick: SimTime`
    - `instigatorId: string`
    - `targetId: string`
    - `locationId: string`
    - `observedAxialDistance: AxialDistance`
    - `observedTensionBp: BasisPoints`
    - `stateHashAnchor: string`

#### Task: Define Tripwire Unit Action Bit Commands

- **Target File:** `packages/300.engine/28.tripwire.unit/fce/tripwire.bit.ts`
- **Implementation:**
  - Enumerate bit action commands: `INIT`, `ARM`, `EVALUATE`, `ENGAGE_BRAKE`, `RESET`.
  - Construct typing resolvers in `TripwireBit.slv` accepting `TripwireConditionRecord` and `TripwireInterceptReceipt` payloads.

### Phase II: Spatial-Tension Predicate Engine

```plaintext
packages/300.engine/28.tripwire.unit/
├── tripwire.model.ts             ◄── In-memory active rule register
├── tripwire.action.ts            ◄── Pure deterministic predicate logic
└── tripwire.reduce.ts            ◄── Tripwire condition reducer
```

#### Task: Implement Pure Hex Axial Proximity Calculation

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.action.ts`
- **Implementation:**
  - Calculate distance between coordinates $A(q_A, r_A)$ and $B(q_B, r_B)$:
    $$
    d_{\text{axial}}(A, B) = \max(\vert{}q_A - q_B\vert{}, \, \vert{}r_A - r_B\vert{}, \, \vert{}(-q_A - r_A) - (-q_B - r_B)\vert{}) \text{}
    $$
  - Expose `isAxialProximitySatisfied(coordA, coordB, threshold)` returning pure boolean.
  - Ban dynamic heap allocations or array construction during distance resolution.

#### Task: Build Dyadic Grievance Tension Ceiling Gate

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.action.ts`
- **Implementation:**
  - Ingest live dyadic tension metrics from relational working cache.
  - Evaluate boiling condition:
    $$
    \text{isTensionSaturated} \iff I_{\text{curr}} \ge I_{\text{ceiling}} \text{}
    $$
  - Verify cooldown eligibility asserting active grievance `cooldown_ticks === 0`.

#### Task: Implement Jaccard Procedural Boredom Gate

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.action.ts`
- **Implementation:**
  - Inspect historical interaction buffer across sliding window $N = 10$.
  - Calculate discrete Jaccard similarity across recent scene participant sets:
    $$
    J = \frac{\vert{}S_{\text{current}} \cap S_{\text{historical}}\vert{}}{\vert{}S_{\text{current}} \cup S_{\text{historical}}\vert{}} \text{[cite: 11]}
    $$
  - Scale $J$ to integer basis points $[0, 10000]\text{ bp}$.
  - Assert condition passes when boredom score remains $\le 6500\text{ bp}$.

#### Task: Assemble Short-Circuit Tripwire Master Gate

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.action.ts`
- **Implementation:**
  - Compose compound evaluator function `evaluateTripwirePredicate(spatial, grievance, boredom, rule)`.
  - Order checks for immediate short-circuiting:
    1. Check `rule.isArmed`
    2. Evaluate `isAxialProximitySatisfied`
    3. Evaluate `isTensionSaturated`
    4. Evaluate procedural boredom filter
  - Guarantee execution bound in $O(1)$ operations per dyad tick.

#### Task: Construct Tripwire Registry Model State Container

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.model.ts`
- **Implementation:**
  - Build `TripwireModel` class managing immutable arrays of `TripwireConditionRecord`.
  - Provide indexed lookups keyed by character pairs `actorA_actorB`.
  - Track active tripping status, last evaluated tick, and total trip count.

#### Task: Implement Tripwire Reduction State Handler

- **Target File:** `packages/300.engine/28.tripwire.unit/tripwire.reduce.ts`
- **Implementation:**
  - Route actions: `INIT`, `ARM`, `EVALUATE`, `RESET`.
  - Ensure state transforms return new cloned instances without mutating previous state objects.

### Phase III: Clock Brake Halting Interceptor

```plaintext
packages/300.engine/29.brake.unit/
├── fce/
│   ├── brake.interface.ts        ◄── Brake event descriptors, halt payload contracts
│   └── brake.bit.ts              ◄── Action bit commands for clock interception
├── brake.model.ts                ◄── Freeze state, unconsumed ticks storage
├── brake.action.ts               ◄── Dispatch loop interruption logic
└── brake.reduce.ts               ◄── Clock halt reducer
```

#### Task: Define Clock Brake Intercept Envelope

- **Target File:** `packages/300.engine/29.brake.unit/fce/brake.interface.ts`
- **Implementation:**
  - Define `ClockBrakePayload` interface:
    - `haltedAtTick: SimTime`
    - `targetTickCeiling: SimTime`
    - `unconsumedTicksRemaining: number`
    - `triggerReceipt: TripwireInterceptReceipt`
    - `isFrozen: boolean`

#### Task: Define Clock Brake Action Bit Declarations

- **Target File:** `packages/300.engine/29.brake.unit/fce/brake.bit.ts`
- **Implementation:**
  - Enumerate action bit identifiers: `BRAKE_ENGAGE`, `BRAKE_HOLD`, `BRAKE_RESTORE_TICKS`, `BRAKE_RELEASE`.
  - Expose typed bit resolvers accepting `ClockBrakePayload`.

#### Task: Implement Tick Dispatch Loop Interruption Logic

- **Target File:** `packages/300.engine/29.brake.unit/brake.action.ts`
- **Implementation:**
  - Intercept `17.tick.unit` advancement loop upon receiving positive tripwire boolean.
  - Halt monotonic loop execution instantly at current tick (e.g., Tick 28,410).
  - Calculate unconsumed tick deficit against requested batch ceiling:
    $$
    \Delta_{\text{remaining}} = t_{\text{ceiling}} - t_{\text{halted}} \text{}
    $$
  - Store $\Delta_{\text{remaining}}$ inside `BrakeModel` for timeline restoration.

#### Task: Construct Clock Brake State Model Container

- **Target File:** `packages/300.engine/29.brake.unit/brake.model.ts`
- **Implementation:**
  - Build `BrakeModel` holding `isBrakeEngaged: boolean`, `haltedAtTick: SimTime`, `unconsumedTicks: number`, and `lastReceipt: TripwireInterceptReceipt | null`.
  - Enforce initial instantiation in unengaged state (`isBrakeEngaged = false`).

#### Task: Wire Clock Brake State Reducer

- **Target File:** `packages/300.engine/29.brake.unit/brake.reduce.ts`
- **Implementation:**
  - Handle `BRAKE_ENGAGE` action: flip `isBrakeEngaged = true`, bind halted tick integer, lock tick emitter.
  - Handle `BRAKE_RELEASE` action: clear lock, return remaining tick budget to scheduler.

### Phase IV: Snapshot Deep-Freeze Sealing

```plaintext
packages/300.engine/30.freeze.unit/
├── fce/
│   ├── freeze.interface.ts       ◄── Frozen snapshot contracts, SHA-256 seal metadata
│   └── freeze.bit.ts             ◄── Bit descriptors for snapshot capture
├── freeze.model.ts               ◄── Immutable snapshot storage cache
├── freeze.action.ts              ◄── Object.freeze traversal, RFC 8785 Merkle hashing
└── freeze.reduce.ts              ◄── Freeze state management reducer
```

#### Task: Define Immutable Snapshot Storage Interface

- **Target File:** `packages/300.engine/30.freeze.unit/fce/freeze.interface.ts`
- **Implementation:**
  - Construct `FrozenSnapshotContainer<TState>` interface:
    - `snapshotTick: SimTime`
    - `frozenTimestampMs: number`
    - `stateMerkleDigest: string`
    - `immutableStatePayload: Readonly<TState>`

#### Task: Declare Freeze Unit Bit Action Enumerations

- **Target File:** `packages/300.engine/30.freeze.unit/fce/freeze.bit.ts`
- **Implementation:**
  - Declare action index bits: `FREEZE_CAPTURE`, `FREEZE_VERIFY`, `FREEZE_RELEASE`.
  - Expose strongly typed parameter definitions for state cloning and digest sealing.

#### Task: Implement Recursive In-Memory State Deep-Freeze

- **Target File:** `packages/300.engine/30.freeze.unit/freeze.action.ts`
- **Implementation:**
  - Clone volatile staging memory slice ($S_{28410}$) using structured deep cloning.
  - Execute recursive `Object.freeze()` traversal visiting all nested objects, character coordinates, inventory arrays, and tension meters.
  - Assert that property writes to the resulting container trigger strict `TypeError` exceptions.

#### Task: Implement RFC 8785 Canonical JSON Merkle Hashing

- **Target File:** `packages/300.engine/30.freeze.unit/freeze.action.ts`
- **Implementation:**
  - Implement canonical JSON serializer enforcing alphabetical key sorting per RFC 8785.
  - Generate cryptographic baseline state digest using `node:crypto`:
    $$
    H_{\text{snapshot}} = \text{SHA-256}(\text{CanonicalJSON}(S_{\text{frozen}})) \text{}
    $$
  - Record $H_{\text{snapshot}}$ as an immutable cryptographic anchor.

#### Task: Construct Frozen Snapshot Model Container

- **Target File:** `packages/300.engine/30.freeze.unit/freeze.model.ts`
- **Implementation:**
  - Build `FreezeModel` storing active frozen snapshots indexed by tick number.
  - Expose read-only getters for accessing frozen state payloads without risk of state leakage.

#### Task: Build Freeze Unit Reducer Dispatcher

- **Target File:** `packages/300.engine/30.freeze.unit/freeze.reduce.ts`
- **Implementation:**
  - Process `FREEZE_CAPTURE` payloads into state cache.
  - Verify Merkle digest matching on `FREEZE_VERIFY` invocations.

### Phase V: Local Relational Execution Lease Management

```plaintext
packages/300.engine/02.database.unit/
├── fce/
│   ├── lease.interface.ts        ◄── Relational schema typings, lease enums
│   └── lease.bit.ts              ◄── Action bits for atomic SQLite lease management
├── lease.model.ts                ◄── Local database connection state
├── lease.action.ts               ◄── SQLite CAS queries, fencing token tracking
└── lease.reduce.ts               ◄── Lease acquisition reducer
```

#### Task: Define Local SQLite Execution Lease Schema

- **Target File:** `packages/300.engine/02.database.unit/fce/lease.interface.ts`
- **Implementation:**
  - Define TypeScript interface mirroring local SQLite schema:
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
  - Ban nullable types on integrity-critical fields (`status`, `locked_at_tick`, `fencing_token`).

#### Task: Declare Lease Unit Action Bit Contracts

- **Target File:** `packages/300.engine/02.database.unit/fce/lease.bit.ts`
- **Implementation:**
  - Declare action bit operations: `LEASE_ACQUIRE`, `LEASE_RENEW`, `LEASE_RELEASE`, `LEASE_AUDIT`.
  - Bind parameters for lease ID, series slug, and current simulation tick.

#### Task: Implement SQLite Compare-And-Swap Lease Acquisition

- **Target File:** `packages/300.engine/02.database.unit/lease.action.ts`
- **Implementation:**
  - Execute atomic write transaction via local SQLite client (`better-sqlite3`):
    ```sql
    UPDATE world_execution_leases
    SET status = 'ENGAGED_IN_SCENE',
        locked_at_tick = ?,
        lease_owner = ?,
        fencing_token = fencing_token + 1
    WHERE series_slug = ? AND status = 'FREE_RUNNING';
    ```
  - Verify `changes === 1`; throw execution conflict exception if lease is held by another process.

#### Task: Implement SQLite Lease Release Settlement Logic

- **Target File:** `packages/300.engine/02.database.unit/lease.action.ts`
- **Implementation:**
  - Execute atomic release query resetting status to `FREE_RUNNING`:
    ```sql
    UPDATE world_execution_leases
    SET status = 'FREE_RUNNING',
        locked_at_tick = 0,
        lease_owner = 'none'
    WHERE series_slug = ? AND status = 'ENGAGED_IN_SCENE';
    ```
  - Assert that fencing token increments monotonically on release.

#### Task: Wire Lease Unit State Reducer

- **Target File:** `packages/300.engine/02.database.unit/lease.reduce.ts`
- **Implementation:**
  - Maintain active lease status, current fencing token value, and active lease owner in local model state.

### Phase VI: Blessed Terminal TUI Integration

```plaintext
apps/terminal/src/cns00/
├── views/
│   └── tripwire-sentinel.view.ts ◄── ASCII alert frame, diagnostic telemetry visualizer
└── menus/
    └── tripwire-control.menu.ts  ◄── Interactive Blessed menu entry for tripwire manual arming
```

#### Task: Build Tripwire Sentinel Terminal View

- **Target File:** `apps/terminal/src/cns00/views/tripwire-sentinel.view.ts`
- **Implementation:**
  - Construct Blessed box component rendering real-time tripwire status:
    ```plaintext
    ┌────────────────────────────────────────────────────────────┐
    │ TRIPWIRE SENTINEL: ARMED                                   │
    │ Proximity d_axial <= 1  | Grievance Tension >= 8,000 bp    │
    │ Simulation Tick: 28,410 | Status: CLOCK_BRAKE_ENGAGED      │
    │ Target: Bog vs Wart at loc_warm_pipe                       │
    │ State Hash: 7f83b165... (SHA-256 Merkle Anchor Sealed)     │
    └────────────────────────────────────────────────────────────┘
    ```
  - Bind view directly to `28.tripwire.unit` and `29.brake.unit` event buses.

#### Task: Construct Interactive Terminal Menu Actions

- **Target File:** `apps/terminal/src/cns00/menus/tripwire-control.menu.ts`
- **Implementation:**
  - Register menu items inside Blessed terminal interface (`apps/terminal`):
    - `[1] Arm Spatial-Tension Tripwire (Default 8,000 bp)`
    - `[2] Disarm Active Tripwire`
    - `[3] Force Manual Clock Brake Engagement`
    - `[4] Inspect Frozen State Snapshot Hash`
    - `[5] Release Brake & Resume Fast-Forward Ticking`
  - Connect keyboard commands directly to `300.engine` action dispatchers.

### Phase VII: Mechanical Verification Suite

```plaintext
packages/300.engine/28.tripwire.unit/tests/
├── tripwire.spatial.test.ts      ◄── Hex axial distance assertions
├── tripwire.tension.test.ts      ◄── Grievance basis point ceiling tests
├── tripwire.boredom.test.ts      ◄── Jaccard similarity filter tests
├── clock.freeze.test.ts          ◄── Tick dispatch freeze validation
├── snapshot.immutability.test.ts ◄── Object.freeze mutation rejection tests
└── lease.concurrency.test.ts     ◄── SQLite CAS race condition tests
```

#### Task: Verify Hex Axial Distance Edge Scenarios

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/tripwire.spatial.test.ts`
- **Implementation:**
  - Assert $d_{\text{axial}} = 2$ returns `isAxialProximitySatisfied === false`.
  - Assert $d_{\text{axial}} = 1$ returns `isAxialProximitySatisfied === true`.
  - Assert collocated coordinates ($d_{\text{axial}} = 0$) satisfy proximity condition.

#### Task: Verify Grievance Tension Threshold Boundary

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/tripwire.tension.test.ts`
- **Implementation:**
  - Test tension at $7999\text{ bp}$; assert tripwire does not engage.
  - Test tension at $8000\text{ bp}$ with active cooldown (`cooldown_ticks > 0`); assert tripwire does not engage.
  - Test tension at $8000\text{ bp}$ with zero cooldown; assert tripwire engages immediately.

#### Task: Verify Procedural Boredom Jaccard Rejection

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/tripwire.boredom.test.ts`
- **Implementation:**
  - Seed historical interaction window with identical pairing (Jaccard similarity $> 0.65$).
  - Assert that tripwire suppresses brake engagement and flags procedural boredom repetition.

#### Task: Assert Strict Clock Monotonic Freeze Integrity

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/clock.freeze.test.ts`
- **Implementation:**
  - Dispatch 36,000 fast-forward tick batch with configured tripwire at Tick 28,410.
  - Verify simulation halts at exactly `currentTick === 28410`.
  - Verify remaining tick count is stored as exactly $7590\text{ ticks}$.

#### Task: Verify Snapshot Immutability Mutation Rejection

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/snapshot.immutability.test.ts`
- **Implementation:**
  - Capture frozen snapshot $S_{28410}$.
  - Attempt property assignment on character coordinates and tension meters[cite: 1, 5].
  - Assert execution throws runtime `TypeError` under Node.js strict mode.
  - Recompute Merkle digest across 100 iterations; assert bit-identical SHA-256 strings.

#### Task: Validate Local SQLite Lease Mutex Concurrency

- **Target File:** `packages/300.engine/28.tripwire.unit/tests/lease.concurrency.test.ts`
- **Implementation:**
  - Instantiate two concurrent workers targeting the same SQLite database.
  - Execute concurrent lease acquisition requests for series `under-the-floorboards`[cite: 5].
  - Verify that exactly one worker succeeds in transitioning status to `ENGAGED_IN_SCENE`[cite: 5].
  - Verify competing worker receives lease collision error and fails to acquire lock[cite: 5].

### You

{{FOCUS : FEATURE 2 Stage 4 Opposed 2d6 Duel Resolver & State Matrix}}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

### Gemini

# Blueprint: Stage 4 Opposed 2d6 Duel Resolver State Matrix

**Repository:** `000.series-sower-engine` (also designated `002.worker-sower` / `worker-sower-engine`)

**Package:** `300.engine` (residing in `packages/300.engine`)

**Target Runtime:** Local Workstation (Rig 1 Node.js POSIX Runtime)

**Control Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`)

**Architectural Scope:** Local Execution Development Cycle (Prior to Cloudflare Durable Objects Deployment)

### Phase I: Mathematical Domain Typings

```plaintext
packages/300.engine/31.duel-math.unit/
├── fce/
│   ├── duel-math.interface.ts    ◄── Discrete margin domains, clamped modifier types, roll types
│   └── duel-math.bit.ts          ◄── Action bit envelopes for mathematical calculations
```

#### Task: Declare Discrete Duel Roll Margin Domains

- **Target File:** `packages/300.engine/31.duel-math.unit/fce/duel-math.interface.ts`
- **Implementation:**
  - Define branded integer type `DiceSum2d6` constrained to $[2, 12]$.
  - Define branded signed integer type `DiscreteMargin` representing $D = X_1 - X_2$ constrained to the interval $[-10, 10]$.
  - Declare permutation constant `TOTAL_PERMUTATIONS = 1296` ($36 \times 36$ equally probable outcomes).
  - Construct strict type assertion functions validating that input values conform to the discrete distribution limits.

#### Task: Declare Clamped Modifier Range Types

- **Target File:** `packages/300.engine/31.duel-math.unit/fce/duel-math.interface.ts`
- **Implementation:**
  - Define branded integer type `ClampedModifier` strictly constrained to $[-2, +2]$ to prevent leverage stacking from breaking dramatic uncertainty.
  - Construct `EffectiveModifier` type representing total clamped adjustments:
    $$
    M_{\text{effective}} = \operatorname{clamp}\left(\sum_{i} m_i, -2, +2\right) \text{[cite: 2]}
    $$
  - Declare string weight constant $W = 3$ and condition penalty weight $P = 2$.

#### Task: Define Duel Participant Parameter Contract

- **Target File:** `packages/300.engine/31.duel-math.unit/fce/duel-math.interface.ts`
- **Implementation:**
  - Declare `DuelParticipantProfile` interface:
    - `agentId: string`
    - `baseAttribute: number` (Integer in range $[1, 5]$: Spite, Cunning, Charm)
    - `stringsCommitted: number` (Integer count of social leverage tokens spent)
    - `somaticDebuffCount: number` (Integer count of active physical impairments)
    - `strainBasisPoints: number` (Integer in $[0, 10000]\text{ bp}$)

#### Task: Define Duel Math Action Bit Commands

- **Target File:** `packages/300.engine/31.duel-math.unit/fce/duel-math.bit.ts`
- **Implementation:**
  - Enumerate action command identifiers: `INIT`, `COMPUTE_ROLL`, `APPLY_CLAMP`, `CALCULATE_MARGIN`.
  - Expose typed bit resolvers in `DuelMathBit.slv` accepting `DuelParticipantProfile` and returning evaluated numeric margins.

### Phase II: Tabletop Dice Gauntlet Calculation

```plaintext
packages/300.engine/31.duel-math.unit/
├── duel-math.model.ts            ◄── Mathematical probability cache
├── duel-math.action.ts           ◄── Pure deterministic dice roll arithmetic
└── duel-math.reduce.ts           ◄── Calculation state transition handler
```

#### Task: Implement Pure 2d6 Argument Score Evaluator

- **Target File:** `packages/300.engine/31.duel-math.unit/duel-math.action.ts`
- **Implementation:**
  - Implement pure scoring formula for an actor:
    $$
    \text{ArgumentScore} = (\text{Base} + \text{Roll}) + (\text{Strings} \times W) - (\text{Debuffs} \times P) \text{[cite: 2, 14]}
    $$
  - Assert that rolls are generated deterministically via pseudo-random number generator seeds without unseeded calls to `Math.random`.
  - Enforce non-negative output bounds on computed scores.

#### Task: Implement Global Modifier Clamping Kernel

- **Target File:** `packages/300.engine/31.duel-math.unit/duel-math.action.ts`
- **Implementation:**
  - Construct `clampModifier(rawNetModifier: number): ClampedModifier`.
  - Map values $\le -2 \to -2$, values $\ge +2 \to +2$, and preserve intermediate integer values.
  - Prevent per-source unclamped stacking where individual $+2$ modifiers accumulate to $+6$.

#### Task: Build Discrete Margin Differential Comparator

- **Target File:** `packages/300.engine/31.duel-math.unit/duel-math.action.ts`
- **Implementation:**
  - Compute signed margin between two actors:
    $$
    \Delta_{\text{margin}} = \text{Score}_A - \text{Score}_B \text{}
    $$
  - Record raw component breakdown (`rollA`, `rollB`, `effectiveModA`, `effectiveModB`) into an immutable audit trail tuple.

#### Task: Construct Duel Math State Model Container

- **Target File:** `packages/300.engine/31.duel-math.unit/duel-math.model.ts`
- **Implementation:**
  - Build `DuelMathModel` storing active calculation buffers, last resolved margin, and audit metrics.
  - Provide immutable getters exposing verified integer distributions for sanity checking.

#### Task: Implement Duel Math Reducer Dispatcher

- **Target File:** `packages/300.engine/31.duel-math.unit/duel-math.reduce.ts`
- **Implementation:**
  - Process `COMPUTE_ROLL` and `CALCULATE_MARGIN` actions using pure cloning without mutation.
  - Return state instances sealed with frozen properties.

### Phase III: Structural Taxonomy Outcome Classifier

```plaintext
packages/300.engine/32.taxonomy.unit/
├── fce/
│   ├── taxonomy.interface.ts     ◄── Outcome tier unions, classification payload structures
│   └── taxonomy.bit.ts           ◄── Classification bit commands
├── taxonomy.model.ts             ◄── Active classification rules register
├── taxonomy.action.ts            ◄── Pure classification logic
└── taxonomy.reduce.ts            ◄── Outcome classification reducer
```

#### Task: Declare Closed Outcome Taxonomy Discriminated Unions

- **Target File:** `packages/300.engine/32.taxonomy.unit/fce/taxonomy.interface.ts`
- **Implementation:**
  - Define strict string literal union type `OutcomeTier`: `'CLEAN_WIN' | 'COSTLY_WIN' | 'MUTUAL_WOUND' | 'BACKFIRE' | 'TRUE_TIE'`
  - Declare compound dual-axis classification unions for extreme matching outcomes: `'DOUBLE_CLEAN_WIN' | 'DOUBLE_COSTLY_WIN' | 'DOUBLE_MUTUAL_WOUND' | 'DOUBLE_BACKFIRE'`

#### Task: Define Taxonomy Unit Action Bit Contracts

- **Target File:** `packages/300.engine/32.taxonomy.unit/fce/taxonomy.bit.ts`
- **Implementation:**
  - Enumerate bit commands: `TAXONOMY_INIT`, `CLASSIFY_MARGIN`, `EVALUATE_BACKFIRE`, `CLASSIFY_COMPOUND`.
  - Bind strong typing parameters to classify margins and grievance parameters into `OutcomeTier`.

#### Task: Implement Margin-Based Taxonomy Classifier Logic

- **Target File:** `packages/300.engine/32.taxonomy.unit/taxonomy.action.ts`
- **Implementation:**
  - Classify raw margin $\Delta = \text{Score}_A - \text{Score}_B$:
    - $\Delta = 0 \implies \text{'TRUE\_TIE'}$ ($11.27\%$ probability mass)
    - $\vert{}\Delta\vert{} \in \{1, 2\} \implies \text{'MUTUAL\_WOUND'}$ ($40.89\%$ probability mass)
    - $\vert{}\Delta\vert{} = 3$ OR (winner spent $\ge 2$ Strings) $\implies \text{'COSTLY\_WIN'}$
    - $\vert{}\Delta\vert{} \ge 4$ (with zero Strings spent) $\implies \text{'CLEAN\_WIN'}$
  - Map winner identity (`'a' | 'b' | null`) based on signed direction of $\Delta$.

#### Task: Implement Over-Escalated Grievance Backfire Evaluator

- **Target File:** `packages/300.engine/32.taxonomy.unit/taxonomy.action.ts`
- **Implementation:**
  - Evaluate social backfire override rules:
    - Check if winner spent $\ge 1$ String tied to a stale grievance.
    - Check if grievance escalation stage has breached staleness threshold ($\text{stage} \ge 3$).
  - Flip social outcome if conditions match: transition classification to `'BACKFIRE'`.
  - Award social standing inversion to nominal loser.

#### Task: Assemble Compound Dual-Axis Extreme Evaluator

- **Target File:** `packages/300.engine/32.taxonomy.unit/taxonomy.action.ts`
- **Implementation:**
  - Ingest independent objective axis outcome and somatic axis outcome.
  - Evaluate equality: `isCompoundExtreme = (objectiveTier === somaticTier)`.
  - Map matching tiers to compound classifications (`DOUBLE_CLEAN_WIN`, `DOUBLE_COSTLY_WIN`, `DOUBLE_MUTUAL_WOUND`, `DOUBLE_BACKFIRE`).

#### Task: Construct Taxonomy Model Container

- **Target File:** `packages/300.engine/32.taxonomy.unit/taxonomy.model.ts`
- **Implementation:**
  - Build `TaxonomyModel` holding active classification thresholds, historical outcomes, and distribution counters.

#### Task: Wire Taxonomy State Reducer

- **Target File:** `packages/300.engine/32.taxonomy.unit/taxonomy.reduce.ts`
- **Implementation:**
  - Handle `CLASSIFY_MARGIN` and store computed `OutcomeTier` into model state.

### Phase IV: Ephemeral Staging Accumulator Allocation

```plaintext
packages/300.engine/33.accumulator.unit/
├── fce/
│   ├── accumulator.interface.ts  ◄── Multi-vector staging payload schemas
│   └── accumulator.bit.ts        ◄── Accumulator staging bit actions
├── accumulator.model.ts          ◄── In-memory volatile staging buffer
├── accumulator.action.ts         ◄── Arithmetic, logistical, and somatic vector staging
└── accumulator.reduce.ts         ◄── Staging accumulator reducer
```

#### Task: Define Multi-Vector Staging Accumulator Schema

- **Target File:** `packages/300.engine/33.accumulator.unit/fce/accumulator.interface.ts`
- **Implementation:**
  - Construct `MutableStagingAccumulator` interface:
    - `stagingId: string`
    - `tickOrigin: SimTime`
    - `arithmeticVector: { readonly rollMargin: number; readonly effectiveModifiers: Record<string, number> }`
    - `logisticalVector: { readonly itemTransfers: Array<{ itemId: string; from: string; to: string }> }`
    - `somaticVector: { readonly strainDeltasBp: Record<string, number>; readonly conditionsAdded: Record<string, string[]> }`
    - `relationalVector: { readonly stringsAwarded: Array<{ from: string; to: string; count: number }>; readonly resentmentDeltas: Record<string, number> }`

#### Task: Declare Accumulator Unit Action Bit Envelopes

- **Target File:** `packages/300.engine/33.accumulator.unit/fce/accumulator.bit.ts`
- **Implementation:**
  - Enumerate action bit operations: `STAGE_INIT`, `STAGE_LOGISTICAL_DELTA`, `STAGE_SOMATIC_STRAIN`, `STAGE_RELATIONAL_SHIFT`, `STAGE_PURGE`.
  - Expose typed bit resolvers accepting staging mutation slices.

#### Task: Implement Equip-Slot Conservation Logistics Stager

- **Target File:** `packages/300.engine/33.accumulator.unit/accumulator.action.ts`
- **Implementation:**
  - Enforce conservation of mass across equipment transitions.
  - Stage item dropping: transition `item_grease_bucket` from Wart to floor seam.
  - Assert that an item cannot exist in two entity slots simultaneously.

#### Task: Implement Integer Basis Point Biological Strain Stager

- **Target File:** `packages/300.engine/33.accumulator.unit/accumulator.action.ts`
- **Implementation:**
  - Stage biological costs in volatile RAM:
    - Bog (`char_bog`): strain delta $+450\text{ bp}$.
    - Apply condition tags (e.g., `exhaustion_tier_1`, `minor_strain`) to somatic payload.
  - Enforce basis-point capping at $10000\text{ bp}$ ($100\%$ collapse threshold).

#### Task: Implement Relational String Leverage Stager

- **Target File:** `packages/300.engine/33.accumulator.unit/accumulator.action.ts`
- **Implementation:**
  - Stage directional string modifications:
    - Under `COSTLY_WIN`: winner drops 1 String on target, or unobserved witness gains 1 String on winner.
    - Assert anti-reflexive invariant ($\text{holderId} \neq \text{debtorId}$).
  - Stage dyadic resentment resets and cooldown activations.

#### Task: Construct Accumulator State Model Container

- **Target File:** `packages/300.engine/33.accumulator.unit/accumulator.model.ts`
- **Implementation:**
  - Build `AccumulatorModel` managing in-memory scratchpad collections.
  - Implement zero-cost rollback mechanism: discard staging payload completely if abort occurs.

#### Task: Build Accumulator Reducer Dispatcher

- **Target File:** `packages/300.engine/33.accumulator.unit/accumulator.reduce.ts`
- **Implementation:**
  - Handle discrete staging actions into isolated volatile objects.
  - Clear buffers completely on `STAGE_PURGE` invocations[cite: 5, 7].

### Phase V: Local SQLite Transaction Reducer Mutation

```plaintext
packages/300.engine/02.database.unit/
├── fce/
│   ├── duel-mutation.interface.ts ◄── SQL mutation contracts, delta batch interfaces
│   └── duel-mutation.bit.ts       ◄── Bit commands for database commits
├── duel-mutation.action.ts        ◄── SQLite transactional write operations
└── duel-mutation.reduce.ts        ◄── Post-commit event log updates
```

#### Task: Define Local Database Transaction Delta Contracts

- **Target File:** `packages/300.engine/02.database.unit/fce/duel-mutation.interface.ts`
- **Implementation:**
  - Construct `StateMutationBatch` interface matching SQLite relational schemas:
    - `targetTick: SimTime`
    - `appliedChangesCount: number`
    - `eventLogPayload: Array<{ eventType: string; payloadJson: string }>`
    - `previousMerkleRoot: string`
    - `newMerkleRoot: string`

#### Task: Declare Database Mutation Action Bit Envelopes

- **Target File:** `packages/300.engine/02.database.unit/fce/duel-mutation.bit.ts`
- **Implementation:**
  - Enumerate action bit commands: `COMMIT_STAGED_DUEL`, `APPLY_SOMATIC_DELTA`, `TRANSFER_INVENTORY`, `DIRTY_DOWNSTREAM_SCENES`.
  - Bind strongly typed parameters for transactional SQL execution.

#### Task: Implement Atomic SQLite Transaction Mutation Execution

- **Target File:** `packages/300.engine/02.database.unit/duel-mutation.action.ts`
- **Implementation:**
  - Execute atomic write transaction via local SQLite client (`better-sqlite3`):
    ```sql
    BEGIN TRANSACTION;
      UPDATE agent_state 
      SET somatic_strain_bp = MIN(10000, somatic_strain_bp + 450)
      WHERE agent_id = 'char_bog';
      UPDATE inventory_ledger 
      SET holder_entity_id = 'floor_seam_loc_warm_pipe', dropped_at_tick = 28410 
      WHERE item_id = 'item_grease_bucket';
      UPDATE agent_spatial 
      SET coord_axial = 'corr_splinter_gap_01' 
      WHERE agent_id = 'char_wart';
      UPDATE grievance_state 
      SET intensity_bps = 2000, cooldown_ticks = 12000 
      WHERE dyad_id = 'char_bog_char_wart';
    COMMIT;
    ```
  - Assert that all four statements execute atomically or rollback completely on error.

#### Task: Implement Downstream Scene Cache Invalidation

- **Target File:** `packages/300.engine/02.database.unit/duel-mutation.action.ts`
- **Implementation:**
  - Flag dependent downstream scenes as stale:
    ```sql
    UPDATE scene_manifests 
    SET is_dirty = 1 
    WHERE target_entity_id IN ('char_bog', 'char_wart', 'item_grease_bucket');
    ```
  - Prevent downstream render pipelines from evaluating un-synchronized scene assets.

#### Task: Wire Database Mutation State Reducer

- **Target File:** `packages/300.engine/02.database.unit/duel-mutation.reduce.ts`
- **Implementation:**
  - Record append-only entries into `event_log` table marking successful transition from $S_n \to S_{n+1}$.

### Phase VI: Blessed Terminal Duel Arena Integration

```plaintext
apps/terminal/src/cns00/
├── views/
│   └── duel-arena.view.ts        ◄── ASCII duel arena display, score and margin meters
└── menus/
    └── duel-simulation.menu.ts   ◄── Interactive terminal controls for dry-run duels
```

#### Task: Build ASCII Duel Resolution Arena Telemetry View

- **Target File:** `apps/terminal/src/cns00/views/duel-arena.view.ts`
- **Implementation:**
  - Construct Blessed box component rendering real-time duel resolution parameters:
    ```plaintext
    ┌────────────────────────────────────────────────────────────┐
    │ STAGE 4 DUEL ARENA: BOG vs WART                            │
    │ Bog Roll:  2d6 (7) + Spite (+2) - Strain (0) = 9           │
    │ Wart Roll: 2d6 (8) + Cunning (0) - Impaired (-1) = 7       │
    │ Net Margin: Δ = +2 ──► COSTLY_WIN                          │
    │ Mandatory Toll: Bog +450 bp Strain | Wart Drops Bucket     │
    │ Staging Buffer: LOCKED (Awaiting Phase 4 Settlement)       │
    └────────────────────────────────────────────────────────────┘
    ```
  - Format data cleanly within standard 7-bit ASCII constraints.

#### Task: Register Interactive Terminal Duel Simulation Menu

- **Target File:** `apps/terminal/src/cns00/menus/duel-simulation.menu.ts`
- **Implementation:**
  - Register menu selections inside the Blessed interface (`apps/terminal`):
    - `[1] Simulate Opposed 2d6 Duel (Bog vs Wart)`
    - `[2] Toggle Strict Modifier Clamping [-2, +2]`
    - `[3] Inspect Volatile Staging Accumulator Buffer`
    - `[4] Force Backfire Social Inversion Override`
    - `[5] Execute Atomic SQLite Mutation Commit`
  - Connect menu items directly to `300.engine` unit action dispatchers.

### Phase VII: Mechanical Verification Suite

```plaintext
packages/300.engine/31.duel-math.unit/tests/
├── discrete-distribution.test.ts ◄── Exhaustive 1,296 combinatorial verification
├── modifier-clamp.test.ts        ◄── Strict [-2, +2] clamp boundary tests
├── taxonomy-classifier.test.ts   ◄── Classification tier threshold tests
├── backfire-override.test.ts     ◄── Stale leverage inversion tests
├── accumulator-staging.test.ts   ◄── Volatile staging rollback tests
└── atomic-mutation.test.ts       ◄── SQLite CAS commit and dirty flag tests
```

#### Task: Verify Discrete 1,296 Difference Distribution Curve

- **Target File:** `packages/300.engine/31.duel-math.unit/tests/discrete-distribution.test.ts`
- **Implementation:**
  - Enumerate all $36 \times 36 = 1{,}296$ ordered combinations of two independent $2\text{d}6$ rolls.
  - Assert exact combination counts and probabilities:
    - Margin $0$: exactly $146$ combinations ($11.27\%$)
    - Margin $\pm 1$: exactly $280$ combinations ($21.60\%$)
    - Margin $\pm 2$: exactly $250$ combinations ($19.29\%$)
    - Margin $\pm 3$: exactly $208$ combinations ($16.05\%$)
    - Margin $\pm 4$: exactly $160$ combinations ($12.35\%$)
    - Margin $\ge \pm 6$: exactly $140$ combinations ($10.80\%$)
  - Assert that near-parity outcomes ($\vert{}D\vert{} \le 2$) equal exactly $676 / 1296 = 52.16\%$.

#### Task: Verify Strict Modifier Clamping Invariants

- **Target File:** `packages/300.engine/31.duel-math.unit/tests/modifier-clamp.test.ts`
- **Implementation:**
  - Test input modifiers with values: $-5$, $-3$, $-2$, $0$, $+2$, $+3$, $+7$.
  - Assert that raw $+3$ clamps to $+2$ and raw $-4$ clamps to $-2$.
  - Assert that three stacked $+1$ modifiers result in $M_{\text{effective}} = +2$, not $+3$.

#### Task: Assert Taxonomy Classification Threshold Correctness

- **Target File:** `packages/300.engine/31.duel-math.unit/tests/taxonomy-classifier.test.ts`
- **Implementation:**
  - Assert margin $\Delta = 0$ classifies strictly as `'TRUE_TIE'`.
  - Assert margin $\Delta = 1$ and $\Delta = 2$ classify strictly as `'MUTUAL_WOUND'`.
  - Assert margin $\Delta = 3$ classifies strictly as `'COSTLY_WIN'`.
  - Assert margin $\Delta = 4$ with 0 Strings spent classifies strictly as `'CLEAN_WIN'`.
  - Assert margin $\Delta = 4$ with $\ge 2$ Strings spent downgrades to `'COSTLY_WIN'`.

#### Task: Validate Stale Grievance Backfire Inversion

- **Target File:** `packages/300.engine/31.duel-math.unit/tests/backfire-override.test.ts`
- **Implementation:**
  - Configure test encounter where winner rolled a net margin of $+5$ but spent a String on a stage 4 grievance.
  - Assert that outcome tier transitions to `'BACKFIRE'`.
  - Verify that nominal winner loses the String and receives the `'humiliated'` condition.

#### Task: Validate Volatile Accumulator Rollback Integrity

- **Target File:** `packages/300.engine/31.duel-math.unit/tests/accumulator-staging.test.ts`
- **Implementation:**
  - Populate staging accumulator with mock somatic and inventory transformations.
  - Dispatch abort command (`STAGE_PURGE`).
  - Verify that staging memory is zeroed out and zero mutations were dispatched to SQLite.

#### Task: Validate Atomic SQLite Mutation Commit State

- **Target File:** `packages/300.engine/31.duel-math.unit/tests/atomic-mutation.test.ts`
- **Implementation:**
  - Commit verified Bog vs. Wart outcome payload ($S_{28410}$ mutations).
  - Query `agent_state`: verify Bog's somatic strain increased by $+450\text{ bp}$.
  - Query `inventory_ledger`: verify Wart no longer holds `item_grease_bucket` and holder is floor seam.
  - Query `scene_manifests`: verify dependent downstream scenes have `is_dirty = 1`.

### You

{{FOCUS : FEATURE 3 ScenePlan IR Compilation & Dashboard Handoff}}

{{REPO : 000.series-sower-engine }}

{{PACKAGE: 300.engine}}

### Gemini

# Blueprint: ScenePlan IR Compilation and Dashboard Handoff

**Repository:** `000.series-sower-engine`

**Package:** `300.engine`

**Target Runtime:** Local Workstation (Rig 1 Node.js POSIX Environment)

**Control Surface:** Blessed Terminal Interface (`apps/terminal` / `cns00`)

**Architectural Scope:** Local Execution Development Cycle (Prior to Cloudflare Durable Objects Deployment)

### Phase I: ScenePlan Intermediate Representation Type Contracts

```plaintext
packages/300.engine/34.sceneplan.unit/
├── fce/
│   ├── sceneplan.interface.ts    ◄── Immutable ScenePlan IR, exit transitions, capability masks
│   └── sceneplan.bit.ts          ◄── Bit action contracts for serialization and verification
```

#### Task: Declare ScenePlan Schema Primitives

- **Target File:** `packages/300.engine/34.sceneplan.unit/fce/sceneplan.interface.ts`
- **Implementation:**
  - Import branded primitives `BasisPoints`, `CentiDecibels`, and `Sha256Hash` from `schemas/primitives.schema.ts`.
  - Define literal outcome unions matching discrete tabletop margin evaluations: `'CLEAN_WIN' | 'COSTLY_WIN' | 'MUTUAL_WOUND' | 'BACKFIRE' | 'TIE'`.
  - Define strict string identifier formats for `scene_id`, `episode_id`, `location_id`, and `grievance_id` using regex guards (`/^char_[a-z0-9_]+$/`, `/^loc_[a-z0-9_]+$/`).

#### Task: Declare Mandatory Exit Transition Types

- **Target File:** `packages/300.engine/34.sceneplan.unit/fce/sceneplan.interface.ts`
- **Implementation:**
  - Construct `MandatedExitConditions` interface:
    - `terminal_concession_by: string`
    - `condition_injected: Record<string, string>` (e.g., `{ "char_bog": "exhaustion_tier_1" }`)
    - `item_transferred: { readonly item_id: string; readonly from: string; readonly to: string } | null`
    - `spatial_displacements: Array<{ readonly agent_id: string; readonly target_coord_axial: readonly [number, number] }>`
    - `strain_deltas_bp: Record<string, BasisPoints>`

#### Task: Declare Biological Capability Resource Mask

- **Target File:** `packages/300.engine/34.sceneplan.unit/fce/sceneplan.interface.ts`
- **Implementation:**
  - Construct `SomaticCapabilityProfile` interface:
    - `arms_available: number` (Quantized integer where $10000 \equiv 1.0\text{ arm}$)
    - `mobility_class: 'NORMAL' | 'LIMPING' | 'IMMOBILE'`
    - `can_speak: boolean`
    - `banned_kinetic_verbs: readonly string[]`
  - Enforce compile-time type safety preventing optional omissions on critical limbs.

#### Task: Assemble Master ScenePlan IR Interface

- **Target File:** `packages/300.engine/34.sceneplan.unit/fce/sceneplan.interface.ts`
- **Implementation:**
  - Assemble top-level immutable contract `ScenePlanIR`:
    - `schema_version: '1.0.0'`
    - `scene_id: string`
    - `tick_origin: number`
    - `location_id: string`
    - `participants: readonly string[]`
    - `mechanical_outcome: OutcomeTier`
    - `mandated_winner: string`
    - `mandated_loser: string`
    - `margin: number`
    - `mandated_exit_conditions: MandatedExitConditions`
    - `capabilities: Record<string, SomaticCapabilityProfile>`
    - `state_merkle_root: string`

#### Task: Define ScenePlan Action Bit Envelopes

- **Target File:** `packages/300.engine/34.sceneplan.unit/fce/sceneplan.bit.ts`
- **Implementation:**
  - Declare bit commands: `SCENEPLAN_INIT`, `SCENEPLAN_COMPILE`, `SCENEPLAN_SEAL`, `SCENEPLAN_VERIFY`.
  - Construct typing resolvers in `ScenePlanBit.slv` validating transitions and error codes.

### Phase II: ScenePlan Compiler Engine

```plaintext
packages/300.engine/34.sceneplan.unit/
├── sceneplan.model.ts            ◄── In-memory ScenePlan model state container
├── sceneplan.action.ts           ◄── Pure compilation logic, RFC 8785 Merkle sealing
└── sceneplan.reduce.ts           ◄── Compilation state transitions
```

#### Task: Build Tabletop Outcome Mutation Mapper

- **Target File:** `packages/300.engine/34.sceneplan.unit/sceneplan.action.ts`
- **Implementation:**
  - Ingest mechanical resolution record from `31.duel-math.unit` and `33.accumulator.unit`.
  - Map `COSTLY_WIN` evaluation (Bog vs Wart) to mandatory state transitions:
    - Winner (`char_bog`): retains territorial seam, gains $+450\text{ bp}$ strain
    - Loser (`char_wart`): drops `item_grease_bucket` to floor seam, retreats into egress corridor
  - Assert that non-participating actors incur zero state mutations.

#### Task: Extract Dynamic Somatic Masks

- **Target File:** `packages/300.engine/34.sceneplan.unit/sceneplan.action.ts`
- **Implementation:**
  - Ingest actor profiles from frozen snapshot $S_{28410}$.
  - Compute available arm count subtracting impairment penalties: Wart has 1 available arm (`arms_available: 10000`).
  - Compile `banned_kinetic_verbs` array (`['bimanual_lift', 'sprint']`) preventing impossible motor execution.

#### Task: Serialize RFC 8785 Canonical JSON ScenePlan Contract

- **Target File:** `packages/300.engine/34.sceneplan.unit/sceneplan.action.ts`
- **Implementation:**
  - Sort all keys lexicographically by UTF-8 code point per RFC 8785 rules.
  - Eliminate dynamic timestamps and non-deterministic object key permutations.
  - Generate cryptographic plan digest:
    $$
    H_{\text{plan}} = \text{SHA-256}(\text{CanonicalJSON}(\text{ScenePlanIR})) \text{[cite: 1, 2, 4]}
    $$

#### Task: Construct ScenePlan Model State Container

- **Target File:** `packages/300.engine/34.sceneplan.unit/sceneplan.model.ts`
- **Implementation:**
  - Build `ScenePlanModel` holding compiled contracts, validation status, and emitted plan digests.
  - Provide immutable getters exposing deep-frozen plan payloads using `Object.freeze()`.

#### Task: Implement ScenePlan State Reducer

- **Target File:** `packages/300.engine/34.sceneplan.unit/sceneplan.reduce.ts`
- **Implementation:**
  - Route actions: `SCENEPLAN_INIT`, `SCENEPLAN_COMPILE`, `SCENEPLAN_SEAL`.
  - Ensure pure state returns without mutating prior generation snapshots.

### Phase III: Structured Attention Context Packaging

```plaintext
packages/300.engine/35.context.unit/
├── fce/
│   ├── context.interface.ts      ◄── Attention sandwich layout contracts, prompt envelope schemas
│   └── context.bit.ts            ◄── Action bits for context assembly
├── context.model.ts              ◄── Context payload buffer cache
├── context.action.ts             ◄── Pure 15/70/15 sandwich slicing logic
└── context.reduce.ts             ◄── Context assembly reducer
```

#### Task: Define Attention Sandwich Layout Contracts

- **Target File:** `packages/300.engine/35.context.unit/fce/context.interface.ts`
- **Implementation:**
  - Define structural sandwich interface `AttentionSandwichEnvelope`:
    - `top_anchor_percent: 15` (Hard invariant boundary constraints, somatic limits, exit rules)
    - `middle_bulk_percent: 70` (Elastic scene context, room description, historical subtext)
    - `bottom_anchor_percent: 15` (Imperative goal restatement, mandatory exit trigger, formatting rail)

#### Task: Declare Context Unit Action Bit Commands

- **Target File:** `packages/300.engine/35.context.unit/fce/context.bit.ts`
- **Implementation:**
  - Enumerate action bit commands: `CONTEXT_INIT`, `BUILD_TOP_ANCHOR`, `BUILD_MIDDLE_BULK`, `BUILD_BOTTOM_ANCHOR`, `ASSEMBLE_SANDWICH`.
  - Bind strong typing parameters for text and JSON context assembly.

#### Task: Construct Top Anchor Strict Invariant Header

- **Target File:** `packages/300.engine/35.context.unit/context.action.ts`
- **Implementation:**
  - Build the top 15% attention anchor containing immutable physical facts:
    - Location: `loc_warm_pipe` (Temperature: $4700\text{ bp}$, Ambient Noise: $1200\text{ cdB}$)
    - Somatic Masks: Wart single-armed (`arms_available: 1`), Bog fatigued
    - Equip Slots: Bog holds iron scraper, Wart holds grease bucket
    - Mandatory Exit: Wart must drop grease bucket and retreat

#### Task: Construct Middle Elastic Search Space Bulk

- **Target File:** `packages/300.engine/35.context.unit/context.action.ts`
- **Implementation:**
  - Assemble the middle 70% elastic exploration buffer:
    - Atmospheric background: Groaning pipes, cooling metal, shadows between rafters
    - Grievance history: `grv_tallow_scraping` (Unwashed scrapings, kitchen theft)
    - Subtextual posture: Bog territorial paranoia, Wart bitter exhaustion

#### Task: Construct Bottom Imperative Directive Footer

- **Target File:** `packages/300.engine/35.context.unit/context.action.ts`
- **Implementation:**
  - Assemble the bottom 15% attention anchor containing unyielding drafting rails:
    - Bog imperative command: "Crawl around the sump or drop the pail."
    - Wart exit concession: Concedes aggressively, kicks grease bucket, retreats into gap
    - Formatting rails: Fountain screenplay notation only; zero internal monologue

#### Task: Assemble Context Model and Reducer

- **Target Files:** `packages/300.engine/35.context.unit/context.model.ts`, `packages/300.engine/35.context.unit/context.reduce.ts`
- **Implementation:**
  - Manage multi-vector context payload in `ContextModel`.
  - Implement reducer processing `ASSEMBLE_SANDWICH` to emit deep-frozen string prompts ready for display or authoring handoff.

### Phase IV: Local POSIX File Bridge Handoff

```plaintext
packages/300.engine/36.bridge.unit/
├── fce/
│   ├── bridge.interface.ts       ◄── File handoff descriptors, staging paths
│   └── bridge.bit.ts             ◄── Bit commands for local file writes
├── bridge.model.ts               ◄── Bridge path registry, status container
├── bridge.action.ts              ◄── Atomic tmp-rename file operations
└── bridge.reduce.ts              ◄── Bridge state reducer
```

#### Task: Define Local Handoff Directory Structure

- **Target File:** `packages/300.engine/36.bridge.unit/fce/bridge.interface.ts`
- **Implementation:**
  - Define local staging paths under `000.series-sower-engine`:
    - Target ScenePlan IR path: `drafts/staging/scene_plan_ep101_sc04.json`
    - Target Prompt Context path: `drafts/staging/prompt_context_ep101_sc04.txt`
  - Define interface `BridgeStagingReceipt` tracking path, written byte size, and file SHA-256.

#### Task: Declare Bridge Action Bit Commands

- **Target File:** `packages/300.engine/36.bridge.unit/fce/bridge.bit.ts`
- **Implementation:**
  - Enumerate action bit commands: `BRIDGE_INIT`, `WRITE_STAGED_PLAN`, `ATOMIC_PROMOTE`, `PURGE_STAGING`.
  - Expose typed bit resolvers accepting `ScenePlanIR` and context payloads.

#### Task: Implement Atomic POSIX File Write Exchange

- **Target File:** `packages/300.engine/36.bridge.unit/bridge.action.ts`
- **Implementation:**
  - Write payload to ephemeral file: `drafts/staging/scene_plan_ep101_sc04.json.tmp_[UUID]`.
  - Execute atomic POSIX rename via `node:fs` `renameSync` to destination `scene_plan_ep101_sc04.json`.
  - Prevent partial-buffer reads by concurrent Astro SSR server processes.

#### Task: Construct Bridge Model and Reducer Dispatcher

- **Target Files:** `packages/300.engine/36.bridge.unit/bridge.model.ts`, `packages/300.engine/36.bridge.unit/bridge.reduce.ts`
- **Implementation:**
  - Store active file descriptors and write status in `BridgeModel`.
  - Wire reducer updating state upon successful file promotion.

### Phase V: Local HTTP Staging Endpoint Gateway

```plaintext
packages/300.engine/37.gateway.unit/
├── fce/
│   ├── gateway.interface.ts      ◄── HTTP route typings, intent schemas
│   └── gateway.bit.ts            ◄── Action bits for route dispatch
├── gateway.model.ts              ◄── Gateway connection state
├── gateway.action.ts             ◄── Local Node.js HTTP server handlers
└── gateway.reduce.ts             ◄── Gateway lifecycle reducer
```

#### Task: Define Gateway HTTP Endpoint Typings

- **Target File:** `packages/300.engine/37.gateway.unit/fce/gateway.interface.ts`
- **Implementation:**
  - Define request and response interfaces for local endpoints:
    - `GET /api/v1/sceneplan/active` $\implies$ returns active `ScenePlanIR`
    - `GET /api/v1/context/active` $\implies$ returns assembled 15/70/15 attention prompt
    - `POST /api/v1/screenplay/validate` $\implies$ accepts candidate Fountain text; evaluates exit conditions

#### Task: Declare Gateway Action Bit Envelopes

- **Target File:** `packages/300.engine/37.gateway.unit/fce/gateway.bit.ts`
- **Implementation:**
  - Enumerate action bit operations: `GATEWAY_START`, `GATEWAY_ROUTE`, `GATEWAY_STOP`.
  - Bind parameter resolvers for local loopback port configuration (default: `localhost:3000`).

#### Task: Implement Pure Local HTTP Route Handlers

- **Target File:** `packages/300.engine/37.gateway.unit/gateway.action.ts`
- **Implementation:**
  - Implement lightweight HTTP router using native `node:http`.
  - Handle `GET /api/v1/sceneplan/active` returning serialized `ScenePlanIR` with header `Content-Type: application/json`.
  - Handle `POST /api/v1/screenplay/validate` parsing Fountain text against required exit criteria:
    - Check if text mentions grease bucket dropped or kicked
    - Check if text asserts Wart retreating into corridor
    - Return validation error list if requirements are unfulfilled

#### Task: Build Gateway Model and Reducer

- **Target Files:** `packages/300.engine/37.gateway.unit/gateway.model.ts`, `packages/300.engine/37.gateway.unit/gateway.reduce.ts`
- **Implementation:**
  - Track active server instance, port bindings, and incoming request counts in `GatewayModel`.
  - Implement reducer handling server start, stop, and request logging.

### Phase VI: Blessed Terminal Plan Inspector Integration

```plaintext
apps/terminal/src/cns00/
├── views/
│   └── sceneplan-inspector.view.ts ◄── ASCII ScenePlan contract viewer
└── menus/
    └── sceneplan-control.menu.ts   ◄── Interactive terminal menu for plan compilation
```

#### Task: Build ScenePlan Inspector Terminal View

- **Target File:** `apps/terminal/src/cns00/views/sceneplan-inspector.view.ts`
- **Implementation:**
  - Construct Blessed box component rendering compiled `ScenePlan IR` telemetry:
    ```plaintext
    ┌────────────────────────────────────────────────────────────┐
    │ SCENEPLAN IR CONTRACT: EP101_SC04_TICK_28410               │
    │ Mechanical Tier: COSTLY_WIN (Bog over Wart)                │
    │ Mandated Exit: Wart drops item_grease_bucket -> floor_seam │
    │ Somatic Mask:  Wart available_arms = 1 (No bimanual lift)  │
    │ Top/Middle/Bottom Context: ASSEMBLED (15/70/15)            │
    │ Staging File:  drafts/staging/scene_plan_ep101_sc04.json   │
    │ Plan Digest:   4b89f2a1... (RFC 8785 Sealed)               │
    └────────────────────────────────────────────────────────────┘
    ```
  - Enforce clean 7-bit ASCII borders and formatting.

#### Task: Register Interactive Terminal ScenePlan Menu

- **Target File:** `apps/terminal/src/cns00/menus/sceneplan-control.menu.ts`
- **Implementation:**
  - Register menu selections inside Blessed interface (`apps/terminal`):
    - `[1] Compile ScenePlan IR from Frozen Snapshot`
    - `[2] Build 15/70/15 Attention Sandwich Context`
    - `[3] Export Staging Files to drafts/staging/`
    - `[4] Start Local Gateway HTTP Server (:3000)`
    - `[5] Validate Candidate Screenplay Exit Criteria`
  - Connect menu items directly to `300.engine` unit action dispatchers.

### Phase VII: Mechanical Verification Suite

```plaintext
packages/300.engine/34.sceneplan.unit/tests/
├── sceneplan-schema.test.ts      ◄── Zod schema validation and rejection tests
├── sceneplan-compiler.test.ts    ◄── Compiler accuracy against Stage 4 outcomes
├── attention-sandwich.test.ts    ◄── 15/70/15 budget and invariant tests
├── posix-bridge.test.ts          ◄── Atomic rename and file integrity tests
└── gateway-validation.test.ts    ◄── Local HTTP endpoint and validation tests
```

#### Task: Verify ScenePlan Zod Schema Validation

- **Target File:** `packages/300.engine/34.sceneplan.unit/tests/sceneplan-schema.test.ts`
- **Implementation:**
  - Assert that a valid `ScenePlanIR` parses cleanly without errors.
  - Inject unexpected properties; assert Zod `.strict()` throws validation errors.
  - Inject negative basis points or malformed IDs; assert parse failure.

#### Task: Verify ScenePlan Compilation Against Stage 4 Outcomes

- **Target File:** `packages/300.engine/34.sceneplan.unit/tests/sceneplan-compiler.test.ts`
- **Implementation:**
  - Feed `COSTLY_WIN` duel result into compiler action.
  - Assert that `mandated_winner === 'char_bog'` and `mandated_loser === 'char_wart'`.
  - Assert that `mandated_exit_conditions` includes dropping `item_grease_bucket`.
  - Assert that Wart's capability mask has `arms_available === 10000`.

#### Task: Verify 15/70/15 Attention Sandwich Structure

- **Target File:** `packages/300.engine/34.sceneplan.unit/tests/attention-sandwich.test.ts`
- **Implementation:**
  - Assemble full context payload.
  - Measure character and token counts across top, middle, and bottom sections.
  - Assert that top anchor explicitly includes physical invariants and somatic masks.
  - Assert that bottom anchor explicitly mandates the terminal concession.

#### Task: Validate POSIX Bridge Atomic File Exchange

- **Target File:** `packages/300.engine/34.sceneplan.unit/tests/posix-bridge.test.ts`
- **Implementation:**
  - Trigger `WRITE_STAGED_PLAN` to write test plan to disk.
  - Assert that destination file exists and contains valid JSON.
  - Assert that temporary `.tmp_*` file is cleaned up after atomic rename.
  - Verify file SHA-256 matches in-memory Merkle digest.

#### Task: Validate Local Gateway Route Endpoints

- **Target File:** `packages/300.engine/34.sceneplan.unit/tests/gateway-validation.test.ts`
- **Implementation:**
  - Start test HTTP server on ephemeral loopback port.
  - Execute `GET /api/v1/sceneplan/active`; assert `200 OK` and identical JSON body.
  - Execute `POST /api/v1/screenplay/validate` with valid screenplay; assert exit conditions pass.
  - Execute `POST /api/v1/screenplay/validate` with screenplay where Wart keeps bucket; assert validation fails with descriptive error.
