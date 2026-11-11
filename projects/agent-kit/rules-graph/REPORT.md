# Report of the rules graph

Built by `npm run graph:rules` from `1348d6d5d`: 351 nodes, 1279 links.
The graph is `projects/agent-kit/rules-graph/graph.json`; graphify reads it with `--graph`. Every list below is
debt for the revision of a law family to sort out, not a refusal.

## Resources nothing links to — 1

No other text names them in its header, a `Requires` line, an import, a binding or in backticks.

- **pipeline:** feature.js

## Rules nothing executes — 0

No `Requires` line and no binding of the companion to code: a hook, a check, a linter rule or a test.

- none

Not laid out in this tree, so their executors are unknown here: api-layer, shared-code.

## Articles nothing carries out — 184

Articles the companion of the rule marks «Not checked» or «Not carried out», of all its articles.

- git-workflow — 27 of 81
- turn-conduct — 27 of 69
- task-flow — 23 of 57
- observability — 14 of 29
- testing — 14 of 42
- deploy-flow — 13 of 28
- browser-verification — 12 of 23
- reuse-first — 9 of 18
- autonomous-work — 8 of 11
- doc-style — 7 of 21
- status-report — 7 of 10
- spec-driven — 6 of 31
- epic-flow — 4 of 11
- typescript-conventions — 3 of 10
- angular-patterns — 2 of 5
- dependencies — 2 of 5
- styling-bem — 2 of 12
- component-structure — 1 of 4
- lib-layers — 1 of 9
- platform-access — 1 of 3
- queue-audit — 1 of 10

## Glossary words used nowhere — 0

Of 46 words of the package glossary, these are said by no text of the package or its specs.

- none

## Texts that state the same thing — 25

Pairs of texts whose bold statements share at least 60% of their words, with the
number of such statements and the first of them.

- `projects/agent-kit/assets/laws/entity-models.md` and `projects/agent-kit/assets/rules/entity-models.md` — 3: «The contract side is not written by hand.» / «The contract side is not written by hand — it is declared as an alias.»
- `projects/agent-kit/assets/pitfalls/git-workflow.github.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 3: «The gate set is never narrower than the pipeline set.» / «The push gate set is never narrower than the pipeline set.»
- `projects/agent-kit/assets/rules/git-workflow.azure.md` and `projects/agent-kit/assets/rules/queue-audit.github.md` — 3: «A lagging state is found by the queue audit, not by eye.» / «A lagging column is found by the queue audit, not by eye.»
- `projects/agent-kit/assets/rules/git-workflow.gitlab.md` and `projects/agent-kit/assets/rules/queue-audit.github.md` — 3: «A lagging list is found by the queue audit, not by eye.» / «A lagging column is found by the queue audit, not by eye.»
- `projects/agent-kit/assets/laws/code-structure.md` and `projects/agent-kit/assets/rules/typescript-conventions.md` — 1: «A type is taken from the package where it is declared.» / «A type is taken from the package where it is declared.»
- `projects/agent-kit/assets/laws/delivery.md` and `projects/agent-kit/assets/rules/git-workflow.azure.md` — 1: «The work queue holds tasks, not PRs about them.» / «The board holds work items, not PRs about them.»
- `projects/agent-kit/assets/laws/delivery.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 1: «The work queue holds tasks, not PRs about them.» / «The board holds tasks, not PRs about them.»
- `projects/agent-kit/assets/laws/delivery.md` and `projects/agent-kit/assets/patterns/spec-driven-rule.md` — 1: «The image rolled out is the image of the commit being rolled out.» / «The image of the commit being rolled out is what gets rolled out.»
- `projects/agent-kit/assets/laws/entity-editing.md` and `projects/agent-kit/assets/laws/lists.md` — 1: «While the record is loading, the place of the fields shows that loading is in progress.» / «While the list is loading, the place of the rows shows that loading is in progress.»
- `projects/agent-kit/assets/laws/frontend-application.md` and `projects/agent-kit/assets/rules/styling-bem.md` — 1: «Every class in the markup has a style rule of its own.» / «Every element class has its own style rule.»
- `projects/agent-kit/assets/laws/project-documentation.md` and `projects/agent-kit/assets/rules/doc-style.md` — 1: «An image is edited by the same change as the text it depicts.» / «A diagram is edited by the same change as the text it depicts.»
- `projects/agent-kit/assets/laws/verifiability.md` and `projects/agent-kit/assets/rules/testing.md` — 1: «A test switched off by an environment flag does not count as coverage.» / «An end-to-end test switched off by an environment variable does not count as coverage.»
- `projects/agent-kit/assets/patterns/autonomous-work-run.md` and `projects/agent-kit/assets/rules/autonomous-work.md` — 1: «The branch was created from main by habit.» / «A branch created from main by habit breaks the chain.»
- `projects/agent-kit/assets/patterns/task-flow-handoff.md` and `projects/agent-kit/assets/patterns/task-flow-resume.md` — 1: «A session that ended in nothing writes a handover too.» / «A session that ended in nothing is recorded too.»
- `projects/agent-kit/assets/patterns/task-flow-start.md` and `projects/agent-kit/assets/pitfalls/git-workflow.azure.md` — 1: «The task is created by a command, not by four calls in a row.» / «A work item is created by the command, not by calls in a row.»
- `projects/agent-kit/assets/patterns/task-flow-start.md` and `projects/agent-kit/assets/pitfalls/git-workflow.github.md` — 1: «The task is created by a command, not by four calls in a row.» / «A task is created by the command, not by four calls in a row.»
- `projects/agent-kit/assets/patterns/task-flow-start.md` and `projects/agent-kit/assets/pitfalls/git-workflow.gitlab.md` — 1: «The task is created by a command, not by four calls in a row.» / «A task is created by the command, not by calls in a row.»
- `projects/agent-kit/assets/pitfalls/git-workflow.github.md` and `projects/agent-kit/assets/rules/git-workflow.azure.md` — 1: «The gate set is never narrower than the pipeline set.» / «The push gate set is never narrower than the pipeline set.»
- `projects/agent-kit/assets/pitfalls/git-workflow.github.md` and `projects/agent-kit/assets/rules/git-workflow.gitlab.md` — 1: «The gate set is never narrower than the pipeline set.» / «The push gate set is never narrower than the pipeline set.»
- `projects/agent-kit/assets/pitfalls/task-flow.md` and `projects/agent-kit/assets/rules/task-flow.md` — 1: «Waiting on one part of a stage is never a stop of the stage.» / «Waiting for one part of a stage is never a stop of the stage.»
- `projects/agent-kit/assets/rules/doc-style.md` and `projects/agent-kit/assets/rules/git-workflow.azure.md` — 1: «A document goes in the same commit as the change it describes.» / «A document goes in the same commit as the edit.»
- `projects/agent-kit/assets/rules/doc-style.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 1: «A document goes in the same commit as the change it describes.» / «A document goes in the same commit as the edit.»
- `projects/agent-kit/assets/rules/doc-style.md` and `projects/agent-kit/assets/rules/git-workflow.gitlab.md` — 1: «A document goes in the same commit as the change it describes.» / «A document goes in the same commit as the edit.»
- `projects/agent-kit/assets/rules/epic-flow.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 1: «Work begins with the epic, and a task outside one is not taken.» / «Work begins with the epic, and the branch of a task is taken from the epic branch.»
- `projects/agent-kit/assets/rules/git-workflow.github.md` and `projects/agent-kit/assets/rules/task-flow.md` — 1: «Opening a PR is refused while the branch carries its task folder.» / «Opening the PR and lifting the draft are refused while the branch carries its task folder.»
