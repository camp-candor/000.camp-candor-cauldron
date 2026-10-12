# AGENTS.md -- Master Storehouse Architecture & Fleet Operational Guidelines

> Operational manual, monorepo architecture, invariant specifications, and
> coding standards for the `995.library` ecosystem.
>
> `995.library` is the definitive master storehouse and point of origin for all
> domain units, state machines, and Blessed terminal cockpits across the fleet.
> Downstream monorepos inherit pivots and harnesses from this repository.

---

## 0. Day 000 Orientation & Master Storehouse Mission

`995.library` operates under a dual architectural mandate:

1. **The Definitive Point of Origin:** All reusable units (`*.unit`), action
   bale definitions, buzzers, and Redux-pattern state machines across the entire
   fleet originate, evolve, and are verified in this repository.
2. **The Autonomous Terminal Cockpit:** A deterministic Blessed terminal UI
   harness backed by an `rx-lite` state machine, capable of mounting local
   domain pivots dynamically without compile-time coupling.

Before implementing features or modifying code, orient yourself in this order:

1. **This file (`AGENTS.md`)** -- Core laws, boundaries, and quality gauntlets.
2. **`apps/995.library/run.ts`** -- Schema-driven runner and dynamic bus
   injector.
3. **`apps/995.library/995.library/00.library.unit/`** -- Workspace template
   compiler.
4. **`packages/`** -- Canonical storehouse for modular fleet domain pivots.
5. **`data/`** -- Task specifications, audit dossiers, and runtime artifacts.

---

## 1. Core Invariants & Architectural Laws (CRITICAL FOR CODING AGENTS)

Coding agents operating in this repository MUST strictly adhere to the following
laws:

### Law 1: Local Harness Mutability (Lifted Immutability Boundary)

- For downstream consumer repositories, `apps/995.library/995.library/**` is a
  vendor harness that remains immutable.
- **FOR THIS REPOSITORY ONLY**, the immutability boundary on
  `apps/995.library/995.library/` is **PERMANENTLY LIFTED**.
- Active development on the library, its core curses widgets, state engine, and
  built-in units occurs directly inside `apps/995.library/995.library/`.

### Law 2: Structural Monorepo Parity (The Copy-Paste Invariant)

- All domain units must maintain a strict 1:1 structural parity with downstream
  repositories.
- Domain units are organized into discrete workspaces under `packages/<domain>/`
  (e.g., `packages/000.agent`, `packages/103.factory`).
- **Do NOT collapse packages into `apps/995.library/`**. Keeping physical folder
  boundaries isolated ensures that any pivot package or the library itself can
  be copied and pasted directly into any other monorepo across the fleet without
  path or build adjustments.

### Law 3: 7-Bit Pure ASCII Compliance (ABSOLUTE REQUIREMENT)

- All terminal labels, curses HUD widgets, console telemetry, status tokens, and
  log messages must use **7-bit pure ASCII** (`>>`, `[OK]`, `[FAIL]`,
  `[UPDATE]`, `::`, `---`).
- **Multi-byte UTF-8 emojis are strictly prohibited.** Do not use them in logs,
  UI code, or documentation to prevent character buffer corruption in Windows
  `cmd.exe` and standard curses terminal emulators.

### Law 4: Fail-Closed Circuit Breaker & Negative Controls

- Metaprogramming compilers, scaffolding engines, and dynamic loaders must catch
  runtime and filesystem errors cleanly.
- On error, buzzers must emit a structured ASCII alert (`>> [RE-WIRE ERROR]`) to
  console `cns00` and resolve error bales (e.g., `update-library-err`) rather
  than throwing unhandled exceptions that tear down the Blessed curses process.
- A component that has not been empirically verified against negative controls
  (missing directories, syntax faults, malformed manifests) is not
  production-ready.

### Law 5: Curses Viewport Logging Isolation & Green Column Telemetry (ABSOLUTE REQUIREMENT)

- Once Blessed curses initializes (from `INIT_LIBRARY` / `INIT_TERMINAL`
  onward), **writing directly to standard output or standard error via
  `console.log` or `console.error` is strictly prohibited**.
- Uncoordinated writes to stdout bypass the curses screen buffer and render as
  terminal-default white text across the screen, colliding with and corrupting
  the Blessed UI layout and navigation forms.
- **All runtime telemetry, bus initialization pings, package mounting notices,
  headless pivot indicators, and warnings must be routed directly to the
  right-hand console column (`cns00`)** via `[Console action] Update Console`
  (`ActCns.UPDATE_CONSOLE`).
