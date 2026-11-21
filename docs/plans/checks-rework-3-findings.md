# Findings of the epic RT-3302 — the checks of the rules package stop work, part three

The findings accumulate here while the epic goes: the owner reads them at once when the epic is
over and says which of them are right. The file lies next to the plan of the epic,
`docs/plans/checks-rework-3.md`.

## RT-3329 — the task flow as an executable scenario

- **The guard of the course of work judges the marks of the progress, not the order of the work.**
  An edit of a file of a later stage passes while an earlier step is open; only a step marked done
  without the mark of the engine is refused. The role `goal-critic` read the owner's words «шёл
  исключительно по шагам» as an order on the edits themselves. **Address:** rules layer — the
  guard compares the path of an edit with the footprint of the current step, or the rule names the
  narrower reading.
- **The count of refusals in a row is one file for every copy of the tree.** `refusals-in-row` lies
  in the common directory of git, so two sessions in two worktrees add to one series, and the
  eighth refusal is written for a series no session had. **Address:** rules layer — the counter is
  kept per session.
- **The journal holds 112 lines of the eighth refusal in a row for 15.11.** Whether the client ends
  a turn by itself after eight continuations is not checked; if it does, those turns ended with
  open work, and the count of missed stops does not see them. **Address:** rules layer — the count
  of missed stops reads an end after a run of stop feedback as missed.
- **The count of missed stops had one stop in its window.** `owner-nudges.mjs --missed --last 200`
  answered `0 of 1` at the minute of the step; over 2000 calls it answered `1 of 16`. A window
  bounded by calls says little when a turn runs long. **Address:** rules layer — the window is
  bounded by the number of stops.
- **The guard of the course of work reads the approved plan from disk only.** After the task folder
  was taken apart, an edit of the engine was refused, and the archive commit had to be undone with
  `reset --soft`. `flow-step.mjs` already reads the plan from the commit that added it.
  **Address:** rules layer — `flow-guard.mjs:judgeProtected` reads the plan from history, and the
  pattern `task-flow-archive` says so in its misses.
- **Exit 11 takes the first unmerged row of the epic plan as the next task.** A row above the task
  of the branch, led by another copy with a branch of its own, met the exit; right after PR #3351
  the engine named state 13 «open the PR of the epic» while tasks 3–9 were ahead. **Address:**
  rules layer — `measure/epic.mjs:nextTaken` looks below the row of the branch, a scenario in
  `flow-script/exit/`, the article of `epic-flow` about the next task.
- **The task key is written into the package code.** `measure/epic.mjs` builds the branch prefix as
  `RT-<n>-`, and `RT-N` stands in `measure/session.mjs` and `checks/flow-verdict.mjs`; in a tree with
  another key exits 11–13 are never met. **Address:** rules layer — the key comes from the branch or
  the settings of the tree.
- **A hook and its state belong to the copy of the session.** The Stop hook measured the main
  checkout and held two sessions of other copies (fixed in RT-3329). **Address:** names of this
  tree — a pitfall of `agent-kit-source`: the root is the `cwd` of the hook input, and a new hook is
  tried from a second worktree before it is laid out.
- **A plan check over a spec directory missed its subdomains, and a check looked for a subagent's
  report in the tool result.** Steps 4.5, 6.5, 3.15 and 3.16 passed only by replacements quoting the
  owner. **Address:** rules layer — two misses of the pattern `task-flow-start`: a check over a spec
  directory uses `grep -r`, and a subagent's report is read from the session record or a file.

## RT-3271

- **The work queue audit falls whole on the comparison with the last rollout.** When production lags
  the main branch far, the host answers the compare with HTTP 422 «diff is taking too long», and
  `check-board.mjs` exits with a stack instead of a line; the checks before it already printed.
  **Address:** rules layer — `deployLag` turns a 422 into a report line about the lag it cannot count.
- **A step check expecting «= 0» from `grep -c` never matches.** `grep -c` exits 1 on zero matches,
  and the number form demands code 0; four steps of RT-3271 passed only by replacements. **Address:**
  rules layer — the plan template names `|| true` for a count that must reach zero, or `plan-check`
  refuses such a check.
- **The window of the end-of-epic guard is journaled under `guard=`, and nothing reads it.** The
  metrics report and the cargo take only `res=`, so the label `guard-ask` reaches neither.
  **Address:** rules layer — `epic-stop-guard.sh` writes `res=`, or the report learns `guard-ask`.
