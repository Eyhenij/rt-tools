# Grill

## The owner request

> RT-3098 (Рекомендуется)

The owner picked it from three described tasks; the other options were RT-3088 (measure the domain
spec before the merge of an agreement) and RT-3084 (one icon input in the second kit). The task
body: the push set runs the guard scenarios from the file `RT_HOOKS_TESTS`; with no such file the
line drops out of the set in silence, and a push that edits guards runs not one scenario.

## What is already in the tree

- The set is `rt_push_checks_default` in `projects/agent-kit/assets/defaults/project.sh`; the line
  is `[ -x "$root/$RT_HOOKS_TESTS" ] && printf …`, the default path `.claude/hooks/tests/run.sh`.
  This tree has no such file either: its guard suites run by `nx affected -t test-hooks`, a line of
  its own set.
- The function takes the base as `$1`; with a base the set is counted against it, without one the
  whole tree is checked.
- The subdomain that says how the set picks its steps by what the branch touched is
  `docs/specs/agent-kit/push-gate-ahead/`; its scenario file has room (48 lines), while the
  delivery gate's is at 499.

## Questions and answers

The owner took the recommended answer twice in a row («RT-3097 (Рекомендуется)», then
«RT-3098 (Рекомендуется)»), so the six questions are closed by assumption:

- **Does the task change the behaviour** — yes, of the push set in the package; no application
  code.
- **Does it need an edit of a law or a rule** — no: the subdomain spec gains one rule.
- **One task or several** — one.
- **What is not part of the task** — creating a run file for the trees that lack one, and how this
  tree runs its guard suites.
- **What shows the task is closed** — a scenario: a push against a base that edits the guards, with
  no run file, gets a line naming the missing file; a push without guard edits gets nothing new; the
  defaults suite is green.
- **The sample** — the neighbouring lines of the same function, which add a step only where its
  file is present.

## Decisions

- **The line names the gap and does not refuse the push.** A tree that installs the package gets
  its guards by the layout, and every upgrade edits them: a refusal would stop every upgrade push
  in a tree that never had a run file. The task asks for a printed line, and the set prints it as a
  step that passes.
- **The guards are matched by the directory the tree's own hooks live in, `.claude/hooks/`.**
  Without a base nothing is counted: there is no contribution to compare.
