# The work result on the screen «Качество» — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

## The intake

- **A day line with the new keys is taken in, and a line without them is taken in too.** — `libs/message-bus-api/observations/util/src/lib/metrics-day.util.ts:parseMetricsDay` — every key is judged by the package list, none is demanded
- **The closed key list of the receiver is the list of the package, and the receiver goes out first.** — `projects/agent-kit/src/lib/cargo.ts:isMetricKey` — the receiver reads the list from the package cargo module; the order of the rollout is held by the owner's rollout, not by code
- **A pair key is judged by its two halves.** — `projects/agent-kit/src/lib/cargo.ts:METRIC_PAIR_KEYS` — a pair key passes when each half passes the resource name form
- **An epic window is taken in by an operation of its own, by the tree token.** — `libs/message-bus-api/observations/feature/src/lib/epic-window-intake.controller.ts:EpicWindowIntakeController` — `POST intake/epic-windows` under `@TreeOperation()`
- **An epic window replaces the stored one of its tree, copy, epic and opening moment.** — `libs/message-bus-api/observations/data-access/src/lib/epic-window.queries.ts:writeEpicWindow` — a newer stamp replaces, an older one changes nothing
- **The moments of a window are judged as the day of a line is.** — `libs/message-bus-api/observations/util/src/lib/epic-window.util.ts:parseEpicWindow` — the field named by the refusal `epic-window-field-refused`
- **The numbers of a window are whole numbers.** — `libs/message-bus-api/observations/util/src/lib/epic-window.util.ts:parseEpicWindow`
- **A window carries the moments of the merge and of the release of its epic, and the screen judges «выпущен» by the end of the shown period.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityEpicWindowsOf`
- **An epic window is kept a year from its opening, as a day line, and the night cleaning removes older ones.** — `libs/message-bus-api/observations/data-access/src/lib/epic-window.queries.ts:sweepEpicWindowsBefore` — called by `libs/message-bus-api/observations/feature/src/lib/observation-retention.service.ts:ObservationRetentionService`

## The section

- **The menu item «Качество» stands right after «Разборы происшествий».** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU`
- **The code of the screen waits for a mockup the owner approved.** — Not checked: the approval lives in the owner's words, and the code has nothing to hold it by
- **The tiles of the section and how each sums the day lines of the period.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityResultOf`; the tiles — `libs/message-bus-admin/usage/util/src/lib/quality-result.logic.ts:qualityResultTiles`
- **«0 из 0» changes the line "A tile with nothing to count says there is no data" of the usage spec for «Принято с первого раза» only.** — `libs/message-bus-admin/usage/util/src/lib/quality.logic.ts:firstPassTile`
- **A value missing from a line is not a zero.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityResultOf` — a tile sums only the lines that carry its key and counts the rest
- **The milestone G is shown per day of the period.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityMilestonesOf`; the rows — `libs/message-bus-admin/usage/util/src/lib/quality-result.logic.ts:qualityMilestoneRows`
- **The block «Подряд» lists the pairs of the period, the most frequent first, by both names.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityPairsOf`
- **The table of drivers keeps its loss columns on `guardRefusals` and gains the column «Отказов на сто вызовов».** — `libs/message-bus-api/observations/util/src/lib/quality.util.ts:per100Of`
- **The epic windows of the period stand in a block of their own, the latest first.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityEpicWindowsOf`; the rows — `libs/message-bus-admin/usage/util/src/lib/quality-result.logic.ts:qualityWindowRows`
- **A window belongs to the period when its stretch overlaps the period; an open window runs up to now.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityEpicWindowsOf`
- **A tree narrows the new numbers and the windows as it narrows the result metrics; a version narrows the numbers and leaves the windows whole.** — `libs/message-bus-api/observations/util/src/lib/quality-result.util.ts:qualityEpicWindowsOf` — the windows take the tree only
- **The section stays under the right `quality:read`.** — `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts:UsageReadController` — `GET quality` under `@RequiresRight('quality:read')`
