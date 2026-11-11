# Grill

Work of epic RT-3190, task RT-3193. No cargo records.

## The owner request

> заведи новый эпик на актуализацию обвязки agent kit и разбей на задачи. нужно сделать ревизию
> всей документации, правил и скилов в agent kit. так же нужно начать с построения графа graphify
> для каждого из проектов в этом репозитории, если это будет необходимо - построить некое подобие
> графа для понятий и правил в agent kit

## What the tree already has

- The family of the law `work-conduct` in the package: the law
  `projects/agent-kit/assets/laws/work-conduct.md` (295 lines), five rules — `task-flow`,
  `epic-flow`, `turn-conduct`, `turn-entry`, `status-report` (929 lines together), ten patterns
  and two pitfall files.
- The graph of concepts and rules from RT-3192 and its report
  `projects/agent-kit/rules-graph/REPORT.md`. For this family it names 61 articles that the
  companion marks «Not checked» or «Not carried out»: turn-conduct 27, task-flow 23, status-report
  7, epic-flow 4, turn-entry 0. The only resource nothing links to is the pipeline `feature.js`,
  named by the tree companion only.
- The command `/rules-review` and the role `rules-reviewer`: one role per family, verbatim quotes,
  divergences first, then gaps.
- Bindings of the family in the package specs: `docs/specs/agent-kit/work`, `work-steps`,
  `turn-guards`, `turn-entry`, `epic-table`, `epic-stop` and others.

## What the rules already say

- The command `/rules-review` leaves the decision on each finding to the owner. The owner already
  decided for the whole epic: «По семьям законов, правки сразу».
- The epic plan: a law article goes to the owner as text, the law is not edited in the branch.
  Hook and check behaviour changes only when the finding is a divergence between a rule statement
  and its executor, with a scenario of its own.

## Questions and answers

**How is the revision split and when are findings fixed?**
«По семьям законов, правки сразу»

**When is the graph of concepts and rules built?**
«Перед ревизией»

## Decisions

- **Edits go into package sources, then build and sync.** Laid-out copies are not edited in place.
  Rejected: overrides — a finding about a package text is fixed for every tree.
- **One reviewer role over the whole family.** The command forbids a fan-out: the subject is two
  texts about one matter. A second pass compares rule articles with the companion bindings and hook
  code, because the task asks for it and the role does not read the companion.
- **The report of the rules graph is rebuilt by the last commit of the revision.** The epic
  milestone compares it with the report from RT-3192.

## What is left unclear

- Which findings will touch law articles. They are written as text for the owner in the archive
  record and in the PR, and do not block the branch.
