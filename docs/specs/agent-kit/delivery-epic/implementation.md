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
- **The draft of the epic plan goes to the host from a temporary clone.** — `projects/agent-kit/assets/checks/task-new-epic.github.mjs:send` — scenario SC-AK-1936
- **The base of a request about a task of an epic is the branch of that epic.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base` — scenario SC-AK-994
- **A chain base is lawful while its history carries the epic branch.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:_chain` — the remote ref of the base must have the remote epic branch as an ancestor; the audit takes the same base by the task number, `projects/agent-kit/assets/checks/board-epics.github.mjs:baseTask`. Scenario SC-AK-1203
- **A miss of the call itself is refused in an epic and outside it.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:unmet_class` — the rows of these classes in `projects/agent-kit/assets/checks/decision-table.json:pr_create_bad_title` do not ask whether the task is in an epic; scenario SC-AK-1937
- **The freshness asked before a request of such a task is the epic's, not the main branch's.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base`
- **The request of an epic opens when the folders of all its tasks are taken apart.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull` — scenario SC-AK-995
- **A draft is refused on a base the pipeline does not wake for.** — `projects/agent-kit/assets/hooks/git-guard-delivery-pipeline.sh:rt_delivery_pull_draft` — the bases are read by `projects/agent-kit/assets/hooks/git-guard-delivery-pipeline.sh:rt_pipeline_pull_bases`; scenarios SC-AK-1256, SC-AK-1257, SC-AK-1258
- **A merged epic is not demanded as the base of a task branch.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_is_merged` — a merge commit of the remote main branch names the epic by key and number; scenario SC-AK-1226
- **The task whose grill gave one task is created outside an epic by the count the grill names.** — `projects/agent-kit/assets/checks/task-new-single.github.mjs:singleFault` — called by `projects/agent-kit/assets/checks/task-new.github.mjs:single`; the count is `projects/agent-kit/assets/task-flow/measure/text.mjs:tasksOfGrill`. Scenarios SC-AK-1988, SC-AK-1989
- **The refusals of `--single` go in one order, and the count stands before the epic.** — `projects/agent-kit/assets/checks/task-new-single.github.mjs:grillFault`, then `projects/agent-kit/assets/checks/task-new-single.github.mjs:liveCopyEpic`; scenario SC-AK-1988
- **A card that already stands gets the same line by a call of its own.** — `projects/agent-kit/assets/checks/task-new-single.github.mjs:writeLine` — scenario SC-AK-1990
- **The line of work outside an epic is read on its own place and in one place.** — `projects/agent-kit/assets/checks/board-epic-link.github.mjs:outsideReasonOf` — scenarios SC-AK-1986, SC-AK-1988
- **The branch of the only task of a grill grows from the main branch, with no commit of another task under it.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_single_base` — the sign is the field `single` of the state of the task; scenario SC-AK-1991
- **An epic is recognised by the label of its card, not by the shape of the branch name.** — `projects/agent-kit/assets/defaults/project.sh:RT_BOARD_EPIC_LABEL`
