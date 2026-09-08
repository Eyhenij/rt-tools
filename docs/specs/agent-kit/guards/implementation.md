# The turn guards and the rules gate — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **A hook that is missing a profile function says so instead of staying silent.** — `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`
- **A message about what is missing does not turn the hook into a refusal.** — `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`
- **The state report lists the profile functions the laid-out hooks expect, and those of them that are not defined.** — `projects/agent-kit/src/lib/commands.ts:profileLines`
- **The sign of an interpreter is read at the line that opened the body, not at the whole command.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_paths_default`
- **The sign of application code is judged relative to the root of the tree.** — `projects/agent-kit/assets/defaults/project.sh:rt_is_app_code_default`
- **The plan guard judges the declared transition, not the presence of files.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state`
- **A refusal by state names the mandatory action of the state that is declared.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`
- **Only a word from the list counts as a state name.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`
- **The task folder is asked of the history of the branch too, not only of the disk.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:in_tree`
- **The state is judged before the agreement and its bypass.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:progress`
- **A session begun from a handover edits no files while the rule of conducting work is not loaded.** — `projects/agent-kit/assets/hooks/handoff-entry-guard.sh:verdict`
- **The handover is recognised both by the path to it and by a word about it.** — `projects/agent-kit/assets/hooks/handoff-entry-guard.sh:from_handoff`
- **A guard of an edit judges a write by a shell command on a par with one by the edit tool.** — `projects/agent-kit/assets/hooks/handoff-entry-guard.sh:rt_write_targets` — the shared parse; scenarios `SC-AK-928`–`SC-AK-930`
- **A refusal of a guard names two lawful moves.** — `projects/agent-kit/assets/hooks/deny-tail.sh:rt_deny_tail`
- **The lawful shape of a bypass is named by the same tail, and its absence too.** — `projects/agent-kit/assets/hooks/deny-tail.sh:rt_deny_tail`
- **The tail of a refusal is assembled by a shared function, not by every text on its own.** — `projects/agent-kit/assets/hooks/git-guard-main.sh:deny_tail_text`
- **The start of a call counts variable assignments as part of the command, and it is declared in one place.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND` — the sample of the call prefix; the carriers take it from there, they have no copies of their own; scenario `SC-AK-559`
- **The scenario suite takes a port from the system, it does not assign it by a number.** — `projects/agent-kit/tests/lib.sh:wait_for_port` — the technique is one for both cargo suites: the server listens on port zero, the chosen number travels into a file.
- **A suite that accumulates a count of checks gives that count back by the exit code.** — `projects/agent-kit/tests/syntax.test.sh:SC-AK-689` — a suite calling the counter without a line of the total is named by name; scenario SC-AK-689
- **A linter command that did not name the edited file is named by a word, not by a refusal.** — `projects/agent-kit/assets/hooks/lint-after-edit.sh:path_gap` — scenario SC-AK-885
- **An assignment before the name of a command hides no call — whatever the shape of its value.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND` — scenario SC-AK-844
- **The sign stays a sample, not a shell parser.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND` — scenario SC-AK-844
- **The sign is bound to err towards a surplus firing.** — Not checked: this is the argument for the choice of the sample, written in the comment next to it.
- **A file put by the layout demands no pair of "an edit and its document".** — `projects/agent-kit/assets/hooks/docs-guard.sh:rt-kit` — the sign is read by the layout header; scenario SC-AK-849
