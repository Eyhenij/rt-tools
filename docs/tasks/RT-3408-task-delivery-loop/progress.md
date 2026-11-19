# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — review and delivery
- **Done:** the rule, its pattern and companion, the task-flow section, the gate branches, the texts
- **Next step:** review round one
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write SKILL.md of the loop
- [x] 1.2 Write COMMANDS.md and GUARDS.md
- [x] 1.3 Write implementation.md
- [x] 2.1 Add the section to the task-flow override and lay it out
- [x] 2.2 Add the gate map branches
- [x] 2.3 Name the skill in CLAUDE.md and in the boundary companion
- [x] 3.1 Run the gate on three paths
- [>] 3.2 Run review round one and fix its findings
- [ ] 3.3 Run review round two and fix its findings
- [ ] 3.4 Take the folder apart and run the push set
- [ ] 3.5 Push and open the PR

## Decisions along the way

- **The working copy names itself `rt-task-delivery-loop`, and its row is added to the assignment
  table in this branch** — the delivery guard refuses a branch of a copy without a row.

- **The ready commands are the pattern `task-delivery-loop-run`, not a COMMANDS.md beside the
  rule** — the spec audit refuses a rule without a pattern. Affected stage of the plan: 1.

## Sessions

### 2026-11-19

- The task #3408, the branch from `origin/main`, the folder.
- The gate on the stripped paths: a task folder — `task-flow task-delivery-loop`; a spec — `spec-driven`;
  a file with no rule — silent; a component — `component-structure`. Commands: `task:new`,
  `checkout -b`, `push`, `pr create` — `task-delivery-loop git-workflow`; `status` — silent.
- Green: check-specs, check-descriptions (108), check-doc-paths (1135), check-boundary, check-dupes,
  check-hooks (17), check-glossary, check-work-steps, `agent-kit:check`.
