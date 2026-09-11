# Plan

**Task:** RT-2038 · **Branch:** RT-2038-pr-opens-ready
**Behaviour:** unchanged — the work edits the rules layer and the pipeline settings; no application
code is touched, and the owner said what to do with this task in their own words.

## Task footprint

| What     | Where                                                                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs    | `docs/specs/agent-kit/delivery-gate/`, `docs/specs/agent-kit/work/`, `docs/specs/agent-kit/laws/`                                                                       |
| Laws     | `docs/constitution/delivery.md`                                                                                                                                         |
| Rules    | `.claude/skills/git-workflow/`, `.claude/skills/task-flow/`, `.claude/skills/git-workflow-pr/`, `.claude/skills/task-flow-close/`, `.claude/skills/git-workflow-stack/` |
| Pipeline | `.github/workflows/ci.yml`                                                                                                                                              |
| Plan     | `docs/plans/cargo-intake.md` — row 10 of the makeup                                                                                                                     |

## What counts as done

- The pipeline wakes for a PR into the main branch and does not wake for a PR into an epic branch.
- The law, the two rules and the two patterns say that a PR into an epic branch opens ready, and
  that the draft stays where a run is waited for — the PR of an epic into the main branch.
- The chain pattern names the consequence of merging a chain out of order.
- The six cargo records are marked in the intake, each with the text of what closed it and, where
  the owner decided otherwise than the record asked, with that reason.
- Row 10 of the epic plan names the state of this work.

## Stages

### 1. The pipeline wakes only for a PR into the main branch

- **What is done:** the trigger in `.github/workflows/ci.yml` gains the branch filter, and the
  comment above it is rewritten to what is true now: why the filter is back and what it costs.
- **Readiness sign:** the trigger names the main branch, and the reason in the comment is the
  owner's, not the former one.
- **Verified by:** `node -e` over the parsed file — the trigger holds `branches` with `main` in it.

### 2. The order of handing in: a PR into an epic branch opens ready

- **What is done:** the articles about the draft in the law of delivery, in the rule of delivery
  and in the rule of work conduct gain their boundary — the draft is for a PR into the main
  branch; the two patterns get the new tail of handing in and the two messages to the owner.
- **Readiness sign:** no text says any more that every PR opens as a draft, and every text that
  names the draft names where it applies.
- **Verified by:** `npm run check:specs` — the `laws`, `delivery-gate` and `work` areas have no
  divergences.

### 3. A chain merged out of order

- **What is done:** record 6 becomes an item of "What is not done in a chain": the upper PRs merge
  into branches that have already given their content to the main branch, the host shows all three
  merged, and the work is in none of them.
- **Readiness sign:** the pattern names the consequence and the one question that finds it.
- **Verified by:** `node tools/check-file-size.mjs` — the pattern stays within the line limit.

### 4. Delivery: layout, checks, the intake and the makeup

- **What is done:** the package is built and laid out, the whole set of checks is run, the six
  records are marked, row 10 of the epic plan is corrected, the folder is taken apart into the
  description of the past and the PR opens — ready, by the new order, since its base is the epic
  branch.
- **Readiness sign:** the laid-out files match the package, the checks are green, and the intake
  holds no record in the state `new`.
- **Verified by:** `pnpm run agent-kit:check && npm run check:specs && npm run check:docs && node tools/check-file-size.mjs`
  — every one of the four says no divergences.

## What this work does not do

- It does not write a guard that would refuse a PR opened without a reviewer. The reviewer cannot
  exist before the PR, and the work queue audit already names such a PR.
- It does not add a trigger on a push into a branch: the owner named that option and declined it.
- It does not touch the rollout pipeline — the run after the merge into the main branch is a
  neighbouring matter and no record speaks of it.
