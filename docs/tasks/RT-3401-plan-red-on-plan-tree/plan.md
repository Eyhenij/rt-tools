# Plan

**Task:** RT-3401 · **Branch:** RT-3401-plan-red-on-plan-tree
**Behaviour:** changes
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md`

## Points

- **A:** `plan-red` runs the checks of a plan on the current tree. A plan commit rebuilt after the
  owner's approval has a new sha, so the stored red output does not apply, and after the work every
  check is green: the command refuses «a check is green before the work» (SC-AK-1738 fixes this
  very refusal). The branch stands on «plan not approved», and an engine edit needs the same mark.
  On RT-3332 and RT-3395 the mark was written by hand from a temporary worktree.
- **This task reaches:** when the branch has moved past the plan commit, `plan-red` runs every check
  on the tree of the plan commit, in a temporary worktree it makes and removes itself. A rebuilt
  plan is approved again by the owner's answer and one command, the laid-out one in `tools/`.
- **Sign:** a rebuilt plan whose checks are green on the branch gets the mark; at the plan commit
  itself nothing changes, and a check green there is still refused; a worktree that cannot be made
  refuses with its reason; no worktree is left after the run.
- **What stays:** the worktree has no `dist/`, no build cache and no generated storage client; a
  check that needs them is red there for that reason. Its head is detached: a check that reads the
  branch name sees none.
- **Milestone G of the epic:** a working day with fewer than five refusals per hundred commands and
  no dead end the executor cannot leave by himself. A rebuilt plan that cannot be approved is such
  a dead end.
- **Metric:** нет: ремонт — пересобранный план одобряется одной командой.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/` |
| Code (правится) | `projects/agent-kit/assets/checks/` |
| Code (правится) | `tools/` |
| Code  | `projects/agent-kit/tests/` |

## What counts as done

- At the plan commit with a clean tree the checks run in place, as before.
- Past the plan commit, or with uncommitted edits, they run in a worktree of the plan commit: every
  `node_modules` directory of the repository that exists is linked into it at its place, the
  worktree lies under the system temporary directory, detached, and is removed after the run, on a
  refusal and a timeout too; a stale worktree record is pruned before.
- A rebuilt plan, green on the branch, gets the mark from the owner's answer and one command.
- A worktree that cannot be made refuses with its reason, and nothing runs on the current tree.
- The laid-out copy in `tools/` is the package source, and the spec says where the checks run.
- On review: on this branch the plan commit is rebuilt with the same text, and the laid-out
  `plan-red` writes the mark from the owner's answer with no hand-made worktree.

## Stages

### 1. plan-red measures on the plan tree

Rules: in place when HEAD is the plan commit and no tracked file differs; otherwise in a detached
worktree of the plan commit under the system temporary directory, with every existing
`node_modules` linked, pruned before and removed after the run whatever its end; a worktree that
cannot be made is a refusal naming the reason; the third case of SC-AK-1738 becomes «measured on
the plan tree, the mark is written».

- **Steps:**
    1. A rebuilt plan is measured on the tree of its commit and gets the mark
       Check: `bash projects/agent-kit/tests/task-flow-script-steps.test.sh >/dev/null && grep -c '^report "plan: SC-AK-1749' projects/agent-kit/tests/task-flow-script-steps.test.sh` → >= 2
    2. A worktree that cannot be made is a refusal with its reason
       Check: `bash projects/agent-kit/tests/task-flow-script-steps.test.sh >/dev/null && grep -c '^report "plan: SC-AK-1750' projects/agent-kit/tests/task-flow-script-steps.test.sh` → >= 1
    3. At the plan commit with a clean tree the checks run in place
       Check: `bash projects/agent-kit/tests/task-flow-script-steps.test.sh >/dev/null && grep -c '^report "plan: SC-AK-1751' projects/agent-kit/tests/task-flow-script-steps.test.sh` → >= 1
- **Readiness sign:** the suite of steps is green, SC-AK-1412 unchanged.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script-steps.test.sh` — «0 провалов».

### 2. The spec and the laid-out copy

- **Steps:**
    1. The step-mark spec names the tree of the plan commit
       Check: `grep -c 'tree of the plan commit' docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md` → >= 1
    2. The laid-out engine measures on the plan tree
       Check: `grep -c 'worktree' tools/flow-plan.mjs` → >= 1
- **Readiness sign:** `npm run check:specs` and `pnpm run agent-kit:check` are green.
- **Verified by:** `NX_DAEMON=false pnpm run -s agent-kit:check` — exit 0.
