# Binding — the run ahead and its copy

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **An edit left in the copy ends the run after the step it was seen after.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:changed_at`, the paths by `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_mark_dirt`; scenario `SC-AK-1980`
- **A run every green step of which holds its mark on the head is green; any other is not judged.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:unmarked`; scenario `SC-AK-1981`
- **A run that is not judged ends with a code of its own and is never called green.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:not_judged`; scenarios `SC-AK-1980`, `SC-AK-1981`
- **A red check outweighs a changed copy.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:red_count`; scenario `SC-AK-1980`
- **An edit made and put back inside one step is not seen.** — **Not checked by anything.** The copy is looked at by `rt_push_mark_clean` after each step.
- **A stopped run ends the tree of its step and keeps the marks of the steps before.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:rt_ahead_stop`; scenario `SC-AK-1983`
- **A stopped step gets `INT`, then `TERM`, then `KILL`.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:rt_ahead_stop`, the processes by `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:rt_ahead_tree`; scenario `SC-AK-1983`
- **A step reads an empty input, and what it left in the background is waited for.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:step_out`; scenarios `SC-AK-1980`, `SC-AK-1982`
