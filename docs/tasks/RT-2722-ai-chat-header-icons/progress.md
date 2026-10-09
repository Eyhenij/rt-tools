# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — The icon sign and the header input
- **Done:** the sign `data-rt-icon-preset`, the drawings of `history` and `window-minimize`, `headerIconPreset`, the spec cases, 5 re-taken frames, the specs and the documents
- **Next step:** on the owner's word: this folder goes to `docs/archive/`, the PR opens after RT-2720 is merged, then the merge and the publish of the kit
- **Uncommitted:** no
- **Waiting for the owner:** the word on the PR, the merge and the publish
- **PR:** not open yet

## Steps

- [x] 1.1 The sign `data-rt-icon-preset` and its constant
- [x] 1.2 The material drawings of `history` and `window-minimize`
- [x] 1.3 `headerIconPreset` on `rt-ai-chat` with the spec cases
- [>] 1.4 The specs, scenarios SC-UKV-779 and SC-UKV-780, CONTEXT and Overview

## Decisions along the way

- **The branch is rebased onto the updated `RT-2720-ai-chat-copy`.** — the answer copy became plain text there; the conflicts in the chat spec history and CONTEXT kept both lines. Affected stage of the plan: 1.

## Sessions

### 2026-10-09

- Task #2722 created outside an epic, branch taken from `RT-2720-ai-chat-copy`.
- `tools/fetch-material-icons.mjs` rewrote every material file in its unformatted form; only the four new files were kept, formatted by prettier.
- `check-icon-map`: 56 entries, 56 with a pair.
- `@rt-tools/ui-kit-v2`: lint, typecheck green; tests 216 suites, 2621 passed.
- The frames re-taken: `atoms-icon--material-set`, `--material-themes`, `--migration-map`, `--presets`, `organisms-chat-aichat--answer`; the other 800 matched.
- The fresh worktree lacked the ignored `.claude/rt-kit/tree-name` and `.claude/handoff/`, and `check-doc-paths` refused; both were laid like in the neighbouring worktree.
- The push set from `rt_push_checks`: green, `check-schema-drift` had nothing to look at.
