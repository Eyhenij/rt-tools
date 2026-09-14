# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — the intake operation
- **Done:** stage 1 — the model `Observation`, the migration `20260914200000_observation_rows`, `observation.queries.ts` with its spec (13 tests green in the lib), `check:schema` green.
- **Next step:** `observation.const.ts`, the intake controller, `IObservationsAccepted`, `CARGO_KINDS`.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no — autonomous session.
- **PR:** not open; nothing leaves during the night.

## Decisions along the way

- none yet

## Sessions

### 2026-09-14

- The folder written; the branch taken from `RT-2098-observations-cargo`.
- Stage 1 done: the migration written by `migrate diff` on a one-off container, the chain matches the schema.
