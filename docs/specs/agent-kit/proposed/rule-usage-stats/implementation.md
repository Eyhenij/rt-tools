# The binding — usage of the rules over a month, the sending side

There is no code yet: the lines name the place foreseen for every rule, and the addresses are filled
in by the work and checked by the spec audit at the merge. The paths are from the root of the
package, `projects/agent-kit/src/`.

| Rule                                                                                                         | Where it is foreseen                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| The digest carries a month block next to the counts of the window.                                           | the digest of the observations, `lib/observations.ts` — a field of the digest counted next to the window counts |
| The block is counted from the first day of the calendar month to the day of the run, both in universal time. | the reading of the day files, `lib/observations.ts` — a second stretch read from the first day of the month     |
| The block names its month and the day it was counted through.                                                | the digest, `lib/observations.ts` — the two fields of the block                                                 |
| A usage line stands for every resource loaded at least once over the month, and for nothing else.            | the counting of the block, `lib/observations.ts`                                                                |
| All the counts of a line are counted over the window of the block.                                           | the counting of the block, `lib/observations.ts` — loads, sessions and refusals from the same lines             |
| A session with a resource is counted once, however many times the session loaded it.                         | the counting of the block, `lib/observations.ts` — distinct session signs per resource                          |
| The kind of a resource is judged by the catalog of the laid-out edition, and the set of kinds is closed.     | the cargo of the digest, `lib/shipment.ts` — the kind from the catalog entry, `lib/catalog.ts`                  |
| The tree's own skills leave as one line, without names.                                                      | the cargo of the digest, `lib/shipment.ts` — the same place that drops own names from the window counts today   |
| An empty month leaves as an empty block, not as no block.                                                    | the cargo of the digest, `lib/shipment.ts`                                                                      |
| The observations of the current month are kept until the month is over.                                      | the sweep of old files, `lib/observations.ts` — the keeping term against the length of a month                  |
| The digest prints the block, and the numbers on the screen of the intake are checked against that print.     | the print of the digest, `bin/agent-kit.ts` — the text and the machine-readable output                          |
| The check for a tree address covers the block on a par with the rest of the digest.                          | the check of the cargo for a tree address, `lib/shipment.ts` — it walks the digest whole, the block included    |

The form of the cargo is declared once for both sides, `lib/cargo.ts`: the block is added to the type
of the digest there, and the intake reads it from the same declaration.

- **Scenario** — Test
- **`SC-AK-1094`** — `lib/observations.spec.ts`
- **`SC-AK-1095`** — `lib/observations.spec.ts`
- **`SC-AK-1096`** — `lib/observations.spec.ts`
- **`SC-AK-1097`** — `lib/observations.spec.ts`
- **`SC-AK-1098`** — `lib/observations.spec.ts`
- **`SC-AK-1099`** — `lib/shipment.spec.ts`
- **`SC-AK-1100`** — `lib/shipment.spec.ts`
- **`SC-AK-1101`** — `lib/shipment.spec.ts`
- **`SC-AK-1102`** — `lib/observations.spec.ts`
- **`SC-AK-1103`** — `lib/commands.spec.ts`
- **`SC-AK-1104`** — `lib/shipment.spec.ts`
