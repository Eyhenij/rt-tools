# task-delivery-loop — where it is carried out

The names and bindings of this tree next to the rule `SKILL.md`.

## Where it lives

- **the demand to load the loop** — `.claude/rt-kit/gate-map.sh:skill_for` — an edit of a task folder and the delivery commands
- **the section in the course of a task** — `.claude/rt-kit/overrides/rules/task-flow.md` — laid out into the rule `task-flow`
- **the review roles** — `.claude/agents/qa-engineer.md`, `.claude/agents/product-strategist.md`, `.claude/agents/goal-critic.md`, `.claude/agents/skill-curator.md`
- **the review lenses** — `.claude/workflows/feature.js:LENSES`
- **the push set** — `.claude/rt-kit/project.sh:rt_push_checks`, run ahead by `.claude/hooks/git-guard-push-ahead.sh`
- **the epic table** — `tools/epic-table.mjs`
- **the stands** — the showcase by `pnpm run storybook:ui-kit-v2`, the receiver and the admin panel by `pnpm run serve:stand`

## Where the articles are carried out

- **The skill is loaded as the first action of work on a task.** — `.claude/rt-kit/gate-map.sh:skill_for` — an edit of a task folder or an epic plan and the commands `task:new`, `checkout -b`, `switch -c`, `worktree add -b`, `git branch <name>`, `push` and `gh pr create` (and its alias `new`) demand the skill on top of the default rules; the cases are `tools/tests/gate-map-loop.test.sh`. The call through the variable `$GH` is read too; the delivery guards do not read it, so the pattern types the call in full.
- **The loop has no exceptions.** — `.claude/rt-kit/gate-map.sh:skill_for` — the branch judges the path and the command, not the kind of the task.
- **Every change is checked live before the first review round.** — **Not checked by anything.** The numbers in the progress are the only trace.
- **Every change passes two review rounds before the push.** — **Not checked by anything.** No guard counts the rounds; the commits named by the rounds and the PR body show them.
- **A finding is checked against the code before it is fixed.** — **Not checked by anything.** A written-off finding stays in the PR body with its reason.
- **A finding about the diff is never parked in a file.** — **Not checked by anything.** Held by this article; a finding beside the subject goes by the rule `task-flow`.
- **Unattended work keeps the loop and the night rule both.** — **Not checked by anything.** Held by this article and by the rule `autonomous-work`.
- **The fixes of a round go as one commit named by the round.** — **Not checked by anything.** The subject is checked for its form by `commitlint.config.cjs`, not for the round.
- **The push set runs once per branch, after round two.** — **Not checked by anything.** No guard counts the runs of the set; the marks of the run ahead only spare a second run of the same content.
- **No guard counts the rounds.** — **Not checked by anything.** That is the article itself: the PR body names the rounds, and the owner reads them there.
