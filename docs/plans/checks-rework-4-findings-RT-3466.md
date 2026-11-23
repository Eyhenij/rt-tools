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
  decision table through a node, and with none, or with one too old to run it, it lets the call
  through. The push guard and the git hook say the line of a missing pinned node themselves; the
  other guards do not. **Address:** package — the answer of a guard when no node is reachable, in
  `projects/agent-kit/assets/hooks/decide.sh`. **Metric:** calls let through with no verdict,
  down.
- **The package manager is not pinned with the node.** The directory of the pinned node goes first
  in `PATH`, and `pnpm` comes from it only when it is installed there; with none the `pnpm` of the
  next node in `PATH` runs, and a tree that demands its version refuses it with
  `ERR_PNPM_UNSUPPORTED_ENGINE`. Here 22.22.3 holds pnpm 11.10.0, so it does not show; a raise of
  `.nvmrc` to a version without its own pnpm brings the false red back. **Address:** package — the
  directory counts as serving the pin only with the `pnpm` the `packageManager` field names, or the
  refusal line names its install, in `projects/agent-kit/assets/hooks/facts.sh`. **Metric:** red
  steps of the set by a wrong package manager, down.
