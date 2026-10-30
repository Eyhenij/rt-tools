# Progress

## Where we stand

- **State:** `этап-идёт`
- Stage 1 is done: the core spec 23 of 23, typecheck, spec and path checks green. Stage 2 goes on.

### Stage 1 — the cycle by the pressed column

- [x] 1. The cycle `repeats` looks at the pressed column
- [x] 2. The scenario SC-UKV-1113 and its test, the oddity line removed

### Stage 2 — closing

- [ ] 1. The kit tests and lint ← now
- [ ] 2. The folder taken apart, the PR into the RT-2867 branch

## Decisions along the way

- The question was closed by assumption, the spec wins: see the grill.
- The core test that pinned the old behaviour (another column after ascending asks descending) is
  removed; SC-UKV-1113 checks the opposite.

## Sessions

- 2026-10-30: task taken after RT-2867 was handed over (#3020); the plan written.
