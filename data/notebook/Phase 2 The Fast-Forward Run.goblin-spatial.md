# Branch • Phase 2: The Fast-Forward Run

_Gemini · 8 messages · exported Oct 27, 2026_

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

{{FOCUS : Feature Multi-Scale Spatial Partitioning Engine}}

{{REPO : 000.goblin-spatial }}

{{PACKAGE: 301.spatial}}

@local-repo-task-list-with-package-00

### Gemini

### Blueprint: Multi-Scale Spatial Partitioning Engine Implementation

**Repository:** `000.goblin-spatial` **Package:** `packages/301.spatial` **Target Environment:** Local Development Workstation (Rig 1 Node.js POSIX Runtime) **Execution Surface:** Blessed Terminal Cockpit (`000.spatial.pvt.tsx` via `98.menu.unit`) **Deployment Strategy:** Strictly scoped to local offline execution ($T_0 = \$0.00$); edge worker hydration (`133.cloudflare`) is deferred to a subsequent blueprint.

### Phase I: Scale Boundary Type Definitions

```plaintext
packages/301.spatial/38.types.unit/
├── types.action.ts
├── types.buzzer.ts
├── types.model.ts
├── types.reduce.ts
├── types.unit.ts
└── fce/
    ├── partition-tier.interface.ts  ◄── Discriminated union scale boundary
    └── brand-tags.bit.ts            ◄── Nominal integer brand wrappers
```

#### Task: Define Scale Boundary Discriminated Union

- **Target File:** `packages/301.spatial/38.types.unit/fce/partition-tier.interface.ts`
- **Implementation Details:**
  - Construct the `EntitySpatialTier` discriminated union separating `STAGED_HOT`, `IN_TRANSIT_SPLINE`, `VOID_DORMANT`.
  - Enforce structural mutual exclusivity so an entity cannot simultaneously hold a packed thirty-two-bit axial cell coordinate alongside a regional transit edge identifier.

#### Task: Create Nominal Integer Brand Assertions

- **Target File:** `packages/301.spatial/38.types.unit/fce/brand-tags.bit.ts`
- **Implementation Details:**
  - Define unique symbol brand tags for `PackedAxialKey`, `UndirectedEdgeKey`, `BasisPoints`, `CentiDecibels`, `CentisecondTick`.
  - Implement runtime type-guard assertions verifying thirty-two-bit unsigned integer bounds without allocating heap strings.

#### Task: Build Deterministic Work Budget Envelopes

- **Target File:** `packages/301.spatial/03.laws.unit/fce/work-budget.bit.ts`
- **Implementation Details:**
  - Define the `WorkBudgetBit` interface pinning `maxCellsExpanded` to 512, `maxRaySteps` to 64, `maxQueueDepth` to 1,024.
  - Replace non-deterministic wall-clock timeouts with discrete step-counter decrements inside `03.laws.unit/buz/laws.buzz.ts`.

### Phase II: Tier One Tactical Hot Set Lattice

```plaintext
packages/301.spatial/
├── 28.axial.unit/
│   └── buz/axial.buzz.ts            ◄── Non-Euclidean axial distance math
├── 27.cells.unit/
│   └── buz/cells.buzz.ts            ◄── Spatial hash bucket O(1) lookup
├── 21.lattice.unit/
│   └── buz/lattice.buzz.ts          ◄── Doubled coordinate geometry & supercover
└── 17.observer.unit/
    └── buz/observer.buzz.ts         ◄── Perceptual horizon culling
```

#### Task: Implement Monotonic Bit Packing Operations

- **Target File:** `packages/301.spatial/21.lattice.unit/buz/lattice.buzz.ts`
- **Implementation Details:**
  - Implement `packAxial(q, r)` shifting signed sixteen-bit axial coordinates by $+32{,}768$ into a single unsigned thirty-two-bit integer key:
    $$
    \text{packAxial}(q, r) = ((q + 32768) \ll 16) \mid (r + 32768)
    $$
  - Implement reciprocal `unpackAxialQ(key)` alongside `unpackAxialR(key)` bit-shift extractors.

