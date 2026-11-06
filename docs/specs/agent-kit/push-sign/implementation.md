# The binding — what the push gate counts as a push

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A push is the subcommand `push` of the same `git` call.** — `projects/agent-kit/assets/hooks/push-sign.sh:words` — the subcommand is read after `git` and its keys; scenario SC-AK-1237
- **The command is parsed as the shell reads it, not by patterns over the line.** — `projects/agent-kit/assets/hooks/push-sign.sh:tokenize` — the reader of shell words; scenario SC-AK-1237
- **A command the parse cannot read is refused when its text names a push.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:opaque` — the parse gives the line `opaque`; scenario SC-AK-1237
- **A wrapper is passed together with its keys and their values.** — `projects/agent-kit/assets/hooks/push-sign.sh:wrap` — the list of wrappers and of their keys that take a value; scenario SC-AK-1237
- **A function body is judged at the call, not at the definition.** — `projects/agent-kit/assets/hooks/push-sign.sh:body_end` — the body is kept by its name and parsed when the name is called; scenario SC-AK-1237
- **A branch switch is found by the same parse as the push.** — `projects/agent-kit/assets/hooks/push-sign.sh:tip` — the start point of a new branch and the paths after a tree word decide whether the tree changes; scenario SC-AK-405
- **A push in the body or the condition of a loop is several pushes; a push after it is one.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:looped` — scenario SC-AK-1238
- **A dry run of one call does not cover a real push next to it.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:pushes` — only calls marked real are counted; scenario SC-AK-1237
- **Several recipients in one push are several pushes.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:several_refs` — scenario SC-AK-1238
- **A push typed into the session terminal tab is judged like a shell call.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:tool` — scenario SC-AK-1239
