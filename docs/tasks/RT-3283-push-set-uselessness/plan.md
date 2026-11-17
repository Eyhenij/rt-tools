# Plan

**Task:** RT-3283 · **Branch:** RT-3283-push-set-uselessness
**Draft:** `docs/specs/agent-kit/proposed/push-set-usefulness/`
**Behaviour:** changes

## Points

- **A:** the push set runs every check on every push; which of them finds a defect, which refuses
  falsely and which runs on a change it cannot reach is seen only from incident analyses. The
  package hook scenarios run whole on any branch of the package — 11–19 minutes a run.
- **This task reaches:** `agent-kit metrics` prints a table «Проверки набора» — per check the runs
  and seconds, the refusals, the false refusals, the idle runs and the seconds per real defect — and
  names, ordered by seconds, the checks never useful and the falsely refusing ones.
- **Sign:** on the marks of 11–17 November 2026 the list «ложных больше настоящих» names the snapshot
  step of the second kit (45 false of 58) and the admin e2e (19 of 30); a run of the package hook
  scenarios on a branch that edits only the library code is counted idle. The first week of real
  records after the merge is read again by the owner — the remaining step of the PR.
- **Milestone G of the epic:** less than five refusals per hundred calls in a working day and no dead
  end. This task does not move the number; it shows which checks of the set to move or fix.
- **Metric:** the false refusals of the push set per week: baseline 92 of 254 red runs on 11–17
  November 2026 — a red run counts false when a later run of the same command on the same content
  sign went green, the marks read in day order; the direction is down, later tasks move it.

## Task footprint

| What | Where |
| --- | --- |
| Specs | `docs/specs/agent-kit/proposed/push-set-usefulness/`, `docs/specs/agent-kit/metrics/`, `docs/specs/agent-kit/push-gate-ahead/`, `docs/specs/agent-kit/hooks/` |
| Laws | `docs/constitution/observability.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/agent-kit-source/` |
| Code | `projects/agent-kit/assets/hooks/metric-marks.sh` (правится), `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh` (правится), `projects/agent-kit/assets/hooks/push-set.sh` (правится), `projects/agent-kit/assets/checks/push-inputs.mjs` (правится), `projects/agent-kit/assets/defaults/project.sh` (правится), `.claude/rt-kit/project.sh` (правится), `projects/agent-kit/src/lib/metrics.ts` (правится), `projects/agent-kit/src/lib/push-set-usefulness.ts` (новый), `projects/agent-kit/tests/push-set-runs.test.sh` (новый), `projects/agent-kit/README.md` |

## What counts as done

- `agent-kit metrics` prints the table of the push set checks with five numbers per check, one line
  per check whatever its base.
- A red run followed by a green run on the same content sign counts as a false refusal (SC-AK-1659).
- The package hook scenarios on a branch that edits only the library code count as idle (SC-AK-1662).
- On the marks of 11–17 November the falsely refusing list names the kit snapshots and the admin
  e2e (SC-AK-1666).

## Stages

### 1. The record of a run

- **Steps:**
    1. `push-inputs.mjs subject <base>` prints per step `touched`, `idle`, `unknown` or `not-run`, by the push inputs table and by the subject the profile declares with `rt_push_subject`
       Check: `bash projects/agent-kit/tests/push-inputs.test.sh >/dev/null && grep -oE 'SC-AK-(1661|1662)' projects/agent-kit/tests/push-inputs.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    2. The profile of this tree declares the subject of the package hook scenarios — the hooks, the checks and the scenarios of the package — and of the steps the table does not record
       Check: `bash -c '. .claude/rt-kit/project.sh >/dev/null 2>&1; rt_push_subject "RT_SUITES_BASE=origin/main pnpm exec nx affected -t test-hooks --base=origin/main"' | grep -c 'projects/agent-kit/assets'` → >= 1
    3. `rt_run_note` writes the moment, the base checksum and the subject mark, and takes the command checksum with the base replaced by a mark
       Check: `bash projects/agent-kit/tests/push-set-runs.test.sh >/dev/null && grep -oE 'SC-AK-(1657|1667)' projects/agent-kit/tests/push-set-runs.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    4. Both runners of the set write a line of seven fields for every step, a step `select` dropped included
       Check: `bash projects/agent-kit/tests/push-set-runs.test.sh >/dev/null && grep -c 'seven fields' projects/agent-kit/tests/push-set-runs.test.sh` → >= 2
- **Readiness sign:** a run of the set in a scratch tree writes seven fields per run line.
- **Verified by:** `bash projects/agent-kit/tests/push-set-runs.test.sh` — the last line ends with «0 провалов».

### 2. The report

- **Steps:**
    1. `push-set-usefulness.ts` counts per check the runs, the seconds, the refusals, the false and the real refusals, the idle and the not-run steps and the price of a defect, old lines included
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/push-set-usefulness.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1658|1659|1660|1663)' projects/agent-kit/src/lib/push-set-usefulness.spec.ts | sort -u | wc -l | tr -d ' '` → = 4
    2. `agent-kit metrics` prints the section «Проверки набора» and the two lists of candidates ordered by seconds, one line per check over its bases, narrowed by `--day`
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/push-set-usefulness.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1664|1665|1667|1668)' projects/agent-kit/src/lib/push-set-usefulness.spec.ts | sort -u | wc -l | tr -d ' '` → = 4
    3. The report over 11–17 November of this machine names the kit snapshots and the admin e2e as falsely refusing
       Check: `pnpm run build:agent-kit >/dev/null 2>&1 && node dist/agent-kit/bin/agent-kit.js metrics --days 7 | awk '/ложных больше настоящих/{f=1;next} f&&/^$/{f=0} f' | grep -cE 'visual-gate.mjs ui-kit-v2|message-bus-admin-e2e:e2e'` → = 2
- **Readiness sign:** the report of this machine prints the table and names both costly candidates.
- **Verified by:** `node dist/agent-kit/bin/agent-kit.js metrics --days 7` — the section «Проверки набора» with a line per check.

### 3. Closing

- **Steps:**
    1. The agreement merges into the package spec as the subdomain `push-set-usefulness` with its bindings
       Check: `test ! -d docs/specs/agent-kit/proposed/push-set-usefulness && grep -c 'SC-AK-166' docs/specs/agent-kit/push-set-usefulness/scenarios.md` → >= 8
    2. The README of the package names the table of the push set checks
       Check: `grep -c 'Проверки набора' projects/agent-kit/README.md` → >= 1
- **Readiness sign:** the agreement is merged, the texts name the table.
- **Verified by:** `npm run check:specs` — no line about `push-set-usefulness`.

## What this work does not do

- Sending the table to the receiver and a screen for it: the request names only the report.
- Removing or moving a check: the report names candidates, the owner decides.
- Making the package hook scenarios run only the suites the change reaches: the report shows what
  they cost idle; a task of its own moves the number, filed by the closing of this work.
- Reading the first week of real records after the merge: it is the remaining step of the PR.
