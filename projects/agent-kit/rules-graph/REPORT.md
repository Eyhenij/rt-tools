# Report of the rules graph

Built by `npm run graph:rules` from `8d3816731`: 353 nodes, 1322 links.
The graph is `projects/agent-kit/rules-graph/graph.json`; graphify reads it with `--graph`. Every list below is
debt for the revision of a law family to sort out, not a refusal.

## Resources nothing links to — 0

No other text names them in its header, a `Requires` line, an import, a binding or in backticks.


## Rules nothing executes — 0

No `Requires` line and no binding of the companion to code: a hook, a check, a linter rule or a test.

- none

Not laid out in this tree, so their executors are unknown here: api-layer, shared-code.

## Articles nothing carries out — 181

Articles the companion of the rule marks «Not checked» or «Not carried out», of all its articles.

- git-workflow — 26 of 79
- turn-conduct — 25 of 69
- task-flow — 23 of 59
- observability — 14 of 29
- deploy-flow — 13 of 29
- testing — 13 of 42
- browser-verification — 12 of 23
- autonomous-work — 11 of 11
- reuse-first — 9 of 18
- doc-style — 8 of 21
- spec-driven — 6 of 31
- status-report — 5 of 10
- epic-flow — 4 of 11
- typescript-conventions — 3 of 10
- angular-patterns — 2 of 5
- styling-bem — 2 of 12
- component-structure — 1 of 4
- dependencies — 1 of 5
- lib-layers — 1 of 9
- platform-access — 1 of 3
- queue-audit — 1 of 10

## Glossary words used nowhere — 0

Of 46 words of the package glossary, these are said by no text of the package or its specs.

- none

## Texts that state the same thing — 16

Pairs of texts whose bold statements share at least 60% of their words, with the
number of such statements and the first of them.

- `projects/agent-kit/assets/laws/entity-models.md` and `projects/agent-kit/assets/rules/entity-models.md` — 3: «The contract side is not written by hand.» / «The contract side is not written by hand — it is declared as an alias.»
- `projects/agent-kit/assets/rules/git-workflow.azure.md` and `projects/agent-kit/assets/rules/queue-audit.github.md` — 3: «A lagging state is found by the queue audit, not by eye.» / «A lagging column is found by the queue audit, not by eye.»
- `projects/agent-kit/assets/rules/git-workflow.gitlab.md` and `projects/agent-kit/assets/rules/queue-audit.github.md` — 3: «A lagging list is found by the queue audit, not by eye.» / «A lagging column is found by the queue audit, not by eye.»
- `projects/agent-kit/assets/pitfalls/git-workflow.github.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 2: «Draft is not lifted from a branch that does not merge.» / «The draft is not lifted from a branch that does not merge.»
- `projects/agent-kit/assets/laws/code-structure.md` and `projects/agent-kit/assets/rules/typescript-conventions.md` — 1: «A type is taken from the package where it is declared.» / «A type is taken from the package where it is declared.»
- `projects/agent-kit/assets/laws/delivery.md` and `projects/agent-kit/assets/rules/git-workflow.azure.md` — 1: «The work queue holds tasks, not PRs about them.» / «The board holds work items, not PRs about them.»
- `projects/agent-kit/assets/laws/delivery.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 1: «The work queue holds tasks, not PRs about them.» / «The board holds tasks, not PRs about them.»
- `projects/agent-kit/assets/laws/entity-editing.md` and `projects/agent-kit/assets/laws/lists.md` — 1: «While the record is loading, the place of the fields shows that loading is in progress.» / «While the list is loading, the place of the rows shows that loading is in progress.»
- `projects/agent-kit/assets/laws/frontend-application.md` and `projects/agent-kit/assets/rules/styling-bem.md` — 1: «Every class in the markup has a style rule of its own.» / «Every element class has its own style rule.»
- `projects/agent-kit/assets/laws/project-documentation.md` and `projects/agent-kit/assets/rules/doc-style.md` — 1: «An image is edited by the same change as the text it depicts.» / «A diagram is edited by the same change as the text it depicts.»
- `projects/agent-kit/assets/laws/verifiability.md` and `projects/agent-kit/assets/rules/testing.md` — 1: «A test switched off by an environment flag does not count as coverage.» / «An end-to-end test switched off by an environment variable does not count as coverage.»
- `projects/agent-kit/assets/rules/doc-style.md` and `projects/agent-kit/assets/rules/git-workflow.azure.md` — 1: «A document goes in the same commit as the change it describes.» / «A document goes in the same commit as the edit.»
- `projects/agent-kit/assets/rules/doc-style.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 1: «A document goes in the same commit as the change it describes.» / «A document goes in the same commit as the edit.»
- `projects/agent-kit/assets/rules/doc-style.md` and `projects/agent-kit/assets/rules/git-workflow.gitlab.md` — 1: «A document goes in the same commit as the change it describes.» / «A document goes in the same commit as the edit.»
- `projects/agent-kit/assets/rules/epic-flow.md` and `projects/agent-kit/assets/rules/git-workflow.github.md` — 1: «Work begins with the epic, and a task outside one is not taken.» / «Work begins with the epic, and the branch of a task is taken from the epic branch.»
- `projects/agent-kit/assets/rules/epic-flow.md` and `projects/agent-kit/assets/rules/git-workflow.gitlab.md` — 1: «Work begins with the epic, and a task outside one is not taken.» / «Work begins with the epic, and the branch of a task is taken from the epic branch.»
