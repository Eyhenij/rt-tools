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

## RT-3480 — the review of 23 November 2026

Loaded: `task-delivery-loop`, `task-flow`, `task-flow-plan`, `task-flow-start`,
`task-flow-archive`, `task-flow-close`, `doc-style`, `doc-style-human`, `kit-approval`,
`kit-approval-record`, `git-workflow` with its parts, `ui-component-tests`, `agent-kit-extend`. No
edit of the gate map is needed. The language miss already went out as an incident with proposals
for `hooks/turn-judge.md` and `hooks/ask-judge.md`.

1. **The language of every line to the owner** — package, `patterns/doc-style-human.md`, section
   «The language of the text», instead of its second sentence: «A session that has just read a
   rule writes the task, the PR and every line to the owner between two tool calls in the rule's
   words and language, so the addressee is checked before the first line of each, together with
   the register. The owner's remark about the language holds for every later message of the
   session, not for the one it answered.» With the sample `✗ Running the push set ahead` /
   `✓ Запускаю набор перед отправкой`.
2. **A step check names a commit, not a branch that moves** — package, `pitfalls/task-flow.2.md`,
   article «Every step of the plan carries a check…», after «Written by a guess, it fails at the
   step itself.»: «A check that compares with another branch names its commit, taken by
   `git rev-parse --short <branch>` while the plan is written: the plan is not edited after
   approval, and the branch merges or moves meanwhile.» Here step 1.5 kept comparing with the
   RT-3508 branch after it merged into the epic.
3. **A comparison inside interpreter code is not a write** — package, `hooks/write-targets.sh`,
   function `writes()`: `>` counts as a redirect only after a space or the line start and before a
   path with `/` or an extension. Scenario: `node -e "process.exit(a>b?1:0)" && node
tools/check-specs.mjs` gives no write target. Here the plan's step 1.5 check could not run as
   one command.
4. **A red set in the push refusal is named** — tree, `tools/tests/run.sh`: the last line names
   the red sets and those that left no exit code — `SETS WITH FAILURES: 1 — <set> (code 1)` or
   `(no code)`. Package, `hooks/git-guard-push-ahead.sh`: the full output of a red step is kept in
   a file of the session's temporary directory, and the refusal names its path beside the last 25
   lines. Here the guard twice refused with one red set unnamed, every manual run was green, and
   the rerun overwrote the evidence; the cause stays unknown.
5. **The gate delivers what fits** (low) — package, `hooks/skill-gate.sh`, branch
   `gate_why="together"`: when the rules of a call fit one by one but not together, the gate
   delivers as many as fit in order and refuses only for the rest, by name.
