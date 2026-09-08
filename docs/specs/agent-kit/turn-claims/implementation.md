# The binding — statements to the owner

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The guard of the statements waits for the text of the answer, it does not judge the record as it found it.** — `projects/agent-kit/assets/hooks/hook-input.sh:rt_turn_has_text` — the record is re-read by short attempts; the refusal is printed by `projects/agent-kit/assets/hooks/claim-guard.sh`; scenarios SC-AK-579, SC-AK-580
- **Words about waiting for someone else's step are judged on a par with the other statements.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claims` — the line of the map about waiting for the run; scenarios SC-AK-581, SC-AK-582
- **A turn in which the conscience found a repeat of a miss already taken apart does not end.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:verdict`
- **A finding is lifted by an action, not by words about it.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:verdict`
- **The rightness of a finding the guard does not judge.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:reason`
- **A finding is the answer of the role, not the mark met in the turn.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:found` — the reading tools are muted by the identifier of the call. Scenarios SC-AK-915, SC-AK-916, SC-AK-917
- **The deed by a finding is looked for over the whole record of the turn.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:found` — the commands and the reply text together; scenarios SC-AK-322, SC-AK-323
- **The refusal quotes the answer it judged.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:detail`
- **A statement about the state of the tree said to the owner is confirmed by a command of the same turn.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claims`
- **Every word of a statement has a kind of command of its own named.** — `projects/agent-kit/assets/hooks/claim-guard.sh:proof`
- **The command is looked for in the same turn, not in the past ones.** — `projects/agent-kit/assets/hooks/claim-guard.sh:turn`
- **What is judged is what was said to the owner, not the output of a tool.** — `projects/agent-kit/assets/hooks/claim-guard.sh:said`
- **A promise does not count as a statement.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claims`
- **The refusal names the statement it found.** — `projects/agent-kit/assets/hooks/claim-guard.sh:found`
- **Someone else's word does not count as a statement about the tree.** — `projects/agent-kit/assets/hooks/claim-guard.sh:judged` — the quoting lines and the code blocks leave whole, the quotation marks and the code inside a line are put out, the sentences with a word of condition are thrown away; scenario SC-AK-764
- **The refusal names as the first exit the removal of the statement, not the launch of the command.** — `projects/agent-kit/assets/hooks/claim-guard.sh:reason`; scenario SC-AK-764
- **A wrong conclusion the guard does not judge.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claim-guard`
- **The guard of the statements lets the work through at any breakage.** — `projects/agent-kit/assets/hooks/claim-guard.sh:transcript`
