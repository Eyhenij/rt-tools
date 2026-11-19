# Grill

## The owner request

> включи task-delivery-loop в task flow

The request came through the session that started this one, with its terms: the loop is loaded
first on every task, two review rounds before the push, no exceptions; it speaks by this tree's
names, roles, stands and push set.

## What the tree already has

- The rule `task-flow` leads one task from the request to the merge and names no review rounds
  and no live check before the PR.
- The roles `qa-engineer`, `product-strategist`, `goal-critic` and `skill-curator` lie in
  `.claude/agents/`; the review lenses lie in `.claude/workflows/feature.js`.
- The push set is printed by `rt_push_checks` in `.claude/rt-kit/project.sh`; its heavy steps run
  ahead by `bash .claude/hooks/git-guard-push-ahead.sh`.
- The stands: `pnpm run serve:stand` for the receiver and the admin panel, the showcase on port
  6007 for the kit.
- The tree's own rules (`kit-approval`, `cargo-triage`) show the shape: `SKILL.md` with
  `kind: rule` and `law:`, a companion `implementation.md`.

## What the rules already say

- The gate map override `.claude/rt-kit/gate-map.sh` is where a tree's own rule is demanded.
- A laid-out text is changed by a section in `.claude/rt-kit/overrides/<resource>`.
- The merge is pressed by a person (rule `git-workflow`): the loop does not change that.

## Questions and answers

No questions: the starting session decides by the task and the code.

## Decisions

- **The skill is a rule of the tree, not a package resource** — it names this tree's stands, roles
  and push set. Rejected: a package resource — a foreign tree has no showcase and no such stand.
- **The gate demands the skill on a task folder edit and on the delivery commands** — those are the
  first actions of any task. Rejected: a new hook — the gate already holds the requirement.
- **The loop does not decide who merges** — the rule `git-workflow` keeps the merge with a person;
  the loop names what the PR waits for and merges only what the owner said to merge.

## What is left unclear

- Nothing blocks the work.
