# Applied Ontology Foundations: BFO-Lite Metaphysics, IP Strategy & Deductive Rule Engines (TypeDB, Datalog, LinkML)

A foundational architectural, metaphysical, legal, and computational specification evaluating Basic Formal Ontology (BFO) within narrative worldbuilding, analyzing intellectual property (IP) protection mechanisms for ontologies, and contrasting deductive reasoning frameworks (TypeDB, Datalog, LinkML, TypeScript, Prolog, ASP).

---

## 1. BFO-Lite for Fictional Universes: Continuants vs. Occurrents

Basic Formal Ontology (BFO) is an upper-level ontology authored in OWL, widely adopted in scientific domains (OBO Foundry) to prevent ontological silos. For fictional worldbuilding, wholesale BFO adoption is an anti-pattern, but its foundational dichotomy provides an indispensable skeleton:

```
                              [ BFO TOP-LEVEL ]
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
        [ CONTINUANTS ]                                [ OCCURRENTS ]
 (Persist through time; wholly                (Unfold across time; exist
  present at any given moment)                 in temporal stages/parts)
  ├── Independent: Character, Artifact,        ├── Process / Event: Battle,
  │   Location, Species                            Coronation, Journey
  └── Dependent: Role (King), Disposition      └── Bounded Span: Era, Reign,
      (Curse, Tendency), Quality (Color)           Timeline Slice
```

### A. What to Steal from BFO:
1. **The Continuant / Occurrent Dichotomy:**
   * *Continuants:* Things that endure through time and are fully present at any single time slice (`Character`, `Faction`, `Artifact`, `Location`).
   * *Occurrents:* Things that unfold through time and possess temporal parts (`Event`, `Battle`, `Process`, `Era`).
   * *Practical Payoff:* Eliminates ad hoc modeling confusion (e.g., formalizing a "Reign" not as an ambiguous property of a person, but as an Occurrent process tied to an Era).
