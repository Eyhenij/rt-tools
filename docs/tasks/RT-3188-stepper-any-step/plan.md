# Plan

**Task:** RT-3188 · **Branch:** RT-3188-stepper-any-step
**Spec:** `docs/specs/ui-kit-v2/stepper/spec.md`
**Behaviour:** changes

## Points

- **A:** the bar of `rt-stepper` draws any set of steps, but the label of a middle step goes past
  the bar near an edge and in a narrow panel; the mockup draws only three cases at one width.
- **This task reaches:** an application screen with step three of four in a 327 px panel shows the
  label inside the bar; the mockup draws any step at any width.
- **Sign:** the showcase stories of three of four, five steps, width 327 and long labels, matched
  with the Figma frames; the owner approves both.
- **Milestone G of the epic:** none — work outside an epic.
- **Metric:** нет: подпись выходила за полосу.

## Task footprint

| What  | Where                                            |
| ----- | ------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/stepper/`                  |
| Laws  | `docs/constitution/frontend-application.md`      |
| Rules | `.claude/skills/kit-approval/`                   |
| Code  | `projects/ui-kit-v2/src/lib/components/stepper/` |

## What counts as done

- The Figma `Stepper` has `Steps` and `Current`, stretches and keeps its label inside the bar.
- `rt-stepper` passes `SC-UKV-1229`…`SC-UKV-1233`, the default look at 480 is the mockup's.
- The showcase has stories for three of four, five steps, width 327 and long labels.
- The owner approved the mockup and the showcase.

## Stages

### 1. The mockup

- **Steps:**
    1. Stepper in Figma: Steps × Current, the bar stretches, the label inside the bar
    2. The owner approves the mockup
- **Readiness sign:** the approval line stands in approvals.md.
- **Verified by:** `node tools/check-kit-approval.mjs` — names no missing mockup line.

### 2. The code and the stories

- **Steps:**
    1. The label segment as a pure function, the current point by the held number
    2. The template and the styles: the rail as a column, the label in its segment
    3. Unit tests named by the scenarios
    4. Showcase stories: three of four, five steps, width 327, long labels
- **Readiness sign:** the stepper tests are green, the spec audit has no stepper refusals.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=stepper --maxWorkers=2` — no failed test.

### 3. The match and the showcase approval

- **Steps:**
    1. The numbers of the Figma frames against the showcase
    2. The overlay frame, the showcase shown to the owner
- **Readiness sign:** the match line is N of N and the showcase line stands in approvals.md.
- **Verified by:** `node tools/check-kit-approval.mjs` — prints no refusal.

### 4. Delivery

- **Steps:**
    1. The task folder is taken apart, the spec status becomes in force
    2. The PR and the kit release
- **Readiness sign:** the PR is open with a reviewer.
- **Verified by:** `gh pr view --json state` — the state is OPEN.

## What this work does not do

- The vertical list: drawn in Figma for the record, the code is unchanged.
