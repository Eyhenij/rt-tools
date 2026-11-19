# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — review and delivery
- **Done:** the rule, its pattern and companion, the task-flow section, the gate branches, the texts
- **Next step:** take the folder apart and run the push set
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
- [x] 3.2 Run review round one and fix its findings
- [x] 3.3 Run review round two and fix its findings
- [>] 3.4 Take the folder apart and run the push set
- [ ] 3.5 Push and open the PR

## Decisions along the way

- **The working copy names itself `rt-task-delivery-loop`, and its row is added to the assignment
  table in this branch** — the delivery guard refuses a branch of a copy without a row.

- **The ready commands are the pattern `task-delivery-loop-run`, not a COMMANDS.md beside the
  rule** — the spec audit refuses a rule without a pattern. Affected stage of the plan: 1.

- **Round one, confirmed and fixed:** the pattern opened the PR through `$GH`, which no delivery
  guard and no gate branch read — the call is typed in full now, and the gate reads `$GH` too;
  `--draft` stood for every base and the reviewer went after the call — the draft is for `main`
  only, reviewer, assignee and labels go in the call; the gate missed `worktree add -b`, `git -C`,
  `checkout -q -b`, a token prefix with `$(…)`, `command gh`, `npm run -s task:new` and the epic
  plan — the branches read the command text plainly and take `docs/plans/`; the task folder branch
  printed `task-flow` first and skipped the default — the loop goes first, the default is called;
  the new branches had no cases — 21 in `tools/tests/gate-map-loop.test.sh`; the live check named
  no port check and ran every suite — `lsof` and `RT_SUITES_BASE`; the REST exception of the quota
  refusal was not named; the label loop split names with a space; the task-flow articles had no
  binding — they are bound in `.claude/skills/task-delivery-loop/implementation.md`, the spec audit
  binds the companion of `task-flow` only to its section «How the law applies here». Affected stage: 3.
- **Round one, written off:** «the merge question contradicts the owner's standing order to merge»
  — that order lives outside the tree, and the tree rule `git-workflow` keeps the merge with a
  person; the step now names what the PR waits for, with no question. «No guard counts the rounds»
  — true, and said in the rule and in the PR body; a guard for it is a package edit, not this task.

- **Round two, confirmed and fixed:** the gate missed the push after `-c` keys and `--no-pager`,
  `switch -C`, `switch --create`, `checkout -bNAME`, `worktree add <path> -b`, `branch <name>`, a
  quoted `$GH`, `${GH:-gh}`, `pr new`, `node tools/task-new.mjs` and a quoted `task:new` — read
  now, 36 cases; the article «a finding never becomes a task» reversed the task-flow article on
  findings beside the subject — narrowed to findings about the diff; step 3 took the branch from
  the epic branch only, and «no answer yet» held the next task — the chain base and the state
  `работа-отдана`; the loop said nothing of unattended work — the night rule keeps the push and the
  PR local; step 13 still set the reviewer by REST — aligned with the pattern; the draft into
  `main` was never lifted — the call named; the run ahead and the push stood in one block — two
  calls; the guard scenarios were sent to the wrong runner — `nx affected -t test-hooks`; the
  refusal list lacked the draft base and the token account; the CLAUDE.md line ran long. Affected
  stage: 3.
- **Round two, written off:** «no guard counts the rounds» — as in round one, said in the rule and
  the PR body; false positives of the gate on read commands — the cost is one load, said in GUARDS.

## Sessions

### 2026-11-19

- The task #3408, the branch from `origin/main`, the folder.
- The gate on the stripped paths (before round one): a task folder — `task-flow task-delivery-loop`; a spec — `spec-driven`;
  a file with no rule — silent; a component — `component-structure`. Commands: `task:new`,
  `checkout -b`, `push`, `pr create` — `task-delivery-loop git-workflow`; `status` — silent.
- Green: check-specs, check-descriptions (108), check-doc-paths (1135), check-boundary, check-dupes,
  check-hooks (17), check-glossary, check-work-steps, `agent-kit:check`.
- Round two: three roles, 3 + 6 + 13 findings; gate cases 36 ok, 0 failures.
- Round one: three roles, 6 + 5 + 8 findings; fixed 12, written off 2. Gate cases: 21 ok, 0 failures.
