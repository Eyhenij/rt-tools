# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — done
- **Done:** stage 1 — `main-run.github.mjs` and `checks-main-run.test.sh` (14 ok). Stage 2 —
  `main-run-context.sh` and `main-run-context.test.sh` (11 ok); laid out, the dispatcher serves it
  at session start. Stage 3 — the article and the `Requires` entry in `rules/task-flow.md` (seven
  arguments folded for the weight limit), the binding in the companion; two rules, SC-AK-1105 and
  SC-AK-1106 and the bindings in `docs/specs/agent-kit/turn-entry/`; `check-specs: scenarios 1589
— covered 1441`; `sync --check` сходится; glossary and boundary checks clean.
- **Next step:** the package suite whole, the folder taken apart, the PR into the RT-2147 branch
- **Uncommitted:** everything of the three stages
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The branch stands on RT-2147, not on the epic branch alone.** The command imports
  `lastMainRun` and `pipelineWakesOnPush`, written by RT-2147 and not yet merged into the epic
  branch: the RT-2147 branch was merged in, and the PR opens with it as the base — the chain
  pattern. The epic plan says so now. Affected stage: 1.

## Sessions

### 2026-09-15

- The task is taken right after RT-2147 was handed in (PR #2151). The main branch was merged into
  the epic branch first: #2145 had reached it.
