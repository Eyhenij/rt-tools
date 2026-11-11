# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Findings
- **Done:** the folder, the plan
- **Next step:** run the role rules-reviewer over the whole family
- **Uncommitted:** the rules graph rebuilt on the branch tip, only the commit stamp differs
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Run the role rules-reviewer over the whole family
- [ ] 1.2 Compare rule articles with the companion bindings and hook code
- [ ] 1.3 Write the findings list into the progress with a decision for each
- [ ] 2.1 Edit the package texts by the findings
- [ ] 2.2 Build the package and lay out the tree
- [ ] 2.3 File tasks for findings that need code or another law
- [ ] 3.1 Rebuild the rules graph and its report
- [ ] 3.2 Run the push gate
- [ ] 3.3 Take the task folder apart into the archive

## Findings

- **F1. No package text names `feature.js`.** Gap, rules graph report. Fixed: a row in the names
  table of `task-flow`, commit `bac1536c0`.
- **F2. `task-flow-graph` calls any lag behind the head stale.** A tree that keeps the graph in
  history is always one commit behind. Fixed: a paragraph in the freshness section.
- **F3. `task-flow-resume` repeats two misses of `task-flow-handoff`.** «A session that ended in
  nothing» and «the uncommitted is named» are about writing the handover. Fixed: removed from
  `task-flow-resume`.
- **F4. The pitfalls of `task-flow` repeat a rule article.** «Waiting on one part of a stage is never
  a stop of the stage» stands in the rule. Fixed: removed from the pitfalls.
- **F5. Pairs with `git-workflow` from the report.** «The task is created by a command» in
  `task-flow-start` and the three `git-workflow` pitfalls; «Opening a PR is refused while the branch
  carries its task folder» in `task-flow` and `git-workflow.github`. Decision: the delivery family
  revision RT-3194 decides where they live — the guard is a delivery guard.

## Decisions along the way

## Sessions

### 2026-11-11

- Folder, plan; baseline: agent-kit:check, check:specs, check:spec-coverage green; 61 articles of
  the family held by memory, 1 resource nothing links to.
