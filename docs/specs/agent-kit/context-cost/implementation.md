# Binding — the cost of context

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The cost is measured by what is counted on the spot: characters and bytes.** — `projects/agent-kit/src/lib/cost.ts:weigh`
- **What it is counted by stands next to the numbers.** — `projects/agent-kit/src/lib/cost.ts:COUNTED_BY`
- **The command names three numbers: the cost of the entry, the weight of the named rule and the weight of the layer.** — `projects/agent-kit/src/lib/cost.ts:costOf`
- **The number is taken from what the session gets, not from the file on the disk.** — `projects/agent-kit/src/lib/cost.ts:entryTexts`
- **Characters and bytes are both printed.** — `projects/agent-kit/src/lib/cost.ts:weigh`
- **The command writes nothing and goes to no network.** — `projects/agent-kit/src/lib/cost.ts:costOf`
- **The output is machine-readable on demand.** — `projects/agent-kit/src/lib/cost.ts:costLines`

A scenario is tied to its test by `scenarios.md` next to it: there each of them carries a coverage
line.
