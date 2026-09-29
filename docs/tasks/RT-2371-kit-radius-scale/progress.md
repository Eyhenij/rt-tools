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

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2371-kit-radius-scale

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 6 — The input on the rest of the components
- **Next step:** the controls take the input — split button first; the stories still use the old inputs and wait for stage 5
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2371-kit-radius-scale/progress.md`; the plan lies next to it.

### Uncommitted

```
 M ../../styles/_mixins.scss
```

### Commits over the main branch

```
d377d4fdd feat(rt:ui-kit-v2): старые входы формы свёрнуты в общий вход radius
84c7318cc feat(rt:ui-kit-v2): общий вход скругления radius и правила его шагов
29ddc4eb0 docs(rt:ui-kit-v2): договорённость об одном входе скругления
fe079c723 docs(rt:ui-kit-v2): план задачи RT-2371 о единой шкале скруглений
eeb37b874 docs(rt:ui-kit-v2): папка задачи RT-2371 о единой шкале скруглений
0e875248d docs(rt:ui-kit-v2): эпик RT-2370 взят в работу, ветки задач стоят стопкой
0b8ab7c6f docs(rt:agent-kit): копия rt-tools снова записана за эпиком RT-2370
f2780c7ca Merge remote-tracking branch 'origin/main' into RT-2370-figma-fields-and-talks
977ec342f docs(rt:ui-kit-v2): в плане эпика записан конец работы по макетам узкого экрана
fa11492c8 docs(rt:ui-kit-v2): в плане эпика записано слово владельца о начале кода
f5c807bdd docs(rt:ui-kit-v2): в эпик добавлены скругления и пикеры дат
80cb4c3bc docs(rt:ui-kit-v2): замысел эпика о полях, списках и переписке по макету
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
