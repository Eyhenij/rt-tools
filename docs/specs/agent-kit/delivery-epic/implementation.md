# The epic in the delivery guards — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

- **The base of a new task branch is judged against the branch of its epic, not against the main branch.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_base` — scenario SC-AK-993
- **The freshness of the main branch moves to the branch of the epic together with the base.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_base` — the tip is asked of the base too. A merge that has not reached the remote yet answers by the base. Scenario SC-AK-1164
- **The branch of an epic is looked for among the remote refs, and neither absence nor a second one is guessed at.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_branch`
- **The epic of a task is declared by one shape, and it is read in one place.** — `projects/agent-kit/assets/checks/board-epic-link.github.mjs:declaredEpicOf` — scenario SC-AK-991
- **The declaration opens its line, and the same words inside a sentence are not one.** — `projects/agent-kit/assets/checks/board-epic-link.github.mjs:DECLARATION` — the expression is anchored to the start of a line; scenario SC-AK-991
- **The state of a task carries the number of its epic.** — `projects/agent-kit/assets/checks/board.github.mjs:taskState` — scenario SC-AK-992
- **The base of a request about a task of an epic is the branch of that epic.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base` — scenario SC-AK-994
- **The freshness asked before a request of such a task is the epic's, not the main branch's.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base`
- **The request of an epic opens when the folders of all its tasks are taken apart.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull` — scenario SC-AK-995
- **An epic is recognised by the label of its card, not by the shape of the branch name.** — `projects/agent-kit/assets/defaults/project.sh:RT_BOARD_EPIC_LABEL`
