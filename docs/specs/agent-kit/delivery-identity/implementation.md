# Binding — the identity of the call that opens a request

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A request whose author would be its own reviewer is refused.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_reviewer` — scenario SC-AK-1064
- **A request opened by a record other than the machine one passes, and the record is named aloud.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:token_login` — scenario SC-AK-1065
- **When there is nothing to learn the author by, the substitution of the machine record token is demanded.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_var` — scenario SC-AK-480
- **The refusal names the token variable and prints a ready substitution line.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_hint`
- **A tree that named no token variable gets no demand.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_var`
- **A command named by a path is recognised on a par with a bare name.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND`
- **A mention of the command name inside a string does not count as a command.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND`
- **The draft is not lifted from a request whose author is also its reviewer.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:reviewed` — the hosting creates no review request pointing at the author, so such a request arrives here with no review at all
- **A draft whose author is not the machine record is lifted, and the record is named aloud.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:pull_author` — scenario SC-AK-485
- **The refusal at lifting a request without a review names the reviewer and the request.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:reviewed`
- **Who will come by the token is asked of the hosting, it is not derived from the text of the command.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:token_login` — scenario SC-AK-842
- **The tree asks, not the package.** — `projects/agent-kit/assets/defaults/project.sh:rt_pull_token_login` — the default stays silent; the implementation of the tree is in `.claude/rt-kit/project.sh`; scenario SC-AK-842
- **An empty answer stops no work, and it is reported.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_var` — scenario SC-AK-843
- **The delivery rule says that the active record of the hosting client is picked per machine, not per tree.** — `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow` — an article next to the article about the identity of a call; scenario SC-AK-892
