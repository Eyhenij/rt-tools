# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — done
- **Done:** stage 1 — `lastMainRun`, `pipelineWakesOnPush`, `pipelineText` in
  `board-runs.github.mjs`, the two findings and the out-loud line in `check-board.github.mjs`, the
  stub case in `lib-board.sh`, scenario SC-AK-1104 in `checks-board-main-run.test.sh` (12 ok, 0
  провалов; the board suite stays at 81 ok). Stage 2 — the two rules, the scenario and the bindings
  in `docs/specs/agent-kit/work/queue-check/`, the audit article in `rules/git-workflow.github.md`,
  the binding in the companion; `check-specs: scenarios 1587 — covered 1439`, `sync --check` сходится.
- **Next step:** the package suite whole, then the folder taken apart, the PR into the epic branch
- **Uncommitted:** everything of both stages
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- The spec of the audit lies in `docs/specs/agent-kit/work/queue-check/`, not in
  `docs/specs/agent-kit/board/` as the plan names: the board directory holds another subdomain, and
  the scenarios of the queue audit (SC-AK-531, 584…590) live in queue-check. The plan is not edited;
  the rule, the scenario and the binding went where their neighbours are.
- SC-AK-1104 lives in a suite of its own, `checks-board-main-run.test.sh`: the board suite went past
  the limit of 500 lines with it, and the file-size check refused. The suite shares `lib-board.sh`.

## Sessions

### 2026-09-15

- The epic RT-2146 was declared with four tasks and its plan; this task is its first. Both
  analyses stay «new» in the intake: a foreign record is closed by the publisher into fixed or
  released only — the mark comes with the merge of the epic.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2147-audit-main-run

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — The reading and the finding
- **Next step:** `lastMainRun` and `pipelineWakesOnPush` in `board-runs.github.mjs`, the report in `check-board.github.mjs`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2147-audit-main-run/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/agent-kit/assets/checks/board-runs.github.mjs
```

### Commits over the main branch

```
2961eb5ec docs(rt:agent-kit): папка задачи RT-2147 заведена, план записан
06110b428 docs(rt:agent-kit): замысел эпика RT-2146 — красная главная ветка и задачи череды видны дереву
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
