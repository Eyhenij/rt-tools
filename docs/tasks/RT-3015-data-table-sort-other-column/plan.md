# Plan — the header of rt-data-table follows its spec

**Spec:** `docs/specs/ui-kit-v2/table-full-port/spec.md`

## Done sign

A press on another column of `rt-data-table` after an ascending sort asks for the ascending order;
the same column goes ascending, descending, ascending. SC-UKV-1107 and the new SC-UKV-1113 are green,
the oddity line of RT-3015 is gone from the spec, the kit tests are green.

## Footprint

- `projects/ui-kit-v2/src/lib/components/table-core/rt-table-sort.core.ts` — the cycle `repeats`.
- `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts` — tests.
- `docs/specs/ui-kit-v2/table-full-port/` — the scenario SC-UKV-1113, the oddity line removed.

## Rules of the agreement and their stages

| Rule                                                                | Stage | Check       |
| ------------------------------------------------------------------- | ----- | ----------- |
| a press asks ascending, on the column sorted ascending — descending | 1     | SC-UKV-1113 |
| a press after descending asks ascending again                       | 1     | SC-UKV-1107 |

## Stages

### Stage 1 — the cycle by the pressed column

1. The cycle `repeats` looks at the pressed column
2. The scenario SC-UKV-1113 and its test, the oddity line removed

Readiness: the core spec is green, the kit typecheck is green.

### Stage 2 — closing

1. The kit tests and lint
2. The folder taken apart, the PR into the RT-2867 branch

Readiness: the push set is green.
