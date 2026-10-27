# Branch • Phase 1: Primordial Genesis

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

{{FOCUS : Phase 1: Primordial Genesis ($S_0$) at Tick 0 }}

@extreme-details

### Gemini

### Phase 1: Primordial Genesis ($S_0$) at Tick 0

In the transmedia engine's execution architecture, **Phase 1: Primordial Genesis ($S_0$) at Tick 0** represents the legislative, compile-time instantiation of the narrative universe. Before a single centisecond tick elapses, before continuous motion splines evaluate, and long before any generative neural network drafts dialogue or diffuses video plates, the universe is brought into existence at **zero computational and API cost ($T_0 = \$0.00$)**.

Reality is treated as code: authored in byte-exact, version-controlled Markdown dossiers, compiled via a non-networked three-pass gauntlet, and cryptographically sealed into an immutable, deep-frozen Merkle root digest ($H_{\text{root}}$).

```plaintext
========================================================================================================================
                                     PHASE 1: PRIMORDIAL GENESIS COMPILATION PIPELINE
========================================================================================================================
  Raw Source Dossiers (Git)                  Pass 1: Shape & Scalars                  Pass 2: Relational & DAG
 ┌───────────────────────────┐             ┌─────────────────────────┐             ┌─────────────────────────┐
 │ series.config.json        │             │ • Byte-0 Delimiter Check│             │ • Referential Integrity │
 │ /characters/*.md          │ ──────────► │ • Zod Schema Validation │ ──────────► │ • Portal Reciprocity    │
 │ /locations/*.md           │             │ • Basis-Point Clamping  │             │ • Somatic SAT Solvers   │
 │ /possessions/*.md         │             │ • Centi-Decibel Checks  │             │ • 3-Color DFS Cycle Det.│
 │ /grievances/*.md          │             │ • Banker's Rounding     │             │ • Topological Depth (δ) │
 └───────────────────────────┘             └─────────────────────────┘             └─────────────────────────┘
                                                                                                │
                                                                                                ▼
         Downstream Unlock & Ignition                  Dual-Emission Artifacts              Pass 3: Deterministic Seal
 ┌───────────────────────────────────────────┐    ┌───────────────────────────────────┐    ┌─────────────────────────┐
 │ • Astro Bus: Broadcast H_root             │    │ compiled/<slug>/                  │    │ • RFC 8785 Canonical JCS│
 │ • Flight Deck UI: Modules Unlock          │ ◄─ │ ├── bible-state.json (HEAD)       │ ◄─ │ • Unicode NFC Conformity│
 │ • D1 Ledger: Stamped with H_root          │    │ └── bible-state_<TIMESTAMP>.json  │    │ • SHA-256 H_root Minting│
 │ • Tick 0 State Matrix S_0 Deep-Frozen     │    └───────────────────────────────────┘    │ • Atomic Inode Rename   │
 └───────────────────────────────────────────┘                                             └─────────────────────────┘
========================================================================================================================
```

### 1. Foundational Philosophy & Constitutional Architecture

#### A. The Four Ontological Tiers

The architecture enforces a strict unidirectional causal pipeline: truth flows downstream, and backward contamination is mathematically prevented:

1. **Tier 1: Canon ($C$):** *"What is allowed to be true?"* Version-controlled physical laws, anatomical limitations, spatial layouts, and axiomatic constraints authored in Markdown dossiers with Byte-0 YAML frontmatter.
2. **Tier 2: Events ($E$):** *"What happened, and why?"* An append-only, chronologically ordered event ledger recording irreversible physical transitions, dice duels, and historical occurrences.
3. **Tier 3: State ($S$):** *"What is true right now?"* An ephemeral, materialized projection derived strictly by folding the historical event log over the primordial baseline:
  $$
  S_N = \text{fold}(\text{apply}_v, S_0, [E_1, E_2, \dots, E_N], \sigma) \text{}
  $$
4. **Tier 4: Media Projections ($M$):** *"What evidence did we render?"* Screenplay ASTs, 48 kHz acoustic stems, Remotion compositions, and broadcast frames. Media files are lossy projections that possess zero semantic authority over world truth.

#### B. The Refined Deletion Principle

The operational integrity of the universe rests on the **Deletion Principle**:

- **Model-Independent World Truth:** Narrative truth, spatial topology, somatic baselines, and unresolved debts exist independently of neural models. If every generative model, cloud worker, vector store, and SQLite/D1 database is wiped from existence, the universe survives intact in the Git commit history of the raw Markdown dossiers.
- **State as an Ephemeral Read-Cache:** `bible-state.json` and database working tables have zero independent legislative sovereignty. Deleting `compiled/` and re-running `scripts/compile.ts` reproduces the byte stream and Merkle root ($H_{\text{root}}$) identically.
- **The Brain-Death Axiom:** If the generative models are deleted, the world remains logically sound and mathematically executable in the ledger. If the ledger and canon dossiers are deleted, the universe suffers brain death, even if generative models continue streaming synthetic text and video.

#### C. The Zero-Dollar Pre-Flight Invariant ($T_0 = \$0.00$)

Before Phase 2 simulation or Phase 4 drafting executes, all structural contradictions, anatomical impossibilities, and cyclic narrative traps are caught at compile time. Compilation runs locally or in sandboxed CI without network calls, without LLM inference, and without GPU VRAM allocation.

### 2. The Source Ingress & The Byte-0 Frontmatter Law

Every canonical entity in `000.goblin-lore/` is declared as a dual-rail Markdown file adhering strictly to physical disk formatting requirements.

#### A. The Byte-0 Frontmatter Guarantee

Every dossier (`bog.md`, `wart.md`, `the_warm_pipe.md`, `grv_tallow_scraping.md`, `item_iron_scraper.md`) must open with the YAML delimiter `---` at **absolute physical byte index 0** (`0x2D 0x2D 0x2D`):

- **Prohibition of UTF-8 BOM:** Invisible Byte Order Marks (`0xEF, 0xBB, 0xBF`) cause standard POSIX parsers to misidentify the start of frontmatter, resulting in silent failures or parsing the configuration block as raw text. Files containing a BOM are rejected immediately with a fatal exit code.
- **Whitespace & Preamble Prohibitions:** Leading spaces, documentation headers, title comments (e.g., `# Bog Dossier`), or empty newlines before byte 0 trigger an immediate `SHAPE_VALIDATION` build halt.
- **POSIX Line Ending Enforcement:** All line endings must strictly normalize to POSIX line feeds (`\n`, `0x0A`). Windows-style CRLF (`\r\n`) sequences are rejected to avoid producing divergent cryptographic hashes across different developer operating systems.

#### B. The Dual-Rail Entity Contract

Every dossier is bifurcated into two mutually exclusive semantic rails:

1. **The Machine Rail (Byte-0 Frontmatter):** Rigid, typed key-value pairs evaluated by deterministic compilers and mathematical engines. Contains entity IDs, scalar bounds in integer basis points, physical slot allocations, foreign-key pointers, and dependency version locks.
2. **The Voice Rail (Markdown Prose Body):** Structured prose sections containing psychological subtext, sensory details, and dialect constraints. These sections are injected into director context windows to guide tone without bypassing mechanical rules:
  - `## Wants (surface)`: The tangible, immediate domestic objective.
  - `## Blind spot`: The character's core psychological delusion.
  - `## Voice notes`: Cadence instructions, monosyllabic constraints, and dialect markers.

- **Zero Citation Pollution:** The prose body must be clean of internal documentation markers or citation artifacts (e.g., reference brackets). An AST linter scans the text to prevent meta-commentary from leaking into generation prompts.
- **Zero Runtime Markdown Parsing:** Production simulation runtimes never read, parse, or import raw `.md` files. Engines ingest only deep-frozen, typed JSON snapshots derived during Pass 3[cite: 5].

### 3. The Primordial Seed Corpus ($S_0$ Entities)

At Tick 0, the universe instantiates five core seed records that form the baseline reality tuple $\langle \mathcal{S}, \mathcal{A}, \mathcal{I}, \mathcal{R} \rangle$ (Spaces, Agents, Items, Relations):

#### A. System Boundary Contract (`series.config.json`)

The environmental envelope and systemic friction coefficients for the universe are declared at the root:

```json
{
  "$schema": "../../schemas/series.config.schema.json",
  "series_slug": "under-the-floorboards",
  "version": 1,
  "simulation_clock": {
    "tick_rate_hz": 100,
    "centiseconds_per_tick": 1,
    "fast_forward_batch_limit": 100000
  },
  "pressures": {
    "scarcity_index_bp": 9200,
    "paranoia_baseline_bp": 7500,
    "max_farce_ratio_bp": 1500,
    "dialogue_ducking_ceiling_cdb": -1400
  },
  "spatial_defaults": {
    "cell_pitch_mm": 2000,
    "default_damping_cdb": 1500
  }
}
```

