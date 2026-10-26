# Phase 4: Falsifiable Verification Gauntlet Observation Checklist

To formally observe and certify the updates executed during **Phase 4: Falsifiable Verification Gauntlet**, execute the following sequence of terminal-based verification commands directly from the monorepo root. This fail-closed audit mimics the gauntlet created during this phase and ensures the atomic quality gates, automated workflows, and immutable boundary rules are fully operational.

---

### Level 0: The Cold Audit (Immutability & Artifact Purity)
Execute these boundary and hygiene checks before any compilation or test runs.

* [ ] **0.1 Immutable Runner Boundary Demarcation**
  * **Command:** `git status -s apps/995.library/995.library/`
  * **Observable Output:** Exit code `0` with exactly `0` lines returned.
  * **Criteria:** Proves the terminal UI harness (`apps/995.library/995.library/**`) has not been breached or modified.

* [ ] **0.2 Workspace Scope Quarantine**
  * **Command:** `node -e "const status = require('child_process').execSync('git status -s', {encoding: 'utf8'}).trim(); const lines = status ? status.split('\n') : []; const allowed = ['package.json', '.github/workflows/pr-checks.yml', '.github/workflows/push-main.yml', 'packages/000.agent/00.agent.unit/gauntlet.test.ts']; const v = lines.filter(l => !allowed.some(a => l.trim().slice(3).trim().endsWith(a))); if(v.length > 0) process.exit(1);"`
  * **Observable Output:** Exit code `0`.
  * **Criteria:** Confirms all modifications are strictly quarantined to the authorized Phase 4 target files.

* [ ] **0.3 Clean Artifact Emission Gate (Zero Leaked Compilation Files)**
  * **Command:** `find packages/000.agent/src apps/worker/src -name "*.js" -o -name "*.d.ts"`
  * **Observable Output:** Exit code `0` with exactly `0` files returned.
  * **Criteria:** Verifies that TypeScript transpilations emit exclusively into `dist/` and do not drop side-by-side JS artifacts in the source trees.

* [ ] **0.4 Pure 7-Bit ASCII Compliance Sweep**
  * **Command:** `git grep -P "[\x{1F300}-\x{1FAD6}\x{1F900}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]" packages/ apps/worker/src/ apps/995.library/run.ts .github/`
  * **Observable Output:** Exit code `1` (zero matches found).
  * **Criteria:** Confirms the complete eradication of multi-byte UTF-8 emojis across mutable packages, workflows, and the entrypoint.

---

### Level 1: Static Configuration & Script Alignment Audit
Verify the atomic quality gates are properly registered and remote CI workflows are synchronized.

* [ ] **1.1 Atomic Script Registration & Gauntlet Verification**
  * **Command:** `node -e "const pkg = require('./package.json'); const s = pkg.scripts; if(!s['check:boundary'] || !s['check:sentry'] || !s['check:artifacts'] || !s['gauntlet']) process.exit(1); if(!s['gauntlet'].includes('check:boundary') || !s['gauntlet'].includes('check:sentry') || !s['gauntlet'].includes('check:artifacts')) process.exit(1);"`
  * **Observable Output:** Exit code `0`.
  * **Criteria:** Ensures `check:boundary`, `check:sentry`, `check:artifacts`, and the unified `gauntlet` scripts exist in `package.json` and are orchestrated correctly.

* [ ] **1.2 Remote Workflow Gauntlet Parity**
  * **Command:** `node -e "const fs = require('fs'); const pr = fs.readFileSync('.github/workflows/pr-checks.yml', 'utf8'); const push = fs.readFileSync('.github/workflows/push-main.yml', 'utf8'); const gates = ['check:boundary', 'check:sentry', 'check:artifacts', 'check:types', 'npm test', 'npm run gauntlet']; for (const gate of gates) { if(!pr.includes(gate) || !push.includes(gate)) process.exit(1); }"`
  * **Observable Output:** Exit code `0`.
  * **Criteria:** Verifies that both `.github/workflows/pr-checks.yml` and `push-main.yml` strictly enforce the new 5-stage verification gauntlet sequence.

---

### Level 2: Compilation & Code Quality Gates
Run static analysis to confirm structural integrity across the monorepo.

* [ ] **2.1 Static TypeScript Compilation**
  * **Command:** `npm run check:types`
  * **Observable Output:** Exit code `0`.
  * **Criteria:** Proves complete type safety and composite build cleaniness across all project references without diagnostic errors.

* [ ] **2.2 Formatting and Lint Standards**
  * **Command:** `npm run prettier:check && npm run lint:check`
  * **Observable Output:** Exit code `0`.
  * **Criteria:** Confirms code conforms to all established formatting rules and ESLint constraints.

---

### Level 3: Programmatic Invariant & Sequential Regression Test Battery
Execute the dynamic and programmatic test suites to ensure the gauntlet actively asserts invariants.

* [ ] **3.1 Programmatic Invariant Assertions**
  * **Command:** `npx vitest run packages/000.agent/00.agent.unit/gauntlet.test.ts`
  * **Observable Output:** Exit code `0` (100% assertions green).
  * **Criteria:** Executes the automated negative-control battery verifying boundary status, absence of DevOps tools, pure ASCII, and exact root identity (`worker-sower-engine`).

* [ ] **3.2 Monorepo Sequential Test Harness**
  * **Command:** `npm test`
  * **Observable Output:** Exit code `0`.
  * **Criteria:** Executes the full regression battery sequentially (`Worker -> Agent -> Library`) completely green.

* [ ] **3.3 End-to-End Consolidated Gauntlet Runner**
  * **Command:** `npm run gauntlet`
  * **Observable Output:** Exit code `0`.
  * **Criteria:** Executes the complete pipeline validation sequence cleanly in a single pass.