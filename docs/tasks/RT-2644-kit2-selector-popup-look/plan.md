# Plan

**Task:** RT-2644 · **Branch:** RT-2644-kit2-selector-popup-look
**Spec:** `docs/specs/ui-kit-v2/side-menu-options/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                               |
| ----- | --------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/side-menu-options/`                                                           |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                   |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`                                 |
| Code  | `projects/ui-kit-v2/src/lib/components/side-menu/`, `projects/ui-kit-v2/src/assets/icons-material/` |

## What counts as done

- Rows 122–128 of the application are in the menu, and without the new inputs and properties the
  menu draws as before: the former side menu frames match without a re-take.
- A submenu row hands its press to the consumer first, and a prevented press does not navigate.
- The package archive lies on the desktop, and the application is told what arrived.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the rules and scenarios of rows 122–128 into the side menu options spec
- **Readiness sign:** the spec check names no divergence for the subdomain.
- **Verified by:** `node tools/check-specs.mjs` — no line about `side-menu-options`

### 2. Code and specs

- **Steps:**
    1. Add the Material pair of the folder icon
    2. Add the row icon size, the fill, the folder padding, the gap, the chevron colour and the empty padding
    3. Add the panel scroll hint input
    4. Hand the row press to the consumer before the navigation
    5. Add the submenu close delay
    6. Write the specs of the new scenarios
- **Readiness sign:** the side menu specs and the icon map are green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/side-menu --skip-nx-cache` — `Tests:` without failures

### 3. Showcase and delivery

- **Steps:**
    1. Give the first kit look story the new inputs and properties
    2. Measure the rows, the folder and the delay on :6007
    3. Take the first kit look reference and run the whole set
    4. Build the package archive and tell the application
- **Readiness sign:** every frame of the kit matches, and the archive is on the desktop.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — `Snapshots:` without failures

## What this work does not do

- The rail and mobile items keep the router link: the request names the submenu rows only.
- The push and the PR wait for the owner's word.
