# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Fixes
- **Done:** findings of the role and of the binding comparison, the text fixes, tasks RT-3214–RT-3217
- **Next step:** lay out, run the checks, commit the fixes
- **Uncommitted:** the fixes of D1–D19, G1–G6, B1–B4
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the role rules-reviewer over the whole family
- [x] 1.2 Compare rule articles with the companion bindings and hook code
- [x] 1.3 Write the findings list into the progress with a decision for each
- [x] 2.1 Edit the package texts by the findings
- [x] 2.2 Build the package and lay out the tree
- [x] 2.3 File tasks for findings that need code or another law
- [>] 3.1 Rebuild the rules graph and its report
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

Role rules-reviewer (D — divergence, G — gap):

- **D1 the end of an epic: stop or queue work.** Fixed: `task-flow-resume` and the pitfalls follow
  `turn-conduct`. Law text L1 for the owner.
- **D2 where the handover lies.** Fixed: `turn-conduct`, `task-flow-resume`, `task-flow-handoff`,
  `turn-entry-map` serve the progress section first. The command `/next-session` — task RT-3214.
- **D3 one task without an epic.** Fixed: `task-flow-start`, `epic-flow-declare`, the flow of
  `task-flow` name `--outside-epic`.
- **D4 state `влито`.** Fixed: the state table of `task-flow`, `task-flow-archive`, the turn map,
  the refusal text of `task-flow-guard.sh`. The map check — task RT-3215.
- **D5 the archive pattern keeps the old closing order.** Fixed.
- **D6 the PR line in a progress that is gone.** Fixed in `task-flow-resume`.
- **D7 the last action of a session.** Fixed: `task-flow-handoff`, `/next-session`.
- **D8 where the path to a sample lives.** Fixed in `task-flow` and the pitfalls. Law text L2.
- **D9 a pitfall sends task branches to main.** Fixed.
- **D10 `epic-flow` quotes the delivery law as its own.** Fixed.
- **D11, D16, D17 untrue «nothing checks».** Fixed: `status-report`, `task-flow`, pitfalls of
  `turn-conduct`.
- **D12 four exits or five.** Fixed: `turn-conduct` turn exits and flow, the turn map.
- **D13 a refusal ends the turn / only as the last action.** Fixed: the first article renamed.
- **D14 one waiting line for two meanings.** Fixed: a standing order goes to decisions along the way.
- **D15 three names for the epic subject, two table shapes.** Fixed: «capability»; the end of an
  epic shows the table of `status-report`.
- **D18 the PR always a draft.** Fixed in `task-flow-archive`.
- **D19 the epic plan committed before its branch.** Fixed in `epic-flow-declare`.
- **G1 `feature.js` without a place.** Fixed: a section in `task-flow-resume`.
- **G2 three law articles without a rule line.** Fixed: two articles in `task-flow`.
- **G3 no step writes the epic assignment.** Fixed: `epic-flow-declare` asks the owner for the row.
- **G4 `status-report-table` only for GitHub.** Task RT-3216.
- **G5 an empty pitfall section.** Fixed: removed.
- **G6 the question branch of the `turn-conduct` flow.** Fixed.

Binding comparison:

- **B1 stale «Not checked» and claims in the companions.** Fixed: `task-flow` (pipeline file,
  board check, specs, epic guards, draft guard), `epic-flow` (epic branch guard, branch section),
  `turn-conduct` (assignment guard, path message, draft-ready guard), `status-report` (table
  command), `turn-entry` (handover place).
- **B2 the guard lifts the refusal on `работа-отдана`, the rule named three states.** Fixed in the rule.
- **B3 the rule named the plan line «Checked by», the guard reads «Verified by».** Fixed in the rule.
- **B4 the epic table took its paragraph from «Зачем», plans open with «Что даёт».** Fixed in
  `epic-table.github.mjs`, scenario SC-AK-1336.
- **B5 the compaction and stop thresholds are equal in the tree settings.** Task RT-3217.

Law texts for the owner:

- **L1.** The article «An ended epic is named to the owner in the same turn in which work outside
  it is taken» contradicts the rules and the guards: the end of an epic is a stop that waits for the
  owner's word.
- **L2.** The article «A sample named in the progress … The link is written directly in the
  progress» meets the ban on another tree's name: the progress holds a reference, the full path lies
  next to the handover.

## Decisions along the way

## Sessions

### 2026-11-11

- Folder, plan; baseline: agent-kit:check, check:specs, check:spec-coverage green; 61 articles of
  the family held by memory, 1 resource nothing links to.