#### Task: Construct Doubled Coordinate Affine Geometry

- **Target File:** `packages/301.spatial/21.lattice.unit/buz/lattice.buzz.ts`
- **Implementation Details:**
  - Map pointy-top hexagons with circumradius $s = 2$ into doubled integer Cartesian coordinates $(cx, cy) = (4q + 2r, 6r)$.
  - Compute exact integer vertex offsets alongside exact edge midpoints without invoking `Math.sin` or `Math.cos`.

#### Task: Build Reciprocal Supercover Sightline Solver

- **Target File:** `packages/301.spatial/21.lattice.unit/buz/supercover.buzz.ts`
- **Implementation Details:**
  - Implement two-dimensional integer cross-product classification:
    $$
    \text{cross}(A, B, C) = (B_x - A_x)(C_y - A_y) - (B_y - A_y)(C_x - A_x)
    $$
  - Implement Cyrus-Beck rational cross-multiplication clipping to guarantee optical reciprocity $\text{hasLoS}(A, B) \equiv \text{hasLoS}(B, A)$ across all cell pairs.

#### Task: Implement Spatial Hash Bucket Adjacency Sweeps

- **Target File:** `packages/301.spatial/27.cells.unit/buz/cells.buzz.ts`
- **Implementation Details:**
  - Store active Tier 1 entity placements in a flat `Map<number, Set<string>>` indexed by packed thirty-two-bit axial keys inside `27.cells.unit/cells.model.ts`.
  - Execute constant-time $O(1)$ one-ring adjacency lookups inspecting the center bucket alongside its six immediate axial neighbors.

#### Task: Build Manhattan Perceptual Horizon Filter

- **Target File:** `packages/301.spatial/17.observer.unit/buz/observer.buzz.ts`
- **Implementation Details:**
  - Calculate non-Euclidean axial step distance inside `00.distance.unit/buz/distance.buzz.ts`:
    $$
    d_{\text{axial}}(A, B) = \max(\vert{}q_A - q_B\vert{}, \, \vert{}r_A - r_B\vert{}, \, \vert{}s_A - s_B\vert{})
    $$
  - Discard observer-target candidate pairs exceeding perceptual horizon $R_{\max} = 15$ cells prior to invoking supercover raycasting.

#### Task: Enforce Active Scene Dyadic Mesh Clamping

- **Target File:** `packages/301.spatial/01.location.unit/buz/location.buzz.ts`
- **Implementation Details:**
  - Clamp active tactical hot-set occupancy to $N_{\text{hot}} \le 12$ actors per site ($M \le 66$ dyadic channels).
  - Trigger budget-bounded Dijkstra flood-fill displacement inside `00.frontier.unit/buz/frontier.buzz.ts` when cell occupancy exceeds `maxAdultGoblins`.

### Phase III: Tier Two Analytical Spline Kinematics

```plaintext
packages/301.spatial/
├── 18.locomotion.unit/
│   ├── locomotion.model.ts          ◄── Rational spline state ledger
│   └── buz/locomotion.buzz.ts       ◄── Piecewise rational progress solver
├── 12.topology.unit/
│   └── buz/topology.buzz.ts         ◄── CSR typed-array regional graph
└── 22.incident.unit/
    └── buz/incident.buzz.ts         ◄── BigInt overtake convergence math
```

#### Task: Build Compressed Sparse Row Graph Loader

- **Target File:** `packages/301.spatial/12.topology.unit/buz/topology.buzz.ts`
- **Implementation Details:**
  - Represent macro corridor topologies using compact `Uint32Array` buffers (`edgeOffsets`, `targetNodes`, `baseCostUnits`) inside `12.topology.unit/topology.model.ts`.
  - Eliminate per-tick step simulation for `IN_TRANSIT_SPLINE` actors.

