# Binding — the product metrics of the rules package

The report of one tree has code in `projects/agent-kit/src/lib/metrics.ts:metrics`, and what a tree
records has code in `projects/agent-kit/assets/hooks/metric-marks.sh:rt_tree_sign`,
`projects/agent-kit/assets/hooks/owner-corrections.sh:RT_CORRECTION_PATTERNS`,
`projects/agent-kit/assets/hooks/role-calls.sh:rt_verdict_of` and
`projects/agent-kit/assets/hooks/pull-outcomes.sh:rt_pull_outcomes`. The rest of the agreement has
none yet, so this file lists where each part is expected, and the merge into the package spec shows
where to look.

| Part                                                             | Where it is expected               | Task    |
| ---------------------------------------------------------------- | ---------------------------------- | ------- |
| The report of one tree                                           | `projects/agent-kit/src/lib/`      | RT-3152 |
| The run line, the signs, the correction hook, the outcome reader | `projects/agent-kit/assets/hooks/` | RT-3153 |
| The day line, its table and its operation                        | `libs/message-bus-api/`            | RT-3155 |
| The sending, the lock, the mark                                  | `projects/agent-kit/src/lib/`      | RT-3154 |
| The section «Качество»                                           | `libs/message-bus-admin/`          | RT-3156 |
| The rule of the loop                                             | `projects/agent-kit/assets/rules/` | RT-3157 |
