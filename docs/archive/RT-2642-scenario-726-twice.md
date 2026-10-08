# Grill

## The owner request

> Довести эпик CMS

## What the tree already has

The epic branch `RT-2591-cms-packages` cannot be pushed after main is merged into it: the spec
check refuses on `docs/specs/ui-kit-v2/toolbar-dense/scenarios.md:6` — `SC-UKV-726` is already taken
by `docs/specs/ui-kit-v2/dynamic-selectors/scenarios.md:308`. Both scenarios are on main: RT-2639 and
RT-2619 took the same number before either was merged. `pnpm run spec:next-id UKV` names
`SC-UKV-727` as the next free number.

## What the rules already say

`spec-driven`: a scenario number is issued once and never reused; the scenario and the title of its
test are edited by one change. Nothing is asked of the owner: the fix is a renumbering of the
dense-toolbar scenario.
