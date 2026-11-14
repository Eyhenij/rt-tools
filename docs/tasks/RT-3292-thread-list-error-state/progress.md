# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 4 of 4 — The showcase
- **Done:** the agreement `docs/specs/ui-kit-v2/proposed/error-states/` with scenarios
  SC-UKV-1267…1278; `npm run check:specs` lists only them as without a test.
- **Next step:** the reference snapshots of the new and changed stories; then the merge of the
  agreement and the close-out.
- **Uncommitted:** no.
- **Waiting for the owner:** nothing; the showcase is approved on 14.11.2026, the record is in
  `approvals.md`.
- **PR:** not open yet.

## Steps

- [x] 1.1 Write the feature spec of the shared contract and of the three components
- [x] 1.2 Write its scenarios
- [x] 2.1 Add the labels `uiLoadError`, `uiLoadErrorHint`, `uiRetry` and the max-width variable of `rt-empty-state`
- [x] 2.2 Add `error`, `retry`, the text inputs and both slots to `rt-thread-list`, with the load more error row
- [x] 2.3 Fix the header and the tab switch spacing of `rt-thread-list`
- [x] 2.4 Cover the new states by the spec
- [x] 3.1 Add `error`, `retry`, `emptyTitle`, `emptyIcon` and both slots to `rt-chat`; fix the `emptyHint` render
- [x] 3.2 Add `error`, `retry` and the error slot to `rt-workspace-details`
- [x] 3.3 Cover the new states by the specs
- [x] 4.1 Add a story for every new state of the three components
- [x] 4.2 Compare the stories with the frames by measurement and show them to the owner

## Decisions along the way

- **The empty title input keeps its former name `emptyText`** — renaming it would break the
  consumers of the published kit; the agreement names it so. Affected stage of the plan: 2.
- **An empty list without search and filters now titles «Пока пусто» (`uiThreadListEmpty`), not
  «Ничего не найдено»** — the agreement parts the two states; the former spec expectation is edited.
  Affected stage of the plan: 2.

- **The epic branch went to the remote on 14.11.2026 after main was merged in** — the push inputs
  check is still red on main, but the push set no longer runs it for this change. Affected stage of
  the plan: none.
- **The error view of the chat and the details panel is built by one helper `rtLoadErrorView` next
  to `rt-empty-state`** — the same title, hint and template context in every component; the thread
  list keeps its own computed values, written and tested before the helper. Affected stage: 3.
- **The details panel error stands in the details tab instead of a toast** — the approved frame
  says so; transition and history errors stay toasts. The former toast test is replaced by
  SC-UKV-1278. Affected stage: 3.
- **The import list of `rt-chat` moved to `rt-chat.imports.ts`** — the component file stood at
  499 lines of the 500 limit. Affected stage: 3.
- **The measurement against the frames found three code misses, fixed in stage 4:** the load more
  error row was a whole placeholder instead of a short row with the text and the button; its rule
  named the undeclared token `--rt-space-3`; the chat width variable lost to the placeholder's own
  rule and the placeholder shrank to its content. Affected stage: 4.
- **What still differs from the frames is the Figma copy of the kit, not this change:** the
  placeholder title line 24 against 20 in code and no side padding; the skeleton row 49 against 54;
  the details tab label «Переход» against «Переход этапа» and the first tab at 17 against 25.
  Affected stage: 4.
- **The empty list keeps its preview rows, not the inbox icon of the frame** — the owner's answer on
  14.11.2026: «Строки-превью»; the frame in Figma is brought to the code. Affected stage: 4.
