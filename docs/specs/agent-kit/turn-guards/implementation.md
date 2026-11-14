# The binding — the guards of the end of a turn

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A second pass over the same turn is not judged.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:active` — the exit guard lets a second pass go outside an open epic; the agent hooks judge it by the same field of their input
- **The tool that closes the conversation is refused always.** — `projects/agent-kit/assets/hooks/end-conversation-guard.sh:tool` — the name is read by jq, without jq by grep; scenario SC-AK-1121
- **Under an open epic the guard of the exits judges a turn that ended with work and a second pass.** — `projects/agent-kit/assets/hooks/turn-exit-epic.sh:rt_te_epic_open` — the tiers are sourced by the exit guard; the subdomain of the exits binds each of them
- **The guard of the window reminds before it refuses.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`
- **The reminder repeats by steps, not at every action.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`
- **After the threshold of the stop the record of the progress of the work, the handover and the commands of the delivery pass.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`
- **The guard of the window lets the work through at any breakage.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`
- **Whether a turn may end by what was said in it is judged by a model, not by word samples.** — `projects/agent-kit/assets/hooks/turn-judge.md:stop_hook_active` — the text of the agent hook; the entry in the session settings points to its laid-out copy; scenarios SC-AK-1358, SC-AK-1359
- **The refusal of the model names itself by a fixed mark.** — `projects/agent-kit/assets/hooks/turn-judge.md:turn-judge` — the mark stands in the shape of the refusal
- **Whether a question to the owner may leave is judged by a model.** — `projects/agent-kit/assets/hooks/ask-judge.md:ask-judge` — the text of the agent hook for the question tool; scenario SC-AK-1360
- **A turn in which the executor admitted a miss does not close until there is a record about the incident.** — `projects/agent-kit/assets/hooks/turn-judge.md:postmortems` — the agent hook on the Stop event looks for the record in the directory the tree names
- **A turn in which the owner said to create or send a proposal does not close until there was a sending.** — `projects/agent-kit/assets/hooks/turn-judge.md:propose` — the agent hook on the Stop event looks for the sending among the calls of the turn
- **What counts as work is an edit of a file and a command that changes the tree.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:work_re` — the `glab` commands stand next to `gh`. Its reading subcommands stand in `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:read_re`; scenario SC-AK-298
- **Commits left in the working tree with a reason named in the reply release the turn.** — `projects/agent-kit/assets/hooks/turn-exit-verdict.sh:unpushed_named` — the tier of the guard reads it. Scenario SC-AK-1199.
- **Work handed in and merged the guard does not judge.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:state`
- **A turn that declared a written plan does not end at all.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:first_stage` — the branch refuses the turn before the second sign and takes the heading of the first stage from the plan; scenarios SC-AK-591…593
- **A removed task folder lifts the requirement of a state.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:archived` — the tier of the taken task does not judge such a branch; scenarios SC-AK-575, SC-AK-576
- **A stage declared closed is confirmed by the output of a command.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:stage_was`
- **The keys of the progress of the work and of the plan are read under two names, English and Russian.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:stage_now` — the stage; the state and the next step — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:next_step`; scenario SC-AK-911
- **A technique written in prose the guard does not read.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:contract`
- **The size of the window is taken from the setting of the tree, not from the record of the session.** — `projects/agent-kit/assets/defaults/project.sh:RT_WINDOW_TOKENS`
- **The threshold of the squeeze is set by the tree by the same numbers as the thresholds of the guard.** — `projects/agent-kit/src/lib/thresholds.ts:readThresholds`
- **The pair of the guard is checked against the pair of the squeeze, and what diverged is named by the numbers of both sides.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift`
- **A tree that declared no threshold of the squeeze gets no refusal.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`
- **One file of a guard has the right to declare several events.** — `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf`
- **A role switched off by the tree does not hold the guard at it.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **A setting that cannot be read does not switch a role off.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **The guard declares the locale of its run, it does not inherit it.** — `projects/agent-kit/assets/hooks/utf8.sh:rt_use_utf8_locale`
- **After the threshold of the squeeze the guard stays an insurance.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:compact_pct`
- **A squeeze summary is never a real remark of the owner.** — `projects/agent-kit/assets/hooks/turn-exit-verdict.sh:is_service` — the sign of the record, not the text; the agent hook skips such a record by the same field
- **A turn in which the executor asks the owner to sign in or type a password does not end.** — `projects/agent-kit/assets/hooks/turn-judge.md:password` — the agent hook on the Stop event refuses a request to the owner for a step the executor can take
