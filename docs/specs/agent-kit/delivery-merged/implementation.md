# The binding — the push into a branch whose PR is merged

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A push into a branch whose PR is merged and which has no open PR is refused.** — `projects/agent-kit/assets/hooks/git-guard-delivery-merged.sh:rt_delivery_merged` — scenario SC-AK-1233
- **A branch reopened by a new PR after the merge is lawful work.** — `projects/agent-kit/assets/checks/board.github.mjs:pullMerged` — an open PR gives an empty answer; scenario SC-AK-1233
- **A silent host gives no refusal.** — `projects/agent-kit/assets/hooks/git-guard-delivery-merged.sh:rt_pull_merged` — the default asks `tools/board.mjs merged`, and every failure returns non-zero; scenario SC-AK-1233