- `scarcity_index_bp`: Pinned at $9{,}200\text{ bp}$ ($92.0\%$), forcing scrap to remain scarce and driving resource competition.
- `paranoia_baseline_bp`: Set to $7{,}500\text{ bp}$ ($75.0\%$), establishing high baseline tension across all agents.
- `max_farce_ratio_bp`: Hard-capped at $1{,}500\text{ bp}$ ($15.0\%$), guaranteeing that comedic relief cannot exceed fifteen percent of scenes or undermine dramatic stakes.
- `dialogue_ducking_ceiling_cdb`: Set to $-1{,}400\text{ cdB}$ ($-14\text{ dB}$) to establish acoustic limits for future audio stems.

#### B. Spatial Anchor (`locations/loc_the_warm_pipe.md`)

Defines the origin node of the crawlspace topology:

```yaml
---
id: loc_the_warm_pipe
name: "The Warm Pipe"
room_type: crawlspace_junction
axial_coords: { q: 0, r: 0 }
capacity_limit: 2
thermal_baseline_bp: 6500
ambient_noise_floor_cdb: 1500
acoustic_damping_cdb: 2500
lighting_lux_bp: 15
portals:
  - target_location_id: loc_the_pantry_wall
    distance_cells: 2
    edge_damping_cdb: 3000
    is_passable: true
---
```

- **Acoustic Calibration:** Ambient noise floor is calibrated to $1{,}500\text{ cdB}$ ($15\text{ dB}$); edge damping to the pantry wall is set to $3{,}000\text{ cdB}$ ($30\text{ dB}$).
- **Capacity Constraint:** Capped at two occupants to prevent overcrowding in the narrow space.

#### C. Logistical Anchors (`possessions/*.md`)

Physical objects are modeled as concrete constraints that bind character motor capacity:

- **Iron Scraper (`item_iron_scraper.md`):**
  - Mass: $350\text{ grams}$.
  - Hand Demand: Occupies $1.0$ functional hands (`occupies_hands: 1.0`).
  - Physical Classification: Hardware/Tool.
  - Current Custody: Held in Bog's primary hand.
- **Grease Bucket (`item_grease_bucket.md`):**
  - Mass: $4{,}200\text{ grams}$ ($4.2\text{ kg}$) of cold iron and scrapings.
  - Hand Demand: Occupies $1.0$ functional hands (`occupies_hands: 1.0`).
  - Current Custody: Held in Wart's functional hand.

#### D. The Primary Agents (`characters/*.md`)

Agents are partitioned into the Tripartite State Vector: Somatic, Logistical, and Epistemic:

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TRIPARTITE AGENT STATE VECTORS AT TICK 0                                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CHAR_BOG:                                                                              │
│ • Somatic Vector:                                                                      │
│     arms_available: 2.0 | legs_available: 2.0 | locomotion: bipedal_hunched            │
│     fatigue_bp: 0 | pain_bp: 0 | strain_bp: 0                                          │
│     banned_kinetic_verbs: ["sprint", "vault", "leap"]                                  │
│ • Logistical Vector:                                                                   │
│     held_primary: item_iron_scraper (occupies: 1.0) | hand_saturation: 1.0 / 2.0        │
│ • Epistemic Vector:                                                                    │
│     paranoia_meter_bp: 2,400 | threshold_bp: 7,500 | decay_rate_bp: 50                │
│     mystery_culvert_siphon: TOTAL_IGNORANCE (Omission Firewall Active)                 │
│     leverage_strings: { char_wart: 1 }                                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CHAR_WART:                                                                             │
│ • Somatic Vector:                                                                      │
│     arms_available: 1.0 | legs_available: 2.0 | locomotion: bipedal_limping            │
│     somatic_debuff: cond_brachial_plexus_severed_left                                  │
│     fatigue_bp: 1,500 | pain_bp: 2,500 | strain_bp: 500                                │
│     banned_kinetic_verbs: ["bimanual_lift", "vault", "climb", "strangle"]              │
│ • Logistical Vector:                                                                   │
│     held_primary: item_grease_bucket (occupies: 1.0) | hand_saturation: 1.0 / 1.0 SAT   │
│ • Epistemic Vector:                                                                    │
│     paranoia_meter_bp: 4,000 | threshold_bp: 7,500 | decay_rate_bp: 50                │
│     mystery_culvert_siphon: TOTAL_IGNORANCE                                            │
│     leverage_strings: { char_bog: 0 }                                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### E. The Primordial Causal Spring (`grievances/grv_tallow_scraping.md`)

Narrative tension is modeled as a formal 9-tuple vertex $v \in \mathcal{V}_{\text{grv}}$:

$$
v = \langle \text{id}, [I_{\min}, I_{\max}], \mathcal{P}_{\text{pri}}, \mathcal{P}_{\text{can}}, \mathcal{P}_{\text{cannot}}, C_{\text{cycles}}, \text{decay}, \mathcal{R}_{\text{paths}}, \tau_{\text{farce}} \rangle \text{[cite: 7, 16]}
$$

- $\text{id}$: `grv_tallow_scraping`.
- $[I_{\min}, I_{\max}]$: Scaled between Stage 1 ($1{,}000\text{ bp}$) and Stage 4 ($8{,}000\text{ bp}$). At Tick 0, $I_{\text{curr}} = 2{,}000\text{ bp}$.
- $\mathcal{P}_{\text{pri}}$: Primary disputant dyad `['char_bog', 'char_wart']`.
- $\mathcal{P}_{\text{cannot}}$: `['char_mum_grissel']` (her presence silences the argument).
- $C_{\text{cycles}}$: $2\text{ episodes}$ mandatory cooldown after resolution.
- $\text{decay}$: Dissipates at $50\text{ bp}$ per idle cycle if unprovoked.
- $\mathcal{R}_{\text{paths}}$: Contains four mechanical resolution vectors (Clean Win, Costly Win, Mutual Wound, Catastrophic Backfire).
- $\tau_{\text{farce}}$: `false` (grounded dramatic conflict; no farce override permitted).
- **Escalation Linkage:** Its machine rail defines:
  ```yaml
  spawns_on_max_escalation:
    - type: grievance
      target_id: grv_hoarding_reveal
  ```
  Hitting the $8{,}000\text{ bp}$ ceiling will promote `grv_hoarding_reveal` into the active conflict pool.

### 4. The Three-Pass Offline Compilation Gauntlet (`scripts/compile.ts`)

Before `bible-state.json` can be emitted, source dossiers must clear the three-pass compilation harness:

```plaintext
/characters/*.md ──┐
/grievances/*.md ──┼─► [ PASS 1: SHAPES & SCALARS ] ─► [ PASS 2: RELATIONAL INTEGRITY ] ─► [ PASS 3: DETERMINISTIC SEAL ]
/locations/*.md  ──┤       (Zod Schemas & Basis Pts)          (Foreign Keys & DFS DAG)         (RFC 8785 JCS & H_root)
/possessions/*.md──┘                                                                                      │
                                                                                                          ▼
                                                                                              compiled/bible-state.json
```

#### Pass 1: Structural Shapes, Scalar Bounds & Somatic SAT Validation

1. **Zod Schema Parsing:** `gray-matter` extracts the frontmatter at byte 0 and executes validation through strict TypeScript schemas (`agent.schema.ts`, `spatial.schema.ts`, `debt.schema.ts`). Any unindexed property or schema deviation halts the build immediately with non-zero exit.
2. **Duplicate Identifier Rejection:** Entity IDs are indexed in an in-memory collision map; any collision between files throws an immediate `DUPLICATE_ID` fatal error.
3. **Integer Basis-Point Normalization:** Floating-point numbers are prohibited across canonical schemas to prevent cross-platform IEEE-754 rounding differences between AMD64 and ARM64 runtimes:
  - All ratios, probabilities, fatigue states, and severities are represented as integers:
    $$
    1.0 \equiv 10{,}000\text{ bp}, \quad 0.0001 \equiv 1\text{ bp} \text{[cite: 2, 6, 11]}
    $$
4. **Strict Centi-Decibels ($\text{cdB}$) Acoustic Standard:** Sound levels and structural dampening must evaluate as integer centi-decibels ($1\text{ dB} = 100\text{ cdB}$), preventing precision loss when calculating signal attenuation across successive barriers:
  $$
  I_{\text{arrival}} = I_{\text{source}} - \sum_{\text{edges}} D_{\text{edge}} \text{[cite: 34, 36]}
  $$
