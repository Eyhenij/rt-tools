# Plan

**Task:** RT-3350 · **Branch:** RT-3350-workspace-details-single
**Spec:** `docs/specs/ui-kit-v2/workspace-breakpoint/spec.md`
**Behaviour:** changes

## Points

- **A:** on a phone the details of `rt-workspace` with the threshold input open as a narrow block
  inside the conversation column, with no header and nothing that closes them.
- **This task reaches:** on a phone the details open as the same side panel over the window as on a
  tablet, the whole window wide, with the arrow back and «Закрыть».
- **Sign:** the story Phone details of Organisms/Workspace/Breakpoint at 375 × 812 shows the side
  panel with its header and «Закрыть»; the owner sees it in the showcase.
- **Milestone G of the epic:** none — work outside an epic by the owner's word.
- **Metric:** нет: a repair — the details on a phone could not be closed.

## Task footprint

| What  | Where                                                    |
| ----- | -------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/workspace-breakpoint/`             |
| Laws  | `docs/constitution/mockups.md`                           |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/lib/components/workspace/`       |

## What counts as done

- With the threshold input and one column, opening the details opens the side panel over the
  window; the panel closes by the arrow, «Закрыть», the dimmed background and Esc, and the record
  stays open.
- Without the threshold input the view is unchanged.
- The showcase has the phone story with the details open, light and dark, with snapshot references.
- Both approvals of the owner are written down; the PR is merged into main.

## Stages

The phone frame 375 × 812 with the details open over the window is already drawn before the plan:
node 8062-6235 of the kit file, cloned from the approved phone frame and the approved tablet panel.

### 1. Mockup and spec

- **Steps:**
    1. Write the owner's approval of the mockup into the approval record
       Check: `grep -c '^- \*\*Макет:\*\*' docs/tasks/RT-3350-workspace-details-single/approvals.md` → `= 1`
    2. Rewrite the spec rule about one column and the scenario SC-UKV-1242
       Check: `grep -c 'not wider than the threshold the details panel opens over the window' docs/specs/ui-kit-v2/workspace-breakpoint/spec.md` → `= 1`
- **Readiness sign:** the approval is quoted, the spec says one column opens the details over the
  window.
- **Verified by:** `npm run check:specs` — no line names the subdomain workspace-breakpoint.

### 2. Code

- **Steps:**
    1. Open the details over the window in one column
       Check: `grep -cF 'narrow() || this.singleColumn()' projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts` → `= 1`
    2. Rewrite the unit test of SC-UKV-1242 and add SC-UKV-1320 about closing in one column
       Check: `grep -q SC-UKV-1320 projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts && node_modules/.bin/jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/workspace` → `exit 0`
    3. Update the component context and the overview page
       Check: `grep -cF 'и в одной колонке' projects/ui-kit-v2/src/lib/components/workspace/CONTEXT.md` → `>= 1`
- **Readiness sign:** the panel over the window opens at 375 with the input 600.
- **Verified by:** `node_modules/.bin/jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/workspace` — every test passed, none failed.

### 3. Showcase

- **Steps:**
    1. Add the stories Phone details and Phone details dark
       Check: `grep -c '^export const PhoneDetails' projects/ui-kit-v2/src/lib/components/workspace/stories/workspace-breakpoint.stories.ts` → `= 2`
    2. Take the snapshot references of the new stories
       Check: `ls projects/ui-kit-v2/.storybook/__snapshots__ | grep -c 'organisms-workspace-breakpoint--phone-details'` → `= 2`
    3. Measure the showcase against the frame and write the match line
       Check: `grep -c '^- \*\*Совпадение:\*\*' docs/tasks/RT-3350-workspace-details-single/approvals.md` → `= 1`
    4. Write the owner's approval of the showcase into the approval record
       Check: `grep -c '^- \*\*Витрина:\*\*' docs/tasks/RT-3350-workspace-details-single/approvals.md` → `= 1`
- **Readiness sign:** the match line is N of N, the approval is quoted.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2 'workspace-breakpoint\.stories'` — no story differs from its reference.

### 4. Hand-over

- **Steps:**
    1. Take the task folder apart
       Check: `test -d docs/tasks/RT-3350-workspace-details-single` → `exit 1`
    2. Open the PR into main
       Check: `/opt/homebrew/bin/gh pr list --repo Eyhenij/rt-tools --head RT-3350-workspace-details-single --state all --json number --jq length` → `= 1`
    3. Merge the PR into main
       Check: `/opt/homebrew/bin/gh pr list --repo Eyhenij/rt-tools --head RT-3350-workspace-details-single --state merged --json number --jq length` → `= 1`
- **Readiness sign:** the PR is merged into main.
- **Verified by:** `/opt/homebrew/bin/gh pr list --repo Eyhenij/rt-tools --head RT-3350-workspace-details-single --state merged --json number --jq length` — prints 1.

## What this work does not do

- The release of the kit: the requesting side runs it.
- The rows of `rt-thread-list`: a neighbouring task.
