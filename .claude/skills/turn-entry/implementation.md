# turn-entry — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it.

## What it is called here

- **In the rule** — Here
- **the handover directory** — `.claude/handoff/` — outside history, a file per branch; the directory is set by `RT_HANDOFF_DIR` of the profile
- **the turn map** — `.claude/rt-kit/defaults/turn-map.md` — a resource of the defaults kind, laid out by the package
- **the entry hook** — `.claude/hooks/turn-entry-load.sh`, declared in `.claude/settings.json`
- **the map check** — `tools/check-turn-map.mjs`, the command `pnpm run check:turn-map`

## Where it lives

- **the entry hook** — `.claude/hooks/turn-entry-load.sh`
- **the map text** — `.claude/rt-kit/defaults/turn-map.md`
- **the map check** — `tools/check-turn-map.mjs`
- **the hook scenarios** — `projects/agent-kit/tests/turn-entry-load.test.sh`
- **the hook that writes the handover** — `.claude/hooks/handoff-write.sh`

## Where the articles are carried out

- **The past session's handover comes into the context by the same launch as the work state.** — `.claude/hooks/turn-entry-load.sh:handoff` — stands in the same group of startup hooks as the loading of the work state
- **The handover is taken by the name of the current branch.** — `.claude/hooks/turn-entry-load.sh:branch` — the file name is assembled from the branch, not picked from the directory
- **No handover — the entry is silent about it.** — `.claude/hooks/turn-entry-load.sh:handoff_dir` — the printing block stands under a check that the file is readable
- **The turn map comes by the same launch and lies as a file of its own, not pulled out of the rule.** — `.claude/hooks/turn-entry-load.sh:map` — the path to the defaults resource; there is no parsing of the rule in the hook at all
- **The map is shorter than the rule, and its limit is set by the tree's check.** — `tools/check-turn-map.mjs:LIMIT_BYTES`
- **A state declared by the rule and forgotten in the map is a divergence.** — `tools/check-turn-map.mjs:statesOf` — the names are reconciled with the rule table both ways
- **Text that travels into the context is written as a list, not a table.** — `tools/check-turn-map.mjs:statesOf` — reads both forms: a list line and a table line; the list is parsed only in the map, because in the rule the patterns are written in the same form
- **The entry is served on all four launches, not only after compaction.** — `.claude/hooks/turn-entry-load.sh:rt-hook` — the declaration line in the header names all four launches, and the layout carries it into the settings
- **The entry hook does not refuse the launch.** — `.claude/hooks/turn-entry-load.sh:exit` — every branch ends with zero, and the output is empty when there is nothing to read

## What of the rule is not here

Everything is carried out. The map check stands in the push gate set next to the state audit, and
the hook scenarios stand in the common run of the package suites.
