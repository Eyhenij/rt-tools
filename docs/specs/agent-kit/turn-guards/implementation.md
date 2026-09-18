# The binding — the guards of the end of a turn

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A turn in which a question is asked of the owner does not end until the laws and the rules were read during the same turn.** — `projects/agent-kit/assets/hooks/grill-gate.sh:verdict`
- **What counts as reading is any of the three ways, not only the loading of a rule.** — `projects/agent-kit/assets/hooks/grill-gate.sh:read_re`
- **A second pass over the same turn is not judged.** — `projects/agent-kit/assets/hooks/grill-gate.sh:active`
- **The tool that closes the conversation is refused always.** — `projects/agent-kit/assets/hooks/end-conversation-guard.sh:tool` — the name is read by jq, without jq by grep; scenario SC-AK-1121
- **Under an open epic the guard of the exits judges a turn that ended with work and a second pass.** — `projects/agent-kit/assets/hooks/turn-exit-epic.sh:rt_te_epic_open` — the tiers are sourced by the exit guard; the subdomain of the exits binds each of them
- **To a question whose answer a remark of the owner has already given, the guard of the conversation answers with a refusal.** — `projects/agent-kit/assets/hooks/grill-gate.sh:seen`
- **A refusal by the second sign orders to go on with the work, not to ask again differently.** — `projects/agent-kit/assets/hooks/grill-gate.sh:seen`
- **Two answers «recommended» in a row close the remaining questions by assumption, and the guard of the conversation refuses the next menu.** — `projects/agent-kit/assets/hooks/grill-gate.sh:streak` — the last two answers of the question tool are read from the record. An answer counts as recommended when every option taken carries the mark in either language. Scenario SC-AK-1134.
- **The guard of the conversation lets the work through at any breakage.** — `projects/agent-kit/assets/hooks/grill-gate.sh:transcript`
- **The guard of the window reminds before it refuses.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`
- **The reminder repeats by steps, not at every action.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`
- **After the threshold of the stop the record of the progress of the work, the handover and the commands of the delivery pass.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`
- **The guard of the window lets the work through at any breakage.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`
- **A turn in which the executor admitted a miss does not close until there is a record about the incident.** — `projects/agent-kit/assets/hooks/postmortem-guard.sh:postmortem-guard`
- **A turn in which the owner said to create or send a proposal does not close until there was a sending.** — `projects/agent-kit/assets/hooks/proposal-guard.sh:proposal-guard`
- **A request for a proposal is caught by a verb next to a word about the rules layer, not by the word itself.** — `projects/agent-kit/assets/hooks/proposal-guard.sh:asked_re`
- **A turn with a question to the owner is checked at the tool of the question, not at the end of the turn.** — `projects/agent-kit/assets/hooks/grill-gate.sh:grill-gate`
- **A turn in which nothing was done about the work does not end.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:verdict`
- **What counts as work is an edit of a file and a command that changes the tree.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:work_re`
- **A word about a stop is judged by the remark of the owner, not by the words of the executor.** — `projects/agent-kit/assets/hooks/turn-exit-verdict.sh:told_stop`
- **A turn that ended with words about waiting for the word of the owner is not let go without their word or a question to them by a tool.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:awaits_word` — the set of the samples of the phrase; the tier stands before the lawful exits; scenario SC-AK-891
- **Work handed in and merged the guard does not judge.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:state`
- **A turn that declared a written plan does not end at all.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:first_stage` — the branch refuses the turn before the second sign and takes the heading of the first stage from the plan; scenarios SC-AK-591…593
- **A removed task folder lifts the requirement of a state and does not end the turn.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:archived` — the sign takes the judging to the second one and does not let the turn go; scenarios SC-AK-574…576
- **A turn that opened a request does not end until the state of the handed-in work is asked by a command.** — `projects/agent-kit/assets/hooks/waiting-turn-guard.sh:ready_re` — the sign is taken from the commands of the turn; scenario SC-AK-583
- **A step of closing the work does not count as taking the next task.** — `projects/agent-kit/assets/hooks/waiting-turn-guard.sh:taken_re` — the list of what taking happens to be; the path of the edit is judged by the sample `taken_path_re`; scenario SC-AK-812
- **A run started or rerun in the turn gets a wait for its end in the same turn.** — `projects/agent-kit/assets/hooks/waiting-turn-guard.sh:started_run_re` — the starting command is matched against the commands of the turn, the wait against them and against the watching tool by `watched_run_re`; the verdict `owe:watch` stands before the release by the taken task; scenario SC-AK-1133
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
- **A squeeze summary is never a real remark of the owner.** — `projects/agent-kit/assets/hooks/proposal-guard.sh:is_input`
- **A turn in which the executor asks the owner to sign in or type a password does not end.** — `projects/agent-kit/assets/hooks/stand-login-guard.sh:asked_re` — the set of the samples of the request; scenario SC-AK-840
- **A request to switch the mode of work is allowed.** — `projects/agent-kit/assets/hooks/stand-login-guard.sh:asked_re` — the word about the mode is not in the set; scenario SC-AK-841
- **The boundary of the set of samples is named.** — `projects/agent-kit/assets/hooks/stand-login-guard.sh:boundary` — it is said in the header of the guard; not checked: what the guard does not recognise it does not check
