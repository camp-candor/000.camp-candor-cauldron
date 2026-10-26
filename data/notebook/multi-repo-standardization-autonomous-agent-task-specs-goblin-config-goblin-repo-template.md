# Multi-Repo Standardization & Autonomous Agent Task Specs: goblin-config & goblin-repo-template

A guide to establishing centralized configuration packages and constructing modular repository templates under strict isolation boundaries [001-POL-04], with executable prompt tickets for autonomous coding agents (Jules).

---

## 1. Multi-Repo Standardization Architecture

Adapting the modular `@snailicid3/config` and `consumer-npm-template` models to enforce universal TypeScript, ESLint, and Prettier rules across isolated repositories without the overhead of monorepos (Nx, Turborepo).

```
[ Central Authority: goblin-config ]
                 │
                 ├── (file:../goblin-config) ──> [ goblin-repo-template ]
                 │                                        │ (Clone / Seed)
                 │                                        ▼
                 ├── (extends ruleset) ─────────> [ worker-sower-engine ]
                 └── (extends ruleset) ─────────> [ goblin-viewport ]
```

### Phase 1: Establish `goblin-config`
A dedicated repository containing zero application logic, acting solely as the canonical rule repository:
* `tsconfig.base.json`: Strict TypeScript settings (`noImplicitAny`, `strictNullChecks`).
* `.eslintrc.js`: Canonical linting rules.
* `.prettierrc.js`: Formatting standards (`printWidth: 100`, `tabWidth: 2`, `endOfLine: "lf"`).

### Phase 2: Construct `goblin-repo-template`
The foundational seed for microservices, pipelines, or parsers:
* Strips heavy CI/CD workflows from the original consumer template to optimize for local-first architecture.
* Declares dependency in `devDependencies`: `"goblin-config": "file:../goblin-config"`.
* Local configuration files strictly extend the central authority:
  * `tsconfig.json`: `{"extends": "goblin-config/tsconfig.base.json", "compilerOptions": {"outDir": "./dist"}}`
  * `.eslintrc.js`: `module.exports = { extends: ['goblin-config/.eslintrc.js'] };`
  * `.prettierrc.js`: `module.exports = require('goblin-config/.prettierrc.js');`

### Phase 3: Downstream Synchronization & Gating
* Rule updates are executed once in `goblin-config` and propagate downstream via `npm update` or local path pulling.
* CI verification runs `npm run lint` and `npm run build` against the centralized package, preventing rule drift across repos.

---

## 2. Autonomous Agent Task Prompts (Jules VM Executable Specs)

### Prompt 1: The Central Config Hub (`TASK-02.01.01`)

```markdown
# 🔧 TASK: 02.01.01 — GOBLIN-CONFIG REPOSITORY INITIALIZATION

**Task ID:** `TASK-02.01.01`
**Parent Epic:** [EPIC-002] REPOSITORY ISOLATION & STANDARDIZATION
**Governing Policy:** [001-POL-04] Repository Isolation Boundaries

---

### **I. TASK DESCRIPTION**

**User Story**
As the Lead Architect, I need to scaffold a dedicated `goblin-config` package so that all isolated repositories in the ecosystem can inherit strict, centralized linting and TypeScript rules without requiring monorepo orchestration.

**Context & Value**
This task establishes the central authority for formatting and rulesets. It must contain no application logic, only the shared ESLint, Prettier, and TypeScript configurations based on modular configuration mechanics.

**Technical Constraints**
- **No Monorepo Tooling:** Do not introduce Nx, Turborepo, Lerna, or workspace features.
- **Dependency Constraint:** The repository must be entirely self-contained and act strictly as an exportable ruleset.

---

### **II. SUBTASKS**

#### **Phase A: Repository & Ruleset Initialization**
- [ ] **[A.1]** Initialize a clean Node project named `goblin-config`.
- [ ] **[A.2]** Author the definitive `tsconfig.base.json` establishing strict type-checking parameters.
- [ ] **[A.3]** Author the definitive `.eslintrc.js` and `.prettierrc.js` files enforcing project-wide syntax and formatting rules.

---

### **III. ACCEPTANCE CRITERIA (Definition of Done)**
- [ ] **AC-1:** The `goblin-config` repository exists and contains zero application code.
- [ ] **AC-2:** The three core configuration files (`tsconfig.base.json`, `.eslintrc.js`, `.prettierrc.js`) are fully populated, valid, and ready to be extended by downstream consumers.
```

---

### Prompt 2: The Template Construction (`TASK-02.01.02`)

```markdown
# 🔧 TASK: 02.01.02 — GOBLIN-REPO-TEMPLATE SCAFFOLDING

**Task ID:** `TASK-02.01.02`
**Parent Epic:** [EPIC-002] REPOSITORY ISOLATION & STANDARDIZATION
**Governing Policy:** [001-POL-04] Repository Isolation Boundaries

---

### **I. TASK DESCRIPTION**

**User Story**
As an Edge Engineer, I need to adapt the consumer template into a stripped-down `goblin-repo-template` so that new microservices and pipelines can be spun up quickly while remaining tethered to the central `goblin-config` ruleset.

**Context & Value**
This template acts as the foundation for all future isolated repositories in the Goblin Engine architecture. It must prioritize simplicity and modularity, importing its laws from `goblin-config` rather than defining them locally.

**Technical Constraints**
- **Schema Compliance:** The local config files must *only* extend the upstream `goblin-config` files. No local rule overrides are permitted in the template.
- **Minimalism:** Aggressively strip out any CI/CD or heavy deployment mechanics from the original template that do not serve local-first architecture.

---

### **II. SUBTASKS**

#### **Phase A: Template Stripping & Dependency Linking**
- [ ] **[A.1]** Recreate the structure of the consumer template, stripping away external CI pipelines and unneeded heavy dependencies.
- [ ] **[A.2]** Modify the template's `package.json` to include `"goblin-config": "file:../goblin-config"` in its `devDependencies`. Add `lint`, `format`, and `build` scripts that utilize these tools.
- [ ] **[A.3]** Create local `tsconfig.json`, `.eslintrc.js`, and `.prettierrc.js` files that exclusively use the `extends` or `require` syntax to point to the `goblin-config` authority.

---

### **III. ACCEPTANCE CRITERIA (Definition of Done)**
- [ ] **AC-1 — Code 0 Exit:** Running `npm run lint` and `npm run build` inside the template repository exits with code 0.
- [ ] **AC-2 — Extension Verification:** The local config files contain no independent rules, exclusively extending the centralized `goblin-config` package.
```
