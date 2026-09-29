# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 6 of 6 — Closing
- **Done:** exploration, grill, plan, the agreement `docs/specs/ui-kit-v2/proposed/radius-scale/`, the step type, `RtRadiusDirective`, the mixin `radius-steps`, their specs; the tag, icon button, button and skeleton folded into `radius`, the kit's callers moved; the twelve controls and nineteen surfaces take the input, the contract spec of SC-UKV-388–390 lists them; the defaults match the mockup (151 suites, 1954 tests green); the showcase page `Foundation/Radius` and the stories of the four folded components are on `radius`, the sweep is clean (624 stories, 85 pages); the snapshots re-taken and confirmed by a second raising (628 stories, 649 frames)
- **Next step:** the agreement merged into the domain spec as the subdomain `radius-scale`; then the full checks
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
- [x] 4.1 Controls: split button, toggle group, toggle switch, checkbox, radio card, input, textarea, input number, select, multiselect, autocomplete, date picker
- [x] 4.2 Surfaces: card, dialog, confirm popover, bottom sheet, toast, tooltip, message, note, menu, file card, file drop, markdown text, money list, action bar, stepper, table, photo viewer, calendar, pagination, section nav, header, notifications bell, thread list, empty state
- [x] 4.3 Defaults brought to the mockup and off-scale values replaced by steps
- [x] 5.1 A showcase page with every component at every step
- [x] 5.2 The stories of the four folded components moved to `radius`
- [x] 5.3 The component descriptions, the README and the changelog brought up to date
- [x] 5.4 The snapshots re-taken
- [>] 6.1 The agreement merged into the domain spec
- [ ] 6.2 The full set of checks run

## Decisions along the way

- **The radius showcase goes as six stories of three to four columns** — the grid harness clips a table wider than the window at its edge, so a ten-column grid never reaches the frame whole; the skeleton's radius grid was clipped the same way before this task and is transposed now. The harness defect is a task to be filed at closing. Affected stage of the plan: 5.

- **The changelog is not edited by hand** — the release writes it from the commit messages, and the fold commit carries the breaking-change footer. Affected stage of the plan: 5.

- **`radius` stands in the accepted list of the preset-stories check** — the folder has no styles of its own, so the pair would show two equal halves; the owner gave the word on 29.09. Affected stage of the plan: 5.

- **The confirmation, the toast, the tooltip and the photo viewer take no input** — a directive or a service draws them in an overlay, and the consumer writes no tag to name a step on; the agreement keeps overlay panels out. Affected stage of the plan: 4.
- **The table takes no input in this task** — its wide view has no corners (the mockup gives it `none`), and its component file stands at the length limit; the narrow card gets the input after the file is split, a task to be filed at closing. Affected stage of the plan: 4.

- **A field takes its own property with the shared field rounding as its default** — `--rt-input-radius` is the kit-level name of all fields, so the input's own property is `--rt-input-box-radius`, the others `--rt-<block>-radius`. Affected stage of the plan: 4.
- **The toggle group's track is `md` and its segments `ms` on every size** — the mockup gives these two steps; the size tiers of 10 and 12px are gone, 12px was off the scale. Affected stage of the plan: 4.

- **The tag scenario SC-UKV-186 is removed, SC-UKV-185 narrowed to the appearance** — the rounding no longer comes from a shape; the new promise is SC-UKV-391. Affected stage of the plan: 3.
- **The skeleton's rectangle default goes from a pill to `sm`** — the mockup gives the skeleton `sm`, and the task follows the mockup defaults. Affected stage of the plan: 3.

## Sessions

### 2026-09-29

- Branch `RT-2371-kit-radius-scale` taken from `RT-2370-figma-fields-and-talks`; task moved to
  «In progress». Exploration: 77 component directories, 49 with an own radius property, 4 with old
  shape inputs, no shared mechanism.
