# Plan

**Task:** RT-2327 · **Branch:** RT-2327-side-menu-favorites-collapse
**Spec:** `docs/specs/ui-kit/side-menu-favorites/spec.md`
**Behaviour:** changes

## Task footprint

| What     | Where                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------- |
| Specs    | `docs/specs/ui-kit/side-menu-favorites/`                                                        |
| Laws     | `docs/constitution/frontend-application.md`                                                     |
| Rules    | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/testing/` |
| Code     | `projects/ui-kit/src/lib/ui-kit/side-menu/`                                                     |
| Showcase | `projects/ui-kit/src/lib/ui-kit/side-menu/stories/`                                             |

## What counts as done

- A submenu item with `favoriteDisabled: true` draws no star, cannot be added, and its stored id
  does not reach the block.
- The favourites block title is a toggle button: mouse, Enter and Space collapse and expand it,
  `aria-expanded` and `aria-controls` stand on it, the state is kept per strip item under the menu
  id and survives a reload; the divider stays; the collapsed title shows the count.
- With `favoriteActionsReserve="none"` hidden row buttons take no width at rest and appear under
  hover and keyboard focus; the filled star, the narrow screen, touch screens and the dragged row
  keep them as now; `'always'` by default keeps today's behaviour.
- The spec names every rule with its binding and scenario; tests and showcase frames are green.

## Stages

### 1. The spec

- **Steps:**
    1. Rules for the disabled star, the collapsible block and the width reserve written into the spec
    2. Scenarios SC-UK-125 and further written into the scenarios
    3. Bindings written into the implementation list
- **Readiness sign:** the audit lists the new scenarios without tests and no divergence of rules
- **Verified by:** `npm run check:specs` — the output names the new scenarios and no rule without a binding

### 2. The disabled star

- **Steps:**
    1. The flag `favoriteDisabled` added to the item type
    2. The candidate check and the block lookup skip the flagged item
    3. The row template draws no star for the flagged item
    4. Tests for the logic and the row
- **Readiness sign:** the side-menu specs pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — «Tests:» with no failed

### 3. The collapsible block

- **Steps:**
    1. The settings field `favoritesCollapsed` read and kept by the settings logic
    2. The service gives the collapsed ids and writes the state of one section
    3. The block title becomes a toggle with a chevron, labels and the count
    4. Styles of the toggle and the chevron column
    5. Tests for the logic, the service and the block
- **Readiness sign:** the side-menu specs pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — «Tests:» with no failed

### 4. The width reserve

- **Steps:**
    1. The menu input `favoriteActionsReserve` and its host mark
    2. Styles of the star, the remove button and the handle without the reserve
    3. Tests for the mark
- **Readiness sign:** the side-menu specs pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — «Tests:» with no failed

### 5. The showcase and the checks

- **Steps:**
    1. Stories for the collapsed block, the reserve and the disabled star
    2. Showcase frames taken and read by eye
    3. The push gate set run
- **Readiness sign:** the frames match and the gate set is green
- **Verified by:** `node tools/visual-gate.mjs ui-kit` — «Snapshots:» with no failed

## What this work does not do

- The second kit's side menu: it is ported separately under the epic RT-1870.
