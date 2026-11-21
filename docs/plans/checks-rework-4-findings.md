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

## Plans of the night of 21.11 — what the roles found beside the plans

The roles `product-strategist` and `goal-critic` read the plans of RT-3469, RT-3423, RT-3434,
RT-3425 and RT-3468. What each plan took in is written in its grill; below is what no plan takes.

- **The dispatcher of hooks has no fallback on a syntax error.** On 20.11 conflict markers in the
  laid-out `dispatch.sh` gave 199 refusals with no name; every call was refused. RT-3423 names
  them `dispatch-broken`. **Address:** a wrapper that lets the call through when the dispatcher
  cannot be parsed, with a journal line. **Metric:** refusals `dispatch-broken` a day, target 0.
- **Past days keep their refusals with no name.** The observations hold only the name, so the new
  table of names of RT-3423 does not rename 15–21.11. **Address:** `record-recount.mjs` with the
  lines of the hook replaced.
- **17 refusals of the step guard «state … ahead of the measured one» on 20–21.11.** Edits of the
  progress written before a commit the engine measures. **Address:** not sorted out yet; the
  records of 20–21.11.
- **One session counted under two numbers on 20.11.** The report counts its calls twice.
  **Address:** the session key of `work-result.mjs`.
- **The run ahead with exit code 3 says nothing alone.** The code is the number of red checks, and
  a reader takes 3 for a crash. **Address:** RT-3469 names the verdict line `push ahead:` as the
  one to read; the code stays.
- **The footprint exit passes falsely after a merged base.** `measure/footprint.mjs` counts every
  commit of `origin/main..HEAD` after the plan, the ones the base brought among them; in a chain a
  footprint row edited by a lower task counts for the upper one. The progress exit reads the same
  way. **Address:** a measure of the branch's own commits after the plan, with the scenario «the
  base edits a footprint row».
- **A refusal of a call by another check twice for one reason still gives the owner's menu.** A
  checkout of a foreign or an epic branch is refused through `forbidden`. RT-3468 leaves it; its
  card names a foreign branch too. **Address:** `measure/session.mjs:forbidden`.
- **A background run longer than 20 minutes no longer holds the menu.** On 20.11 the push set ran
  24 and 37 minutes, and the engine counted the stops idle. **Address:** `BACKGROUND_BOUND` of the
  engine against the measured length of the push set.
- **A stop word of the owner releases every turn a background task wakes after it.** The engine
  reads the owner's last word over the whole record, and a notice of a task carries no word. On
  20.11 after «стоп» at 16:37 the session was woken 7 times and made 44 calls before the owner's
  next word. Whether a stop lasts one turn is a product choice for the owner. **Address:**
  `measure/owner.mjs:saidStop` with a bound «no call of the agent after the word».

## Left unresolved

- **The commit hook does not check the pipeline files.** `lint-staged` in `package.json` does not
  read `.github/**`; a line `".github/**/*.yml": "prettier --check"` would refuse the broken file by
  machine — waits for RT-3493 to decide whether it goes with the text.
