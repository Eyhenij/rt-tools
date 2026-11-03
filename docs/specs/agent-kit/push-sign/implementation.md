# The binding — what the push gate counts as a push

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A push is the subcommand `push` of the same `git` call.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:push_calls` — scenario SC-AK-1237
- **The command is parsed as the shell reads it, not by patterns over the line.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:push_calls` — the perl parse inside the guard; scenario SC-AK-1237
- **A push in the body or the condition of a loop is several pushes; a push after it is one.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:looped` — scenario SC-AK-1238
- **A dry run of one call does not cover a real push next to it.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:pushes` — only calls marked real are counted; scenario SC-AK-1237
- **Several recipients in one push are several pushes.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:several_refs` — scenario SC-AK-1238
- **A push typed into the session terminal tab is judged like a shell call.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:tool` — scenario SC-AK-1239