5. **Exact Banker's Rounding (Round-Half-Even):** Scalar math avoids floating-point operations by using integer division and explicit remainder evaluations:
  $$
  \text{Let } P = A \times B, \quad Q = \lfloor P / 10{,}000 \rfloor, \quad R = P \pmod{10{,}000} \text{[cite: 4, 12]}
  $$
  $$
  \text{Scale}(A, B) = \begin{cases} Q & \text{if } R < 5{,}000 \\  Q + 1 & \text{if } R > 5{,}000 \\  Q & \text{if } R = 5{,}000 \text{ and } Q \equiv 0 \pmod 2 \quad (\text{even}) \\  Q + 1 & \text{if } R = 5{,}000 \text{ and } Q \equiv 1 \pmod 2 \quad (\text{odd}) \end{cases} \text{[cite: 4, 12]}
  $$
  All chained multiplications enforce left-associativity: $\text{Scale}(\text{Scale}(A, B), C)$.
6. **Somatic Hand Capacity SAT Solver:** Physical load cannot exceed available limbs:
  $$
  \sum_{i \in \text{HeldItems}} \text{occupies\_hands}(i) \le \text{arms\_available} - \text{somatic\_penalties} \text{}
  $$
  For Bog: $1.0 \le 2.0 - 0.0 \implies \text{VALID}$. For Wart: $1.0 \le 2.0 - 1.0 \implies 1.0 \le 1.0 \implies \text{VALID (Saturated)}$. If Wart were assigned a second object, Pass 1 would halt with an anatomical over-allocation error.

#### Pass 2: Relational Topology & Grievance DAG Acyclicity

1. **Foreign-Key Closure Sweep:**
  - Validates that every item in `logistical.held_primary` exists in `possessions/`.
  - Asserts that `participants_primary` entries resolve to existing character dossiers in `characters/`.
  - Confirms that all room portals are reciprocal: if `loc_the_warm_pipe` links to `loc_the_pantry_wall`, the pantry must link back with matching physical damping coefficients:
    $$
    \Gamma(u \to v) = \Gamma(v \to u) \text{[cite: 7, 24]}
    $$
  - Any dangling reference triggers an immediate `RELATIONAL_INTEGRITY` Hard Fail.
2. **Three-Color Depth-First Search (DFS) Cycle Detection:** Grievance escalation spawn chains (`spawns_on_max_escalation`) form a directed graph $\mathcal{G} = (\mathcal{V}_{\text{grv}}, \mathcal{E}_{\text{spawn}})$. To prevent circular escalation loops ($A \to B \to A$), the compiler evaluates the graph using node coloring:
  - **WHITE (0):** Unvisited node.
  - **GRAY (1):** Node currently on the active recursion stack.
  - **BLACK (2):** Verified acyclic subtree[cite: 7, 12].

```typescript
function verifyGrievanceAcyclicity(graph: Map<string, string[]>): void {
  const visited = new Map<string, 'WHITE' | 'GRAY' | 'BLACK'>();
  for (const node of graph.keys()) visited.set(node, 'WHITE');

  function dfs(u: string, path: string[]): void {
    visited.set(u, 'GRAY');
    path.push(u);

    for (const v of graph.get(u) || []) {
      const state = visited.get(v);
      if (state === 'GRAY') {
        const cycle = [...path.slice(path.indexOf(v)), v].join(' -> ');
        throw new Error(`CYCLE_DETECTED: Infinite narrative escalation loop detected: ${cycle}`);
      }
      if (state === 'WHITE') {
        dfs(v, path);
      }
    }

    path.pop();
    visited.set(u, 'BLACK');
  }

  for (const node of graph.keys()) {
    if (visited.get(node) === 'WHITE') {
      dfs(node, []);
    }
  }
}
```

- **Confluent Diamonds Allowed:** Legitimate multi-path structures where two distinct disputes point to the same child grievance are confirmed valid, while back-edges targeting a `GRAY` node cause compilation to fail with `CYCLE_DETECTED`.
- **Topological Depth Assignment:** Every node is stamped with its depth:
  $$
  \delta(v) = \max_{(u, v) \in \mathcal{E}} (\delta(u) + 1), \quad \delta(\text{Genesis Root}) = 0 \text{[cite: 7, 16, 19]}
  $$

#### Pass 3: Deterministic Serialization, Merkle Root Derivation & Dual Emission

1. **Runtime Volatility Stripping:** The serialization pass strips all volatile environmental inputs, system clocks (`Date.now()`, `performance.now()`), and pseudo-random numbers (`Math.random()`).
2. **Unicode NFC Normalization:** All text strings are conformed to Unicode Normalization Form C (NFC). This eliminates encoding discrepancies between precomposed characters and decomposed multi-byte sequences that would otherwise alter cryptographic hashes across operating systems.
3. **RFC 8785 JSON Canonicalization Scheme (JCS):** All dictionary and object keys are sorted lexicographically by UTF-16 code units, and excess whitespace is stripped.
4. **Merkle Root Digest Calculation:** The canonical byte stream is hashed using SHA-256 to produce the state root digest:
  $$
  H_{\text{root}} = \text{SHA-256}(\text{RFC8785\_Canonicalize}(\text{bible-state.json})) \text{}
  $$
  This 64-character hexadecimal digest (e.g., `268e2c748c069601...`) is written directly into `metadata.corpusHash` inside `bible-state.json`.
5. **Same-Filesystem Atomic Inode Renames:** To prevent concurrent processes from reading half-written files, output is written to a temporary sibling file (`compiled/bible-state.json.tmp_[UUIDv7]`) on the same physical filesystem mount and committed via an atomic `fs.renameSync`.
6. **Dual-Emission Snapshots:** The compiler writes two distinct artifacts to disk:
  - `compiled/<slug>/bible-state.json`: The un-timestamped canonical HEAD consumed by downstream runtimes.
  - `compiled/<slug>/bible-state_<TIMESTAMP>.json`: An immutable WORM archive stamped with a Windows-safe ISO 8601 timestamp (`YYYY-MM-DDTHH-mm-ssZ`) committed to Git for historical replays[cite: 1, 7].
7. **In-Memory Deep-Freezing:** The resulting object graph in memory is sealed with recursive `Object.freeze()` calls, preventing accidental mutation during execution.

### 5. The Zero-Drift CI Tripwire & Invariant Verification Suite

