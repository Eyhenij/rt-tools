# Findings of the epic «Четвёртая часть переделки проверок»

The findings of the rules review accumulate here, next to the epic plan `checks-rework-4.md`. A
section per task, a line per finding.

## RT-3475 — the rollout workflow got a name that says what it rolls out

The task ran outside the epic; the owner added its findings to the epic on 21.11 as RT-3493.

- **The rollout rule says the pipeline file is checked only after the push.** The plan had
  `name: Deploy message-bus: …` without quotes: a value with `: ` is no string, the host refuses the
  whole file, and a manual-only rollout loses its start. The roles on the plan caught it, the rule
  did not. `pnpm exec prettier --check <file>` refuses such a file before the commit with a
  `SyntaxError` about nested mappings. **Address:** rules layer — the article «An edit to the
  pipeline is run before the merge with a manual run.» of the cold part of `deploy-flow`; names of
  this tree — the same article in `.claude/skills/deploy-flow/implementation.md` names the parser.
- **The package sample `chore(deploy): …` teaches a scope the commit check does not know.**
  commitlint refused `rt:deploy`; the right one was `rt:message-bus`. No text says which scope a file
  outside every package takes. **Address:** rules layer — the sample and the paragraph on the subject
  in the cold part of `git-workflow-commit`, both editions; names of this tree — the line «the edit
  area (scope)» of `.claude/skills/git-workflow/implementation.md`.
- **The push set fails in a second working copy without dependencies.** The demand to install them
  stands only where a copy is created, not in the command of the push step. **Address:** names of
  this tree — the block of steps 11–12 in `.claude/skills/task-delivery-loop-run/SKILL.md`, a line
  `[ -d node_modules ] || pnpm install --frozen-lockfile` before `git fetch`.
- **The refusal of the run ahead on an untracked file says «commit first» and names no file.** A
  task folder `task:new` assembled for another branch must be moved out, never committed.
  **Address:** names of this tree — the item «The run ahead writes marks only for a clean copy.» of
  `.claude/skills/task-delivery-loop/GUARDS.md`; rules layer — the refusal text of the hook
  `git-guard-push-ahead.sh` lists the files of `git status --porcelain`.

## RT-3467 — the turn end holds a CI run without a watch and an unread red one

- **A reviewer's finding against an answer the owner already gave has no move of its own.** Round
  two changed the «стоп» behaviour before a menu, reverted it, then asked. **Address:** names of
  this tree — the article «A finding about the diff is never parked in a file.» of
  `.claude/skills/task-delivery-loop/SKILL.md`: a finding the recorded answer does not cover goes
  to a menu before any edit, the recorded answer as its first option. **Metric:** review commits
  that change and revert an answer chosen by menu, 1 here, target 0.
- **An edit of the progress demands three rules together past the host limit, and none arrives.**
  Three Edit refusals on 21.11. **Address:** names of this tree — a branch for
  `*/docs/tasks/*/progress.md` in `.claude/rt-kit/gate-map.sh` with only the default rules.
  **Metric:** `gate-deny` events with `why: together` on the loop rule, 20 over 18–21.11, target 0.
- **A pipe after a check hides its verdict line.** `git commit … 2>&1 | tail -1` kept only «husky -
  commit-msg script failed»: the cause was `subject-case` on a subject starting with «RT», not a
  missing key at the end. **Address:** names of this tree — a section «Common misses» in
  `.claude/skills/task-delivery-loop-run/SKILL.md`; the run ahead half is RT-3469.
- **An inline script that only reads a guarded path is refused as a write.** Four refusals of the
  flow-step guard and one of the host classifier on 21.11. **Address:** names of this tree — a
  section «Shell commands» in `.claude/skills/task-delivery-loop/GUARDS.md`: a read-only probe goes
  into a scratchpad script file, the progress and the plan are edited by the Edit tool.
- **The rule `turn-conduct` says the stop word releases a turn; the CI hold now holds it.**
  **Address:** rules layer — the article «Until the scenario is over a turn ends only by the
  owner's stop word or by a release case.» of `assets/rules/turn-conduct.md`; names of this tree —
  three «Not checked» bindings of `.claude/skills/turn-conduct/implementation.md` now bound to
  `tools/task-flow/measure/ci.mjs:hold`.

## RT-3469 — the run ahead started in the background ends with the code of the set

- **The exit code 3 of the run ahead means both «did not start» and «three red checks».** The
  script exits with the number of red checks, at most 100, and with 3 when the run did not start.
  A session that reads the code alone takes a red set for one that did not start. **Address:**
  rules layer — the exit codes of `assets/hooks/git-guard-push-ahead.sh`, a code for «did not
  start» above 100, and the Contract section of `docs/specs/agent-kit/push-gate-ahead/spec.md`.
