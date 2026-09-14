# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 done — the keeping term
- **Done:** stage 3 — `observation-retention.util.ts` (pure moment and boundary), `observation-retention.service.ts` (one timer per run, a journal line per tree, a failure as a line), 34 tests green across the three libs, `nx build message-bus` green, lint of the four projects green; stage 2 — `observation.const.ts`, `observation-cargo.util.ts` (6 tests), `observations-intake.controller.ts` (6 tests), `IObservationsAccepted`, `CARGO_KINDS` and the startup line name the new kind and the lines cap; stage 1 — the model `Observation`, the migration `20260914200000_observation_rows`, `observation.queries.ts` with its spec (13 tests green in the lib), `check:schema` green.
- **Next step:** bring the intake domain texts up to date; take the folder apart.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no — autonomous session.
- **PR:** not open; nothing leaves during the night.

## Decisions along the way

- **The lines cap reader lives in the util lib and is re-exported by the feature lib.** The application may depend on the feature lib only; the controller in the feature lib reads the same function. Affected stage: 2.
- **The sweep deletes per tree and takes the count from the delete.** A grouped count before the delete is a second number that may diverge; the typed aggregate of the storage client also refused the annotation. Affected stage: 3.

## Sessions

### 2026-09-14

- The folder written; the branch taken from `RT-2098-observations-cargo`.
- Stage 3 done: the sweep rewritten without `groupBy` — the count comes from the delete itself; the build caught two type errors the runner did not.
- Stage 2 done: the parser split into small functions under the complexity limit; the app names the cap in its startup line.
- Stage 1 done: the migration written by `migrate diff` on a one-off container, the chain matches the schema.
