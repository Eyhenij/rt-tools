# Binding — the dispatcher of the agent's events

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **An event of the agent is called by the dispatcher, not by a list of guards.** — `projects/agent-kit/src/lib/hooks-map.ts:hooksSection`
- **The call sample is carried by the header of the guard itself, and the dispatcher checks it.** — `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf` — the declaration is read from the header; it is checked by `projects/agent-kit/assets/hooks/dispatch.sh`.
- **The sample is checked against the name of the tool whole, not against a piece.** — Not checked by a machine: the check goes by a shell expression in `projects/agent-kit/assets/hooks/dispatch.sh`, and it has no anchor on a symbol. This is held by the scenario SC-AK-523.
- **All the event declarations of a file are read, not the first one.** — `projects/agent-kit/assets/hooks/dispatch.sh:matched` — the declarations are walked, a matched branch is called once; scenario SC-AK-577
- **The refusal of a branch arrives as a decision in the output on a par with the exit code.** — `projects/agent-kit/assets/hooks/dispatch.sh:branch_out` — the output of a branch is read by the parser, and on a refusal decision the walk stops; scenario SC-AK-578
- **The refusal of a branch is given to the agent as it is, and the branches after it are not called.** — Not checked by a machine: this is the order of the walk in `projects/agent-kit/assets/hooks/dispatch.sh`. This is held by the scenario SC-AK-524.
- **A guard called directly works as before.** — `projects/agent-kit/assets/hooks/hook-input.sh:rt_hook_field` — the field is asked of the environment, the parse goes only without it.
- **The input stream is read by a command, not by a substitution.** — `projects/agent-kit/assets/hooks/hook-input.sh:rt_hook_read`
- **A broken dispatcher does not jam the work.** — Not checked by a machine: these are the early exits in `projects/agent-kit/assets/hooks/dispatch.sh`. This is held by the scenario SC-AK-525.
- **What is laid out and needs a record in the setting of the agent reaches it.** — `projects/agent-kit/src/lib/hooks-map.ts:bindDispatch` — called from `projects/agent-kit/src/lib/sync.ts:runSync`; scenarios SC-AK-05, SC-AK-682
- **A record in the setting of the agent only adds.** — `projects/agent-kit/src/lib/hooks-map.ts:bindDispatch` — scenarios SC-AK-683, SC-AK-684
- **The refusal of a closing guard is checked on the link with the dispatcher, not on the guard alone.** — `projects/agent-kit/tests/dispatch.test.sh:real_input` — the real watchman of the exits is put into the fixture of the dispatcher and called through it; scenarios SC-AK-700, SC-AK-701
- **A branch that left with a non-zero code and said nothing is named by name.** — `projects/agent-kit/assets/hooks/dispatch.sh:branch_out` — the name is taken from the file of the branch itself; scenario SC-AK-833
- **The subject of the check is picked by the event: the tool name where there is one, the kind of the start where there is none.** — `projects/agent-kit/assets/hooks/dispatch.sh:subject` — the kind of the start arrives as a parse field on a par with the tool name; scenario SC-AK-856
- **A refusal said into the error stream reaches the executor.** — `projects/agent-kit/assets/hooks/dispatch.sh:branch_err` — the stream is gathered into a separate file and printed when the output of the branch is empty; scenario SC-AK-860
