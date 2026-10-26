### Transmedia Storyworld Taxonomy & Map-Reduce Corpus Extraction Engine
A comprehensive entity taxonomy organized across six metaphysical and structural layers, paired with an operational map-reduce prompt protocol designed to extract structured knowledge graphs and detect ontological drift across massive freeform markdown lore corpuses.

--------------------------------------------------------------------------------

#### 1. The Hexapartite Entity Taxonomy for Story Worlds
Rather than maintaining flat, unorganized entity registries, complex fictional worlds organize entities across six distinct structural layers:
```
┌────────────────────────────────────────────────────────────────────────┐
│ I. STRUCTURAL / PHYSICAL LAYER                                         │
│    - Location: Region, City, Building, Room (hierarchically nested)    │
│    - Object / Artifact: Physical tools, weapons, and relics            │
│    - Species / Race: Biological or metaphysical taxonomies             │
│    - Resource: Materially scarce commodities, ores, and flora          │
│    - Technology / System: Devices, mechanisms, and manufacturing rules │
│    - Vehicle / Vessel: Locomotion frameworks and transports            │
│    - Territory / Border: Contested geopolitical and spatial bounds     │
├────────────────────────────────────────────────────────────────────────┤
│ II. SOCIAL / POLITICAL LAYER                                           │
│     - Character: Individual agents possessing will and memory          │
│     - Faction / Organization: Guilds, dynasties, armies, and cults     │
│     - Relationship: Typed edges (Ally, Rival, Kin, Mentor, Debt)       │
│     - Role / Title: Positions of authority distinct from the holder    │
│     - Culture / Ethnicity: Shared customs, mores, and social taboos    │
│     - Language: Spoken, written, or encoded semiotic systems           │
│     - Institution: Courts, academies, and enduring religious bodies    │
├────────────────────────────────────────────────────────────────────────┤
│ III. CAUSAL / TEMPORAL LAYER                                           │
│      - Event: Discrete occurrences defined by timestamp and impact     │
│      - Era / Age: Bounded epochs with distinct systemic traits         │
│      - Timeline / Calendar: Deterministic timekeeping conventions      │
│      - Cause-Effect Link: Explicit causal dependencies between events  │
│      - Prophecy / Prediction: Claimed future events vs. realized ones  │
├────────────────────────────────────────────────────────────────────────┤
│ IV. ONTOLOGICAL / METAPHYSICAL LAYER                                   │
│     - Law of Nature / Magic Rule: Rigid constraints on the possible    │
│     - Deity / Cosmic Force: Entities operating above standard physics  │
│     - Afterlife / Alternate Plane: Distinct metaphysical spaces        │
│     - State of Being: Statuses altering active rules (Cursed, Ascended)│
├────────────────────────────────────────────────────────────────────────┤
│ V. SYMBOLIC / THEMATIC LAYER                                           │
│    - Theme / Motif: Recurring philosophical ideas (Scarcity, Rot)      │
│    - Symbol: Concrete objects carrying transcendent cultural meaning   │
│    - Myth / Legend: In-world narratives distinct from historical facts │
├────────────────────────────────────────────────────────────────────────┤
│ VI. NARRATIVE-MECHANICAL LAYER (Transmedia Specific)                   │
│     - Medium / Channel: Origin and distribution platforms (Game, Film) │
│     - Perspective / POV: Unreliable vantage points and focal characters│
│     - Canon Status: Confirmed, Disputed, Apocryphal, Deprecated        │
│     - Route / Path: Designated reading or gameplay itineraries         │
└────────────────────────────────────────────────────────────────────────┘

```

--------------------------------------------------------------------------------

#### 2. Map-Reduce Ingestion Engine: Markdown-to-Graph Pipeline
Parsing raw, multi-megabyte freeform markdown archives into a structured, validated knowledge graph cannot be executed in a single monolithic LLM pass without severe context exhaustion, silent entity truncation, or hallucinated reconciliations.
The pipeline executes as an auditable, two-stage  **Map-Reduce Ingestion Protocol** :
```
[ Freeform Markdown Files (Lore Corpus) ]
                    │
                    ▼ Split into Context Chunks
[ Phase 1: MAP (Local Chunk Extraction) ]
  - Extracts explicit instances mapped to Hexapartite Taxonomy
  - Flags local contradictions, ambiguities, and missing links
                    │
                    ▼ Outputs Array of Chunk Schemas
[ Phase 2: REDUCE (Global Reconciliation & Drift Detection) ]
  - Merges duplicate node IDs across files
  - Catches cross-document contradictions (Ontological Drift)
  - Surfaces unresolved discrepancies for Human Showrunner review
                    │
                    ▼
[ Structured Graph Output (Cypher Ingestion Ready) ]

```

