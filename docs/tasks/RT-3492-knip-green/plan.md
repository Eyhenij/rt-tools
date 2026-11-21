# Plan

**Task:** RT-3492 · **Branch:** RT-3492-knip-green
**Behaviour:** unchanged — the work touches no file under `apps/**` or `libs/**`: one `export` word less on symbols nobody imports, and two dev packages declared by the kit that uses them

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** `pnpm run check:unused` is red on main and on the epic branch: 2 unused devDependencies,
  2 referenced optional peers, 9 unused exports, 10 unused exported types. `check:all` ends red on
  its last step.
- **This task reaches:** `pnpm run check:unused` exits 0 without a new exception in `knip.json`,
  and `pnpm run check:all` is green to its last step.
- **Sign:** `pnpm run check:unused` → exit 0; `git diff origin/RT-3476-angular-doctor -- knip.json`
  is empty.
- **Milestone G of the epic:** score 100 of 100, no Angular Doctor findings, and `check:all` green
  around it.
- **Metric:** the number of knip findings, 23 now, goes to 0.

## Task footprint

| What  | Where                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------- |
| Rules | `.claude/skills/dependencies/`, `.claude/skills/typescript-conventions/`                                      |
| Code  | `package.json`, `pnpm-lock.yaml`, `projects/ui-kit-v2/package.json`, `projects/agent-kit/src/lib/`, `projects/ui-kit-v2/src/` |
| Texts | `docs/plans/angular-doctor.md`                                                                                |

## What counts as done

- The 19 exports and types knip names are no longer exported, and each is still used in its own
  file; the agent kit and the component kit pass their type checks.
- `d3-hierarchy`, `d3-shape` and their type packages stand in devDependencies of the kit by exact
  versions and are gone from the root manifest; the kit builds.
- `knip.json` is unchanged: no new exception.
- `pnpm run check:unused` exits 0.

## Stages

### 1. Exports nobody imports

- **Steps:**
    1. Drop `export` from the 19 symbols knip names in the agent kit, the chart scene and the link block fixture
       Check: `pnpm exec knip --exports` → exit 0
- **Readiness sign:** knip names no unused export or type; both packages type check.
- **Verified by:** the check line above;
  `pnpm exec nx run-many -t typecheck -p @rt-tools/agent-kit @rt-tools/ui-kit-v2` → exit 0.

### 2. The d3 packages move to the kit

- **Steps:**
    1. Move `d3-hierarchy`, `d3-shape` and their type packages from the root devDependencies to devDependencies of the kit
       Check: `node -p "['d3-hierarchy','d3-shape','@types/d3-hierarchy','@types/d3-shape'].filter((n) => n in require('./package.json').devDependencies).length"` → `0`
    2. Keep the versions exact in the kit manifest
       Check: `node -p "require('./projects/ui-kit-v2/package.json').devDependencies['d3-shape']"` → `3.2.1`
    3. Declare all four in the kit manifest
       Check: `node -p "['d3-hierarchy','d3-shape','@types/d3-hierarchy','@types/d3-shape'].filter((n) => n in (require('./projects/ui-kit-v2/package.json').devDependencies ?? {})).length"` → `4`
- **Readiness sign:** the root manifest has no d3 package, the kit declares them by exact
  versions, and the kit builds.
- **Verified by:** the three check lines above; `pnpm run build:ui-kit-v2` → exit 0;
  `node tools/check-dependencies.mjs` → exit 0.

### 3. knip green

- **Steps:**
    1. Run knip over every project
       Check: `pnpm run check:unused` → exit 0
    2. Mark RT-3492 as done in the epic plan
       Check: `grep -c "RT-3492 .*| готово" docs/plans/angular-doctor.md` → `1`
- **Readiness sign:** knip is green with no new exception, and the epic plan says so.
- **Verified by:** the two check lines above;
  `git diff --quiet origin/RT-3476-angular-doctor -- knip.json` → exit 0; the push set runs the
  kit tests and the showcase snapshots.