To maintain continuity across episodes, repository health is enforced through a strict verification battery:

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ THE ZERO-DRIFT CI VERIFICATION BATTERY                                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 0: THE GOLDEN-FILE FAILURE BATTERY (Must pass before build tests run)           │
│ • Asserts that err_dangling_fk.md fails Pass 2 with RELATIONAL_INTEGRITY               │
│ • Asserts that err_cyclic_grievance.md fails Pass 2 with CYCLE_DETECTED                │
│ • Asserts that err_scalar_overflow.md fails Pass 1 with ZOD_BOUNDS_VIOLATION          │
│ • Asserts that err_bom_marker.md fails Pass 1 with BYTE_0_VIOLATION                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 1: COMPILATION & DRIFT TRIPWIRE                                                  │
│ • Sandboxed runner executes: scripts/compile.ts under pure offline isolation           │
│ • Executes: git diff --exit-code compiled/                                             │
│ • TRIPWIRE CONDITIONS:                                                                 │
│   - Condition A: Author changed /characters/*.md but failed to compile. Diff detected. │
│   - Condition B: Author edited bible-state.json manually. Re-compilation overwrites it;│
│     Git diff detected. Build fails.                                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: TRUSTED HARNESS OVERLAY                                                       │
│ • CI pipeline pulls schemas/, scripts/, and package.json directly from main            │
│ • Pull requests cannot bypass checks by altering compiler or Zod validation logic      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **The Drift Tripwire:** Running `git diff --exit-code compiled/` ensures that compiled state always matches source dossiers bit-for-bit. Any divergence fails CI immediately.
- **Golden-File Failure Suite:** Before validating clean inputs, the compiler must prove it rejects malformed inputs. It tests for syntax errors, missing foreign keys, circular DAGs, basis-point overflows, and BOM violations, ensuring tests cannot trivially pass due to loose validation logic.

### 6. State $S_0$ Instantiation & Downstream Subsystem Ignition

When compilation succeeds, `bible-state.json` is stamped and Phase 1 establishes the starting baseline for the universe ($t = 0$):

#### A. The Concrete State Matrix ($S_0$)

```json
{
  "_meta": {
    "corpusHash": "268e2c748c069601...",
    "schemaVersion": "1.0.0",
    "tick": 0,
    "status": "INITIALIZED"
  },
  "entities": {
    "characters": {
      "char_bog": {
        "spatial": { "location_id": "loc_the_warm_pipe", "coords": { "q": 0, "r": 0 } },
        "somatic": {
          "arms_available": 2,
          "legs_available": 2,
          "locomotion_tier": "BIPEDAL_HUNCHED",
          "somatic_strain_bp": 0,
          "banned_verbs": ["SPRINT", "VAULT", "LEAP"]
        },
        "logistical": {
          "held_primary": "item_iron_scraper",
          "worn_gear": { "belt": "item_scrap_pouch" }
        },
        "epistemic": {
          "paranoia_bp": 2400,
          "paranoia_baseline_bp": 2400,
          "ignorance_firewalls": ["mystery_culvert_siphon"],
          "strings": { "char_wart": 1 }
        }
      },
      "char_wart": {
        "spatial": { "location_id": "loc_the_pantry_wall", "coords": { "q": 2, "r": 0 } },
        "somatic": {
          "arms_available": 1,
          "legs_available": 2,
          "locomotion_tier": "BIPEDAL_LIMPING",
          "somatic_strain_bp": 500,
          "debuffs": ["cond_brachial_plexus_severed_left"],
          "banned_verbs": ["BIMANUAL_LIFT", "VAULT", "CLIMB", "STRANGLE"]
        },
        "logistical": {
          "held_primary": "item_grease_bucket",
          "worn_gear": {}
        },
        "epistemic": {
          "paranoia_bp": 4000,
          "paranoia_baseline_bp": 4000,
          "ignorance_firewalls": ["mystery_culvert_siphon"],
          "strings": { "char_bog": 0 }
        }
      }
    },
    "grievances": {
      "grv_tallow_scraping": {
        "participants": ["char_bog", "char_wart"],
        "intensity_bp": 2000,
        "escalation_ceiling_bp": 8000,
        "cooldown_ticks": 0,
        "status": "ACTIVE",
        "topological_depth": 0
      }
    },
    "locations": {
      "loc_the_warm_pipe": {
        "temperature_bp": 6500,
        "ambient_noise_cdb": 1500,
        "occupants": ["char_bog"]
      },
      "loc_the_pantry_wall": {
        "temperature_bp": 4200,
        "ambient_noise_cdb": 2200,
        "occupants": ["char_wart"]
      }
    }
  }
}
```

#### B. The Handshake with Downstream Runtimes

Once `bible-state.json` is validated and sealed, the compile-time genesis engine unlocks downstream systems:

1. **Astro Event Broadcast:** The compilation service issues an HTTP 201 response and broadcasts the new Merkle root ($H_{\text{root}}$) across the Astro event bus to all active dashboard components.
2. **Database Hash Synchronization:** Cloudflare D1 and Durable Object working stores ingest the sealed snapshot and synchronize their local canonical hash:
  $$
  \text{CANON\_DB.\_meta.state\_hash} \leftarrow H_{\text{root}} \text{[cite: 1, 2]}
  $$
  If an incoming request carries an outdated hash, the database flags `is_dirty = 1` and locks downstream dispatchers until the state is re-synchronized.
3. **Flight Deck UI Module Unlocking:** Dashboard modules that were previously inert (`goblin-corpus-health`, `goblin-somatic-hud`, `goblin-spatial-canvas`) ingest the sealed state, hydrate their interfaces, and display a green status indicator.
4. **Transition to Phase 2:** The dispatcher disarms its safety lockout (`DISPATCH_LOCKOUT = 0`), clearing the system to advance from the immutable Genesis state into **Phase 2: The Fast-Forward Run**.

### You

{{FOCUS : Phase 1: Primordial Genesis ($S_0$) at Tick 0 }}

@project-categories-00

### Gemini

Here is the detailed breakdown of the software project management Epic, Features, and Tasks for implementing **Phase 1: Primordial Genesis ($S_0$) at Tick 0**.

In the transmedia engine architecture you provided, these elements would be managed within the `@snailicid3/consumer-npm` and `000.goblin-lore` Git repositories.

### Epic: Phase 1 Primordial Genesis Baseline Execution

**Repository:** `000.goblin-lore` (for dossier authoring constraints) & `@snailicid3/consumer-npm` (for compiler execution)

**Description:** Implement the $T_0 = \$0.00$ compile-time instantiation of the narrative universe. This epic covers the creation of the offline, three-pass validation compiler that ingests Byte-0 Markdown dossiers, verifies structural and relational invariants, and seals the output into a deterministically hashed `bible-state.json` payload.

### Feature 1: Implement Byte-0 Markdown Dossier Ingestion

**Repository:** `@snailicid3/consumer-npm` (specifically `scripts/compile.ts`)

**Description:** Build the ingestion mechanism that strictly enforces the physical file formatting of all canonical source documents before passing them to the validation schemas.

#### Tasks:

- **Task 1.1: Develop YAML delimiter index verifier.** Write the parser logic to assert the YAML `---` sequence begins exactly at byte index 0.
- **Task 1.2: Build POSIX line ending normalizer.** Implement a scrubber to forcefully convert Windows-style `\r\n` (CRLF) endings to POSIX `\n` (LF) endings for cross-platform determinism.
- **Task 1.3: Create invisible character rejection trap.** Program the parser to detect UTF-8 Byte Order Marks (BOM), preceding spaces, or empty newlines before byte 0 and throw a fatal `SHAPE_VALIDATION` build halt.
- **Task 1.4: Develop dual-rail text extractor.** Implement the logic using `gray-matter` to split the file into the typed JSON "Machine Rail" (frontmatter) and the raw Markdown "Voice Rail" (body).
- **Task 1.5: Build citation pollution AST linter.** Create an AST scanner to sweep the Voice Rail Markdown body and fail the build if reference markers (e.g., ``) are detected.

### Feature 2: Construct Pass 1 Shape or Scalar Validator

**Repository:** `@snailicid3/consumer-npm` (`scripts/compile.ts`, `schemas/agent.schema.ts`, `schemas/spatial.schema.ts`, `schemas/debt.schema.ts`)

**Description:** Implement the first stage of the compiler gauntlet to validate data types, enforce basis-point integer clamping, and solve somatic hand capacity.

#### Tasks:

- **Task 2.1: Write Zod agent schema definitions.** Construct the strict TypeScript `agent.schema.ts` file to validate all character frontmatter fields against expected primitive types and enumerations.
- **Task 2.2: Write Zod spatial schema definitions.** Construct the strict TypeScript `spatial.schema.ts` file to validate location frontmatter fields, including acoustic damping centi-decibels.
- **Task 2.3: Write Zod debt schema definitions.** Construct the strict TypeScript `debt.schema.ts` file to validate grievance frontmatter fields, including escalation intensity bounds ($I_{\min} \le I_{\max} \in [1, 5]$).
- **Task 2.4: Implement integer basis point clamp.** Create the validation logic to reject floating-point numbers and verify all ratios or probabilities are represented as integers between 0 and 10,000.
- **Task 2.5: Build Banker's Rounding helper function.** Write a math utility utilizing Round-Half-Even logic for scalar calculations to prevent positive-bias drift.
- **Task 2.6: Develop duplicate ID rejection map.** Implement an in-memory collision map to index all entity IDs during parsing and trigger a `DUPLICATE_ID` fatal error if a collision occurs.
- **Task 2.7: Construct Somatic Hand Capacity SAT Solver.** Write the logic to evaluate `∑occupies_hands ≤ availableArms`, failing the build if a character's physical load exceeds their available limbs.

### Feature 3: Construct Pass 2 Relational or Topological Validator

**Repository:** `@snailicid3/consumer-npm` (`scripts/compile.ts`)

**Description:** Implement the second stage of the compiler gauntlet to traverse the entity graph, ensure referential closure, and guarantee causal acyclicity.

#### Tasks:

- **Task 3.1: Build foreign-key closure sweeper.** Write the graph traversal logic to verify every `location_id`, `character_id`, or `item_id` referenced in an inventory slot or grievance participant array resolves to an existing file.
- **Task 3.2: Implement dangling pointer exception handler.** Create the failure state logic to throw a `RELATIONAL_INTEGRITY` Hard Fail if the sweeper detects an orphaned reference.
- **Task 3.3: Develop spatial portal reciprocity checker.** Write the logic to ensure if Room A links to Room B with a specific edge damping coefficient, Room B must link back to Room A with the identical coefficient.
- **Task 3.4: Construct Three-Color DFS cycle detector.** Implement the Depth-First Search algorithm (using WHITE, GRAY, BLACK node coloring) to traverse `spawns_on_max_escalation` grievance chains.
- **Task 3.5: Build circular escalation loop exception handler.** Create the failure state logic to throw a `CYCLE_DETECTED` error and dump the exact path to `stderr` if the DFS encounters a back-edge to a GRAY node.

### Feature 4: Construct Pass 3 Deterministic Sealer

**Repository:** `@snailicid3/consumer-npm` (`scripts/compile.ts`)

**Description:** Implement the final stage of the compiler gauntlet to strip volatility, normalize data, and cryptographically seal the universe into a deterministically reproducible snapshot.

#### Tasks:

- **Task 4.1: Develop runtime volatility stripper.** Write the serialization pass logic to locate and strip non-deterministic inputs like `Date.now()` or `Math.random()`.
- **Task 4.2: Implement Unicode NFC string normalizer.** Build the string conformity step to convert all text into Unicode Normalization Form C.
- **Task 4.3: Build RFC 8785 JSON Canonicalization sorter.** Write the logic to sort all dictionary or object keys lexicographically by UTF-16 code units.
- **Task 4.4: Construct SHA-256 Merkle Root hasher.** Implement the cryptographic pass to hash the canonical byte stream and generate the 64-character $H_{\text{root}}$ digest.
- **Task 4.5: Develop atomic POSIX rename writer.** Build the save operation to write output to a temporary sibling file (`compiled/bible-state.json.tmp_[UUID]`) and execute `fs.renameSync`.
- **Task 4.6: Implement in-memory deep-freezer.** Write the recursive `Object.freeze()` wrappers to seal the resulting object graph in memory for downstream runtimes.
- **Task 4.7: Build dual-emission archiver.** Configure the output to save both the `bible-state.json` active HEAD and a timestamped immutable WORM archive (`bible-state_<TIMESTAMP>.json`).

### Feature 5: Implement CI/CD Zero-Drift Tripwire Battery

**Repository:** `@snailicid3/consumer-npm`

**Description:** Build the automated verification suite to run in the CI pipeline, ensuring the compiled state never drifts from the authored markdown source and that the compiler correctly rejects malformed inputs.

#### Tasks:

- **Task 5.1: Create Git diff exit code assertion.** Write the CI step `git diff --exit-code compiled/` to fail the build instantly if the compiled JSON diverges from the source dossiers.
- **Task 5.2: Build relational integrity failure test case.** Write the golden-file test asserting `err_dangling_fk.md` fails Pass 2 with a `RELATIONAL_INTEGRITY` error.
- **Task 5.3: Build cyclic grievance failure test case.** Write the golden-file test asserting `err_cyclic_grievance.md` fails Pass 2 with a `CYCLE_DETECTED` error.
- **Task 5.4: Build scalar overflow failure test case.** Write the golden-file test asserting `err_scalar_overflow.md` fails Pass 1 with a `ZOD_BOUNDS_VIOLATION` error.
- **Task 5.5: Build byte-0 delimiter failure test case.** Write the golden-file test asserting `err_bom_marker.md` fails Pass 1 with a `BYTE_0_VIOLATION` error.

### You

{{FOCUS : Feature 1: Implement Byte-0 Markdown Dossier Ingestion}}

{{REPO : 000.goblin-lore }}

{{PACKAGE: 299.lore}}

@local-repo-task-list-with-package-00

### Gemini

Here is the localized Blueprint for implementing **Feature 1: Implement Byte-0 Markdown Dossier Ingestion** within the `000.goblin-lore` repository.

This plan leverages the package structure visualized in "2026-10-26 23_27_32-.png", ensuring all logic resides in explicit units (such as `[41.canon.unit]` or `[98.menu.unit]`) rather than a generic `src/` directory. It focuses strictly on local development capabilities before moving to edge deployment.

### Phase 1: Local File Ingestion Architecture

This phase establishes the physical formatting constraints required to ingest raw markdown dossiers safely.

- **Task 1.1: Initialize File System Scanner Module**
  - Create a local file traversal utility inside `[41.canon.unit]` of the `299.lore` package.
  - Configure the scanner to strictly target `.md` files within the local lore directories.
- **Task 1.2: Construct Byte-Zero Verification Trap**
  - Implement the parser logic within `[24.primordial.unit]` to assert that the YAML `---` sequence begins exactly at byte index 0.
  - Configure this trap to throw a `SHAPE_VALIDATION` build halt if the condition fails.
- **Task 1.3: Develop POSIX Line Ending Scrubber**
  - Write a normalizer inside `[41.canon.unit]` to convert Windows-style CRLF sequences to POSIX LF sequences.
  - Ensure this scrubber executes locally prior to any cryptographic hashing.
- **Task 1.4: Implement Unicode Marker Rejection Logic**
  - Program the parser to detect invisible UTF-8 Byte Order Marks (BOM).
  - Configure the system to reject files containing preceding spaces or empty newlines before byte 0.

### Phase 2: Dual-Rail Parsing Implementation

This phase handles the structural separation of machine-readable data from human-authored prose.

- **Task 2.1: Integrate Frontmatter Extraction Dependency**
  - Implement `gray-matter` within `[22.payload.unit]` to split incoming files into two distinct segments.
- **Task 2.2: Isolate Machine Rail YAML**
  - Extract the strict key-value pairs from the frontmatter block for downstream Zod schema validation.
  - Route this extracted payload to `[26.schema.unit]`.
- **Task 2.3: Isolate Voice Rail Prose**
  - Extract the Markdown body containing the psychological subtext.
  - Ensure the prose is correctly appended under generated headers like `## Wants (surface)`.
- **Task 2.4: Build Abstract Syntax Tree Citation Linter**
  - Develop an AST scanner inside `[41.canon.unit]` to sweep the Voice Rail Markdown body.
  - Configure the linter to fail the local build if reference markers or citation artifacts are detected.

### Phase 3: Blessed Terminal Menu Hooks

This phase exposes the ingestion tools to the human operator via the interactive curses-based Terminal User Interface (TUI).

- **Task 3.1: Construct TUI Ingestion Panel**
  - Navigate to `[98.menu.unit]` as referenced in "2026-10-26 23_27_32-.png".
  - Create a new interactive menu view allowing local authors to trigger the dossier ingestion pipeline.
- **Task 3.2: Wire Scrubber Execution Command**
  - Link the POSIX normalization module to a selectable menu item inside the TUI.
- **Task 3.3: Wire Linter Execution Command**
  - Link the AST citation scanner to a selectable menu item inside the TUI for manual prose verification.

### Phase 4: Local Dry-Run Validation

This phase ensures the ingestion engine correctly rejects malformed inputs locally without requiring cloud compute.

- **Task 4.1: Scaffold Golden-Failure Test Fixtures**
  - Create deliberate malformed markdown fixtures inside the local testing directory.
  - Include a fixture with a BOM marker to test the `BYTE_0_FAIL` exit code.
- **Task 4.2: Execute Local CLI Validation Suite**
  - Run the offline compilation gauntlet against the test fixtures.
  - Verify the local engine successfully halts the build upon encountering syntax violations.

### You

{{FOCUS : Feature 2: Construct Pass 1 Shape or Scalar Validator}}

{{REPO : 000.goblin-lore }}

{{PACKAGE: 299.lore}}

@local-repo-task-list-with-package-00

### Gemini

Here is the localized Blueprint for implementing **Feature 2: Construct Pass 1 Shape or Scalar Validator** within the `000.goblin-lore` repository.

This plan leverages the package structure visualized in "2026-10-26 23_27_32-.png", ensuring all logic resides in explicit units (such as `[26.schema.unit]` or `[98.menu.unit]`) rather than a generic `src/` directory. It focuses strictly on local development capabilities before moving to edge deployment.

### Phase 1: Local Somatic Vector Validation

This phase establishes the strict Zod contracts and validation logic for character anatomy and physical limitations.

- **Task 1.1: Construct Somatic Zod Definitions**
  - Create `agent.schema.ts` inside `[26.schema.unit]` of the `299.lore` package.
  - Define the `SomaticVectorSchema` to enforce `locomotion_baseline`, `motor_limitations`, and `active_conditions`.
- **Task 1.2: Implement Basis-Point Quantization**
  - Write the validation logic inside `[26.schema.unit]` to clamp floating-point severities (e.g., $0.0 \le s \le 1.0$) to integer basis points ($0 \le x \le 10{,}000$).
- **Task 1.3: Build Banker's Rounding Utility**
  - Implement the Round-Half-Even rounding function inside `[41.canon.unit]` to process scalar calculations.

### Phase 2: Local Logistical Vector Validation

This phase enforces constraints on equipment slots and physical load capacities.

- **Task 2.1: Construct Logistical Zod Definitions**
  - Expand `agent.schema.ts` inside `[26.schema.unit]` to include `LogisticalVectorSchema`.
  - Define exact equipment slots (`worn`, `held`, `carried`, `cached`) and `weight_class` enums.
- **Task 2.2: Develop Somatic Hand Capacity SAT Solver**
  - Write the SAT solver logic inside `[41.canon.unit]` to evaluate limb capacity arithmetic: $\sum h \le 2.0 - \text{penalty}$.
  - Configure the solver to throw a fatal anatomical over-allocation error if physical load exceeds available limbs.

### Phase 3: Local Epistemic Vector Validation

This phase defines the schemas for character relationships and grievance escalation ceilings.

- **Task 3.1: Construct Epistemic Zod Definitions**
  - Create `debt.schema.ts` (or expand existing `grievance.schema.ts`) inside `[26.schema.unit]`.
  - Define the `EpistemicVectorSchema` to enforce relationship parameters (`leverage_strings`, `strings_held_over`).
- **Task 3.2: Implement Escalation Ceiling Clamps**
  - Write the validation logic inside `[26.schema.unit]` to ensure escalation intensities fall strictly within integer bounds ($1 \le c \le 5$ or $I_{\min} \le I_{\max}$).

### Phase 4: Blessed Terminal Menu Hooks

This phase exposes the Pass 1 validation tools to the human operator via the interactive curses-based Terminal User Interface (TUI).

- **Task 4.1: Construct TUI Validation Panel**
  - Navigate to `[98.menu.unit]` as referenced in "2026-10-26 23_27_32-.png".
  - Create a new interactive menu view allowing local authors to manually trigger the Pass 1 Zod validation.
- **Task 4.2: Wire Somatic SAT Solver Execution Command**
  - Link the `[41.canon.unit]` SAT solver to a selectable menu item inside the TUI for manual limb capacity checks.

### Phase 5: Local Dry-Run Validation

This phase ensures the Pass 1 engine correctly rejects mathematically impossible inputs locally.

- **Task 5.1: Scaffold Golden-Failure Test Fixtures**
  - Create deliberate malformed markdown fixtures inside the local testing directory (e.g., `err_scalar_overflow.md`).
- **Task 5.2: Execute Local CLI Validation Suite**
  - Run the Pass 1 validation gauntlet against the test fixtures.
  - Verify the local engine successfully throws `ZOD_BOUNDS_VIOLATION` errors when encountering illegal scalars or overloaded inventory slots.

### You

{{FOCUS : Feature 3: Construct Pass 2 Relational or Topological Validator}}

{{REPO : 000.goblin-lore }}

{{PACKAGE: 299.lore}}

@local-repo-task-list-with-package-00

### Gemini

### Blueprint: Feature 3 — Construct Pass 2 Relational or Topological Validator

**Repository:** `000.goblin-lore`

**Package:** `299.lore`

**Focus:** Pass 2 Relational Integrity, Cross-Corpus Foreign Keys, Spatial Reciprocity, and Grievance DAG Acyclicity

### Phase 1: Relational Pointer Integrity Architecture

This phase constructs the cross-corpus reference validation engine to verify that every identifier declared across characters, possessions, grievances, and locations exists in the active corpus.

- **Task 1.1: Build Inventory Ownership Resolution Mechanism**
  - Implement reference resolution logic inside `packages/299.lore/25.relation.unit/fce/relation.action.ts`.
  - Assert that all entity slugs declared in character equipment slots (`held`, `worn`, `carried`, `cached`) resolve to valid descriptors in `packages/299.lore/15.item.unit`.
  - Assert that reverse pointers (`item.owner`, `item.contested_by`) resolve to valid identifiers in `packages/299.lore/02.character.unit`.
- **Task 1.2: Implement Epistemic Leverage Anti-Reflexivity Filter**
  - Write directional debt validation inside `packages/299.lore/17.leverage.unit/fce/leverage.action.ts`.
  - Validate that character entries in `epistemic.strings_held_over` point to existing actors in `packages/299.lore/02.character.unit`.
  - Enforce the anti-reflexivity invariant asserting that no character holds leverage over themselves (`char_id !== target_id`).
- **Task 1.3: Construct Entity Retirement Status Gate**
  - Implement lifecycle status checks inside `packages/299.lore/32.status.unit/fce/status.action.ts`.
  - Block active entities, encounters, or leverage strings from targeting entities carrying the `retired` or `DEPRECATED_ARCHIVED` lifecycle state.
- **Task 1.4: Develop Dangling Pointer Hard Fail Exception Handler**
  - Implement terminal error reporting inside `packages/299.lore/25.relation.unit/buz/relation.buzz.ts`.
  - Halt offline compilation with an immediate `RELATIONAL_INTEGRITY` failure code whenever an unindexed identifier is encountered.

### Phase 2: Bidirectional Spatial Topology Verification

This phase implements the spatial invariant checker to enforce reciprocal navigation portals and symmetric acoustic boundary damping.

- **Task 2.1: Construct Portal Pair Reciprocity Inspector**
  - Implement portal matching algorithms inside `packages/299.lore/23.port.unit/fce/port.action.ts`.
  - Validate that whenever Room A defines an exit portal targeting Room B, Room B declares a corresponding entry portal targeting Room A.
- **Task 2.2: Implement Acoustic Edge Damping Symmetry Comparator**
  - Write physical boundary verification logic inside `packages/299.lore/01.location.unit/fce/location.action.ts`.
  - Assert that bidirectional portal links maintain identical acoustic damping values in centi-decibels ($\Gamma(u \to v) = \Gamma(v \to u)$) to prevent directional sound decay anomalies.
- **Task 2.3: Build Spatial Graph Reachability Traversal Engine**
  - Implement Breadth-First Search (BFS) graph reachability inside `packages/299.lore/01.location.unit/buz/location.buzz.ts`.
  - Confirm that all non-void location nodes form a single connected component starting from the origin hub `loc_the_warm_pipe`.
- **Task 2.4: Develop Disconnected Room Island Exception Trap**
  - Implement topological defect trapping inside `packages/299.lore/01.location.unit/fce/location.reduce.ts`.
  - Halt compilation with exit code 1 if any orphan room island exists outside global graph reachability.

### Phase 3: Causal Grievance Directed Acyclic Graph Validation

This phase constructs the causal acyclicity validator and longest-path depth assignor across grievance escalation spawn chains.

- **Task 3.1: Construct Typed Grievance Spawn Adjacency Builder**
  - Implement adjacency list generation inside `packages/299.lore/13.grievance.unit/fce/grievance.action.ts`.
  - Extract `spawns_on_max_escalation` target links and construct the directed graph adjacency map $\mathcal{G} = (\mathcal{V}_{\text{grv}}, \mathcal{E}_{\text{spawn}})$.
  - Enforce typed target references (`grievance`, `secret`, `world_event`) while rejecting untyped cross-domain identifiers.
- **Task 3.2: Implement Three-Color Depth-First Traversal Engine**
  - Write the traversal algorithm inside `packages/299.lore/41.canon.unit/fce/canon.action.ts`.
  - Maintain distinct states for unvisited nodes (`WHITE`), active recursion stack members (`GRAY`), and verified subtrees (`BLACK`).
  - Permit confluent diamond dependencies while tracking active path stacks.
- **Task 3.3: Build Circular Escalation Loop Exception Handler**
  - Construct cycle exception dumping inside `packages/299.lore/41.canon.unit/buz/canon.buzz.ts`.
  - Halt execution with `CYCLE_DETECTED` and output the full recursive loop slice (e.g., $A \to B \to C \to A$) to `stderr` whenever a back-edge to a `GRAY` node is detected.
- **Task 3.4: Develop Longest Path Topological Depth Assignor**
  - Implement topological depth calculation inside `packages/299.lore/10.escalation.unit/fce/escalation.reduce.ts`.
  - Assign integer depth $\delta(v) = 1 + \max_{(u, v)} \delta(u)$ with $\delta(\text{root}) = 0$ using dynamic programming.
  - Enforce narrative runway rules by asserting that peak climax nodes achieve depth $\delta \ge 2$.

### Phase 4: Blessed Terminal Interface Integration

This phase exposes the Pass 2 relational and topological validation tooling to local developers via the curses-based Blessed Terminal User Interface.

- **Task 4.1: Construct Relational Validation TUI Form Panel**
  - Create the interactive Blessed form screen in `packages/299.lore/98.menu.unit/fce/menu.model.ts`.
  - Display real-time verification status for foreign keys, spatial portals, and grievance chains.
- **Task 4.2: Wire Topological Reciprocity Inspection Menu Action**
  - Connect the spatial portal reciprocity inspector from `23.port.unit` to a selectable action inside `packages/299.lore/98.menu.unit/buz/menu.buzz.ts`.
  - Render edge damping mismatch warnings and disconnected room identifiers directly in the terminal interface viewport.
- **Task 4.3: Wire Escalation Cycle Detection Menu Action**
  - Connect the Three-Color DFS cycle detector from `41.canon.unit` to a selectable action inside `packages/299.lore/98.menu.unit/fce/menu.action.ts`.
  - Display the detected recursive cycle trace or confirm DAG acyclicity inside the Blessed status window.

### Phase 5: Local Offline Dry-Run Test Harness

This phase establishes the offline test fixtures and Vitest execution suite to verify that Pass 2 fails closed before any cloud compute or runtime simulation is engaged.

- **Task 5.1: Scaffold Dangling Foreign Key Failure Fixture**
  - Create test input `val/fixtures/err_dangling_fk.md` containing an equip slot pointing to a non-existent item ID.
  - Assert that running the Pass 2 validator results in a `RELATIONAL_INTEGRITY` exit status.
- **Task 5.2: Scaffold Asymmetric Portal Failure Fixture**
  - Create test input `val/fixtures/err_asymmetric_portal.md` defining an unreciprocated spatial link.
  - Assert that the topological inspector halts compilation with a reciprocity violation.
- **Task 5.3: Scaffold Circular Grievance Escalation Failure Fixture**
  - Create test inputs `val/fixtures/err_cyclic_grievance.md` defining a circular spawn chain ($G_1 \to G_2 \to G_1$).
  - Assert that the Three-Color DFS algorithm halts compilation with `CYCLE_DETECTED`.
- **Task 5.4: Execute Local Pass Two Test Suite**
  - Configure `vitest.config.ts` to run the Pass 2 test battery across `packages/299.lore/val/`.
  - Confirm that valid corpus configurations pass cleanly with zero network calls and zero unhandled rejections.

### You

{{FOCUS : Feature 4: Construct Pass 3 Deterministic Sealer}}

{{REPO : 000.goblin-lore }}

{{PACKAGE: 299.lore}}

@local-repo-task-list-with-package-00

### Gemini

### Blueprint: Feature 4 — Construct Pass 3 Deterministic Sealer

**Repository:** `000.goblin-lore`

**Package:** `299.lore`

**Focus:** Pass 3 Serialization Purity, RFC 8785 Canonical JSON Sorting, Unicode NFC Normalization, SHA-256 Merkle Root Minter, Atomic POSIX Persistence, and In-Memory Deep Freezing

### Phase 1: Local Serialization Purity Enforcement

This phase eliminates volatile runtime noise, ambient system clocks, and character encoding divergences across operating system runtimes.

- **Task 1.1: Construct Runtime Volatility Stripper Module**
  - Implement ambient parameter scrubbing logic inside `packages/299.lore/41.canon.unit/fce/canon.action.ts`.
  - Strip non-deterministic primitives including `Date.now()`, `performance.now()`, `Math.random()`, and dynamic wall-clock timestamps (`new Date().toISOString()`) from the compiled state graph.
  - Intercept calls to mutable runtime environment flags (`process.env`) during the sealing pass.
- **Task 1.2: Build Unicode NFC Normalization Routine**
  - Implement string canonicalization routines inside `packages/299.lore/22.payload.unit/fce/payload.action.ts`.
  - Convert all character dialogue prompts, location descriptions, and string identifiers to Unicode Normalization Form C (NFC).
  - Eliminate encoding discrepancies between precomposed characters and decomposed multi-byte sequences across developer workstations.
- **Task 1.3: Implement Lexicographical Key Sorter Utility**
  - Write recursive object key sorting algorithms inside `packages/299.lore/22.payload.unit/fce/payload.reduce.ts`.
  - Sort all dictionary keys strictly by UTF-16 code units ($a < b \implies -1; a > b \implies 1; 0$).
  - Preserve authored array element sequence to prevent disrupting causal narrative order.

### Phase 2: Cryptographic State Seal Generation

This phase packages the normalized state matrix into a content-addressed envelope and mints the universal root digest ($H_{\text{root}}$).

- **Task 2.1: Construct RFC 8785 Canonical Byte Stream Serializer**
  - Implement the JSON Canonicalization Scheme (JCS) serializer in `packages/299.lore/31.state.unit/fce/state.action.ts`.
  - Serialize normalized object dictionaries directly into whitespace-minified UTF-8 byte buffers.
  - Strip trailing newlines and extraneous space characters from the final serialization buffer.
- **Task 2.2: Implement SHA-256 Merkle Root Hasher**
  - Write cryptographic hashing logic inside `packages/299.lore/24.primordial.unit/fce/primordial.action.ts`.
  - Hash the canonical byte stream using SHA-256 to generate the 64-character lowercase hexadecimal root digest ($H_{\text{root}}$):
    $$
    H_{\text{root}} = \text{SHA-256}(\text{CanonicalJCS}(S_0)) \text{[cite: 4, 10, 14]}
    $$
- **Task 2.3: Build Metadata Corpus Hash Binder**
  - Implement root metadata binding inside `packages/299.lore/31.state.unit/fce/state.reduce.ts`.
  - Stamp the minted $H_{\text{root}}$ into the `_meta.corpusHash` field of the state container.
  - Inject semantic ontology versioning (`schemaVersion: "1.0.0"`) and total entity population counts into the envelope.

### Phase 3: Resilient Filesystem Atomic Persistence

This phase manages safe disk persistence through POSIX atomic operations and dual-emission archival snapshots without corrupting concurrent readers.

- **Task 3.1: Construct Temporary Sibling Buffer Writer**
  - Implement staged disk writes inside `packages/299.lore/41.canon.unit/buz/canon.buzz.ts`.
  - Write the serialized payload to an isolated temporary sibling file on the identical physical filesystem mount (`compiled/<seriesSlug>/bible-state.json.tmp_[UUIDv7]`).
  - Enforce POSIX file permissions (`0o644`) on the target output buffer.
- **Task 3.2: Implement POSIX Atomic Inode Rename Operative**
  - Implement atomic file replacement inside `packages/299.lore/31.state.unit/buz/state.buzz.ts`.
  - Execute `fs.renameSync` to atomically swap the temporary buffer into the target file (`compiled/<seriesSlug>/bible-state.json`).
  - Prevent partial reads by external processes and downstream watcher daemons.
- **Task 3.3: Build Dual Emission Historical Archive Dispatcher**
  - Implement archival snapshot branching inside `packages/299.lore/41.canon.unit/fce/canon.reduce.ts`.
  - Emit an immutable WORM artifact (`compiled/<seriesSlug>/bible-state_<TIMESTAMP>.json`) with filesystem-safe ISO 8601 formatting alongside the active canonical HEAD.
- **Task 3.4: Construct In-Memory Recursive Deep Freeze Sealer**
  - Implement memory protection utilities inside `packages/299.lore/31.state.unit/fce/state.model.ts`.
  - Seal the in-memory object graph using recursive `Object.freeze()` wrappers to block subsequent runtime modifications.
  - Assert that any down-funnel property reassignment triggers an immediate `TypeError`.

### Phase 4: Blessed Terminal Interface Integration

This phase exposes the Pass 3 deterministic sealing pipeline to local developers through the interactive curses-based Terminal User Interface (TUI).

- **Task 4.1: Construct Terminal Sealing Form Panel**
  - Implement the sealing status view inside `packages/299.lore/98.menu.unit/fce/menu.model.ts`.
  - Display real-time verification indicators for normalization, key ordering, and root digest calculation.
- **Task 4.2: Wire Sealing Execution Menu Action**
  - Connect the Pass 3 serialization compiler to a selectable action inside `packages/299.lore/98.menu.unit/buz/menu.buzz.ts`.
  - Print the generated 64-character $H_{\text{root}}$ digest and file size metrics directly to terminal output `cns00`.
- **Task 4.3: Wire Hash Audit Inspection Menu Action**
  - Connect the state verification checker to an interactive menu option in `packages/299.lore/98.menu.unit/fce/menu.action.ts`.
  - Compare the computed memory hash against the persisted disk snapshot to report drift discrepancies directly in the console.

### Phase 5: Local Offline Sealing Verification Suite

This phase builds offline unit tests and deterministic integrity checks using Vitest before running any cloud or simulation workloads.

- **Task 5.1: Scaffold Volatile Property Injection Failure Fixture**
  - Create a test fixture in `packages/299.lore/val/fixtures/err_volatile_clock.json` containing an illegal `Date.now()` timestamp.
  - Assert that the Pass 3 compiler halts execution with a purity violation error.
- **Task 5.2: Scaffold Key Insertion Variance Fixture**
  - Create test fixtures with scrambled dictionary key orders in `packages/299.lore/val/fixtures/scrambled_keys.json`.
  - Assert that RFC 8785 canonical key sorting transforms divergent inputs into byte-identical serialized output.
- **Task 5.3: Build Cross Platform Hash Determinism Test**
  - Write a deterministic reproducibility test inside `packages/299.lore/val/hunt.ts`.
  - Verify that repeated compilation passes across different directory locations produce identical SHA-256 $H_{\text{root}}$ hashes.
- **Task 5.4: Execute Local Vitest Sealing Battery**
  - Configure `packages/299.lore/val/vitest.config.ts` to execute all sealing test suites.
  - Assert complete test coverage for Unicode NFC conformance, atomic file replacement, and frozen in-memory references with zero network requests.

### You

{{FOCUS : Feature 5: Implement CI/CD Zero-Drift Tripwire Battery}}

{{REPO : 000.goblin-lore }}

{{PACKAGE: 299.lore}}

@local-repo-task-list-with-package-00

### Gemini

### Blueprint: Feature 5 — Implement CI/CD Zero-Drift Tripwire Battery

**Repository:** `000.goblin-lore`

**Package:** `299.lore`

**Focus:** CI/CD Zero-Drift Tripwires, Golden-File Mutation Batteries, Deletion Assertion Verification, and Anti-Gaming Overlays

### Phase 1: Golden File Negative Control Suite

This phase constructs the mutation testing suite to verify that the compiler fails closed with non-zero exit codes when presented with invalid markdown input.

- **Task 1.1: Scaffold Schema Bounds Overflow Fixture**
  - Create the test input fixture `packages/299.lore/val/fixtures/golden_failures/err_scalar_overflow.md`.
  - Inject an out-of-bounds basis point integer ($10{,}001\text{ bp}$) into character frontmatter.
  - Configure `packages/299.lore/val/hunt.ts` to assert a fatal `ZOD_BOUNDS_VIOLATION` compilation halt.
- **Task 1.2: Scaffold Dangling Foreign Key Fixture**
  - Create the test input fixture `packages/299.lore/val/fixtures/golden_failures/err_dangling_fk.md`.
  - Inject an inventory slot reference pointing to a non-existent item slug.
  - Assert that Pass 2 execution terminates with a fatal `RELATIONAL_INTEGRITY` error code.
- **Task 1.3: Scaffold Cyclic Escalation Graph Fixture**
  - Create the test input fixtures `packages/299.lore/val/fixtures/golden_failures/err_cyclic_grievance.md`.
  - Declare a circular grievance escalation dependency loop ($A \to B \to A$).
  - Assert that the Three-Color DFS cycle detector terminates with exit code 1 and logs `CYCLE_DETECTED`.
- **Task 1.4: Scaffold Byte Zero Delimiter Breach Fixture**
  - Create the test input fixture `packages/299.lore/val/fixtures/golden_failures/err_bom_marker.md`.
  - Prepend a UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`) before the opening frontmatter delimiter.
  - Assert that the byte scanner in `packages/299.lore/24.primordial.unit/fce/primordial.action.ts` throws `BYTE_0_VIOLATION`.
- **Task 1.5: Build Negative Control Assertion Runner**
  - Implement the mutation harness in `packages/299.lore/41.canon.unit/fce/canon.action.ts`.
  - Execute the compilation gauntlet sequentially against all negative fixtures.
  - Assert that 100% of negative control inputs fail closed before running positive build suites.

### Phase 2: Local Git Drift Tripwire Engine

This phase implements the automated tripwire checking mechanisms to detect uncompiled markdown modifications or manual JSON mutations.

- **Task 2.1: Implement Local Working Tree Diff Inspector**
  - Create git workspace inspection logic inside `packages/299.lore/31.state.unit/fce/state.action.ts`.
  - Execute the equivalent of `git diff --exit-code compiled/` through a local child process.
  - Trap non-zero exit codes to detect modifications in compiled output artifacts.
- **Task 2.2: Build Stale Canon Detection Logic**
  - Implement filesystem modification timestamp comparators in `packages/299.lore/31.state.unit/buz/state.buzz.ts`.
  - Evaluate if authorial source markdown files possess commit or modification timestamps newer than `compiled/bible-state.json`.
  - Flag uncompiled canon drift immediately to halt local test pipelines.
- **Task 2.3: Build Spoofed Snapshot Mutation Detector**
  - Implement re-compilation overwrite assertions in `packages/299.lore/41.canon.unit/buz/canon.buzz.ts`.
  - Re-run the three-pass compiler against the active workspace into a temporary buffer.
  - Detect if a contributor hand-edited `compiled/bible-state.json` directly to bypass schema bounds without updating source markdown.
- **Task 2.4: Construct Atomic Git Exit Code Reporter**
  - Implement process exit coordination inside `packages/299.lore/31.state.unit/fce/state.reduce.ts`.
  - Map uncommitted drift directly to process exit code 1 to block local git pre-commit hooks.
  - Emit formatted 7-bit ASCII status logs to standard error upon drift detection.

### Phase 3: Deletion Principle Reconstruction Harness

This phase establishes the offline test harness to verify that deleting derived snapshots allows full, byte-identical reconstruction strictly from raw git markdown dossiers.

- **Task 3.1: Construct Local Cache Purge Operative**
  - Implement filesystem removal logic in `packages/299.lore/41.canon.unit/fce/canon.reduce.ts`.
  - Safely delete local transient caches, intermediate indexes, and the entire `compiled/` directory.
  - Verify zero leftover build residues remain on the local disk partition.
- **Task 3.2: Implement Offline Reconstruction Pipeline**
  - Create clean-room execution scripts in `packages/299.lore/scripts/deletion_check.ts`.
  - Trigger full multi-pass compilation from cold storage targeting only source dossiers.
  - Measure reconstruction execution duration in local CPU centiseconds.
- **Task 3.3: Build Merkle Root Parity Comparator**
  - Implement hash comparison routines in `packages/299.lore/24.primordial.unit/buz/primordial.buzz.ts`.
  - Compare the freshly generated $H_{\text{root}}$ SHA-256 digest against the historical baseline.
  - Assert bit-for-bit equivalence between reconstructed snapshots and original artifacts.
- **Task 3.4: Construct Hermetic Network Isolation Guard**
  - Implement socket interception logic inside `packages/299.lore/val/BEE.ts`.
  - Verify that the compilation harness executes with zero outbound TCP sockets and zero cloud requests ($T_0 = \$0.00$).
  - Throw a fatal build violation if any network connection attempt occurs.

### Phase 4: Trusted Harness Overlay Shield

This phase implements anti-gaming protections that enforce schema and test immutability during pull request evaluations.

- **Task 4.1: Implement Workspace Protected Path Guard**
  - Create repository boundary inspection logic inside `packages/299.lore/03.laws.unit/fce/laws.action.ts`.
  - Scan git file lists to identify changes targeting protected infrastructure files (`package.json`, `tsconfig.json`, `schemas/`).
  - Reject pull requests attempting to weaken validator rules or loosen TypeScript bounds.
- **Task 4.2: Construct Anti Gaming Test Restoration Routine**
  - Implement test directory synchronization in `packages/299.lore/03.laws.unit/buz/laws.buzz.ts`.
  - Forcefully overwrite candidate `val/` directories with authoritative tests from the `main` branch before execution.
  - Prevent automated agents or external contributors from passing checks by modifying unit test assertions.
- **Task 4.3: Build Configuration Immutability Validator**
  - Create configuration fingerprint checkers in `packages/299.lore/03.laws.unit/fce/laws.model.ts`.
  - Verify that `vitest.config.ts` and test runner settings match repository master hashes.
  - Halt the evaluation pipeline if test execution parameters have been altered.

### Phase 5: Blessed Terminal Tripwire Menu Integration

This phase surfaces the zero-drift tripwire battery, golden failure tests, and reconstruction runners directly to local developers through the Blessed curses interface.

- **Task 5.1: Construct Terminal Tripwire Status Model**
  - Create the UI state definition inside `packages/299.lore/98.menu.unit/fce/menu.model.ts`.
  - Track active statuses for git drift, golden failure tests, and deletion principle verification.
  - Format pass, warning, and failure metrics using clean 7-bit ASCII terminal characters.
- **Task 5.2: Wire Golden Failure Battery Menu Action**
  - Connect the negative control suite from `41.canon.unit` to a selectable action in `packages/299.lore/98.menu.unit/buz/menu.buzz.ts`.
  - Display individual test results for bounds, foreign keys, cyclic graphs, and byte zero markers directly in the TUI.
- **Task 5.3: Wire Drift Verification Menu Action**
  - Connect the local working tree diff inspector to an interactive command in `packages/299.lore/98.menu.unit/fce/menu.action.ts`.
  - Render diff summaries and uncompiled file warnings directly to the Blessed interface viewport.
- **Task 5.4: Wire Deletion Reconstruction Menu Action**
  - Connect the offline reconstruction pipeline to a dedicated menu action in `packages/299.lore/98.menu.unit/fce/menu.unit.ts`.
  - Execute the purge and rebuild sequence on command, outputting the newly stamped SHA-256 root hash to the console screen.
