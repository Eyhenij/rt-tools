# The binding — what the push gate counts as a push

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A push is the subcommand `push` of the same `git` call.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:push_call` — scenario SC-AK-1237
- **Several recipients in one push are several pushes.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:several_refs` — scenario SC-AK-1238
- **A push typed into the session terminal tab is judged like a shell call.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:tool` — scenario SC-AK-1239