- **A retry loop that exits 0 on green and 1 after the loop is refused.** The form `if set; then …;
  exit 0; fi; done; …; exit 1` ends red on red, but the guard reads only the set and its next
  command. Three calls of 17.11; the ready form passes. **Address:** rules layer — the judge of
  `assets/hooks/push-ahead-call-guard.sh`. **Metric:** refusals of the guard on calls whose last
  command is `exit N` with a nonzero N, 3 over 14–21.11, target 0.
- **A guard run by hand writes its refusals into the observations of the tree it stands in.** With
  no `CLAUDE_PROJECT_DIR` the record falls back to the working directory: review agents that fed
  the guard by hand wrote 458 `guard-deny` lines into 22.11, the day the metric of the task is judged
  by. The report of the tree does not count them, `agent-kit stats` does. **Address:** rules layer —
  `assets/hooks/decide.sh` skips the note for an agent event with no `CLAUDE_PROJECT_DIR`, and an
  article in the cold part of `agent-kit`; names of this tree — the frame of «7, 9. Review rounds» in
  `.claude/skills/task-delivery-loop-run/SKILL.md`: a hook is run only with `CLAUDE_PROJECT_DIR` set
  to a fresh directory under the scratchpad.
- **The metric of the plan named a target where the cycle pattern asks for a direction.** The plan
  wrote «не больше 0,05 на сто», the pattern `task-flow-cycle` was not loaded, and nothing demands it
  for the line `**Metric:**`. The new refusal was not run over the recorded calls before the plan: it
  refuses 244 of 462. **Address:** rules layer — a text layer for `*/docs/tasks/*/plan.md` with a
  `**Metric:**` line in `assets/hooks/skill-gate-layers.sh` that adds `task-flow-cycle`, and an
  article «A guard's metric is counted on the recorded calls before the plan.» of that pattern and
  its cold part. **Metric:** plans of a guard whose metric was not counted on the records, 1 here,
  down.
- **A guard over a shell call is judged as bash, but the host runs the call in zsh.** No rule says
  so; `exit ${PIPESTATUS[0]}` ends with 0 there, and round two rewrote the rule of the guard because
  of it. **Address:** rules layer — an article in the cold part of `agent-kit`: a form a guard
  accepts or offers in a refusal is run once in a real call before it ships.
- **A marked footprint row with a conditional path keeps the state `этапы-кончились` to the end of
  the branch.** The row «`real-hooks.test.sh`, `push-inputs.json` — if the checks demand» carried
  «(правится)»; the checks did not demand it, and `measure.footprint.touched` has no revision path.
  **Address:** rules layer — a line in `assets/samples/tasks/_template/plan.md`: a conditional path
  goes to a row without the mark, with its condition; a revision path in
  `assets/task-flow/measure/footprint.mjs` is a code task of its own.
- **`check-doc-paths.mjs` judges an ignored draft with Cyrillic in its name.** `git check-ignore`
  prints the name quoted and escaped, and the match fails; three `*-ночь.md` files of the handover
  directory are judged. **Address:** rules layer — `-c core.quotePath=false` in both git calls of
  `assets/checks/check-doc-paths.mjs` and a scenario with an ignored draft whose name is in Cyrillic.
- **`push-inputs.mjs record` with steps on stdin erases the other rows of the table.** `record()`
  starts from `steps: {}`. **Address:** rules layer — `assets/checks/push-inputs.mjs` keeps the other
  rows when steps come on stdin, and its header says so.

## RT-3423 — every refusal named, the step guard judges only a write

- **A script written by an earlier call and run with a guarded path is not judged.** `python3
  /tmp/w.py docs/tasks/<x>/progress.md` and `source /tmp/w.sh` pass: the code of the script is not in
  the call. A script written to a temporary directory by one call and run by the next passes both.
  **Address:** rules layer — the step guard reads a script file under a temporary directory named
  by the call.
- **A model check whose Read the permission mode refuses runs off, and nothing records it.** On
  16.11 the turn-end check refused 182 calls with «the read of the file is refused by the
  permissions»; by the new words such a call passes unjudged. **Address:** rules layer — a note in
  the observations when a model check lets a call through for no file or no read. **Metric:** the
  refusals of `turn-judge` and `ask-judge` that name a missing or unread file on the first day after
  the merge, by a recount of the records, 0 expected.
- **`awk` with `print >` and `sed` with `w <file>` write past the step guard.** Both are taken as
  readers; no call of 15–21.11 wrote a guarded file so. **Address:** rules layer — the readers of
  `assets/checks/flow-guard.mjs`.
