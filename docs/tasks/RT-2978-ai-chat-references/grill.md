# Grill

## The owner request

> RT-2972 сейчас, потом RT-2965 (Recommended)

The owner ordered the gate for RT-2965 to be cleared. After #2973 (epic RT-2958) merged, the second
kit snapshot check on main fails on the ai-chat stories, and no branch from main passes the gate.
Per rule `task-flow`, a red main branch is fixed before new work is taken.

## What the tree already has

- `node tools/visual-gate.mjs ui-kit-v2` on RT-2976 (fresh main inside): 10 failed snapshots, all
  `organisms-chat-aichat--*`.
- The diff frames show one change: the composer is now one box — the text on top, the row of
  actions inside at the bottom. That is the rule «The composer of the assistant is one box» of the
  ai-chat spec, from RT-2964.
- No open PR or task re-takes these references.

## Questions and answers

Question closed by assumption: behaviour does not change — only references are re-taken.

Question closed by assumption: no law or rule edit.

Question closed by assumption: one task.

Question closed by assumption: not part of the task — any other story.

Question closed by assumption: closed when the second kit snapshot check shows 0 failed.

Question closed by assumption: sample — RT-2972.

## Decisions

- **Only the ai-chat story file is re-taken** — every failed frame belongs to it.
