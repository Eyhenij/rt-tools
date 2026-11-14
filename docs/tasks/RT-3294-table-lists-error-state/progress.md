# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The table and the data list
- **Done:** stage 1 — `rt-table` and `rt-data-list` take `error`, `errorDescription` and
  `retry` and their own empty and error templates; SC-UKV-1279…1282 and SC-UKV-1285 are covered by
  `rt-table.states.spec.ts` and `rt-data-list.states.spec.ts`.
- **Next step:** step 2.1 — the error input, the retry output and both template directives of
  `rt-dynamic-list`.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no; the consumer session is asked about the push set limit that holds
  the RT-3292 push.
- **PR:** not open yet.

## Steps

- [x] 1.1 Add `error`, `errorDescription`, `retry`, `rtTableEmptyState` and `rtTableError` to `rt-table`
- [x] 1.2 Add `error`, `errorDescription`, `retry`, `rtDataListEmpty` and `rtDataListError` to `rt-data-list`
- [x] 1.3 Cover SC-UKV-1279…1282 and SC-UKV-1285 by the specs
- [>] 2.1 Add `error`, `errorDescription`, `retry`, `rtDynamicListEmpty` and `rtDynamicListError` to `rt-dynamic-list`
- [ ] 2.2 Add `error`, `errorDescription`, `retry`, `rtBarListEmpty` and `rtBarListError` to `rt-bar-list`
- [ ] 2.3 Cover SC-UKV-1283, SC-UKV-1284 and SC-UKV-1286 by the specs
- [ ] 3.1 Add a story of the error and both own views for each of the four components
- [ ] 3.2 Compare the stories with the frames by measurement and show them to the owner

## Decisions along the way

None yet.

## Sessions

### 14.11.2026

- The branch `RT-3294-table-lists-error-state` from `RT-3292-thread-list-error-state`; the grill
  written from the task body, the epic plan and a survey of the four components.
