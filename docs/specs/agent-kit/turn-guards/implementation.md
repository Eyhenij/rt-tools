# The binding — the guards of the end of a turn

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The tool that closes the conversation is refused always.** — `projects/agent-kit/assets/hooks/end-conversation-guard.sh:tool` — the name is read by jq, without jq by grep; the refusal comes from the decision table; scenario SC-AK-1121
- **While the owner's stop stands, a turn no word of the owner opened does no work.** — `projects/agent-kit/assets/hooks/owner-stop-call-guard.sh:owner_stop_call` — the refusal of a call, the take-down passed. `projects/agent-kit/assets/checks/task-flow-script.mjs:runStopCall` — the command `stop-call`. `projects/agent-kit/assets/task-flow/measure/owner.mjs:stopCall` — the opening of the turn against the stop. `projects/agent-kit/assets/task-flow/source/owner.mjs:turnOpener` — the prompt and its queue time. Scenario SC-AK-2014
- **A `Monitor` that prints a line on every step of a live own background task is refused.** — `projects/agent-kit/assets/hooks/monitor-stream-guard.sh:monitor_stream` — the cheap filter with no node, the refusal from the decision table. `projects/agent-kit/assets/checks/task-flow-script.mjs:runMonitorCall` — the command `monitor-call`. `projects/agent-kit/assets/checks/flow-monitor.mjs:linesPerStep`, `projects/agent-kit/assets/checks/flow-monitor.mjs:followedTask` — the decision; scenario SC-AK-2017
- **The guard of the window reminds before it refuses.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`
- **The reminder repeats by steps, not at every action.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`
- **After the threshold of the stop the record of the progress of the work, the handover and the commands of the delivery pass.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`
- **The guard of the window lets the work through at any breakage.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`
- **Whether a turn may end by what was said in it is judged by a model, not by word samples.** — `projects/agent-kit/assets/hooks/turn-judge.md:stop_hook_active` — the text of the agent hook; the entry in the session settings points to its laid-out copy; scenarios SC-AK-1358, SC-AK-1359, SC-AK-1361, SC-AK-1363
- **The refusal of the model names itself by a fixed mark.** — `projects/agent-kit/assets/hooks/turn-judge.md:turn-judge` — the mark stands in the shape of the refusal
- **Whether a question to the owner may leave is judged by a model.** — `projects/agent-kit/assets/hooks/ask-judge.md:ask-judge` — the text of the agent hook for the question tool; scenario SC-AK-1360
- **A turn in which the executor admitted a miss does not close until there is a record about the incident.** — `projects/agent-kit/assets/hooks/turn-judge.md:postmortems` — the agent hook on the Stop event looks for the record in the directory the tree names, and by the case next to it for its send in the turn
- **A turn in which the owner said to create or send a proposal does not close until there was a sending.** — `projects/agent-kit/assets/hooks/turn-judge.md:propose` — the agent hook on the Stop event looks for the sending among the calls of the turn
- **What counts as work is an edit of a file and a command of the work the description names.** — `projects/agent-kit/assets/task-flow/measure/session.mjs:wrote` — an edit tool or a command `projects/agent-kit/assets/checks/flow-data.mjs:isWriteCommand` finds in `words.write`; scenario SC-AK-1432
- **The size of the window is taken from the setting of the tree, not from the record of the session.** — `projects/agent-kit/assets/defaults/project.sh:RT_WINDOW_TOKENS`
- **The threshold of the squeeze is set by the tree by the same numbers as the thresholds of the guard.** — `projects/agent-kit/src/lib/thresholds.ts:readThresholds`
- **The pair of the guard is checked against the pair of the squeeze, and what diverged is named by the numbers of both sides.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift`
- **A tree that declared no threshold of the squeeze gets no refusal.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`
- **One file of a guard has the right to declare several events.** — `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf`
- **A role switched off by the tree does not hold the guard at it.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **A setting that cannot be read does not switch a role off.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **The guard declares the locale of its run, it does not inherit it.** — `projects/agent-kit/assets/hooks/utf8.sh:rt_use_utf8_locale`
- **After the threshold of the squeeze the guard stays an insurance.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:compact_pct`
- **A squeeze summary is never a real remark of the owner.** — `projects/agent-kit/assets/task-flow/source/owner.mjs:wordOf` — the sign of the record, not the text; the agent hook reads only the records of typed messages and of answers to the question tool, and a squeeze summary is neither
- **A turn in which the executor asks the owner to sign in or type a password does not end.** — `projects/agent-kit/assets/hooks/turn-judge.md:password` — the agent hook on the Stop event refuses a request to the owner for a step the executor can take
