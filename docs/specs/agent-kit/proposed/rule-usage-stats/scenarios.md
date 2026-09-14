# Scenarios — observation lines leave for the intake, the sending side

The largest number issued in the tree is 1093; the numbers continue it and do not change after the
merge.

### SC-AK-1094 — the observation cargo carries every line of the window grouped by day

Given day files for three days with lines of all four event kinds
When the send gathers the cargo
Then the cargo carries three days, every line of each day, and the total equals the sum of the
files

Covered: `projects/agent-kit/tests/observations-cargo.test.ts`.

### SC-AK-1095 — a load names the kind of its skill

Given a load of a rule laid out by the package, a load of a pattern of the package and a load of a
skill of the tree's own
When the send gathers the cargo
Then the three lines carry `skill` `rule`, `pattern` and `own`, and a refusal line carries no
`skill`

Covered: `projects/agent-kit/tests/observations-cargo.test.ts`.

### SC-AK-1096 — a broken line is skipped and the cargo goes

Given a day file with a line broken mid-way
When the send gathers the cargo
Then the cargo carries the other lines of the day, and the broken one is absent

Covered: `projects/agent-kit/tests/observations-cargo.test.ts`.

### SC-AK-1097 — the dry run names the cargo with lines and days

Given three days of lines
When `agent-kit propose --dry-run` runs
Then the print holds the line `observations — строк N за 3 дн.` with N the total, and nothing
leaves

Covered: `projects/agent-kit/tests/observations-cargo.test.ts`.

### SC-AK-1098 — a tree address in a line refuses the send

Given a line whose resource holds a segment of the tree address
When the send checks the cargo for leaks
Then the send refuses and names the line, as it does for the digest

Covered: `projects/agent-kit/tests/observations-cargo.test.ts`.