- **The window is opened only on the forms the guard parses.** `env A=1 …`, `time …`, a subshell,
  `if … then`, `bash -c "…"`, `git worktree add -b` and `git branch RT-N-…` pass without it; the
  first four were caught by the substring search the guard had before. **Address:** rules layer —
  `epic-stop-guard.sh:heads` strips these wrappers, and scenarios cover each form.
- **A deny of the tree assignment guard overrides the window.** After the epic is over, a task of a
  new epic is refused by `tree-assignment-guard.sh` while the row of the copy names the old epic.
  **Address:** names of this tree — the assignment guard asks instead of refusing on a closed epic.
- **The kit release and a PR opened in the browser get no window with the approval quotes.**
  **Address:** names of this tree — `kit-approval-guard.sh` asks on `--publish` too.
- **Two judges still read the owner's answers from the session record.** `ask-judge.md` and
  `turn-judge.md` were not touched by RT-3271. **Address:** rules layer — a task of this epic.

## RT-3275 — the decision table of the package hooks

- **The engine measures a wrong state from a subdirectory of the tree.** Called inside
  `projects/agent-kit/tests`, `measure` answers `эпик-заведён (2 of 13)`, from the root `этап-идёт`;
  the turn exit guard hands it the cwd of the hook input and names the epic branch as the next move.
  **Address:** rules layer — the engine resolves the root by `git rev-parse --show-toplevel`.
- **The plan check accepts an expected result `` `/…/` `` in backticks.** The engine reads it by the
  form `line`, and five steps of the plan could never match a right output. **Address:** rules
  layer — the plan check refuses a `line` form whose text is itself a `/…/` pattern.
- **The number form does not trim leading spaces.** `wc -l` on macOS prints `       1`, and `= 1`
  does not match. **Address:** rules layer — the engine trims the last line on both sides.
- **A replacement of a step check counts only a typed message of the owner.** A menu answer does not
  count, and neither does a message sent while the turn goes: it lies in the record as an attachment
  `queued_command`, which the owner source does not read. Each such permission cost the owner two
  extra moves. **Address:** rules layer — the owner source reads `queued_command` and menu answers.
- **The turn exit guard holds a turn on a step that waits for the owner's typed word.** The engine
  has no state «the step waits for the owner», and the refusal names a move impossible in that
  state. **Address:** rules layer — a row of the area «turn» in the decision table and a release
  case in the engine.
- **The model has one fact `rule_loaded`, while the rules gate and the handover entry read different
  sources.** The gate reads its marks file, the handover entry reads the record of the conversation,
  and the rule of a move may differ from the one the entry waits for. **Address:** rules layer — the
  table splits the fact in RT-3355.
- **The work queue audit falls whole when the host cannot compare the last rollout with main.**
  `tools/board-runs.mjs:deployLag` calls the compare API, the host answers HTTP 422 «this diff is
  taking too long to generate», and `npm run check:board` stops with a stack before the lines about
  task folders. **Address:** names of this tree — the lag is counted fail-open, as other host calls.
- **A refusal of a composing hook now asks up to eight neighbours, to the depth of three.** The
  conform mode runs about 4 min in parallel over 999 rows. **Address:** rules layer — RT-3355
  reads the decision from the table instead of asking the neighbours.
- **The conform mode checks a row against its hook, not a refusal against the rows.** Past the stop
  threshold of the window the exam named a call the window refuses, and no row said so: the roles
  found it by running the hooks. **Address:** rules layer — a reverse probe in RT-3355: the named move
  of each refusal is asked of the decider for every hook that judges it; the mutation sweep proves
  that each hook answers as the decider.
- **The assignment check went silent under the task runner.** The runner sets `FORCE_COLOR`, and
  `tree-assignment.mjs --assigned` printed the epic number with colour codes; the queue was asked
  about no epic, and a closed assignment passed. Only the push set, run by the runner, showed it.
  Fixed in RT-3275: the number is printed as a string. **Address:** rules layer — a check that
  prints a value for a shell caller prints a string, and its suite runs once with `FORCE_COLOR`.
- **The two hooks of git refuse and are marked as helpers.** `pre-push.sh` and `commit-msg.sh` exit
  with a refusal the table does not describe. **Address:** the owner's word — whether they enter the
  table.

## RT-3355 — the package hooks take the decision from the table

- **`plan-red` did not find the record of the session that ran it.** The owner's approval stood in
  the record, and the command answered «no menu answer «Одобряю …»» until `RT_FLOW_TRANSCRIPT`
  named the file. **Address:** rules layer — `plan-red` takes the record from the session id the
  way the hooks do, or its refusal names the variable.
