# Binding — the steps of the work are written out, marked and counted

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The plan names the steps of every stage, and the progress mirrors them with a mark each.** — `projects/agent-kit/assets/checks/check-work-steps.mjs:stepsOfPlan` — the steps of the plan by stage and by place inside it; scenario `SC-AK-1008`
- **The numbers and the names of the steps are copied, not reworded.** — `projects/agent-kit/assets/checks/check-work-steps.mjs:judge` — the two lists are matched by number and by name; scenarios `SC-AK-1009`, `SC-AK-1010`
- **Exactly one step carries the mark of going on right now, while any step is not done.** — `projects/agent-kit/assets/checks/check-work-steps.mjs:CURRENT` — the mark of the current step; scenario `SC-AK-1011`
- **Every step is done — no step carries the mark of going on right now.** — `projects/agent-kit/assets/checks/check-work-steps.mjs:DONE` — the mark of a step that is done; scenario `SC-AK-1011`
- **A step of the plan that is not done forbids a stop of the turn.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:rt_te_steps_left` — the count of what is not done; scenarios `SC-AK-1012`, `SC-AK-1013`
- **The refusal names the remainder, the current step and the command that counted them.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:rt_te_steps_reason` — the text of the refusal; scenario `SC-AK-1012`
- **The count is read from the record of the progress, not from the hosting.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:rt_te_step_now` — the current step by its number and name, read from the same file; scenario `SC-AK-1012`
- **A plan that names no steps is not judged, and neither is a progress without the list.** — `projects/agent-kit/assets/checks/check-work-steps.mjs:stepsOfProgress` — the section of the progress and whether it is declared at all; scenario `SC-AK-1015`
- **A plan whose step names still stand as the sample wrote them is not judged.** — `projects/agent-kit/assets/checks/check-work-steps.mjs:BLANK_NAME` — a name in angle brackets; scenario `SC-AK-1008`
- **A progress that carries the list while the plan names no steps is a divergence.** — `projects/agent-kit/assets/checks/check-work-steps.mjs:declared` — the list was written from the head; scenario `SC-AK-1008`
- **The word of the owner about a stop lifts the refusal, and the guard reads it from them.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:told_stop` — the owner remark is judged, not the reply text; scenario `SC-AK-1014`
