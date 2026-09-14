# Observation lines leave for the intake — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about. The paths are from the root of the
tree.

- **Every line of the window leaves, of every event kind.** — `projects/agent-kit/src/lib/observations-cargo.ts:parseObservationLine` — the four kinds are the closed list `OBSERVATION_EVENTS` of the cargo module
- **The lines leave grouped by day, and a day leaves whole.** — `projects/agent-kit/src/lib/observations-cargo.ts:readObservationDays` — one entry per day file of the window, the lines of the file whole
- **The cargo names the working copy it left from, by a checksum of its root.** — `projects/agent-kit/src/lib/observations-cargo.ts:originOf`
- **A load names the kind of its skill.** — `projects/agent-kit/src/lib/observations-cargo.ts:skillKindOf` — the kind by the layout the send reads, `own` for a name the layout does not carry
- **A line leaves as it lies, and nothing is added to it but the kind.** — `projects/agent-kit/src/lib/observations-cargo.ts:linesOfDay` — the kind is added to a load only
- **A broken line does not leave and does not stop the cargo.** — `projects/agent-kit/src/lib/observations-cargo.ts:parseObservationLine` — `null` for a broken or foreign line, and the reader skips it
- **The cargo goes by the same request as the rest, with the tree token, and only by a command.** — `projects/agent-kit/src/lib/shipment.ts:shipmentsOf` — the fourth shipment next to the digest, sent by the same command
- **The check for a tree address covers the observation cargo.** — `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo` — the lines are walked on a par with the digest
- **The schema version of the cargo rises.** — `projects/agent-kit/src/lib/cargo.ts:CARGO_SCHEMA_VERSION`
- **The dry run names the observation cargo with the number of lines and days.** — `projects/agent-kit/src/lib/shipment.ts:describe` — the line `observations — строк N за D дн.`

The form of the cargo is declared once for both sides, `projects/agent-kit/src/lib/cargo.ts`: the
intake reads `IObservationsCargo` from the same declaration.

- **Scenario** — Test
- **`SC-AK-1094`** — `projects/agent-kit/src/lib/observations-cargo.spec.ts`
- **`SC-AK-1095`** — `projects/agent-kit/src/lib/observations-cargo.spec.ts`
- **`SC-AK-1096`** — `projects/agent-kit/src/lib/observations-cargo.spec.ts`
- **`SC-AK-1097`** — `projects/agent-kit/src/lib/observations-cargo.spec.ts`
- **`SC-AK-1098`** — `projects/agent-kit/src/lib/observations-cargo.spec.ts`
