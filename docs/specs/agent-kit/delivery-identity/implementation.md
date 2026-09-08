# Binding — the identity of the call that opens a request

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A request opened without the substitution of the machine record token is refused.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_var`
- **The refusal names the token variable and prints a ready substitution line.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_hint`
- **A tree that named no token variable gets no demand.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_var`
- **A command named by a path is recognised on a par with a bare name.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND`
- **A mention of the command name inside a string does not count as a command.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND`
- **The draft is not lifted from a request opened by other than the machine record.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:pull_author`
- **The refusal at lifting the draft names both records and the reopening.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:pull_author`
- **Who will come by the token is asked of the hosting, it is not derived from the text of the command.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:token_login` — scenario SC-AK-842
- **The tree asks, not the package.** — `projects/agent-kit/assets/defaults/project.sh:rt_pull_token_login` — the default stays silent; the implementation of the tree is in `.claude/rt-kit/project.sh`; scenario SC-AK-842
- **An empty answer stops no work, and it is reported.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:token_login` — scenario SC-AK-843
- **The delivery rule says that the active record of the hosting client is picked per machine, not per tree.** — `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow` — an article next to the article about the identity of a call; scenario SC-AK-892
