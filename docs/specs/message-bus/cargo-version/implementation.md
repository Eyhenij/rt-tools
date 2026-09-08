# The column, the filter and the order by the version — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The version of the release is visible as a column at the analyses and at the proposals.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:IPostmortemListRow`
- **The column of the version stands after the column of the state and is in the set by default.** — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.columns.ts:POSTMORTEMS_COLUMNS`
- **At a record without a version the cell is empty.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:IProposalListRow`
- **The column of the version stays in the setting of the columns on a par with the rest.** — `libs/message-bus-admin/proposals/util/src/lib/proposal.columns.ts:PROPOSALS_COLUMNS`
- **The filter by version is put into the page by the section, the page does not know it itself.** — `libs/message-bus-admin/postmortems/feature/list/src/lib/admin-postmortems-list.component.ts:AdminPostmortemsListComponent`
- **The filter by version stands third in the strip, to the right of the filter by state.** — `libs/message-bus-admin/proposals/feature/list/src/lib/admin-proposals-list.component.ts:AdminProposalsListComponent`
- **The filter by version is at the sections of the analyses and of the proposals and only at them.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:AdminListScreenBase`
- **The filter lists the versions that met, not all the possible ones.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-versions.controller.ts:CargoVersionsController`
- **The first item of the filter is "все версии", the second "без версии".** — `libs/message-bus-common/src/lib/cargo-page.ts:CARGO_VERSION_NONE`
- **The filter by version lives in the address of the section on a par with the page, the size, the order and the other filters.** — `libs/message-bus-admin/common/core/util/src/lib/list-query.ts:listQueryParams`
- **The filter by version adds up with the filter by tree and with the filter by state.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:whereOf`
- **A chosen version resets the list to the first page.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:changeVersion`
- **A version that is not in the list of the versions is sent to the intake as it is and gives back an empty list.** — `libs/message-bus-common/src/lib/cargo-page.ts:cargoVersionFault`
- **A list empty by the filter of the version explains that by the filter.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:narrowed`
- **The version of the release is a sortable field at the analyses and at the proposals.** — `libs/message-bus-common/src/lib/sortable.ts:POSTMORTEM_SORTABLE`
- **The order by version goes by the numbers of the parts, not by the letters of the string.** — `libs/message-bus-common/src/lib/release-version-order.ts:compareReleaseVersions`
- **A version that was not taken apart by numbers stands at the end of the order, and among themselves such ones go by the alphabet.** — `libs/message-bus-common/src/lib/release-version-order.ts:releaseVersionKey`
- **The records without a version in the order by version go last at an ascending order and first at a descending one.** — `libs/message-bus-common/src/lib/release-version-order.ts:releaseVersionPageIds`
- **The second key of the order stays the former one — the identifier of the record.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:byColumn`