#### Task: Implement Rational Piecewise Progress Evaluator

- **Target File:** `packages/301.spatial/18.locomotion.unit/buz/locomotion.buzz.ts`
- **Implementation Details:**
  - Compute lazy analytical edge traversal progress across centisecond tick intervals $\Delta t$ using integer fixed-point scaling:
    $$
    \Delta P = \left\lfloor \frac{\Delta t \times 10^9}{C_{\text{edge}}} \right\rfloor
    $$
  - Preserve split-invariance across dynamic edge-cost multiplier transitions.

#### Task: Implement BigInt Bankers Rounding Division Utility

- **Target File:** `packages/301.spatial/00.kernel.unit/buz/kernel.buzz.ts`
- **Implementation Details:**
  - Implement pure `divRoundHalfEven(N: bigint, D: bigint): bigint` evaluating quotient $q = \lfloor N / D \rfloor$ alongside remainder $r = N \bmod D$.
  - Round to the nearest even integer when $2r = D$, preventing cumulative directional bias across long simulation horizons.

#### Task: Build Analytical Corridor Intercept Solver

- **Target File:** `packages/301.spatial/22.incident.unit/buz/incident.buzz.ts`
- **Implementation Details:**
  - Solve exact mid-edge convergence ticks for opposing or overtaking actors on shared corridor splines using sixty-four-bit `BigInt` arithmetic:
    $$
    t_{\text{meet}} = \text{divRoundHalfEven}\Big(D_A D_B + T_{A,\text{enter}} D_B + T_{B,\text{enter}} D_A, \; D_A + D_B\Big)
    $$
  - Emit deterministic intercept receipts into `11.events.unit` at the exact centisecond tick of collision.

### Phase IV: Tier Three Void Dormancy Management

```plaintext
packages/301.spatial/
├── 08.decay.unit/
│   ├── decay.model.ts               ◄── Unobserved site sleep records
│   └── buz/decay.buzz.ts            ◄── Closed-form algebraic catch-up
└── 14.port.unit/
    └── buz/port.buzz.ts             ◄── Zero-2PC portal scale handoff
```

#### Task: Build Unobserved Site Eviction Manager

- **Target File:** `packages/301.spatial/08.decay.unit/buz/decay.buzz.ts`
- **Implementation Details:**
  - Monitor site observer counts inside `01.location.unit`.
  - Evict spatial sites with zero active observers into `VOID_DORMANT` status inside `08.decay.unit/decay.model.ts`, recording `sleepStartTick` while burning zero per-tick CPU cycles.

#### Task: Implement Closed Form Algebraic Wake Catch Up

- **Target File:** `packages/301.spatial/08.decay.unit/buz/decay.buzz.ts`
- **Implementation Details:**
  - Compute elapsed dormancy ticks $\Delta t = T_{\text{wake}} - T_{\text{sleep}}$ when an actor crosses a portal into a sleeping site.
  - Apply closed-form linear basis-point decay in a single $O(1)$ integer calculation:
    $$
    \text{State}_{\text{wake}} = \max\Big(\text{Floor}_{\text{bp}}, \; \text{State}_{\text{sleep}} - (\text{Rate}_{\text{bp}} \times \Delta t)\Big)
    $$

#### Task: Implement Atomic Portal Scale Handoff Protocol

- **Target File:** `packages/301.spatial/14.port.unit/buz/port.buzz.ts`
- **Implementation Details:**
  - Manage zero-two-phase-commit transitions between `16.origin.unit` alongside `26.destination.unit` across portal cells.
  - Remove departing actors from the origin site spatial hash bucket prior to registering their `IN_TRANSIT_SPLINE` interval in `00.ledger.unit`.

### Phase V: Blessed Terminal Partition Cockpit

