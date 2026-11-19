# Plan

**Task:** RT-3408 · **Branch:** RT-3408-task-delivery-loop
**Behaviour:** unchanged — the owner asked for a rule of work, the edit touches rules, the gate map and texts, no application code

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** a task reaches the PR read by nobody but its executor: no live check, no review round.
- **This task reaches:** every task of the tree goes through a live check and two review rounds
  before the push, and the gate demands the loop at the first action of the task.
- **Sign:** the gate prints `task-delivery-loop` for an edit of a task folder and for `task:new`;
  the rule `task-flow` holds the section that names the loop.
- **Milestone G of the epic:** outside an epic, by the owner's word.
- **Metric:** нет: a repair — the course of a task had no mandatory review.

## Task footprint

| What  | Where                                                                               |
| ----- | ----------------------------------------------------------------------------------- |
| Rules | `.claude/skills/task-delivery-loop/`, `.claude/rt-kit/overrides/rules/task-flow.md` |
| Gate  | `.claude/rt-kit/gate-map.sh`                                                        |
| Texts | `CLAUDE.md`, `docs/specs/agent-kit/package-boundary/implementation.md`              |

## What counts as done

- The skill lies in `.claude/skills/task-delivery-loop/` with its companion.
- The laid-out rule `task-flow` holds the section about the loop.
- The gate demands the skill on a task folder edit and on the delivery commands.
- The tree checks and the push set are green, the PR into `main` is open.

## Stages

### 1. The skill

- **Steps:**
    1. Write SKILL.md of the loop
    2. Write COMMANDS.md and GUARDS.md
    3. Write implementation.md
- **Readiness sign:** the spec and description checks pass with the new rule.
- **Verified by:** `node tools/check-descriptions.mjs` — «all within the limit».

### 2. The bindings

- **Steps:**
    1. Add the section to the task-flow override and lay it out
    2. Add the gate map branches
    3. Name the skill in CLAUDE.md and in the boundary companion
- **Readiness sign:** the layout matches, the gate names the skill.
- **Verified by:** `pnpm run agent-kit:check` — «разложенное сходится с пакетом».

### 3. Review and delivery

- **Steps:**
    1. Run the gate on three paths
    2. Run review round one and fix its findings
    3. Run review round two and fix its findings
    4. Take the folder apart and run the push set
    5. Push and open the PR
- **Readiness sign:** the PR is open into `main`, the push set is green.
- **Verified by:** `node tools/check-specs.mjs` — exit code 0.

## What this work does not do

- It does not move the loop into the rules package: the loop names this tree's stands and roles.
- It adds no hook of its own: the gate holds the requirement.
