# The delivery guards and the push gate — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **The main branch is merged into the task branch before the PR is opened.** — `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow`
- **Opening a PR is refused while the main branch is not merged.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:behind`
- **The delivery conditions that did not come together are named by one refusal.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:deny_faults`
- **Every condition that did not come together is named together with what it is lifted by.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:fault`
- **A condition known at the start of the work is asked at the start.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:branch_arg`
- **The base named by the command is judged, not the tip of the working copy.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:base_ref`
- **The freshness of the local reference to the main branch is asked when the branch is created too.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:remote_head`
- **The task number is taken out of the branch name by the profile, not by the guard.** — `projects/agent-kit/assets/defaults/project.sh:rt_task_branch_number_default`
- **A branch without a task number gets no delivery conditions.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:branch_arg`
- **The push gate calls what the tree laid out.** — `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default`
- **The identity of the machine record is confirmed by the answer of the hosting, not by recognising a string.** — `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow`
- **The work queue demands no token of the machine record.** — `projects/agent-kit/assets/checks/board.github.mjs:botToken`
- **The commit signature and the work with the queue are different properties of the machine record.** — `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`
- **The push gate set is never narrower than the pipeline set.** — `tools/check-push-gate.mjs:pipelineSteps`
- **The completeness is held by the declared list, not by parsing the pipeline file.** — `tools/check-push-gate.mjs:pushGate`
- **An exception is declared with a reason and next to the set.** — `tools/check-push-gate.mjs:pipelineSteps`
- **A tree without a pipeline file gets no audit.** — `tools/check-push-gate.mjs:pipelineSteps`
- **The completeness check itself stands in the gate set.** — `.claude/rt-kit/project.sh:rt_push_checks`
- **Switching a branch in the same command refuses the push whole.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:checkout`
- **A heavy step of the set is picked by the composition of the edit.** — `projects/agent-kit/assets/defaults/project.sh:rt_push_docs_only_default`
- **A postponed edit does not count as a push.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:probe`
- **The verb of a command is looked for in its position, not as a substring across the whole line.** — `projects/agent-kit/assets/hooks/git-guard-main.sh:verbs` — scenario SC-AK-832
- **Creating a branch is recognised with a flag between the verb and `-b` too.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:branch_arg` — the same sample stands in the guards of the request conflict, of the push set, of waiting and in the watchman of the turn exits; scenario SC-AK-872
- **The push gate writes an observation line for every outcome of its own.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:rt_push_gate_note` — scenario SC-AK-835
- **A fallen step of the pipeline is not restarted while its journal is not read.** — `projects/agent-kit/assets/hooks/rerun-guard.sh:seen`
- **The journal of that very step counts as read.** — `projects/agent-kit/assets/hooks/rerun-guard.sh:run_id`
- **A restart without a named number of a step is not judged.** — `projects/agent-kit/assets/hooks/rerun-guard.sh:run_id`
- **The body of a request carries the section about the remaining step from the minute it is opened.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_body_section` — scenario SC-AK-685
- **The sample of the mandatory section is named by the tree, not by the package.** — `projects/agent-kit/assets/defaults/project.sh:RT_PULL_BODY_SECTION` — the default stays silent; scenario SC-AK-686
- **A body passed as a file is judged on a par with a body in the argument of the command.** — Not checked by a machine: the body is taken out by an expression in `projects/agent-kit/assets/hooks/git-guard-delivery.sh`, and it has no anchor on a symbol. This is held by the scenario SC-AK-687.
- **The body flag is recognised only as a separate word.** — Not checked by a machine: the boundary before the flag stands in the same expressions in `projects/agent-kit/assets/hooks/git-guard-delivery.sh`, and they have no anchor on a symbol. This is held by the scenario SC-AK-884.
- **The final set before the push is printed by the state report, not only by the guard at the minute of the push.** — `projects/agent-kit/src/lib/push-gate.ts:pushGateLines` — scenario SC-AK-821
- **The set in the state report is called, not retold by reading.** — `projects/agent-kit/src/lib/push-gate.ts:callProfile` — the profile is assembled from the same files and in the same order the guard itself reads
- **What the default printed and what did not get into the set is named by a line of its own.** — `projects/agent-kit/src/lib/push-gate.ts:pushGateLines` — the difference is counted by two calls, not by a sign of an override
- **The guard once per session names what its set is narrower than the pipeline by.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:gap_mark` — the mark lives in the temporary file directory and is keyed by the session sign; scenario SC-AK-820
- **A refusal of the push gate names three moves, not two.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:reason` — scenario SC-AK-851
- **What is disputed is not put into the known list.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:ALLOWLIST` — the same is said in the refusal text of the address check; scenario SC-AK-851
- **The base of a new task branch is judged against the branch of its epic, not against the main branch.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_base` — scenario SC-AK-993
- **The freshness of the main branch moves to the branch of the epic together with the base.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_base`
- **The branch of an epic is looked for among the remote refs, and neither absence nor a second one is guessed at.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_branch`
- **The epic of a task is declared by one shape, and it is read in one place.** — `projects/agent-kit/assets/checks/board-epic-link.github.mjs:declaredEpicOf` — scenario SC-AK-991
- **The state of a task carries the number of its epic.** — `projects/agent-kit/assets/checks/board.github.mjs:taskState` — scenario SC-AK-992
- **The base of a request about a task of an epic is the branch of that epic.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base` — scenario SC-AK-994
- **The freshness asked before a request of such a task is the epic's, not the main branch's.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base`
- **The request of an epic opens when the folders of all its tasks are taken apart.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull` — scenario SC-AK-995
- **An epic is recognised by the label of its card, not by the shape of the branch name.** — `projects/agent-kit/assets/defaults/project.sh:RT_BOARD_EPIC_LABEL`
