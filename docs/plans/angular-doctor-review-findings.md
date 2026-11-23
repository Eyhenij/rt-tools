# The findings of the review of the closed works of the epic RT-3476

The findings of the rules review of every closed task of the epic "Дерево проходит проверку Angular
Doctor без находок" accumulate here and wait for the owner's word. The file lies next to the plan of
the epic — `docs/plans/angular-doctor.md`. Nothing here is applied without that word.

## RT-3478 — the review of 22 November 2026

Loaded: `task-delivery-loop`, `task-flow`, `task-flow-plan`, `doc-style`, `typescript-conventions`,
`ui-component-tests`, `spec-driven`, `testing`, `browser-verification`, `git-workflow`,
`git-workflow-push`, `git-workflow-hosting`, `doc-style-human`, `task-flow-handover`,
`agent-kit-source`. No edit of the gate map is needed.

1. **The order of steps 11–12 of the delivery loop** — tree, `.claude/skills/task-delivery-loop/SKILL.md`.
   Step 11 takes the folder apart before the push set, while `task-flow-archive` asks for the folder
   taken apart by the last commit after the gate has passed. Here the push set found three issues
   after the folder was taken apart, and the archive commit was made twice. Proposed: step 11 —
   close the texts and run the push set until green; step 12 — take the folder apart by the last
   commit and push. At the end of step 9: «Before the round's commit run `node tools/check-dupes.mjs;
   pnpm run check:unused; node tools/check-doc-paths.mjs` — their findings join the round.»
2. **The form of an expected number and the count of tests** — package, `rules/task-flow-plan.md`,
   after the article «Every step of the plan carries a check…»: «**An expected number is written
   bare; backticks mean a whole line.** `>= 12` compares the last line as an integer, `` `12` ``
   demands the line equal. A test run is expected by its count of passed tests, never by `exit 0`: a
   skipped test leaves the code zero.» Companion line: `tools/flow-data.mjs:compareExpected`. Here
   ten checks of the plan had to be replaced in the progress.
3. **End-to-end suites named at planning** — tree, step 4 of `task-delivery-loop`: «The plan names the
   end-to-end suites its paths demand and a step that edits a test of each.» In
   `task-delivery-loop-run`, section 5–6: how to read the suites a change touches, and that the
   coverage guard judges the pushed head, so a test commit is pushed before `gh pr create`. Here the
   guard refused the PR twice, once per suite.
4. **Graphs are not rebuilt in a task branch** — tree, override
   `.claude/rt-kit/overrides/pitfalls/task-flow-graph.needs-graph.md`, section «The graphs of this
   tree»: «`graph:build` is not run in a task branch. It leaves graph.html in every `graphify-out/`,
   ignored by git yet counted by `check:ngdoctor`, and rewrites the root `graph.json` into one line.
   A review finding asking for a rebuild is written off with this reason; graphs are rebuilt by a task
   of their own.»
5. **The question judge and a product choice about sanitizing** — package, `hooks/ask-judge.md`, after
   the item «weakens a hook or a check»: «A check here is a guard, a linter, a test or a threshold of
   the work. An option that changes what the product sanitizes or allows is a product choice and
   leaves.» Doubtful: the judge may have been right to stop a weaker sanitizer. Here the question
   whether to keep `<style>` and animation in a consumer's icons did not reach the owner.

## RT-3508 — the review of 23 November 2026

Loaded: `task-delivery-loop`, `task-flow`, `task-flow-plan`, `task-flow-handover`,
`task-flow-archive`, `task-flow-close`, `doc-style`, `kit-approval`, `kit-approval-record`,
`git-workflow` with `-push`, `-hosting`, `-pr`, `-pr-body`, `epic-flow`, `component-structure`,
`angular-patterns`, `reuse-first`, `testing`, `ui-component-tests`, `ui-component-tests-screens`,
`rt-tools-storybook`, `spec-driven`. No edit of the gate map is needed.

1. **The delivery guard reads a shell redirect as the base of a new branch** — package,
   `hooks/git-guard-delivery.sh`, after `base_arg=…`: a base argument with `>` or `<` in it is
   emptied. A scenario in the package guard tests creates a task branch by a command that ends in
   `2>&1`. Here `2>` was judged a base that does not carry the epic.
2. **Where repairs go when the main branch merges into the epic with conflicts** — package, rule
   `git-workflow`, after «The main branch is merged into the epic branch…»: «A merge of the main
   branch that needs repairs leaves the epic branch with the merge commit alone; the task branch is
   taken from that tip before the first repair. The folder is created in the task branch, named by
   it.» The same sentence closes the refusal `epic_has_main_tip` of
   `hooks/git-guard-delivery-epic.sh`. Here the repairs and the folder lay on the epic branch; the
   folder was moved by a rename, and the approval mark of the plan stayed with the old name — the
   engine reads RT-3508 as a task without an approved plan.
3. **The order of steps 11–12 of the delivery loop** — tree, the same proposal as RT-3478 item 1,
   now repeated: the push set run after the take-apart found two reds, and their fixes came after
   the take-apart commit.
4. **What squeezing is** — package, rule `component-structure`, after «A component that grew past
   the file limit is split, not squeezed.»: «Moving comments out, dropping blank lines and joining
   lines are squeezing: the limit is met and the component is as large as before.»
5. **A story brings a reference** (optional) — tree, rule `rt-tools-storybook`, after «A component
   is counted apart from its family…»: «A component without a story gets a story or a named reason,
   and a story brings a snapshot reference. Where the plan keeps the references, the component is
   named in the component list with its reason, and its story is work of its own.»
