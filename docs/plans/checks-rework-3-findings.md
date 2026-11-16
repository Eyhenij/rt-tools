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
  conform mode runs about 4 min in parallel over 1007 rows. **Address:** rules layer — RT-3355
  reads the decision from the table instead of asking the neighbours.
- **The conform mode checks a row against its hook, not a refusal against the rows.** Past the stop
  threshold of the window the exam named a call the window refuses, and no row said so: the roles
  found it by running the hooks. **Address:** rules layer — a reverse probe in RT-3355: the hook of
  the named move is run in the state of each refusal.
- **The two hooks of git refuse and are marked as helpers.** `pre-push.sh` and `commit-msg.sh` exit
  with a refusal the table does not describe. **Address:** the owner's word — whether they enter the
  table.

## Left unresolved

- **A session that wrote nothing releases the turn, and so do the silent hosting and a lost menu.**
  The role `goal-critic` judged these releases against «любые остановки должны быть исключены».
  They are the cases 2–5 and 8 of the approved plan of RT-3329; changing them needs the owner's
  word.
- **The own branch of RT-3329 stands in `words.legacyBranches`.** Its plan was approved before the
  engine existed; the branch leaves the list when the epic is merged.
