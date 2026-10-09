# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — The copy buttons
- **Done:** `rt-ai-chat-copy`, both rows, `copyable`, the spec cases, 8 re-taken frames, the spec and the documents; the answer copies plain text
- **Next step:** on the owner's word: this folder goes to `docs/archive/`, the PR opens into `main`, then the merge and the publish of the kit
- **Uncommitted:** no
- **Waiting for the owner:** the word on the PR, the merge and the publish
- **PR:** not open yet

## Steps

- [x] 1.1 `rt-ai-chat-copy` and the answer row
- [x] 1.2 The question row and `copyable` with the spec cases
- [x] 1.3 The showcase frames re-taken
- [x] 1.4 Overview, CONTEXT and the assistant chat spec with scenarios SC-UKV-777 and SC-UKV-778

## Sessions

### 2026-10-09

- Task #2720 created outside an epic, branch taken from `origin/main`.
- The labels are the kit's `uiCopy` and `uiCopied`: both texts already exist in the English set and the showcase Russian set, so no `ai*` keys were added.
- `@rt-tools/ui-kit-v2`: lint, typecheck green; tests 216 suites, 2617 passed.
- The frames re-taken: `answer`, `extra`, `full-screen`, `long`, `playground`, `presets`, `run-error`, `themes`; `empty` and `threads` matched.
- The push set from `rt_push_checks`: 49 lines, 48 green, `check-schema-drift` skipped with code 7 (no database address); the showcase snapshots 788 tests, 805 frames matched on a second raising; the admin suite 146 passed; the auth example 10 passed.
- The owner's change: the answer copied its markdown source with `##`, `**` and list markers; now it copies the visible text. Decision: `markdownToPlainText` in the kit core, built on the same `parseMarkdown` tree that `rt-markdown-text` draws. Rejected: `innerText` of the rendered body — jsdom has no `innerText`, so the spec would test a stand-in rather than the real path. The question still copies its text as is.
- After the change: `@rt-tools/ui-kit-v2` lint, typecheck green; tests 217 suites, 2625 passed. The push set: 49 lines, 47 green, `check-schema-drift` skipped with code 7 (no database address), `check-work-steps` red on an extra progress step and green after it was removed; the showcase snapshots 788 tests, 805 frames matched; the admin suite 146 passed; the auth example 10 passed.
