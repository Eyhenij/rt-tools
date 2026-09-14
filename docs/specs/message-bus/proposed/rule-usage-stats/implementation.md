# The binding — usage of the rules over a month, the receiving side

There is no code yet: the lines name the place foreseen for every rule, and the addresses are filled
in by the work and checked by the spec audit at the merge. The paths are from the root of the tree.

| Rule                                                                                                                                     | Where it is foreseen                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| A digest without the month block is taken in as before.                                                                                  | the list of the mandatory fields of the digest, `libs/message-bus-api/observations/util/src/lib/summary.const.ts` — the block is not added to it |
| The intake does not take the block apart.                                                                                                | the intake of the digest, `libs/message-bus-api/observations/feature/src/lib/summary-intake.controller.ts` — the digest lands whole, as today    |
| The block replaces the former one together with the digest.                                                                              | the writing of the record of a month, `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts` — the same replacement     |
| The table of usage is drawn from the block of the record itself, not by a second request.                                                | the mapper of the record, `libs/message-bus-admin/summaries/util/src/lib/month-record.mapper.ts` — the block is taken apart next to the text     |
| A record without the block draws no table.                                                                                               | the view of the record, `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/` — the section is drawn on a block alone                 |
| A block without lines draws the table with one line saying that nothing was loaded over the month.                                       | the view of the record, `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/`                                                         |
| A row of the table shows the resource, its kind, the loads, the sessions and the refusals, and the rows go in descending order of loads. | the model and the mapper of the record, `libs/message-bus-admin/summaries/util/src/lib/` — the rows as they arrived, no sorting on the screen    |
| The line of the own stands last, whatever its loads.                                                                                     | the mapper of the record, `libs/message-bus-admin/summaries/util/src/lib/month-record.mapper.ts`                                                 |
| The kind is shown by a word of the domain, not by the word of the cargo.                                                                 | the labels of the application, `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts` — a label per kind                              |
| The month of the block is shown at the section when it differs from the month of the record.                                             | the view of the record, `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/`                                                         |
| The day the block was counted through stands under the heading of the section.                                                           | the view of the record, `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/`                                                         |
| The table is the table of the kit, and the section is the section of the kit.                                                            | the view of the record, `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/` — the kit's table and aside section                     |
| The table stands under the same right as the record.                                                                                     | the reading of a record, `libs/message-bus-api/observations/feature/src/lib/summaries-read.controller.ts` — the right of the digests, unchanged  |
| The numbers of the table are checked against the print of the digest at the tree.                                                        | held by the acceptance of the work, not by code: a live run from a tree against the stand; no anchor is foreseen                                 |

- **Scenario** — Test
- **`SC-MB-327`** — `libs/message-bus-api/observations/feature/src/lib/summary-intake.controller.spec.ts`
- **`SC-MB-328`** — `libs/message-bus-api/observations/feature/src/lib/summary-intake.controller.spec.ts`
- **`SC-MB-329`** — `apps/message-bus-admin-e2e/src/` — a spec of the section of the digests
- **`SC-MB-330`** — `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/` — the spec of the view
- **`SC-MB-331`** — `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/` — the spec of the view
- **`SC-MB-332`** — `libs/message-bus-admin/summaries/util/src/lib/month-record.mapper.spec.ts`
- **`SC-MB-333`** — `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/` — the spec of the view
- **`SC-MB-334`** — `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/` — the spec of the view
- **`SC-MB-335`** — `libs/message-bus-admin/summaries/ui/src/lib/month-record-view/` — the spec of the view
- **`SC-MB-336`** — `libs/message-bus-api/observations/feature/src/lib/summaries-read.controller.spec.ts`
