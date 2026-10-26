# Ontology-Grounded RAG Architecture: 10-Phase Engineering Guide & Database Evaluation (Neo4j, TypeDB, TerminusDB)

An end-to-end systems engineering specification for building an ontology-grounded Retrieval-Augmented Generation (RAG) architecture for narrative worldbuilding. It contrasts graph database engines (Neo4j, TypeDB, TerminusDB) and details the 10-phase implementation sequence from paper schema to grounded LLM generation.

---

## 1. Graph Database Architectural Evaluation: Neo4j vs. TypeDB vs. TerminusDB

Selecting a database for a narrative world depends on whether the system prioritizes mature topological analytics, native symbolic reasoning, or version-controlled canon:

| Evaluation Axis | Neo4j (Property Graph) | TypeDB (PERA / Polymorphic) | TerminusDB (Document Graph) |
|---|---|---|---|
| **Data Model** | Labeled Property Graph (Nodes & Edges). | Polymorphic Entity-Relation-Attribute (PERA). | Schema-enforced JSON document store over RDF triples. |
| **Primary Strength** | Largest ecosystem, battle-tested tooling, Graph Data Science (GDS), Sigma.js. | Native subtyping & built-in deductive rule-inference engine. | Built-in Git-like version control (commit, branch, diff, merge, time-travel). |
| **Reasoning & Inference** | Lacks native rule inference; requires imperative Cypher/APOC scripts. | Declarative query-time rule derivation; updates in-memory automatically. | Schema validation and constraint enforcement; lacks native deductive reasoner. |
| **Traceability & Versioning** | External serialization to Git required (diffs on exports). | Manual schema migration; external versioning required. | Native triple-level diffing, conflict resolution, and branch merging. |
| **Ideal Project Role** | Massively interconnected networks, topological centrality, fast pathfinding. | Deep symbolic reasoning, dynamic faction hostilities, deriving implicit facts. | Multi-author collaborative worldbuilding, auditable retcons, canon branching. |

### Architectural Tradeoff Summary:
* **TypeDB:** Best fit when **fact-derivation and symbolic rule inference** are paramount. Its PERA model natively supports BFO-lite class hierarchies (`Continuant` $\rightarrow$ `Character`, `Faction`), and its rule engine infers implied facts at read-time without storing stale redundant edges.
* **TerminusDB:** Best fit when **traceability, retcon accountability, and branching canon** are paramount. Conflicts are resolved at the triple level with structured JSON patches, allowing writers to branch narrative canon (`main` vs. `alternate-timeline-draft`) and merge changes with automated conflict surfacing.
* **Neo4j:** Best fit for **mature ecosystem stability and topological analysis**. It provides the lowest operational risk, native graph algorithms (betweenness centrality, community detection), and seamless integration with TypeScript (`neo4j-driver`, `graphology`).

---

## 2. The Complete TypeScript/Node.js Technology Stack

```
[ Ingestion & Validation ]     Node.js + TypeScript (Zod schemas, Claude API chunk extractor)
           │
           ▼
[ Database & Reasoning ]       Neo4j (Property Graph) OR TypeDB (PERA Rules) OR TerminusDB (Git Graph)
           │
           ▼
[ Analytics & Topology ]       graphology + graphology-metrics (Centrality, Path Lengths, Clusters)
           │
           ▼
[ Retrieval Layer ]            Custom Cypher / TypeQL Parameterized Graph Traversals (Subgraphs)
           │
           ▼
[ Generation Layer ]           Claude API with Tool-Calling (Constrained strictly to graph subgraphs)
           │
           ▼
[ Playout & Frontend ]         React + Sigma.js (Interactive Graph View) + Next.js API Routes
```

---

## 3. The 10-Phase Build Sequence: Empty State to Fully Functional

```
Phase 0: Paper Schema ──────► Phase 1: DB & Constraints ────► Phase 2: Manual Seed (10-15 Nodes)
                                                                        │
Phase 5: DB Ingestion ◄────── Phase 4: Human Audit ◄───────── Phase 3: Map-Reduce Extraction
         │
         ▼
Phase 6: Topological Analysis (Centrality/Gaps) ──► Phase 7: Subgraph Retrieval (Tools)
                                                                        │
Phase 10: Canon Versioning & Maintenance ◄──────── Phase 9: API ◄───── Phase 8: Grounded Generation
```

### Phase 0: Schema Definition on Paper (Pre-Tooling)
* **Objective:** Formalize classes, properties, and relationships before provisioning databases.
* **Execution:**
  1. Define core entity types (`Character`, `Faction`, `Location`, `Event`, `Artifact`, `Era`).
  2. Partition entities under a BFO-lite top-level division: **Continuants** (persistent entities) vs. **Occurrents** (temporal events/processes).
  3. Specify directional relationship constraints (e.g., `BELONGS_TO: Character -> Faction`).
* **Exit Condition:** A written one-page specification hand-validated against 10–15 real story entities without logical contradictions.

### Phase 1: Database Initialization & Constraints
* **Objective:** Establish the empty graph container and enforce schema uniqueness.
* **Execution:**
  1. Provision a local instance or cloud cluster (Neo4j Aura, TypeDB Cloud, TerminusDB).
  2. Initialize the Node.js connection module (`db.ts`).
  3. Apply unique identifier constraints:
     ```cypher
     CREATE CONSTRAINT character_id_unique IF NOT EXISTS FOR (c:Character) REQUIRE c.id IS UNIQUE;
     CREATE CONSTRAINT faction_id_unique IF NOT EXISTS FOR (f:Faction) REQUIRE f.id IS UNIQUE;
     ```