- **A check of a plan that measures the tree is green before the work.** Five steps of the first
  approved plan matched at once (`--coverage`, the spec check, the layout, the suites); the engine
  refused the approval mark, and the plan went to the owner twice. **Address:** rules layer — the
  plan template says that a check names what the work adds, with an example.
- **The texts of the hooks are built from variables, so the table cannot hold them as written.**
  Of 118 distinct refusal patterns 67 are found literally in the hook sources. **Address:** this
  task — the rows hold slots the hooks fill.
- **The stop guard measured `эпик-заведён` while the suites loaded the machine.** Three times in one
  session; a measure right after gave `этап-идёт`. **Address:** rules layer — the engine measures
  the state with a time limit of its own and names a measure cut by the limit apart.
- **The words of a delivery miss and its move are still written in bash.** The decision comes from
  the table, and the mutation sweep proves it; but 343 of 673 refusal rows carry a slot the hook
  fills, and the 37 `unmet` calls of the delivery hooks hold the words of the miss with its move.
  Neither the sweep nor the reverse probe sees a move in those words that differs from the row.
  **Address:** a task of this epic — the words of `unmet` move into the `text` field of the rows
  by the fact key, and the hook hands only the fact and the slot values.
- **Some hooks hand a fact as a constant on the refusal path.** `commit-msg.sh`, `skill-gate.sh`,
  `epic-stop-guard.sh` and `git-guard-discard.sh` ask the decider only after their own check found
  the miss. A row that refuses on the other value of such a fact would not be read. **Address:** a
  task of this epic — the hook computes every fact its rows name, or the spec names a fact the hook
  does not compute as lawful.
- **The rules gate forgets the loaded rules after a compaction of the context.** Every rule was
  asked again after each compaction, and a refused edit in the same command cost a second call.
  **Address:** rules layer — the gate reads the loads of the session from the record, not only
  from the part of the context that survived.

## RT-3277 — the readers run on saved real data

- **The work queue audit falls on the real host.** The comparison of the deployed head with the
  main branch gets HTTP 422 «diff is taking too long to generate» in `deployLag`, and nothing
  catches it: the audit ends with a stack trace and code 1. The suite on the recorded answers names
  it. **Address:** a task of this epic — the audit names an unanswered comparison and goes on.
- **The role metrics read a table header as a verdict.** A goal-critic report of 13.11 opens with a
  table; «Достигнуто» in its header matches the pass words, and the hook counts «passed».
  **Address:** a task of this epic — the verdict is read from a line that is not a table row.
- **A message the owner sends during a turn is no word of the owner to the engine.** The record
  keeps it as an entry `attachment` of kind `queued_command` with `origin.kind: human`; `owner.mjs`
  reads only entries `user`, and the cut keeps no `attachment` entries. The owner had to send the
  permission twice. **Address:** a task of this epic — the owner source reads such an entry as a
  typed message, and the cut keeps it.
- **The owner source reads harness wrappers as the owner's words.** On the cut of 13.11 `owner.mjs`
  counts 213 typed messages, the reminder measure 123: 86 interrupt marks, command wrappers and a
  command output among them. A phrase in a command output would count as the owner's consent.
  **Address:** a task of this epic — the owner source recognises these wrappers; the case SC-AK-1607
  then expects 123.
- **A check of a plan written as a pattern in backquotes never matches.** The engine tries the
  line form first and compares a backquoted pattern as a line. Two steps of this plan stood red on
  a right output. **Address:** rules layer — the plan check refuses a backquoted pattern when the
  plan is written, or the engine reads `/…/` inside backquotes as a pattern.
- **`grep -c` as a step check is red exactly on the clean answer.** It exits 1 on zero matches, and
  the engine reads the exit before the line. **Address:** rules layer — the pattern of writing a
  plan names `wc -l` for a count that should be zero.
- **A menu answer is no word of the owner for a replacement line.** Only a typed message counts,
  and a quote with «(Recommended)» never matches. A question that only asks the owner to type a
  phrase is refused by the question judge as a bypass. **Address:** rules layer — the replacement
  line accepts the menu answer of a question that named the step and the new check.
- **The step guard measured the state wrongly from a subdirectory.** An edit of the progress was
  refused as «ahead» while the shell stood under `projects/`. **Address:** rules layer — the engine
  takes the tree root from the record, not from the working directory.
- **The two findings on the owner source are taken by RT-3270.** Its first stage reads
  `queued_command` as a typed message and drops the harness wrappers, by the owner's answer
  «Починить в RT-3270 (Recommended)».

### The rules review of RT-3277

The review role brought six wordings; they wait for the owner at the end of the epic.

