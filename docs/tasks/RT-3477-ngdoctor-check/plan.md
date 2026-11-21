# Plan

**Task:** RT-3477 · **Branch:** RT-3477-ngdoctor-check
**Behaviour:** unchanged — the owner's word «Да, в check:all»: the work adds a tree check and drops an unused dev package; no application, library or kit code changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** Angular Doctor runs only by hand through npx with a floating version; `check:all` does
  not know it; the score is 31.
- **This task reaches:** `pnpm run check:all` turns red when the Angular Doctor score differs
  from the threshold kept in the check, and the version of the tool is pinned.
- **Sign:** `pnpm run check:ngdoctor` ends with the line «score N = threshold N» and exits 0; the
  scenario set shows red for a lower score, for a higher score not yet written as the threshold,
  and for a failed or empty run of the tool.
- **Milestone G of the epic:** score 100 of 100, no findings, the threshold of `check:ngdoctor`
  equals 100.
- **Metric:** нет: the tree had no check at all, this is a new one.

## Task footprint

| What  | Where                                                      |
| ----- | ---------------------------------------------------------- |
| Rules | `.claude/skills/dependencies/`, `.claude/skills/testing/`  |
| Code  | `package.json`, `pnpm-lock.yaml`, `tools/`, `tools/tests/` |
| Texts | `CLAUDE.md`, `docs/plans/angular-doctor.md`                |

## What counts as done

- Angular Doctor 0.3.0 stands in devDependencies by an exact version, and the script calls the
  local binary, not npx.
- The animations package of Angular is gone from `package.json`; the showcase still builds — the
  snapshot gate of the push set builds it.
- The config file holds only the report path: no rule is turned off, no path is ignored.
- The threshold equals the score measured after stage 1, and the check is red on any other score,
  so a fix must raise the threshold and a new finding cannot hide below it.
- `pnpm run check:all` calls the check; `CLAUDE.md` names the command and the description of
  `check:all` names it too.

## Stages

### 1. The package and its settings

- **Steps:**
    1. Add Angular Doctor 0.3.0 to devDependencies by an exact version
       Check: `node -p "require('./package.json').devDependencies['@abiramcodes/angular-doctor']"` → `0.3.0`
    2. Remove the animations package of Angular from devDependencies
       Check: `node -p "'@angular/animations' in require('./package.json').devDependencies"` → `false`
    3. Write the config file with the report path in tmp and nothing else
       Check: `node -p "JSON.stringify(require('./angular-doctor.config.json'))"` → `{"reportPath":"tmp/angular-doctor-report.md"}`
- **Readiness sign:** the version is exact, the animations package is gone from the root
  manifest, the report has its place outside history and the config turns nothing off.
- **Verified by:** the three check lines above; `node tools/check-dependencies.mjs` — the line
  «versions are exact, the waiting term is written».

### 2. The threshold check

- **Steps:**
    1. Write the check that reads the JSON of the tool from stdin and compares the score with the threshold
       Check: `pnpm run -s check:ngdoctor` → /^score (\d+) = threshold \1$/
    2. Write its scenario set: equal, lower, higher, empty input, broken input
       Check: `bash tools/tests/check-ngdoctor.test.sh` → exit 0
    3. Add the scenario set to the selection by a changed file
       Check: `echo tools/check-ngdoctor.mjs | bash tools/tests/select.sh` → /check-ngdoctor/
    4. Add the step to check:all
       Check: `node -p "require('./package.json').scripts['check:all'].includes('pnpm run check:ngdoctor')"` → `true`
- **Readiness sign:** the check ends with «score N = threshold N» on the tree; its scenarios are
  green, each red verdict among them.
- **Verified by:** the four check lines above.

### 3. Texts

- **Steps:**
    1. Name the command and its place in check:all in CLAUDE.md
       Check: `grep -c "check:ngdoctor" CLAUDE.md` → >= 2
- **Readiness sign:** `CLAUDE.md` names `check:ngdoctor` in the command list and in the
  description of `check:all`; knip has no findings.
- **Verified by:** the check line above; `pnpm run check:unused` — exit 0.

## What this work does not do

- Fixes no finding of Angular Doctor apart from the unused animations package: that is the rest
  of the epic RT-3476, tasks RT-3478 to RT-3490.
- Does not add the step to the push set or to the pipeline: the owner named `check:all`. Whether
  the pipeline runs it as well is a question to the owner, asked together with the approval of
  this plan.