2. **Roles and Dispositions (Dependent Continuants):**
   * *Roles:* BFO defines a role (e.g., *King*, *Outcast*) as an entity that exists only by virtue of being borne by an independent continuant within a specific social context. Distinct from the character holding it.
   * *Dispositions / Capabilities:* Properties that exist latently and manifest only under specific boundary conditions (e.g., a magical *Curse* or a weapon's *Brittleness*).

### B. Why Wholesale BFO Adoption Fails in Creative Worldbuilding:
* **Over-Granular Real-World Mereology:** BFO invests immense rigor into biological and physical reality (e.g., the exact mereological part-whole relationship between cells and organs, or whether a spatial hole is a real entity). This granularity provides zero narrative value and creates heavy cognitive overhead.
* **Fiction Deliberately Breaks Metaphysical Rules:** BFO presumes stable physical identities, linear unidirectional time, and standard material existence. Fictional worldbuilding frequently hinges on violating these exact constraints: retrocausality, characters existing across parallel timelines simultaneously, shapeshifters, and gods manifesting as pure ideas.
* **The Pragmatic Implementation (Neo4j / TypeDB):**
  * In Neo4j: Apply `:Continuant` and `:Occurrent` as top-level labels, attaching specific types (`:Character`, `:Event`) as secondary labels.
  * In TypeDB: Declare `continuant` and `occurrent` as native supertypes, subtyping domain classes beneath them.

---

## 2. Core Architectural Debates in Narrative Systems

### A. Ontology as the Keystone of AI
* For open-ended creative prose or sentiment tasks, formal ontologies are unnecessary.
* For **knowledge-intensive, consistency-critical, multi-hop reasoning tasks** (transmedia continuity, simulation game state, lore linters), ontology is the absolute keystone:
  $$\text{Vector RAG} = \text{Retrieval of Words (Statistical Plausibility)}$$
  $$\text{Graph-Grounded RAG} = \text{Retrieval of Verified Causal Subgraphs (Deterministic Meaning)}$$

### B. Sequencing: Ontology-First vs. Post-Hoc Retrofitting
* Implementing an ontology at the beginning of a pipeline is mandatory because **ontological drift compounds exponentially**:
  * Ingesting data before formalizing classes results in unmapped, ambiguous entities.
  * Post-hoc reconciliation requires re-evaluating entire corpora to retroactively assign classes, reconcile contradictory assertions, and resolve naming collisions at maximum expense.

### C. Compute vs. Structural Understanding
* Compute and structure are **multipliers**, not substitutes:
  * Scaling raw LLM parameters increases **fluency**, not **factual correctness**.
  * On multi-hop relational tasks, unstructured compute hits a performance ceiling where additional parameters fail to eliminate hallucinations. Only structural knowledge graphs provide verifiable relational truth.

### D. Traceability: When It Matters
* **High-Value Scenarios:** Contradiction debugging, multi-author franchise disputes, auditable retcons, grounding LLM outputs to verifiable source nodes, and fan-facing participatory ARG exploration.
* **Low-Value Scenarios:** Solo linear writing projects without automated generation or franchise continuity requirements.

### E. Top-Down vs. Bottom-Up Strategy: The Iterative Loop
* *Pure Top-Down Risk:* Fragile, over-engineered philosophical hierarchies that clash with real narrative material.
* *Pure Bottom-Up Risk:* Ingesting unstructured text directly into a graph reproduces the exact ontological drift it was intended to resolve.
* *The Golden Mean:* Author a minimal top-down skeleton (5–6 core types) in an afternoon $\rightarrow$ test bottom-up against 10–15 real entities $\rightarrow$ iterate the schema 2–3 times before scaling extraction across the full corpus.

---

## 3. Intellectual Property (IP) Strategy for Ontologies

Protecting a narrative ontology requires a multi-layered legal approach, as intellectual property law does not treat "an ontology" as a single monolithic asset:

| Legal Mechanism | Scope of Protection | Practical Strength & Role in Transmedia | Key Limitations & Case Law |
|---|---|---|---|
| **Copyright** | Specific creative prose descriptions, distinctive proper nouns, and thin compilation protection. | **Weak for structure; Strong for expression.** Protects character bios, lore text, and unique phrasing. | *Baker v. Selden* (ideas, systems, and taxonomies cannot be copyrighted); *Feist v. Rural Telephone* (raw facts are not protectable; compilation receives only thin protection). |
| **Trade Secret** | The complete internal relational graph, schema mechanics, and unpublished continuity bibles. | **Strongest practical protection for the system.** Protects unpublished master knowledge graphs from competitors and leaks. | Requires active security measures (access controls, NDAs); protection evaporates permanently if published on a fan wiki. |
| **Patent** | Novel, non-obvious *computational methods* for generating narrative from layered ontological graphs. | **Narrow and technically demanding.** Protects proprietary generative software algorithms rather than lore. | High bar post-*Alice Corp. v. CLS Bank*; abstract software concepts implemented on generic hardware are rejected. |
| **Trademark** | Source-identifying proper nouns, faction insignias, and commercial iconography. | **Highest commercial value.** Protects franchise identifiers (*Jedi*, *Hogwarts*, character names) across merchandise. | Protects brand identity and source indicators, not the underlying graph data structure. |
| **Contract Law** | Non-Disclosure Agreements (NDAs), licensing agreements, work-for-hire contracts. | **The primary day-to-day enforcement mechanism.** Binds writers, studios, and licensees to canon compliance. | Governs only parties in contractual privity; cannot prevent independent creation or reverse-engineering by third parties. |

* **The Franchise IP Blueprint:** Keep the thick, structural knowledge graph as an **internal trade secret** behind access controls; release thin, expressive lore as **copyright-protected public bibles**; register iconic proper nouns as **trademarks**; and bind collaborators through **strict contractual licensing covenants**.

---

## 4. Deductive Rule Engines: Contradiction Detection vs. Fact Derivation

Selecting a reasoning framework requires separating two fundamentally distinct operations:
1. **Contradiction Detection:** Closed-world consistency validation proving two asserted facts cannot coexist under the schema's constraints.
2. **Fact Derivation (Inference):** Generative logic creating new, unasserted truths from existing facts and rules (e.g., $A \in X \land B \in Y \land X \text{ opposes } Y \implies A \text{ opposes } B$).

### A. Evaluation of Candidates (Ranked for Fact-Derivation First)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ REASONING FRAMEWORK COMPARISON                                                         │
├───────────────────┬─────────────────────────┬───────────────────────┬──────────────────┤
│ Framework         │ Fact Derivation (Rules) │ Contradiction Checks  │ Operational Fit  │
├───────────────────┼─────────────────────────┼───────────────────────┼──────────────────┤
│ 1. TypeDB         │ Native Query-Time Rules │ Native Subtyping      │ Integrated Graph │
│ 2. Datalog        │ Native Recursive Logic  │ Declarative Checks    │ Requires Dual DB │
│ 3. Prolog         │ Classical Inference     │ Unification Checks    │ Manual Stitching │
│ 4. Neo4j + APOC   │ Imperative Cypher Trigs │ Schema Constraints    │ Stored Mutated   │
│ 5. LinkML         │ None (Schema Only)      │ Generates OWL/JSON    │ Authoring Layer  │
│ 6. TypeScript     │ None (No Runtime Inf)   │ Compile-Time Shape    │ Code Types Only  │
└───────────────────┴─────────────────────────┴───────────────────────┴──────────────────┘
```

---

### B. Detailed Tool Analysis

#### 1. TypeDB (Top Overall Recommendation)
* **Architecture:** Uses TypeQL to define entities, relations, and declarative query-time rules.
* **Query-Time Rule Derivation:** Derived facts are computed in memory during query execution rather than stored as physical edges in the database. When underlying data mutates, derived facts update instantly without batch re-inference jobs:
  ```typeql
  rule antagonism-from-faction-war:
  when {
    $a isa character, has faction $fa;
    $b isa character, has faction $fb;
    (warring-party: $fa, warring-party: $fb) isa war;
    $fa != $fb;
  } then {
    (antagonist: $a, target: $b) isa antagonism;
  };
  ```

#### 2. Dedicated Datalog Engines (Soufflé, Datomic)
* **Architecture:** Purpose-built logic-programming language executing recursive, high-performance fact derivation:
  ```prolog
  antagonist(A, B) :- 
      belongs_to(A, FA), 
      belongs_to(B, FB), 
      at_war(FA, FB), 
      FA != FB.
  ```
* **Tradeoff:** Extremely fast and theoretically pure, but requires pairing a standalone Datalog engine with an external graph store, increasing integration complexity relative to TypeDB's all-in-one architecture.

#### 3. Neo4j + APOC + Custom Cypher Triggers
* **Architecture:** Hand-authored imperative Cypher queries that compute and commit derived relationships to disk.
* **Limitation:** Lacks a declarative reasoner. If an underlying faction war ends, the system does not automatically revoke the stored `antagonism` edges unless explicitly programmed with cleanup triggers.

#### 4. LinkML (Modeling Layer, Not a Reasoner)
* **Role:** Excellent YAML-based authoring format for schemas, compiling down to JSON Schema, TypeScript types, and OWL.
* **Limitation:** LinkML validates data conformity (cardinality, enums, required fields); it **does not infer new facts or detect logical contradictions** on its own without passing the compiled schema to an external OWL reasoner (HermiT, Pellet).

#### 5. TypeScript (Compile-Time Guard, Not a Runtime Reasoner)
* **Role:** Enforces structural shape and discriminated unions in application code at compile time.
* **Limitation:** Cannot evaluate the logical validity of runtime graph data. TypeScript verifies that an object has a `faction_id: string` field; it cannot determine whether that character is simultaneously bound to two mutually exclusive warring factions.
