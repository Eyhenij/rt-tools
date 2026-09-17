# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `разбор-кончился`
- **Stage:** 3 of 3 — the seven tasks are closed and the tree texts are up to date
- **Done:** the board check names an open task standing in a closing column; the declaration of an epic is read by the shape of the line; both suites green — 91 ok and 19 ok; the seven tasks closed with a comment naming their request; the rule, the specs and the bindings carry the new articles
- **Next step:** take the folder apart into the description of the past, push and open the request into the main branch
- **Uncommitted:** the edits of the checks, the suites, the rule and the specs
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The task was created outside an epic by the owner's word.** — The owner said «исправляй автоматизацию» after the epic RT-2146 ended. Affected stage of the plan: none.
- **The body of the task was reworded.** — The phrase «задачи эпика #1870» in it was read by the delivery check as a declaration of belonging, and the branch from main was refused. The defect itself went into the task. Affected stage of the plan: 2.

## Sessions

### 2026-09-17

- The board check reads the closing columns from the settings of the queue and names an open task standing in one of them; the suite of the queue audit — 91 ok.
- The declaration of belonging to an epic is read only at the start of a line: the words «семь задач эпика #1870» inside a sentence no longer count as one; the suite of the delivery guard — 19 ok.
- Seven open tasks found in «Done»: #1878, #1951, #1961, #1970, #1988, #2090, #2102 — all merged into the epic branch of #1870 on 14–15 September, before the closing pipeline was added. All seven are closed with a comment naming their request; the live audit prints no such line.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2185-open-tasks-in-done

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — the audit names an open task in a closing column
- **Next step:** read the closing columns from the settings in the board check and report an open task standing in one of them
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2185-open-tasks-in-done/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/agent-kit/assets/checks/board-epic-link.github.mjs
 M projects/agent-kit/assets/checks/check-board.github.mjs
 M projects/agent-kit/tests/checks-board.test.sh
 M projects/agent-kit/tests/guard-epic-base.test.sh
 M tools/board-epic-link.mjs
 M tools/check-board.mjs
```

### Commits over the main branch

```
213a10525 docs(rt:agent-kit): папка задачи RT-2185 заведена, план записан
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
