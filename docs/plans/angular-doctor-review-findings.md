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
   the rerun overwrote the evidence. On RT-3514 the cause of the same refusal was found: the guard
   runs the steps under `LC_ALL=C.UTF-8` — point 2 of the RT-3514 review below.
5. **The gate delivers what fits** (low) — package, `hooks/skill-gate.sh`, branch
   `gate_why="together"`: when the rules of a call fit one by one but not together, the gate
   delivers as many as fit in order and refuses only for the rest, by name.

## RT-3481 — the review of 23 November 2026

Loaded: `task-delivery-loop`, `task-flow` with its parts, `task-flow-archive`, `kit-approval`,
`git-workflow` with its parts, `epic-flow`, `doc-style`, `rt-tools-storybook`, `lib-layers`,
`typescript-conventions`, `agent-kit`, `spec-driven`. No edit of the gate map is needed. The
unnamed red set of the push refusal repeats point 4 of the RT-3480 review.

1. **Code reshaped so the scanner stops recognising a construct is the same taking-out** —
   package, `laws/verifiability.md`, article «A red check means wrong code, not a wrong check.»,
   after «…and nobody has a signal about it any more.»: «Code reshaped so that the check stops
   recognising a construct that is still there — a key assembled from parts, a call through an
   alias, a value hidden from the parser — is the same taking-out: the construct stays, and the
   signal goes.» Here the first plan proposed a helper that assembled the key `then` past the
   scanner; goal-critic and the question judge stopped it, not a text.
2. **The step engine freezes the whole task folder, the rule names only the plan** — package,
   `checks/flow-step.mjs:changedSincePlan` and `rules/task-flow-plan.md` after «Done work is
   marked only in the progress.». Choice A (recommended): the engine judges only the plan and the
   grill, and the tree names other growing records in the engine words; the article «After the
   plan's commit the plan and the grill stay as they were; the progress and the records the tree
   names grow.» Choice B: the article «After the plan's commit only the progress moves in the task
   folder.», with a pitfall in `pitfalls/task-flow.2.md`. Here an approval line appended by the
   kit-approval rule after the first review round refused the rerun before the PR.
3. **Bringing the folder back after an engine refusal** — package,
   `pitfalls/task-flow-archive.md`, after «No plan on disk after the taking-apart, and the folder
   is not assembled again.»: the one exception is the refusal «the task folder differs from the
   commit of the plan» — the folder comes back whole from the plan's commit by a commit of its
   own, the rerun passes, and the folder is taken apart again; one file brought back is not
   enough. Here the first attempt brought back only the approvals and was refused for the missing
   grill and plan.
4. **The machine identity in zsh** — tree, `.claude/skills/task-delivery-loop-run/SKILL.md`,
   section «8, 9. Commit as the machine account», at its end: «The four variables are written out
   in the command, never packed into one: zsh does not split `$E` into words, so
   `env $E git commit` passes one argument, and the commit leaves under the local identity.» Here
   two commits
   left under the local identity and the identity guard caught them.
5. **The prose guard reads a long command as one sentence** — package,
   `hooks/prose-style-guard.sh`, branch `Bash`, line `[ -z "$added" ] && added="$cmd"`: without a
   heredoc only the quoted arguments of `printf` and `echo` that end in the redirect are judged; a
   command that brings no text of its own gives nothing to judge. Scenario: a `sed -i` and check
   chain over 60 words passes, `printf` with bureaucratic prose into a `.md` is still refused.

## RT-3514 — the review of 23 November 2026

Loaded: `task-delivery-loop`, `task-flow` with its parts, `doc-style`, `testing`, `git-workflow`
with its parts, `component-structure` (by a probe file path), `epic-flow`. No edit of the gate map
is needed.

1. **The exit code of a step check is the whole line's** — package, `pitfalls/task-flow.2.md`,
   article «Every step of the plan carries a check…», after «…a step marked done without its mark
   is refused.»: «The verdict is the exit code of the whole line, and in a pipe that is the last
   command's: `<check> | grep -c x` proves grep, not the check. The line puts `set -o pipefail;`
   first or ends with the checked command. Output a variable switches on — `VERBOSE=1` and the
   like — is set in the line itself, not taken from one's own terminal.» Companion
   `.claude/skills/task-flow-plan/implementation.md`: the engine runs the line by `bash -c` without
   `pipefail`. Here the first RT-3514 plan judged grep's exit code and counted names `report`
   prints only with `VERBOSE`; strategist and goal-critic caught both.