* **Exit Condition:** Empty database running with unique constraints active; connection script executes `MATCH (n) RETURN count(n)` returning `0`.

### Phase 2: Manual Seed Data Verification (Mandatory Gate)
* **Objective:** Validate the schema against real data before executing automated extraction.
* **Execution:** Hand-author Cypher/TypeQL statements for the 10–15 entities mapped in Phase 0:
  ```cypher
  CREATE (k:Character {id: 'kael-ashwood', name: 'Kael Ashwood', species: 'Human', status: 'alive'})
  CREATE (f:Faction {id: 'ashfall-concordat', name: 'The Ashfall Concordat'})
  CREATE (k)-[:BELONGS_TO {since_era: 'the-sundering'}]->(f);
  ```
* **Exit Condition:** Queries return expected relationship paths; missing edges or property mismatches are corrected at zero architectural cost.

### Phase 3: Extraction Pipeline (Map-Reduce Engine)
* **Objective:** Convert freeform markdown archives into structured JSON chunks.
* **Execution:**
  1. Split the lore corpus into logical files (characters, locations, chapters).
  2. Execute the Phase 1 MAP prompt via Claude API per chunk, saving discrete JSON artifacts.
  3. Execute the Phase 2 REDUCE script to consolidate entities, merge shared relationships, and populate the `flags` array.
* **Exit Condition:** A unified JSON payload containing extracted entities, edges, and an explicit list of unmerged ambiguities and contradictions.

### Phase 4: Human Review & Ontological Drift Resolution
* **Objective:** Human showrunner arbitration of the `flags` array before database insertion.
* **Execution:** Resolve contradictions manually (e.g., deciding canonical dates, clarifying ambiguous duplicates). Update the JSON payload with authoritative decisions.
* **Exit Condition:** Consolidated JSON payload verified with zero unresolved flags, representing the canonical, clean narrative state.

### Phase 5: Database Ingestion
* **Objective:** Idempotent database population.
* **Execution:** Run parameterized `MERGE` queries (ensuring repeated runs do not duplicate nodes):
  ```typescript
  const entityQuery = `
    MERGE (e:${entity.type} {id: $id})
    SET e.name = $name, e.description = $description, e.status = $status
  `;
  await session.run(entityQuery, entity);
  ```
  * Ingest all entities first; ingest relationships second after all endpoint nodes exist.
* **Exit Condition:** Full narrative corpus live in the database, queryable via Cypher/TypeQL, matching Phase 4 validation.

### Phase 6: Analysis Layer (Topological & Lore-Shifter Diagnostics)
* **Objective:** Computational evaluation of narrative structure.
* **Execution:** Ingest graph topology into `graphology` and execute `graphology-metrics`:
  1. *Betweenness Centrality:* Detects **Lore-Shifters** (entities spanning multiple narrative layers).
  2. *Degree Centrality:* Identifies structural hubs.
  3. *Connected Components:* Detects isolated character clusters and orphaned subplots.
  4. *Average Path Length:* Measures small-world network density.
* **Exit Condition:** Automated diagnostic report detailing structural hubs, unlinked subplots, and topological balance.

### Phase 7: Subgraph Retrieval Layer (Grounding Harness)
* **Objective:** Replace vector similarity search with structured graph traversals.
* **Execution:** Author parameterized query modules returning scoped subgraphs:
  * *Entity Horizon:* Node properties plus 1-to-2-hop connected nodes and typed edges.
  * *Relational Path:* Shortest path between two specified entities.
  * *Temporal Slice:* All entities and events active during a designated `Era`.
* **Exit Condition:** Tested Node.js module that accepts entity IDs and returns structured subgraphs without LLM intervention.

### Phase 8: Grounded Generation Layer (The Tool-Calling Loop)
* **Objective:** Bind LLM generation strictly to retrieved graph facts.
* **Execution:**
  1. Expose Phase 7 retrieval functions as tool-calling targets to the LLM (Claude API).
  2. System prompt mandates calling retrieval tools prior to drafting and strictly prohibits asserting unverified entities.
  3. Post-generation validation pass checks output text against graph node registries, flagging hallucinated names.
* **Exit Condition:** Demonstrable grounding: querying unmapped lore returns *"Information not found in canonical graph"* rather than fabricated text.

### Phase 9: Orchestration & Application Interface
* **Objective:** Package the retrieval and generation pipeline into production endpoints.
* **Execution:** Wrap the pipeline in Next.js / Express API routes (`/api/narrative/generate`, `/api/lore/query`). Optionally deploy a React frontend using `Sigma.js` for interactive, force-directed graph exploration.
* **Exit Condition:** Usable HTTP endpoint accepting creative prompts and returning grounded, validated narrative outputs.

### Phase 10: Versioning & Continuous Maintenance
* **Objective:** Maintain long-term canon stability.
* **Execution:** Schedule automated graph serializations (Cypher dumps or JSON payloads) committed directly to Git for diffable versioning (or manage branches natively within TerminusDB). Ingest new lore strictly through Phases 3–5.
* **Exit Condition:** Fully auditable, version-controlled knowledge graph operating as the single source of truth for the franchise.