- **The plan sample names neither the bare pattern nor the zero count.** Address: package, the plan
  sample of the task template after the expected-output forms. A pattern stands bare between
  slashes, a count of what must be absent goes through `wc -l`, the trial run prints the exit code.
- **The replacement line of a step check is named by no rule.** Its form lives only in the engine
  and in SC-AK-1413. Address: package, the pattern `task-flow-resume` after «A stage revision».
- **Three pitfalls of the package suites.** Saved real data are searched for people before the
  first commit. A suite pins its environment: colour, home directory, no machine token. A coverage
  check matches a name whole. Address: this tree, the rule `agent-kit-source`.
- **The edit tool drops a space at the end of the replacement.** Address: package, the cold part
  of `doc-style`.
- **Untracking a directory from the index takes the neighbours' files too.** Address: package, the
  pattern `git-workflow-commit`. The same section names the path of one machine to the hosting
  client three times; that is a separate task.
- **Guards read a reading command as an edit.** A redirect after a hook path, a laid-out script name
  or a plan path among git arguments is refused. The review itself got two such refusals on reading
  commands. Address: package, the cold part of `agent-kit`, and a task of this epic for the guard.

## RT-3270 — the metrics of the work result

`goal-critic` judged the goal partly met, `product-strategist` judged the point not reached: the
report prints «RT-3227 не выпущен», «отказов 35 из 187», «переспросили 3», the screen shows them only
on the stand seed. Their misses, each with an address:

- **The live screen is not compared with the report.** The receiver is rolled out from the main
  branch only, so the screen of 13.11 is seen after the epic is merged. **Address:** this epic — a
  closing step after the merge: the owner rolls the receiver out, the executor sends the recounted
  days from 27.10, the screen of 13.11 is compared with `metrics --day 2026-11-13`.
- **The screen test checks the seed, not what the package sends.** The stand seed of 13.11 holds
  187 calls and 2.4 h idle; the report of the package gives 3001 and 6.8 h. Only the window line
  35/187/3 matches, and it is written by hand too. **Address:** a task of this epic — the stand
  receives the day line and the windows the package builds from the saved record of 13.11.
- **The verdicts «цель не достигнута» are not split by task.** The report prints «без задачи: 2»,
  the receiver keeps one number `goalNotMet`. **Address:** a task of this epic — the verdict carries
  the task branch, the day line carries the split.
- **Two counts of refusals for one day.** The result block prints «489 из 3001», the old block
  «отказы проверок: 98»; 3.20 of 16.29 per hundred are `unnamed`. **Address:** a task of this epic —
  one count, and every refusal names its check.
- **Dead ends 27 in the report against 20 in the suite of the real record.** Hypothesis: 27 counts
  every session of every copy, 20 only the slice. **Address:** a task of this epic, together with
  the item above.
- **Interruptions may be overstated.** 100 against 243 words of the owner; the count takes every
  `[Request interrupted` line, the refused tool call included. **Address:** a task of this epic —
  checked on the record of 13.11 before an edit.
- **«Принято с первого раза: 0 из 0» with eight merged tasks, and «Повторы ошибок» outside the
  report.** The line «нет данных: Экзамены с первого раза» stays in the head of the day report.
  **Address:** a task of this epic — the denominator is the merged tasks, or the line names why it
  is zero; «Повторы ошибок» needs the owner's word.

## RT-3283 — the usefulness of the push set checks

`goal-critic` judged the goal partly met, `product-strategist` judged the point partly reached: the
report names the kit snapshots (44 false of 57, 76 044 s) and the admin e2e (17 of 28, 29 846 s),
and the idle runs read «предмет не записан» in all 84 lines. Their misses, each with an address:

- **No idle run is counted on real data yet.** The marks of this machine were written before the
  work; the owner's own example, the hook scenarios on branches that never touched them, shows only
  after one push with the seven-field line. **Address:** the remaining step of the PR — read
  `metrics --days 7` on 25.11.2026.
- **The lint, types, tests and build of `nx affected` had no subject.** Closed in the same branch:
  the profile declares the project roots and the root settings for that step.
- **The e2e, the snapshots and the images take the whole tree as their subject, so they never run
  idle.** The set prints them only for a branch that touched their subject, and the report cannot
  judge them finer. **Address:** a task of this epic — the subject by the roots of the affected
  projects.
- **31 of 84 lines are named by a checksum.** Three of the seven falsely refusing candidates are
  among them, and the owner cannot act on a number. **Address:** a task of this epic — a short step
  name in the run line, or one summary line for the commands outside the set.
