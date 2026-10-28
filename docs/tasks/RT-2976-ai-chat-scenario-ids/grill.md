# Grill

## The owner request

> RT-2972 сейчас, потом RT-2965 (Recommended)

The owner ordered the push of RT-2965 to be unblocked. After #2973 (epic RT-2958) merged, main
fails the specs audit, and no branch from main passes the gate before push. Per rule `task-flow`, a
red main branch is fixed before new work is taken.

## What the tree already has

- `node tools/check-specs.mjs` on fresh main: 7 divergences. The ai-chat scenarios
  `SC-UKV-1040`…`SC-UKV-1046` repeat numbers taken first by aside-options (RT-2957, commit
  `e9d3ba5cb`, 18:26) and form-dictionary (RT-2955). The ai-chat ones came later (`a8777328b`,
  18:57).
- `npm run spec:next-id -- UKV` — the next free number is `SC-UKV-1051`.
- The session of RT-2957 answered that nobody fixes the ai-chat numbers, and the aside-options
  numbers must stay.
- Places to edit: `docs/specs/ui-kit-v2/ai-chat/scenarios.md`, its `implementation.md`, and test
  titles in seven spec files — markdown-parse, markdown-text styles, ai-chat styles, thread-list
  styles, ai-prompt-input, usage-ring.

## Questions and answers

Question closed by assumption: behaviour does not change — only scenario numbers and test titles.

Question closed by assumption: no law or rule edit.

Question closed by assumption: one task.

Question closed by assumption: not part of the task — the numbers of aside-options and
form-dictionary.

Question closed by assumption: closed when `node tools/check-specs.mjs` shows no divergence and the
second kit tests are green.

Question closed by assumption: sample — the renumbering in #2963.

## Decisions

- **The later-issued numbers move** — 1040→1051, 1041→1052, 1042→1053, 1043→1054, 1044→1055,
  1045→1056, 1046→1057. Rejected: moving the aside-options numbers, which were issued first.