2. **The locale the push guard runs steps under** — package, `rules/git-workflow-push.github.md`
   and `pitfalls/git-workflow.2.github.md`: «Guard and check scenarios set the git settings and
   the locale themselves, not take them from the machine.», with «the push guard runs steps under
   `C.UTF-8`, where macOS bash 3.2 breaks `$var»`»; `hooks/git-guard-push-ahead.sh` names `LC_ALL`
   in the red line. Tree: `tools/tests/run.sh` exports `LC_ALL=C.UTF-8` before the sets, so a
   terminal run sees what the guard sees; companion `.claude/skills/git-workflow-push/implementation.md`.
   Here two refusals «SETS WITH FAILURES: 1» while manual runs were green; a temporary diagnostic
   commit found «grep: illegal byte sequence».
3. **The kit approval check gives a file to the task that edited it** — tree,
   `tools/check-kit-approval.mjs`: `branchFaults` stops giving the whole visible set to the
   branch's own record; `answerersOf` gives a commit to the task its subject ends with `(RT-N)`, a
   merge to its `[RT-N]`; a commit naming no task needs the branch record; scenarios in
   `tools/tests/check-kit-approval.test.sh`; companion `.claude/skills/kit-approval/implementation.md`.
   The base stays the remote main branch and no file loses its judge. Here RT-3514, stacked on RT-3481,
   was asked for 170 kit files of RT-3480 and RT-3481. Needs the owner's word.
4. **The epic line of a card says «план»** — package, `checks/task-new.github.mjs:284`, the hints
   in `checks/board-epics.github.mjs` and the test `task-new-epic.test.sh`: «Задача эпика #N,
   план — <path>». The queue audit reads only «задача эпика #N». Here the prose guard refused the
   word the package itself writes into the card.

Not proposed: `pipefail` in the step engine — it would flip the verdicts of approved plans; the
folder `task:new --epic-of` lays into the current working copy — the reviewer needs to know what
it broke.

## RT-3518 — the review of 23 November 2026

Loaded: `task-delivery-loop`, `task-flow` with its parts, `doc-style`, `testing`,
`typescript-conventions`, `git-workflow` with its parts, `kit-approval`, `epic-flow`. No edit of
the gate map is needed.

1. **The gate rearm text promises a delivery that does not come** — package,
   `hooks/skill-gate-rearm.sh`, the `context=` line: «Every rule within the host limit comes back
   by itself, whole, at the next edit of its area — unless the rules one edit demands pass the
   limit together: then the gate delivers none of them and names them all in one refusal, and
   they are loaded by the tool Skill in one turn.» Here after the compaction an edit of the
   progress was refused for four rules at once. A second case of RT-3480 item 5; worth raising
   from low while `task-delivery-loop` weighs 9.4 thousand characters.
2. **A counted step measure grows after review** — package, `pitfalls/task-flow.2.md`, after
   «A file holds neighbouring sets too.»: «A review round adds to the same set after the step's
   mark: the count is taken over a sign only the step's own items carry — a scenario id range, a
   label prefix — and what a round adds carries a sign of its own and an entry in the progress.
   Rewording the added items so the frozen number holds hides them from the count instead of
   bounding it.» Here the rounds added eight scenarios named «a pass…» beside the ten «the pass…»
   step 1.1 counts.
3. **Fast tree checks at the stage, not at the push** — tree,
   `.claude/skills/task-delivery-loop/SKILL.md` step 5: «Tests, lint and types over what is
   touched, and `node tools/check-file-size.mjs; node tools/check-doc-paths.mjs` with
   `pnpm run check:unused` — the linter after an edit does not judge `tools/` and texts, and the
   push set is too late for them»; the article «No guard counts the rounds» leaves as a repeat of «What of the
   law is not here», with its companion line, to keep the rule under the gate's delivery limit.
   Replaces RT-3478 item 1. Here the 579 lines of `check-ngdoctor.mjs`, the knip refusal and a
   backticked branch name surfaced only in review and in the push set.
4. **A parser of a tool's output is tested on output the tool printed** — package,
   `rules/testing.md`, after «An absence test is green even on the wrong target.»: «Synthetic
   output lacks the fields its author did not think of: an empty file, a finding on a
   directory.»; companion `.claude/skills/testing/implementation.md` marks it not checked. Here a
   finding with an empty `file` resolved to the tree root and gave a false «outside the list»;
   only the live check found it.
