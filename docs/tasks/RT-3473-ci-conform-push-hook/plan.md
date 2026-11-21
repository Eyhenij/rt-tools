# Plan

**Task:** RT-3473 · **Branch:** RT-3473-ci-conform-push-hook
**Behaviour:** unchanged — код приложений не меняется. Меняется окружение пробы в сверке таблицы решений: переменные конвейера не доходят до хука. Слово владельца: «обязан сам следить за проверками и ci».

## Points

- **A:** the pipeline run 44884048830 on the epic's PR #3472 is red: `SC-AK-1563` «rows 1012,
  mismatch 2», two rows `pre-push.sh:push:deny`. The hook passes everything under `CI`
  (`pre-push.sh:42`), and the probe hands it the pipeline's environment. The sweep with `CI=true`
  repeats it on this machine. Steps 32–40 of that run did not start at all.
- **This task reaches:** the sweep judges hooks as the session sees them on any machine, the steps
  the run skipped are green here, and the epic's PR into main gets a run that goes past step 31.
- **Sign:** `CI=true GITHUB_ACTIONS=true node ../assets/checks/decision-table.mjs --conform` run
  from `projects/agent-kit/tests` ends with «mismatch 0»; the suite holds `SC-AK-1798`, red on the
  unchanged probe; `pnpm run lint:styles` and `nx affected -t verify` exit 0.
- **Milestone G of the epic:** the epic reaches main and the package release; a red run that only
  the pipeline shows blocks both.
- **Metric:** нет: сверка таблицы решений краснела только на конвейере.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/testing/`, `.claude/skills/agent-kit-source/` — читаются |
| Code  | `projects/agent-kit/assets/checks/decision-table.mjs` |
| Code  | `projects/agent-kit/tests/decision-table.test.sh` |
| Specs | `docs/specs/agent-kit/decision-table/` |
| Code  | `tools/decision-table.mjs` — разложенная копия, её пишет раскладка |

## What counts as done

- A probe runs its hook without the variables of the pipeline: `CI` and `GITHUB_ACTIONS` do not
  reach it.
- The sweep under the pipeline's variables gives «mismatch 0».
- The suite holds `SC-AK-1798`: the sweep under `CI=true` over a table of the two `pre-push.sh`
  rows. On the unchanged probe it gives «rows 2, mismatch 2», measured 21.11 in 0.3 s.
- The description holds the scenario; the laid-out copies match the package.
- The pipeline steps the red run skipped and that run here without a stand are green.

## Stages

### 1. The probe runs without the pipeline's variables

Rules: `runProbe` drops the variables of the pipeline from the environment of a probe. A case of the
suite builds a table of the two `pre-push.sh` rows and runs the sweep over it under `CI=true`: the
full sweep is not run twice.

- **Steps:**
    1. The sweep under the pipeline's variables gives no mismatch
       Check: `(cd projects/agent-kit/tests && CI=true GITHUB_ACTIONS=true node ../assets/checks/decision-table.mjs --conform | tail -1 | grep -c 'mismatch 0$')` → = 1
    2. The suite holds the scenario of the pipeline's variables
       Check: `VERBOSE=1 bash projects/agent-kit/tests/decision-table.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1798'` → >= 1
- **Readiness sign:** the suite ends with 0 failures; with the probe's line reverted, the case
  `SC-AK-1798` fails.
- **Verified by:** `bash projects/agent-kit/tests/decision-table.test.sh` — exit 0;
  `pnpm run agent-kit:check` — exit 0. The steps after step 31 of the red run that need no stand
  run here too: `pnpm run lint:styles` — exit 0; `pnpm exec nx affected -t verify --parallel
  --base=origin/main --head=HEAD` — exit 0. Both are green before the work, so they are a guard
  against a regression, not steps: the engine marks no check that is green before the work. The
  end-to-end suites, the snapshots and the images are seen only on the run of #3472.

### 2. The description

Rules: the scenario gets its number and its binding in the companion of the spec.

- **Steps:**
    1. The scenario stands in the description
       Check: `grep -c '^### SC-AK-1798' docs/specs/agent-kit/decision-table/scenarios.md` → = 1
- **Readiness sign:** the count holds, and the coverage check is green.
- **Verified by:** `npm run check:spec-coverage` — exit 0; `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- It does not change the push hook: its pass under the pipeline stays.
- It does not judge other hooks for other variables of the pipeline: the sweep shows none today.
- The run of #3472 after this task is merged into the epic branch is watched to its end outside
  this folder: the folder is taken apart before that run starts. A new red step there becomes a
  task of its own, and the run is watched again.