```plaintext
packages/301.spatial/
├── 000.spatial.pvt.tsx              ◄── Local terminal pivot entry
└── 98.menu.unit/                    ◄── New unit for Blessed TUI controls
    ├── menu.action.ts
    ├── menu.buzzer.ts
    ├── menu.model.ts
    ├── menu.reduce.ts
    ├── menu.unit.ts
    ├── buz/
    │   └── 00.menu.buzz.ts          ◄── Interactive partition menu handlers
    └── fce/
        └── menu.bit.ts
```

#### Task: Scaffold Spatial Menu Unit Structure

- **Target File:** `packages/301.spatial/98.menu.unit/menu.unit.ts`
- **Implementation Details:**
  - Create `98.menu.unit` inside `packages/301.spatial` mirroring the standard unit pattern (`menu.action.ts`, `menu.buzzer.ts`, `menu.model.ts`, `menu.reduce.ts`, `buz/00.menu.buzz.ts`, `fce/menu.bit.ts`).
  - Register `98.menu.unit` inside `packages/301.spatial/BEE.ts` so `sim.hunt` routes interactive terminal actions.

#### Task: Wire Partition Inspector Controls Into Blessed Menu

- **Target File:** `packages/301.spatial/98.menu.unit/buz/00.menu.buzz.ts`
- **Implementation Details:**
  - Expose selectable menu commands inside the Blessed Terminal Interface:
    - `[1] INSPECT TIER 1 HOT-SET BUCKETS (27.cells.unit)`
    - `[2] ADVANCE TIER 2 SPLINE KINEMATICS (18.locomotion.unit)`
    - `[3] TOGGLE TIER 3 VOID SLEEP / WAKE CATCH-UP (08.decay.unit)`
    - `[4] EXECUTE 8,190-PAIR SUPERCOVER ORACLE (21.lattice.unit)`
  - Dispatch each menu selection via `sim.hunt` without network calls.

#### Task: Render Real Time Partition Telemetry View

- **Target File:** `packages/301.spatial/000.spatial.pvt.tsx`
- **Implementation Details:**
  - Render a 7-bit ASCII terminal dashboard displaying live actor distribution across Tier 1 (`STAGED_HOT`), Tier 2 (`IN_TRANSIT_SPLINE`), Tier 3 (`VOID_DORMANT`).
  - Display active `WorkBudget` consumption counters alongside axial hex coordinates for local debugging.

### Phase VI: Local Hermetic Verification Suite

```plaintext
packages/301.spatial/test/
├── reciprocal-oracle.test.ts        ◄── 8,190-pair optical symmetry suite
├── spline-invariance.test.ts        ◄── Piecewise rational transit suite
└── void-awakening.test.ts           ◄── Algebraic catch-up parity suite
```

#### Task: Build Eight Thousand One Hundred Ninety Pair Reciprocity Test

- **Target File:** `packages/301.spatial/test/reciprocal-oracle.test.ts`
- **Implementation Details:**
  - Verify optical symmetry across all 8,190 ordered pairs within a radius-5 hex disk ($91\text{ cells}$) via `21.lattice.unit`.
  - Assert zero directional sightline discrepancies across randomized dynamic occluder overlays from `00.overlay.unit`.

#### Task: Build Spline Split Invariance Verification Test

- **Target File:** `packages/301.spatial/test/spline-invariance.test.ts`
- **Implementation Details:**
  - Assert that evaluating a 36,000-tick corridor transit in a single jump produces the exact same arrival tick as evaluating 360 steps of 100 ticks via `18.locomotion.unit`.
  - Verify `BigInt` overtake convergence accuracy at $T \ge 10^9$ centiseconds without precision loss.

#### Task: Build Void Algebraic Awakening Parity Test

- **Target File:** `packages/301.spatial/test/void-awakening.test.ts`
- **Implementation Details:**
  - Compare a dormant room woken at Tick 28,410 via single-step algebraic catch-up in `08.decay.unit` against an observed control room ticked iteratively 28,410 times.
  - Assert bit-identical basis-point state across both execution paths using `vitest run`.
