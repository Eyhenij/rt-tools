# The binding — the guard of the conversation

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A turn in which a question is asked of the owner does not end until the laws and the rules were read during the same turn.** — `projects/agent-kit/assets/hooks/grill-gate.sh:verdict`
- **What counts as reading is any of the three ways, not only the loading of a rule.** — `projects/agent-kit/assets/hooks/grill-gate.sh:read_re`
- **A turn with a question to the owner is checked at the tool of the question, not at the end of the turn.** — `projects/agent-kit/assets/hooks/grill-gate.sh:grill-gate`
- **With edits in the turn the refusal of the first sign names the rules of their area.** — `projects/agent-kit/assets/hooks/grill-gate.sh:named` — scenario SC-AK-1194
- **An edit outside the tree does not make up the area of the work.** — `projects/agent-kit/assets/hooks/grill-gate.sh:edited` — the loop over the edited paths skips an absolute path outside the root. Scenario SC-AK-1196.
- **To a question whose answer a remark of the owner has already given, the guard of the conversation answers with a refusal.** — `projects/agent-kit/assets/hooks/grill-gate.sh:seen`
- **A refusal by the second sign orders to go on with the work, not to ask again differently.** — `projects/agent-kit/assets/hooks/grill-gate.sh:seen`
- **Two answers «recommended» in a row close the remaining questions by assumption, and the guard of the conversation refuses the next menu.** — `projects/agent-kit/assets/hooks/grill-gate.sh:streak` — the last two answers of the question tool are read from the record. An answer counts as recommended when every option taken carries the mark in either language. Scenario SC-AK-1134.
- **A question after a refusal in the same turn leaves only with the line of what was done without the answer and a working command after the refusal.** — `projects/agent-kit/assets/hooks/grill-gate.sh:after_refusal` — the line is `RT_DONE_WITHOUT_ANSWER` of the profile, the work pattern is `work_re` of the exit guard. Scenario SC-AK-1197.
- **A question that offers the owner to walk around a check does not leave.** — `projects/agent-kit/assets/hooks/grill-gate-bypass.sh:bypass_re` — the guard sources the file and calls `rt_grill_bypass`. Scenario SC-AK-1202.
- **The guard of the conversation lets the work through at any breakage.** — `projects/agent-kit/assets/hooks/grill-gate.sh:transcript`