5. **The doc path check reads a remote branch as a path** — package, `checks/check-doc-paths.mjs`,
   `looksLikePath`: a candidate starting with a remote name and a slash is a ref, not an address;
   a scenario with a backticked remote main branch gives no divergence.

Not proposed: knip on `const require = createRequire(...)` — one case, and item 3 catches it at the
stage; the step and source guard refusals on combined commands — to be sent by `/feedback` with the
command verbatim; the kit approval demand for other tasks' files — RT-3514 item 3 already.

## RT-3483 — the review of 23 November 2026

Loaded: `task-delivery-loop`, `task-flow` with its parts, `doc-style`, `component-structure`,
`angular-patterns`, `rt-tools-storybook`, `reuse-first`, `browser-verification`, `git-workflow`
with its parts, `kit-approval`. No edit of the gate map is needed.

1. **The quick checks of the push set run at the stage** — tree,
   `.claude/skills/task-delivery-loop-run/SKILL.md`, section «5–6», after the line
   `RT_SUITES_BASE=origin/<base> bash tools/tests/run.sh`; step 5 of the rule reads «Tests, lint,
   types and the quick checks of the push set over what is touched». Here `check-boolean-inputs`
   and a stale `tools/reuse-allowlist.json` line were found only by the push set, which ran again.
2. **A wrapper that derives by `computed()` declares its args `input()`, a boolean one with
   `booleanAttribute`** — tree, `.claude/skills/rt-tools-storybook-story/SKILL.md`, section «The
   wrapper component», after «Plain public fields — these are the Storybook control surface.».
   Here seven boolean inputs failed `check-boolean-inputs`. The comment at
   `tools/check-boolean-inputs.mjs:33` says the stories lie outside `src/lib`; they do not.
3. **The showcase frames have one road** — tree, `task-delivery-loop-run`, section «5–6»: only
   `node tools/visual-gate.mjs ui-kit-v2`, the whole set, about eight minutes; a path sample is read
   only after `--update`. A pointed match without `--update` is a code task.
4. **The own showcase and stand are stopped before the run ahead** — tree,
   `task-delivery-loop-run`, section «11–12». Here the admin end-to-end suite went red under the
   showcase's load and was green alone and on rerun.
5. **The pinned Chrome gave a network error for the local showcase while `curl` got 200** —
   companion of `browser-verification`. The live check went through the desktop browser pane; two
   reviewers met the same. Whether the pane is a lawful way in is the owner's decision.

Not proposed: the refused progress edit after compaction — GUARDS.md already names it; the tool
taking a component by the text `@Component\s*\(` — a quirk of version 0.3.0, written into the
archive record of RT-3483.

## RT-3525 — the review of 23 November 2026

Loaded: `task-delivery-loop`, `task-flow` with its parts, `doc-style`, `git-workflow` with its
parts, `testing`, `kit-approval`, `epic-flow`. No edit of the gate map is needed.

1. **A task of an epic answers for the kit files its epic branch carries** — a code task:
   `tools/check-kit-approval.mjs:answerersOf` counts the merge of the epic branch into a task branch
   as the branch's own work, so a tool-only task needs the no-look line; RT-3514, RT-3518, RT-3525
   and RT-3526 hit it. Until then — tree, `kit-approval`, «How the law applies here», and
   `task-delivery-loop`, step 4: the no-look question goes with the plan when the epic branch
   carries kit files.
2. **The base of a chain is read again before the PR opens** — package, the pitfalls of the pattern `git-workflow-pr`:
   the host keeps a merged branch, so `git ls-remote` does not show that the base merged; ask
   `gh pr list --head <base> --state merged`. Tree, `task-delivery-loop-run` «11–12», the same call.
   Here the previous branch's PR merged meanwhile, and the first `gh pr create` named it.
3. **The merge of the base is signed by the machine account** — tree, `task-delivery-loop-run`
   «11–12»: its ready merge line has no identity, while `git-workflow-merge` pitfalls require it. A
   re-signing amend goes by a call of its own: the push guard judges the commits before the amend.
4. **The PR opens after the push has answered** — tree, `task-delivery-loop-run` «13»: two calls of
   one message run at once, and a refused push left the PR on a head the host did not have.

Not proposed: a test file edited by a script — `testing` names it, a miss of carrying out; mutants
that survived the first suite — the review rounds caught them, as they exist to.
