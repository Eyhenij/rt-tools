# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — texts, showcase and snapshots
- **Done:** the three remarks in code with specs SC-UKV-535, SC-UKV-536; spec rules, the overview and the ButtonRadius story
- **Next step:** the owner looks at the showcase, then the snapshots are retaken
- **Uncommitted:** no
- **Waiting for the owner:** a look at the showcase before the PR
- **PR:** not open yet

## Steps

- [x] 1.1 Draw the row in flight on a background layer inside the preview
- [x] 1.2 Add the button rounding input with the full step by default and pass it to every icon button of the list
- [x] 1.3 Anchor the popup to the add button pressed
- [x] 2.1 Rules and scenarios in the spec, the input in the overview and the component context
- [>] 2.2 A story axis for the button rounding and retaken snapshots of the selector
- [ ] 2.3 Show the owner the showcase

## Decisions along the way

- **The row in flight is fixed outside the cascade layer** — CDK resets `background`, `color` and `padding` of `.cdk-drag-preview` in its layer `cdk-resets`, which comes after the kit's layer and wins; the same technique the data list settings use. Affected stage: 1.

## Sessions

### 2026-10-01

- The branch stands on RT-2463 (PR #2464): main merged into the epic and scenario numbers split.
