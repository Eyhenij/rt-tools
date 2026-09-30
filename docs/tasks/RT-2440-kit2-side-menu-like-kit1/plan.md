# Plan

**Task:** RT-2440 · **Branch:** RT-2440-kit2-side-menu-like-kit1
**Spec:** `docs/specs/ui-kit-v2/side-menu/spec.md`
**Behaviour:** changes

## Task footprint

| What   | Where                                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Specs  | `docs/specs/ui-kit-v2/side-menu/`, `docs/specs/ui-kit-v2/kit-settings-theme/`                                          |
| Laws   | `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                                               |
| Rules  | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/styling-bem/`              |
| Code   | `projects/ui-kit-v2/src/lib/components/side-menu/`, `projects/ui-kit-v2/src/styles/`, `projects/ui-kit-v2/.storybook/` |
| Sample | `projects/ui-kit/src/lib/ui-kit/side-menu/` — the menu, `favorites/`, the stories and their data                       |

## What counts as done

- The second kit's side menu stories carry the first kit's data: the same sections, labels, nesting
  and long titles, with the kit's own icons in place of Material ones.
- Every first-kit menu story has a second-kit story of the same state, and the menu in them is
  live: a section opens its submenu on hover or click, search, pin and folders answer.
- The narrow screen is a live menu the width of a phone, like the first kit's `Mobile` and
  `Mobile active menu`.
- The second kit's side menu has favorites like the first kit's, without Material, with a story
  for every first-kit favorites story.
- `[data-rt-scheme]` on the root repaints the second kit's accent, and the menu follows it; a story
  shows the menu under a scheme next to the default one.
- The executor has looked at every pair of frames, kit one next to kit two, before showing them.

## Stages

### 1. Stories on the first kit's data, live

- **Steps:**
    1. Carry the first kit's menu data into the second kit's story data with kit icons
    2. Make Playground a full-height live menu like the first kit's Default
    3. Add a story per first-kit menu state
    4. Look at every pair of frames, kit one next to kit two
- **Readiness sign:** the story index of 6007 lists a side menu story for each of the seventeen
  first-kit menu stories.
- **Verified by:** `curl -s http://localhost:6007/index.json | grep -o '"organisms-navigation-sidemenu[^"]*"' | sort -u | wc -l` — seventeen or more.

### 2. The narrow screen as a live menu

- **Steps:**
    1. Compare the second kit's narrow layout with the first kit's Mobile by measurement
    2. Close what differs in the component
    3. Show the narrow menu live at phone width in its own stories
- **Readiness sign:** the Mobile and Mobile active menu pairs match by measurement.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/side-menu` — `Tests:` all passed, 89 today plus the new ones.

### 3. Favorites

- **Steps:**
    1. Port the favorites logic and its spec
    2. Port the favorites block into the menu without Material
    3. Add the favorites stories after the first kit's eleven
    4. Write the scenarios and their tests
- **Readiness sign:** the favorites scenarios pass and their frames match the first kit's.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/side-menu` — `Tests:` all passed.

### 4. Colour scheme

- **Steps:**
    1. Declare `[data-rt-scheme]` over the brand ramp in the kit's styles, the material preset too
    2. Add a scheme switch to the showcase toolbar
    3. Show the menu under a scheme in a story
- **Readiness sign:** under a scheme the menu's active item takes the scheme's colour in both
  presets.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — `Tests:` all passed.

### 5. Texts, frames, showing

- **Steps:**
    1. Bring the spec, scenarios, overview and context of the menu up to what was done
    2. Take the new frames after looking at them
    3. Run the whole check set
    4. Show the owner the pairs of links before any push
- **Readiness sign:** the check set is green and the owner has the links.
- **Verified by:** `pnpm run check:all` — ends without a failed step.

## What this work does not do

- The first kit is frozen and is not edited.
- `rt-menu` is not touched.
- Colour schemes for components other than those that already take the brand ramp are not
  reworked one by one: the scheme repaints what derives from the ramp.
