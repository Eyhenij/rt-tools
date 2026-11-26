# task-delivery-loop — where it is carried out

The names and bindings of this tree next to the rule `SKILL.md`.

## Where it lives

- **the demand to load the loop** — `.claude/rt-kit/gate-map.sh:skill_for` — an edit of a task folder and the delivery commands
- **the section in the course of a task** — `.claude/rt-kit/overrides/rules/task-flow.md` — laid out into the rule `task-flow`
- **the review roles** — `.claude/agents/qa-engineer.md`, `.claude/agents/product-strategist.md`, `.claude/agents/goal-critic.md`, `.claude/agents/skill-curator.md`
- **the review lenses** — `.claude/workflows/feature.js:LENSES`
- **the push set** — `.claude/rt-kit/project.sh:rt_push_checks`, run ahead by `.claude/hooks/git-guard-push-ahead.sh`
- **a PR asked about before the set** — `.claude/hooks/git-guard-push-ready.sh`; this tree's guard in it is `.claude/rt-kit/project.sh:RT_PUSH_READY_HOOKS`
- **the epic table** — `tools/epic-table.mjs`
- **the review path** — `tools/review-path.mjs`, its signs in `tools/review-path-signs.mjs`, the outer shape of a file in `tools/review-path-api.mjs`
- **the stands** — the showcase by `pnpm run storybook:ui-kit-v2`, the receiver and the admin panel by `pnpm run serve:stand`

## Where the articles are carried out

- **The skill is loaded as the first action of work on a task.** — `.claude/rt-kit/gate-map.sh:skill_for` — an edit of a task folder or an epic plan and the commands `task:new`, `checkout -b`, `switch -c`, `worktree add -b`, `git branch <name>`, `push` and `gh pr create` (and its alias `new`) demand the skill on top of the default rules; the cases are `tools/tests/gate-map-loop.test.sh`. The call through the variable `$GH` is read too; the delivery guards do not read it, so the pattern types the call in full.
- **Every task goes through the loop.** — `.claude/rt-kit/gate-map.sh:skill_for` — the branch judges the path and the command, not the kind of the task.
- **The path of a change is named by the command, not by the executor.** — `tools/review-path-signs.mjs:judgeDiff` by the diff and `tools/review-path-signs.mjs:judgePlan` before the code; `.claude/rt-kit/checks.json` names the command as `planRolesCommand`, and `plan-red` asks it; the scenarios are `tools/tests/review-path.test.sh`.
- **Every change is checked live before the first review round.** — **Not checked by anything.** The numbers in the progress are the only trace.
- **Every change is read by one review round before the push.** — **Not checked by anything.** The commits named by the rounds and the PR body show them.
- **On the full path the second round is due by risk and reads the fixes of the first.** — `tools/review-path.mjs:roundTwo` — the answer; the number of serious findings is named by the executor, and nothing checks it.
- **A light plan with a full diff is refused at the push.** — `tools/review-path.mjs:check`, a step of `.claude/rt-kit/project.sh:rt_push_checks`.
- **A finding is checked against the code before it is fixed.** — **Not checked by anything.** A written-off finding stays in the PR body with its reason.
- **A finding about the diff is never parked in a file.** — **Not checked by anything.** Held by this article; a finding beside the subject goes by the rule `task-flow`.
- **Unattended work keeps the loop and the night rule both.** — **Not checked by anything.** Held by this article and by the rule `autonomous-work`.
- **The fixes of a round go as one commit named by the round.** — **Not checked by anything.** The subject is checked for its form by `commitlint.config.cjs`, not for the round.
- **The push set runs beside round two.** — **Not checked by anything.** The progress holds the times of the roles and of the set. That a run over a changed copy is not called green is `.claude/hooks/git-guard-push-ahead.sh:not_judged`; that a commit of records takes no mark of the tree's scenarios is `.claude/rt-kit/project-texts.sh:rt_push_check_unread`.
- **The set waits for the round** — **Not checked by anything.** `tools/check-kit-approval.mjs` is red until the owner's answer, `tools/review-path.mjs:check` until the commit of the round.