- The `cns00` console log widget renders all telemetry deterministically in
  **green (`COLOR.GREEN`)** using pure 7-bit ASCII status tokens (`>> [OK]`,
  `>> [INFO]`, `:: [WARN]`).

---

## 2. Monorepo Topology & Workspace Roles

```text
.
├── apps/
│   └── 995.library/            # Blessed Terminal UI Harness (@camp_candor/995.library)
│       ├── run.ts              # Schema-driven dynamic runner & bus injector
│       ├── package.json        # Harness runtime dependencies
│       ├── data/redux/BEE.txt  # Canonical Redux wiring manifest template
│       ├── test/               # AVA test suites for harness and compilers
│       └── 995.library/        # [MUTABLE IN THIS REPO] Core Curses engine & units
│           ├── BEE.ts          # Root library state manifest
│           ├── hunt.ts         # Library execution harness & dispatcher
│           ├── 00.library.unit/# Metaprogramming & workspace compiler buzzers
│           ├── 01.unit.unit/   # Deterministic unit scaffolding engine
│           ├── 80.terminal.unit# Blessed curses screen container
│           ├── 83.console.unit # Console log viewport (cns00)
│           ├── 85.choice.unit/ # Interactive menu choice form
│           └── 98.menu.unit/   # Master terminal navigation loop
│
├── packages/                   # Canonical Storehouse for Fleet Domain Pivots
│   ├── 000.agent/              # Core Agent Domain & Cockpit (@camp_candor/000.agent)
│   │   ├── BEE.ts              # Agent unit wiring manifest
│   │   ├── hunt.ts             # Standardized state machine bootstrap contract
│   │   ├── package.json        # Contains "terminal" schema metadata
│   │   ├── 00.agent.unit/      # Agent domain actions and buzzers
│   │   └── 98.menu.unit/       # Agent cockpit sub-menu
│   └── <domain>/               # Additional modular fleet packages
│
└── data/                       # Historical transcripts & build directives
    ├── flat/                   # Flattened repository snapshots
    ├── unit/                   # Scaffolded unit artifacts
    └── directive/              # Task specifications and audit dossiers
```

---

## 3. Metaprogramming & Workspace-Aware Compilers (`updateLibrary`)

The `UPDATE_LIBRARY` action (`00.library.unit/buz/library.buzz.ts`) is the
in-process metaprogramming engine of the fleet. It allows dynamic regeneration
of Redux coordination manifests without restarting terminal sessions.

### Execution Lifecycle

1. **Target Directory Resolution:** Resolves `bal.src` dynamically across the
   monorepo root, supporting absolute paths, relative paths, and workspace slugs
   (e.g., `packages/000.agent` or `[packages/103.factory]`).
2. **Lexical Unit Sweeping:** Scans the resolved directory strictly for entries
   matching `/^\d{2}\..+\.unit$/`. Discovered units are sorted lexicographically
   (`a.localeCompare(b)`) to guarantee deterministic, bit-reproducible output.
3. **Template Resolution & Fallback:** Reads `BEE.txt` from the target workspace
   or `apps/995.library/data/redux/BEE.txt`. If absent, falls back to a built-in
   in-memory template string.
4. **AST Token Interpolation:** Dissects unit directory names into numerical
   indices, raw domain verbs, and PascalCase identifiers to generate:
   - Class imports (`import FooUnit from "./00.foo.unit/foo.unit";`)
   - Interface and Model imports
     (`import { FooModel } from "./00.foo.unit/foo.model";`)
   - Reducer slice imports
     (`import * as reduceFromFoo from "./00.foo.unit/foo.reduce";`)
   - Composite `list`, `reducer`, and `UnitData` class declarations.
5. **Scoped Emission:** Synchronously writes the assembled AST directly to
   `<targetDir>/BEE.ts`. It never touches `apps/995.library/995.library/BEE.ts`
   unless that workspace is explicitly targeted.

---

## 4. Schema-Driven Dynamic Autodiscovery & Bus Bootstrapping (`run.ts`)

`apps/995.library/run.ts` operates as a zero-configuration dynamic runner.
Hardcoded package registries (such as `PACKAGES_CONFIG`) are prohibited.

### Autodiscovery Protocol

1. **Filesystem Sweep:** `run.ts` inspects `packages/*` for directories
   containing a valid `tsconfig.json`.
2. **Schema Ingestion:** Reads `package.json` for each package and looks for the
   `terminal` metadata block:
   ```json
   {
     "terminal": {
       "globalKey": "AGENT",
       "menuTitle": "AGENT MENU",
       "menuDesc": "Open the Agent Cockpit menu\nto run system diagnostics."
     }
   }
   ```
