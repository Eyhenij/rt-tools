# Binding — the exam on the loaded rules

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **No edit goes while the exam on the loaded rules is not passed during the session.** — `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`
- **Only a full score counts as passing.** — `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`
- **The last verdict of the role is judged, not the first.** — `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`
- **The exam is asked twice: at the start of the session and before the draft is lifted.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready`
- **The second exam is asked only where there is an open request.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready`
- **The records of a turn are gathered into one stream in order.** — `projects/agent-kit/assets/hooks/exam-guard.sh:after`
- **The other commands of the hosting client the guard does not judge.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready`
- **A role switched off by the tree holds no guard at it.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **A setting that cannot be read does not switch a role off.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **The verdict of the second exam is looked for in all the shapes of a turn record, as the verdict of the first is.** — `projects/agent-kit/assets/hooks/exam-guard.sh:after` — scenario SC-AK-318
- **The answer of a tool that reads or writes files is not a verdict, and such a call is recognised by its identifier.** — `projects/agent-kit/assets/hooks/exam-guard.sh:verdict` — scenarios SC-AK-757, SC-AK-918
- **The refusal has an exit that does not demand lifting the protection.** — `projects/agent-kit/assets/hooks/exam-guard.sh:rt_exam_declared_skip` — scenario SC-AK-852
- **Both refusals say that the path through the list of switched-off roles demands lifting the protection.** — `projects/agent-kit/assets/hooks/exam-guard.sh:deny` — the text of both refusals; scenario SC-AK-852
- **A call of the client counts as lifting the draft, not an occurrence of words.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready` — scenario SC-AK-853
