# The binding — the decision table of the package hooks

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **Every hook of the package has a row in the table or a mark.** — `projects/agent-kit/assets/checks/decision-table.mjs:coverage` — scenarios `SC-AK-1562`, `SC-AK-1569`
- **A row matches the hook it describes.** — `projects/agent-kit/assets/checks/decision-table.mjs:conform` — the hook runs through `runProbe` on the fixture of the row; scenario `SC-AK-1563`
- **No state is dead.** — `projects/agent-kit/assets/checks/decision-table.mjs:walk` — scenario `SC-AK-1564`
- **A refusal names a move the table allows in the same state.** — `projects/agent-kit/assets/checks/decision-table.mjs:walk` — scenario `SC-AK-1565`
- **An ask-only state is named apart.** — `projects/agent-kit/assets/checks/decision-table.mjs:walk` — scenario `SC-AK-1566`
- **Chains are derived from the table, not written by hand.** — `projects/agent-kit/assets/checks/decision-table.mjs:chainsOf` — scenario `SC-AK-1567`
- **An edit of any hook selects the test of the table before a push.** — `projects/agent-kit/tests/select-suites.sh:rt_select_suites` — scenario `SC-AK-1568`

The names of this tree: the table is `projects/agent-kit/assets/checks/decision-table.json`, its
test is `projects/agent-kit/tests/decision-table.test.sh`. A refusal asks whether the rules gate
holds its named move by `rt_gate_pending` in `projects/agent-kit/assets/hooks/deny-tail.sh`.
