# The binding — the guard of the exits of a turn

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

| Rule                                                                      | Where it is carried out                                                                                                                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The last action of a turn is only ever work.                              | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:ended_working` — an edit of a file or the changing part of the last command of the turn                                           |
| An answer to the owner does not work as an action.                        | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:ended_working` — the calls of the tools are judged, the text of the answer does not count as an action at all                     |
| Exploration does not count as work.                                       | `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:read_re` — the reading subcommands of the version control system and of the hosting client                                     |
| A redirection of the output does not count as work.                       | `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:work_re` — there is no arrow in the sample of work: the signs stay an edit of a file and the listed commands                   |
| Waiting for someone else's step is never the end of a turn.               | `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:wait_re` — a loop until the run is ready, watching it, a call of a sleep                                                       |
| Handed-in work ends a turn only together with the next one begun.         | `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:handover_re` — the tail of the turn after the opening of the request is compared with the sample of the start of the next work |
| A task taken without a task folder does not end the turn.                 | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:task_key` — the branch is compared with the sample of the key of the tasks, the sign is the absence of the directory of the task  |
| A closed stage is confirmed by the command of the check of the same turn. | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:stage_was` — the number of the stage is compared with the history of the branch, the command is taken from the line of the plan   |
| The lawful exits are judged before all the tiers.                         | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:released` — a question to the owner, a refusal of a guard, a written handover and a word of the owner about a stop                |
| The parts of a compound command are judged one by one.                    | `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:part_re` — the command is split by the joiners, and every part is judged apart                                                 |