--------------------------------------------------------------------------------

#### 3. Operational Prompt Specifications
##### Phase 1: The MAP Prompt (Chunk Extraction)
```markdown
SYSTEM:
You are an expert Ontology Engineer and Continuity Editor. Your task is to extract structured entities, attributes, and relationships from the provided markdown lore document according to the Hexapartite Storyworld Taxonomy.

TAXONOMY LAYERS & CLASSES:
1. Structural: Location, Artifact, Species, Resource, Technology, Territory.
2. Social: Character, Faction, Relationship, Role, Culture, Language, Institution.
3. Causal: Event, Era, Timeline, CauseEffectLink, Prophecy.
4. Ontological: MagicRule, NaturalLaw, Deity, AlternatePlane, StateOfBeing.
5. Symbolic: Theme, Symbol, Myth.
6. Narrative-Mechanical: Medium, CanonStatus, Route.

INSTRUCTIONS:
1. Extract all discrete entities. Assign each a unique kebab-case ID prefixed by its class (e.g., "char-torvin", "loc-murkwaste-barony", "art-gator-spear").
2. Extract all explicit relationships as typed, directed edges:
   - Source ID, Target ID, Relationship Type (e.g., "BELONGS_TO", "CAUSES", "LOCATED_IN", "OPPOSES"), and edge properties.
3. DO NOT hallucinate missing connections. If an entity is mentioned without affiliation, record it as an isolated node.
4. MANDATORY AUDIT: Populate a `flags` array with any ambiguous names, temporal discrepancies, or contradictory statements found within this text.

OUTPUT SCHEMA (JSON):
{
  "chunk_id": "<string>",
  "nodes": [
    {
      "id": "<class-name>",
      "class": "<TaxonomyClass>",
      "layer": "<TaxonomyLayer>",
      "name": "<string>",
      "properties": { "<key>": "<value>" }
    }
  ],
  "edges": [
    {
      "source": "<node-id>",
      "target": "<node-id>",
      "type": "<RELATIONSHIP_TYPE>",
      "properties": { "<key>": "<value>" }
    }
  ],
  "flags": [
    {
      "type": "AMBIGUITY" | "CONTRADICTION" | "MISSING_DATA",
      "entities_involved": ["<node-id>"],
      "description": "<string>"
    }
  ]
}

```

--------------------------------------------------------------------------------

##### Phase 2: The REDUCE Prompt (Global Drift & Conflict Reconciliation)
```markdown
SYSTEM:
You are the Master Continuity Arbiter. You have received extraction payloads from multiple chunks of a narrative corpus. Your responsibility is to synthesize these chunks into a unified master knowledge graph while forensicly exposing all instances of Ontological Drift and narrative inconsistency.

CRITICAL DIRECTIVES:
1. Deduplication: Merge identical entity nodes that represent the same canonical individual or location. Do NOT silently merge distinct entities that share similar names without explicit textual proof.
2. Edge Reconciliation: Consolidate redundant edges; preserve multi-source provenance metadata.
3. Ontological Drift Detection: Inspect the merged dataset for cross-document contradictions:
   - Temporal paradoxes (e.g., an event caused by a character prior to their birth).
   - Faction loyalty clashes (e.g., an exclusive faction member bound simultaneously to an opposing faction without an explicit betrayal edge).
   - Conflicting physical attributes (e.g., inconsistent origins or mechanics for an artifact).
4. Human-in-the-Loop Quarantine: Do NOT guess the "correct" truth when a contradiction arises. Mark conflicting nodes with `status: "NEEDS_SHOWRUNNER_REVIEW"`, isolate the conflicting assertions, and document the exact files in conflict.

OUTPUT FORMAT (JSON):
{
  "master_graph": {
    "nodes": [...],
    "edges": [...]
  },
  "reconciliation_audit": {
    "merged_entities_count": <int>,
    "unresolved_conflicts": [
      {
        "conflict_id": "<string>",
        "type": "TEMPORAL_PARADOX" | "FACTION_DISCREPANCY" | "PHYSICAL_CONTRADICTION",
        "entities": ["<node-id>"],
        "source_chunks": ["<chunk-id-1>", "<chunk-id-2>"],
        "divergent_assertions": [
          { "source": "<chunk-1>", "claim": "<string>" },
          { "source": "<chunk-2>", "claim": "<string>" }
        ]
      }
    ]
  }
}

```