3. **Heuristic Fallback:** If `terminal` metadata is omitted, `run.ts` extracts
   the domain verb from the directory name (e.g., `103.factory` -> `factory`)
   and derives `globalKey: "FACTORY"` and `menuTitle: "FACTORY MENU"`.
4. **In-Memory Cross-Bus Wiring:**
   - Dynamically loads `<package>/hunt.js` or `<package>/hunt.ts`.
   - Injects the dispatcher onto the global scope:
     `global[pkg.globalKey] = instance`.
   - Populates the central pivot registry: `global.PIVOTS[pkg.name] = instance`
     and `global.PIVOTS[pkg.globalKey] = instance`.
5. **Headless & UI Pivot Handling:**
   - If `98.menu.unit/menu.action` is detected, `run.ts` mounts the package into
     the root Blessed navigation choice list via `ROUTE_MENU`.
   - If no menu unit exists, it mounts the package as a headless background
     service without throwing missing-route exceptions.

---

## 5. Scaffolding Standards & Non-Blocking Execution (`01.unit.unit`)

All unit scaffolding generated by `createUnit` and `updateUnit` must adhere to
deterministic execution standards:

### Scaffolding Invariants

- **Zero Artificial Delays:** Scaffolding buzzers must never use `setTimeout`
  delays (e.g., `setTimeout(..., 2111)`). Promises must resolve immediately and
  deterministically upon filesystem I/O completion.
- **Non-Blocking Observable Stubs:** Newly scaffolded action handlers in
  `unit.model.ts` (`buzzTemplate`) must never generate `debugger; return cpy;`
  placeholders.
- **Standardized Stub Contract:** Generated buzzers must export an asynchronous
  handler that emits an execution ping to console `cns00` and immediately
  resolves `bal.slv`:

```typescript
export const {{=it.buzNom}} = async (
    cpy: {{=it.cpyNom}},
    bal: {{=it.balNom}},
    ste: State,
) => {
    if (ste) {
        await ste.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: '>> Executing {{=it.buzNom}} stub',
        });
    }
    if (bal && bal.slv != null) {
        bal.slv({ {{=it.nom}}Bit: { idx: '{{=it.buzNom}}-stub' } });
    }
    return cpy;
};
```

---

## 6. Verification Gauntlet & Quality Gates

Every code modification must pass the verification gauntlet before committing:

```bash
# 1. Typecheck all project references across monorepo workspaces
npm run check:types

# 2. Assert 7-Bit Pure ASCII Compliance across all source files
npm run check:sentry

# 3. Assert zero compiled artifacts (.js, .d.ts) leaked into TypeScript source roots
npm run check:artifacts

# 4. Run monorepo unit test suites (AVA for library, Vitest for packages)
npm test

# 5. Execute unified verification gate (types + lint + format + boundary)
npm run check:all
```

### Quick Reference -- Common Scripts

| Script                 | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `npm run tui`          | Launch Blessed curses cockpit via dynamic `run.ts`     |
| `npm run test:library` | Run `apps/995.library` AVA test battery                |
| `npm run test:agent`   | Run `packages/000.agent` Vitest suites                 |
| `npm run check:types`  | Project-wide static TypeScript typechecking (`tsc -b`) |
| `npm run fix`          | Auto-format with Prettier and apply ESLint fixes       |

---

## 7. Guide for AI Coding Agents

If you are an AI agent modifying this codebase, **READ THIS SECTION CAREFULLY**:

1. **Do Not Touch Downstream Concepts**: You are in the core `995.library`
   repository. You CAN mutate `apps/995.library/995.library/**`. Do not behave
   as if this is a downstream repository where this is locked.
2. **Observe 7-Bit ASCII Strictly**: Do NOT output emojis in your commits, file
   outputs, comments, or terminal outputs.
3. **Always Run Checks**: Run `npm run check:all` before concluding your task.
   Ensure there are no type errors, no lint issues, and that all tests pass.
4. **Creating New Units**: When asked to create a new module, ALWAYS scaffold it
   following the exact folder conventions:
   `packages/<domain_name>/<unit_index>.<unit_name>.unit/`. You should invoke
   the existing `01.unit.unit` or manually adhere to the deterministic stubs.
5. **No `setTimeout` or `debugger`**: Your code should be fully non-blocking and
   observable. Emits to the console (`cns00`) are your logging mechanism.
6. **No `console.log` After Terminal Initialization**: Once Blessed curses is
   active, never write directly to stdout via `console.log` or `console.error`.
   All telemetry must be dispatched to the right-hand console column (`cns00`)
   via `ActCns.UPDATE_CONSOLE` so it renders in green (`COLOR.GREEN`).
