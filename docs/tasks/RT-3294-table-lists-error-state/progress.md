# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The showcase
- **Done:** stages 1 and 2 — all four components take `error`, `errorDescription` and `retry` and
  their own empty and error templates; SC-UKV-1279…1286 are covered by the four `*.states.spec.ts`.
  The four `ErrorAndPlaceholders` stories stand in the showcase; the data list error keeps the kit
  placeholder instead of the first kit empty look.
  The stories match the four frames 32 of 32 by `tools/kit-match.mjs`; the table error is 400 wide
  in the middle, the data list error takes the whole width.
  The owner approved the showcase on 14.11.2026: «Одобряю».
- **Next step:** the references, the agreement merge and the folder.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no; the consumer session is asked about the push set limit that holds the RT-3292 push.
- **PR:** not open yet.

## Steps

- [x] 1.1 Add `error`, `errorDescription`, `retry`, `rtTableEmptyState` and `rtTableError` to `rt-table`
- [x] 1.2 Add `error`, `errorDescription`, `retry`, `rtDataListEmpty` and `rtDataListError` to `rt-data-list`
- [x] 1.3 Cover SC-UKV-1279…1282 and SC-UKV-1285 by the specs
- [x] 2.1 Add `error`, `errorDescription`, `retry`, `rtDynamicListEmpty` and `rtDynamicListError` to `rt-dynamic-list`
- [x] 2.2 Add `error`, `errorDescription`, `retry`, `rtBarListEmpty` and `rtBarListError` to `rt-bar-list`
- [x] 2.3 Cover SC-UKV-1283, SC-UKV-1284 and SC-UKV-1286 by the specs
- [x] 3.1 Add a story of the error and both own views for each of the four components
- [x] 3.2 Compare the stories with the frames by measurement and show them to the owner

## Decisions along the way

None yet.

## Sessions

### 14.11.2026

- The branch `RT-3294-table-lists-error-state` from `RT-3292-thread-list-error-state`; the grill
  written from the task body, the epic plan and a survey of the four components.
