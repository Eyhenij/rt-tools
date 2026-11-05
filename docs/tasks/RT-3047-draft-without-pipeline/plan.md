# Plan

**Task:** RT-3047 · **Branch:** RT-3047-draft-without-pipeline
**Behaviour:** unchanged — эпик владельца: правка проверки поставки, код приложений не тронут

## Task footprint

| What  | Where                                                   |
| ----- | ------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-epic/`                   |
| Laws  | `docs/constitution/delivery.md`                         |
| Hooks | `projects/agent-kit/assets/hooks/git-guard-delivery.sh` |

## Stages

### Stage 1 — the check

Done sign: the guard suite passes on both cases, a draft on a base the pipeline skips and on one it wakes for.

- 1.1 Write the helper that reads the bases from the pipeline file and judges the draft
- 1.2 Call it from the delivery guard on a PR opening
- 1.3 Write the scenarios and the suite

### Stage 2 — texts

Done sign: `check-specs` and `check-hooks` are green, the layout matches the package.

- 2.1 Add the rule, the scenarios and the binding to the spec
- 2.2 Name the check in the rule companion
- 2.3 Lay out the package and run the checks

### Stage 3 — handing over

Done sign: the PR into the epic branch is open.

- 3.1 Take the task folder apart into the archive
- 3.2 Push and open the PR
