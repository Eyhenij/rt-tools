# The binding — the handover of a session and the entry into a new one

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The handover of a session is written before the squeeze of the context, not by the hand of the executor.** — `projects/agent-kit/assets/hooks/handoff-write.sh:target`
- **The hook of the handover adds nothing of its own.** — `projects/agent-kit/assets/hooks/handoff-write.sh:line_of`
- **The keys of the progress of the work are read under two names, English and Russian.** — `projects/agent-kit/assets/hooks/handoff-write.sh:line_of` — the state, the stage and the next step; the section "where we stand" — `projects/agent-kit/assets/hooks/task-context-load.sh:LIMIT`; scenarios SC-AK-909, SC-AK-910
- **What the hook wrote is the lower bound of the handover.** — `projects/agent-kit/assets/hooks/handoff-write.sh:handoff_dir`
- **The hook of the handover does not refuse the squeeze.** — `projects/agent-kit/assets/hooks/handoff-write.sh:trigger`
- **The handover of the past session arrives in the context at the launch, it is not put into the chat by hand.** — `projects/agent-kit/assets/hooks/turn-entry-load.sh:handoff`
- **The handover is taken by the name of the current branch.** — `projects/agent-kit/assets/hooks/turn-entry-load.sh:branch`
- **There is no handover — the entry stays silent about it.** — `projects/agent-kit/assets/hooks/turn-entry-load.sh:handoff_dir`
- **The map of the turn arrives in the context at the same launch as the handover.** — `projects/agent-kit/assets/hooks/turn-entry-load.sh:map`
- **The exits of a turn and the line about the boundary of a state are read under two names: English and Russian.** — `projects/agent-kit/assets/checks/check-turn-map.mjs:EXITS` — the pairs of names, either is enough; the line about the boundary — `projects/agent-kit/assets/checks/check-state-next.mjs:BOUNDARIES`; scenario SC-AK-905
- **The map names the mandatory action of every state and the four exits of a turn.** — `projects/agent-kit/assets/checks/check-turn-map.mjs:EXITS`
- **The map lives as a file of a package resource of its own.** — `projects/agent-kit/assets/checks/check-turn-map.mjs:MAP`
- **The map is shorter than the rule and differs from it by this.** — `projects/agent-kit/assets/checks/check-turn-map.mjs:LIMIT_BYTES`
- **The entry is served at all four launches, not only after a squeeze.** — `projects/agent-kit/assets/hooks/turn-entry-load.sh:rt-hook`
- **The hook of the entry does not refuse the launch.** — `projects/agent-kit/assets/hooks/turn-entry-load.sh:rt_hooks_dir`
- **The threshold of the squeeze stands lower than the threshold of the stop.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift`
- **A coincidence of the thresholds is a divergence, not an agreement.** — `projects/agent-kit/src/lib/thresholds.ts:tied`
- **The distance between the thresholds is declared, not derived.** — `projects/agent-kit/src/lib/thresholds.ts:marginPct`
- **A tree that declared no squeeze works as before.** — `projects/agent-kit/src/lib/thresholds.ts:compactPct`
- **The refusal names both sides by numbers.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`
- **A filled window ends a turn only where there is no squeeze.** — `projects/agent-kit/assets/checks/check-turn-map.mjs:EXITS`
