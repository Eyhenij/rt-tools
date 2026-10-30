# Plan

**Task:** RT-3000 · **Branch:** RT-3000-popover-touch-hover
**Draft:** `docs/specs/ui-kit-v2/proposed/popover-touch/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/popover-backdrop/`, `docs/specs/ui-kit-v2/proposed/popover-touch/`                          |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/mockups.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/ui-component-tests/`, `.claude/skills/testing/`                   |
| Code  | `projects/ui-kit-v2/src/lib/components/popover/`, `projects/ui-kit-v2/src/lib/components/page-header/`            |

## What counts as done

- A tap on the user name of the page header at 375 opens the profile menu once, on one backdrop;
  a tap on the backdrop leaves neither the menu nor a backdrop. Measured in the showcase under a
  touch emulation, before and after the edit.
- The mouse opens a hover popover on hover and closes it on leave, as before: the hover specs
  of the popover stay green.
- The scenarios SC-UKV-1082…1084 have tests, and `pnpm run check:specs` binds them.
- The approval record holds the mockup and the showcase quotes of the owner.

## Stages

### 1. The symptom in a browser

- **Steps:**
    1. Raise the second showcase or find the one that answers on its port
    2. Tap the user name of the page header story at 375 under a touch emulation and count the backdrops
- **Readiness sign:** the count after the tap shows the menu gone and a backdrop left, as the
  request says — or the symptom did not reproduce, and the task closes as lapsed.
- **Verified by:** `lsof -nP -iTCP:6007 -sTCP:LISTEN` — a process answers on the showcase port

### 2. The fix and its tests

- **Steps:**
    1. Make the hover of a hover popover follow the mouse only
    2. Make a press on the host of a hover popover open the panel
    3. Write the popover tests for SC-UKV-1082 and SC-UKV-1083
    4. Write the page header test for SC-UKV-1084
- **Readiness sign:** the popover and page header specs pass, the new tests among them.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.spec.ts` — every test passed

### 3. The measurement and the approvals

- **Steps:**
    1. Repeat the tap of stage 1 on the fixed showcase and count the backdrops
    2. Ask the owner about the mockup frame of the profile menu on the backdrop
    3. Show the owner the showcase and ask about it
    4. Write the approval record
- **Readiness sign:** after the tap one backdrop and the menu, after the tap on the backdrop none;
  the record holds both quotes.
- **Verified by:** `node tools/check-kit-approval.mjs` — no refusal for the branch

### 4. Closing

- **Steps:**
    1. Merge the agreement into the popover backdrop spec
    2. Run the specs check, the types, the linters and the tests of the kit
    3. Take the task folder apart into the archive record
    4. Open the PR
- **Readiness sign:** the checks are green, the folder is gone from the branch, the PR is open.
- **Verified by:** `pnpm run check:specs` — no refusal

## What this work does not do

- It does not release the package: a release goes by the owner's word.
- It does not change how the profile menu and the backdrop look.
- The popover reads its backdrop class at the first open only; that finding of RT-2997 stays
  apart.