- **The list «ни разу не отказали по делу» holds 49 lines, a check of two seconds among them.**
  **Address:** a task of this epic — a threshold of seconds, the rest as a count.
- **The milestone of the epic is not moved by this task, and its sign does not read now.** The
  report prints «результат работы: подсчёт оборвался». **Address:** a task of this epic, together
  with the items of RT-3270 above.

### The rules review of RT-3283

`skill-curator` brought five findings; each waits for the owner's word.

- **A value a laid-out hook computes is asked of the hook, not recomputed in the package code.**
  The report first counted `rt_check_id` as its own checksum in TypeScript; only `no-bitwise`
  stopped it. The article of `testing` about the declaring side is read on test paths, not where
  the copy is written. **Address:** this tree — the pitfalls of `agent-kit-source`.
- **A number the work's own tool will compute does not enter a sign or a scenario from a hand
  count.** The plan wrote 45/58 and 19/30, the report gave 44/57 and 17/28, and SC-AK-1666 was
  rewritten at the merge. **Address:** the package — the pitfalls of `task-flow`; the file is at
  its character limit, two repeated entries about the layout header in a template copy make room.
- **A linter that crashes at its own start is reported as a finding about every edited file.** After
  a restart the hooks ran on node 20 against `engines.node >=22.22.3`, and the ESLint stack came
  back on every edit. **Address:** the package — `lint-after-edit.sh` treats an output that names
  no line of the file as a broken run, once per session with both versions.
- **After a merge of the base, the reads table of the push set is verified.** Fixtures from the
  merged task were not in the table, and the set turned red after a whole run. **Address:** the
  package — `git-workflow-merge`, the checks after the resolution.
- **Every decision of the grill becomes a step, like every rule of the agreement.** The grill named
  the project roots as the subject of `nx affected`, no step wrote it, and `goal-critic` found it
  after the work. **Address:** the package — the article of `task-flow` and its companion line.

## RT-3326 — the rules gate gives the rule

`goal-critic` judged the goal partly met, `product-strategist` judged the point of the task reached
and the milestone not moved yet. The gate delivers every rule under the host limit, and the seven
named rules fit without losing text. Their misses, each with an address:

- **Rules outside the seven still refuse.** `agent-kit`, `testing`, `rt-tools-storybook`,
  `reuse-first`, `deploy-flow` and `rt-tools-styling` are longer than the limit, about 14% of the
  former refusals. `spec-driven` with `agent-kit-source`, and `angular-patterns` with
  `typescript-conventions`, fit apart and not together. **Address:** RT-3392 in this epic.
- **The week report cannot read the done-sign of the task.** `agent-kit metrics` counts the gate
  refusals by the rule name: it reads neither `why` nor `gate-deliver`. **Address:** RT-3392; until
  then the sign is read by a command over the observations, named in the PR.
- **A PR command lost the branch part of the delivery rule at the split.** The PR of an epic, the
  branch without a number and the merge order of a chain stand there. Closed in the same branch:
  the map gives the PR commands the hosting part with the branch part.
- **A draft of an agreement and the epic plan get only the states part of `task-flow`.** A
  hypothesis of `goal-critic`, not checked: whether the articles of the plan part are missed there.
  **Address:** a retelling on a case of that edit, in RT-3392.
- **24 patterns were shortened, though the gate never refused a pattern.** The checks of the
  stages named the rule directories with their patterns. A pattern loaded by `Skill` now gives an
  index and its cold part is read apart. **Address:** a count in the observations, after a week —
  a `skill-load` of a pattern followed by a read of its `pitfalls.md`.

## RT-3332 — the marks are measured again, not believed

- **`plan-red` cannot approve a plan whose commit changed after the work began.** The plan of the
  task was added again by a rebuilt commit after the owner's approval, and `plan-red` was not run on
  the new commit. Its checks were green by then, and the old mark named the replaced commit. The
  mark was written by running the current engine on the tree of the plan commit in a temporary
  working copy, the branch pointed there for the run. **Address:** rules layer — `plan-red` measures
  the checks on the tree of the plan commit itself, so «red before the work» never depends on when
  it runs.

## Left unresolved

- **A session that wrote nothing releases the turn, and so do the silent hosting and a lost menu.**
  The role `goal-critic` judged these releases against «любые остановки должны быть исключены».
  They are the cases 2–5 and 8 of the approved plan of RT-3329; changing them needs the owner's
  word.
- **The own branch of RT-3329 stands in `words.legacyBranches`.** Its plan was approved before the
  engine existed; the branch leaves the list when the epic is merged.
