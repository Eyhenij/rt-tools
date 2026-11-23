# Findings of RT-3466 — the steps of the push set run on the pinned node

What the reviews of RT-3466 found outside its approved plan. Each finding waits for the owner's
decision: a task of its own or none.

## Outside the plan

- **The lint after an edit runs on the node of the hook.** The hook after an edit calls the
  linter of styles of the tree by `pnpm exec stylelint`; on node 20 first in `PATH` the linter
  ends with `ERR_REQUIRE_ESM`, and the filter of the hook does not drop that line: it reaches the
  agent as a finding of the linter in the edited file. The plan of RT-3466 leaves the checks of a
  hook outside the set on the node of the hook. **Address:** package — the same directory of the
  pinned node first in `PATH` around the call of the linter in
  `projects/agent-kit/assets/hooks/lint-after-edit.sh`, and a case in its suite. **Metric:**
  findings of the linter after an edit that are a wrong node, down.
- **A guard of the session reaches no decision with no node in `PATH`.** Every guard asks the
  decision table through a node, and with none it lets the call through. The git hook before a
  push prints the line of a missing pinned node itself; the push guard of the session does not.
  **Address:** package — the answer of a guard when no node is reachable, in
  `projects/agent-kit/assets/hooks/decide.sh`. **Metric:** calls let through with no verdict,
  down.
