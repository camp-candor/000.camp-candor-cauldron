Here is the comprehensive task manifest to implement **Feature 3: Canon Ingestion & Relational Ledger Core (Stage 2)** for `worker-sower-engine` (also known as `series-sower-engine`).

This phase constructs the strict epistemological boundary of the engine. It establishes the read-only ingestion of static lore (compiled from markdown) and the dynamic, transactional ledger that tracks the mutable state of the world across narrative cycles[cite: 1, 2, 4].

---

### Epic: WORKER-SOWER-ENGINE INCEPTION & CORE SIMULATION ARCHITECTURE
#### Feature 3: Canon Ingestion & Relational Ledger Core (Stage 2)

#### Phase 1: Canon Ingestion & The Cryptographic Boundary
*   **[TASK-3.1.1] Scaffold the Ingestion Interface (`src/core/canon/bibleLoader.ts`):**
    *   *Detail:* Implement the `loadBibleState(seriesSlug)` function to read the pre-compiled `compiled/<seriesSlug>/bible-state.json` payload directly off disk[cite: 2, 6, 8].
    *   *Invariant Constraint:* Enforce the `deepFreeze<T>(obj: T)` helper upon ingestion. The runtime must treat this static data as strictly read-only, throwing a fatal `TypeError` if any downstream process attempts an illegal mutation[cite: 4].
*   **[TASK-3.1.2] Cryptographic $H_{\text{root}}$ Hash Verification:**
    *   *Detail:* Implement the hash-check protocol within the loader[cite: 1, 4, 8]. The loader must extract the `_meta.state_hash` (the Merkle root $H_{\text{root}}$) stamped in the JSON payload[cite: 1, 4].
    *   *D1 Gateway:* It must query the Cloudflare D1 `CANON_DB` to verify that the active database state is pinned to this exact $H_{\text{root}}$[cite: 4, 8].
    *   *Circuit Breaker:* If the hashes diverge, the engine must instantly flag `is_dirty = 1` and halt execution, guaranteeing no scenes are generated against un-synchronized canon[cite: 4, 18].
*   **[TASK-3.1.3] Dual-Rail Entity Mapping:**
    *   *Detail:* Ensure the loaded entities map cleanly to the Zod-verified "Machine Rail" (somatic bitmasks, logistical slots, $O(1)$ lookup ids) and the isolated "Voice Rail" (emotional state, tone notes) for selective prompt injection later[cite: 4].

#### Phase 2: Relational Ledger Data Definition (DDL)
*   **[TASK-3.2.1] Establish SQLite/D1 Schema Core (`src/core/ledger/schema.ts`):**
    *   *Detail:* Author the explicit schema defining the dynamic state of the world. This must include:
        *   `entities_live`: Tracking current spatial coordinates ($q, r$ hex positions or location IDs), and somatic trauma vectors (e.g., `paralyzed_arm`, `exhausted`)[cite: 2, 4, 8].
        *   `strings_ledger`: The directed graph tracking asymmetric social debt and leverage ("Strings") held between actors[cite: 2, 8].
        *   `grievance_status`: Escalation stage indices and active `cooldown_cycles` for unresolved conflicts[cite: 2, 8].
        *   `paranoia_clocks`: Integer-based "doom counters" mapping rising tension[cite: 2, 8].
*   **[TASK-3.2.2] Construct the Append-Only Event Log (`event_log`):**
    *   *Detail:* Define the `event_log` table to act as the immutable ledger of execution[cite: 2, 8].
    *   *Formalism:* This table must support the pure reduction function: $S_{n+1} = \mathcal{R}(S_n, E_n, \sigma_n)$, logging the event $E_n$, the resulting state hash, and the random seed $\sigma_n$[cite: 4, 8].

#### Phase 3: Transact & Mutate (The Pure Reducer Core)
*   **[TASK-3.3.1] Scaffold the Deterministic Reducer (`src/core/ledger/reducer.ts`):**
    *   *Detail:* Implement the pure function that calculates $S_{n+1}$[cite: 8]. It must accept an active state object and an event object, returning a completely new state object[cite: 4].
    *   *Invariant:* The reducer must execute with zero side-effects: no network calls, no `Date.now()`, and no non-deterministic math[cite: 4].
*   **[TASK-3.3.2] Build the Mutable Staging Accumulator:**
    *   *Detail:* Implement an in-memory RAM scratchpad. During mechanical duel resolution (Stage 4), all state mutations (injuries taken, strings spent) are staged here[cite: 4].
    *   *Atomic Flush:* Only after a conflict mathematically concludes and all invariants pass does the accumulator flush the final state $S_{n+1}$ to the persistent D1 ledger via an atomic SQL transaction[cite: 4].