- **The whole directory of epic plans is guarded, findings files included.** `sed -i` on a findings
  file next to the epic plan is refused as an edit of the epic plan. **Address:** rules layer — the
  guarded path of the epic plan in `assets/checks/flow-guard.mjs`.
- **The rules review: a step that changes what a guard refuses was checked by its own scenarios
  only.** Stage 3 was rewritten three times; the middle version refused about 108 calls falsely,
  and `rm -r docs/tasks/<x>` of every closed task was refused until round two. **Address:** rules
  layer — the article on step checks in `assets/pitfalls/task-flow.2.md`: such a step takes its
  check from `task-flow-script.mjs forecast --days 7 --guard`, bounded by the refused count of the
  version before the edit. **Metric:** guard steps that let a regression through on the recorded
  calls, 2 of 3 versions here, down.
- **The rules review: a footprint row names an engine file near the length limit, and no module can
  split off it.** `flow-guard.mjs` stands at 496 of 500 lines; three findings above lead into it.
  **Address:** rules layer — the plan template `assets/samples/tasks/_template/plan.md`: a file of
  the engine within a tenth of the limit is named in its row by its directory. The next plan on
  these findings names `projects/agent-kit/assets/checks/`.
- **The rules review: the rule of the delivery loop takes 9399 of the 10 000 characters the host
  carries.** The rules gate refused 36 calls on 19–22.11 for rules that did not fit together.
  **Address:** this tree — `.claude/skills/task-delivery-loop/SKILL.md` keeps its bold lines; the
  article bodies and the names table move into a cold `pitfalls.md`, the section on the owner's
  answer into the pattern `task-delivery-loop-run`. **Metric:** refusals of the gate for rules
  together with this one, 36, target 0.
- **The rules review: the frame of a review round names no place for probes.** Reviewers' probes
  that read a guarded file and write by a path from `argv` are refused. **Address:** this tree —
  the frame in `.claude/skills/task-delivery-loop-run/SKILL.md`: «A probe is a script file under
  <scratchpad>, given literal paths; a guarded path is only read.»
- **The rules review: archive records past their week turn the push set red by the calendar.**
  **Address:** this tree — the closing block of `task-delivery-loop-run` runs `node
  tools/archive-prune.mjs --apply` alone before the set.
- **`check-format-ignore` fell on an observation lock that vanished during its walk.** **Address:**
  this tree — `tools/check-format-ignore.mjs` skips a file gone between the directory read and its
  `stat`, or walks `git ls-files`.
- **Hooks run by hand left three stray `.claude/` directories under `projects/agent-kit/`.** The
  `.gitignore` line for observations hides them. **Address:** this tree — remove them in the next
  branch; the cause is the RT-3469 finding on the working directory without `CLAUDE_PROJECT_DIR`.

## RT-3434 — the step is measured after the folder is taken apart

- **The step guard measures the branch from the directory of the call, and a session in a
  subdirectory gets a correct state line refused.** On 22.11 the line `этап-идёт` was refused as
  «ahead of the measured one» while the shell stood in `projects/agent-kit/tests`; the same edit
  from the root passed, and `measure` from the root named `этап-идёт`. **Address:** rules layer —
  the guard of `assets/checks/flow-guard-run.mjs` measures from the root of the copy, not from the
  `cwd` of the hook input.
- **`step N.M` run from a subdirectory measures there and drops the mark of a matched step.** The
  paths of the history and the check resolve against the directory of the call, as in the guard
  above; the change of the task kept that old behaviour. **Address:** rules layer — the engine runs
  `step` from the root of the copy.
- **A dead end of the turn end carries no state, so the share of this task in the dead ends of
  `turn-exit-guard` cannot be told.** The observation of the refusal holds the task, the kind, the
  check and the session. **Address:** rules layer — a field `state` in that observation and the line
  of dead ends split by it in `assets/checks/work-result.mjs`.
- **While a step run holds a folder put back, the folder lies untracked in the working copy.** A
  `git add -A` and a commit in that window bring it back into the head with an older progress. The
  window is one check; the rerun before a PR runs inside the opening of the PR, when no commit is
  made. **Address:** rules layer — the step guard refuses a commit that adds a folder put back.
- **A live record is trusted by its process number alone.** A number reused by another process keeps
  a dead run's folder until that process ends. **Address:** rules layer — the record carries the
  start time of the process in `assets/task-flow/source/git.mjs`.

## Left unresolved

- **The commit hook does not check the pipeline files.** `lint-staged` in `package.json` does not
  read `.github/**`; a line `".github/**/*.yml": "prettier --check"` would refuse the broken file by
  machine — waits for RT-3493 to decide whether it goes with the text.
