# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 4 of 6 — The input on the rest of the components
- **Done:** exploration, grill, plan, the agreement `docs/specs/ui-kit-v2/proposed/radius-scale/`, the step type, `RtRadiusDirective`, the mixin `radius-steps`, their specs; the tag, icon button, button and skeleton folded into `radius`, the kit's callers moved (150 suites, 1882 tests green)
- **Next step:** the controls take the input — split button first; the stories still use the old inputs and wait for stage 5
- **Uncommitted:** none
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the feature spec of the one rounding input
- [x] 1.2 Write its scenarios and the binding table
- [x] 2.1 Add the step type and the host directive with the `radius` input
- [x] 2.2 Add the SCSS mixin that maps a step to the component's own property
- [x] 2.3 Cover the directive with a unit spec
- [x] 3.1 Fold the tag's `shape` and `radius` into `radius`
- [x] 3.2 Fold the icon button's `shape` into `radius`
- [x] 3.3 Fold the button's `rounded` and its kit setting into `radius`
- [x] 3.4 Fold the skeleton's `borderRadius` into `radius`, the wrapper too
- [x] 3.5 Move the kit's own callers to the new input
- [>] 4.1 Controls: split button, toggle group, toggle switch, checkbox, radio card, input, textarea, input number, select, multiselect, autocomplete, date picker
- [ ] 4.2 Surfaces: card, dialog, confirm popover, bottom sheet, toast, tooltip, message, note, menu, file card, file drop, markdown text, money list, action bar, stepper, table, photo viewer, calendar, pagination, section nav, header, notifications bell, thread list, empty state
- [ ] 4.3 Defaults brought to the mockup and off-scale values replaced by steps
- [ ] 5.1 A showcase page with every component at every step
- [ ] 5.2 The stories of the four folded components moved to `radius`
- [ ] 5.3 The component descriptions, the README and the changelog brought up to date
- [ ] 5.4 The snapshots re-taken
- [ ] 6.1 The agreement merged into the domain spec
- [ ] 6.2 The full set of checks run

## Decisions along the way

- **The tag scenario SC-UKV-186 is removed, SC-UKV-185 narrowed to the appearance** — the rounding no longer comes from a shape; the new promise is SC-UKV-391. Affected stage of the plan: 3.
- **The skeleton's rectangle default goes from a pill to `sm`** — the mockup gives the skeleton `sm`, and the task follows the mockup defaults. Affected stage of the plan: 3.

## Sessions

### 2026-09-29

- Branch `RT-2371-kit-radius-scale` taken from `RT-2370-figma-fields-and-talks`; task moved to
  «In progress». Exploration: 77 component directories, 49 with an own radius property, 4 with old
  shape inputs, no shared mechanism.
