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

## Left unresolved

- **The commit hook does not check the pipeline files.** `lint-staged` in `package.json` does not
  read `.github/**`; a line `".github/**/*.yml": "prettier --check"` would refuse the broken file by
  machine — waits for RT-3493 to decide whether it goes with the text.
