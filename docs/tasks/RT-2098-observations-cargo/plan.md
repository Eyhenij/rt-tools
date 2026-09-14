# Plan

**Task:** RT-2098 · **Branch:** RT-2098-observations-cargo
**Draft:** `docs/specs/agent-kit/proposed/rule-usage-stats/`
**Behaviour:** changes

Epic RT-2097, task 1 of 4. The agreement of the receiving side, `docs/specs/message-bus/proposed/rule-usage-stats/`, travels in this branch too: the chain carries it up to the tasks that need it.

## Task footprint

| What  | Where                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/observations/`, `docs/specs/agent-kit/proposed/rule-usage-stats/`                                       |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/observability.md`                                                    |
| Rules | `.claude/skills/testing/`, `.claude/skills/agent-kit-source/`                                                                 |
| Code  | `projects/agent-kit/src/lib/cargo.ts`, `projects/agent-kit/src/lib/shipment.ts`, `projects/agent-kit/src/lib/observations.ts` |

## What counts as done

- `agent-kit propose --dry-run` prints the line `observations — строк N за D дн.`.
- The spec `observations-cargo.spec.ts` covers SC-AK-1094 … SC-AK-1098 and is green.

## Stages

### 1. The cargo form and the reading of the days

- **What is done:** `IObservationLine`, `IObservationDay`, `IObservationsCargo` in `cargo.ts`; `CARGO_SCHEMA_VERSION` rises to `2`; `observations-cargo.ts` reads the window by day keeping the time and adds the skill kind from the layout.
- **Readiness sign:** the spec of the module is green.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit --testFile=projects/agent-kit/src/lib/observations-cargo.spec.ts` — `Tests: … passed`.

### 2. The cargo leaves with the rest

- **What is done:** `shipmentsOf` adds the observations shipment; the manifest line and the leak check cover it; the propose flow assembles it.
- **Readiness sign:** the whole package suite is green and the dry run prints the line.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit` — `Tests: … passed`; `node dist/agent-kit/bin/agent-kit.js propose --dry-run` — a line starting with `  observations —`.

## What this work does not do

- Does not change the digest or its window.
- Does not touch the receiver: task RT-2099.
