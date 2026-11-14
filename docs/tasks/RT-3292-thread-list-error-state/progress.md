# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — The shared error view and the thread list
- **Done:** the agreement `docs/specs/ui-kit-v2/proposed/error-states/` with scenarios
  SC-UKV-1267…1278; `npm run check:specs` lists only them as without a test.
- **Next step:** the header and the tab switch spacing of `rt-thread-list`.
- **Uncommitted:** no.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Steps

- [x] 1.1 Write the feature spec of the shared contract and of the three components
- [x] 1.2 Write its scenarios
- [x] 2.1 Add the labels `uiLoadError`, `uiLoadErrorHint`, `uiRetry` and the max-width variable of `rt-empty-state`
- [x] 2.2 Add `error`, `retry`, the text inputs and both slots to `rt-thread-list`, with the load more error row
- [>] 2.3 Fix the header and the tab switch spacing of `rt-thread-list`
- [ ] 2.4 Cover the new states by the spec
- [ ] 3.1 Add `error`, `retry`, `emptyTitle`, `emptyIcon` and both slots to `rt-chat`; fix the `emptyHint` render
- [ ] 3.2 Add `error`, `retry` and the error slot to `rt-workspace-details`
- [ ] 3.3 Cover the new states by the specs
- [ ] 4.1 Add a story for every new state of the three components
- [ ] 4.2 Compare the stories with the frames by measurement and show them to the owner

## Decisions along the way

- **The empty title input keeps its former name `emptyText`** — renaming it would break the
  consumers of the published kit; the agreement names it so. Affected stage of the plan: 2.
- **An empty list without search and filters now titles «Пока пусто» (`uiThreadListEmpty`), not
  «Ничего не найдено»** — the agreement parts the two states; the former spec expectation is edited.
  Affected stage of the plan: 2.

- **The epic branch went to the remote on 14.11.2026 after main was merged in** — the push inputs
  check is still red on main, but the push set no longer runs it for this change. Affected stage of
  the plan: none.
