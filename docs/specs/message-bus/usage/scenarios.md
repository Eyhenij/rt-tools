# Scenarios — usage of the rules in the sessions of the trees

The largest number issued in the domain is 336; the numbers continue it and do not change after the
merge. The numbers `SC-MB-327`…`SC-MB-336` were issued by a discarded version of this agreement and
stay empty.

### SC-MB-337 — a line lands as a row of its own

Given the observation cargo of two days with four lines
When the intake takes it in by the tree token
Then four rows lie in the storage with the tree, the working copy sign, the day, the event, the
resource, the kind of the skill and the session sign of each line, and the answer names two days and
four rows

Covered: `libs/message-bus-api/observations/feature/src/lib/observations-intake.controller.spec.ts`, `libs/message-bus-api/observations/data-access/src/lib/observation.queries.spec.ts`, `libs/message-bus-api/observations/util/src/lib/observation-cargo.util.spec.ts`.

### SC-MB-338 — a day of one working copy is replaced whole

Given three rows of a day of a copy lie in the storage
When the same copy sends the same day with two lines
Then two rows of that day lie in the storage and none of the former three

Covered: `libs/message-bus-api/observations/feature/src/lib/observations-intake.controller.spec.ts`, `libs/message-bus-api/observations/data-access/src/lib/observation.queries.spec.ts`.

### SC-MB-339 — a day of another working copy is not touched

Given rows of a day of copy A lie in the storage
When copy B of the same tree sends the same day
Then the rows of copy A lie as they were, and the rows of copy B lie next to them

Covered: `libs/message-bus-api/observations/feature/src/lib/observations-intake.controller.spec.ts`, `libs/message-bus-api/observations/data-access/src/lib/observation.queries.spec.ts`.

### SC-MB-340 — an unknown event kind refuses the cargo whole

Given the cargo of one day with a load and a line of the event `unknown`
When the intake takes it in
Then the intake refuses with `400` naming the day and the place of the line, and no row of the cargo
lands

Covered: `libs/message-bus-api/observations/feature/src/lib/observations-intake.controller.spec.ts`, `libs/message-bus-api/observations/util/src/lib/observation-cargo.util.spec.ts`.

### SC-MB-341 — more lines than the cap refuses the cargo without a row

Given the cap of lines is ten and the cargo carries eleven
When the intake takes it in
Then the intake refuses with `413` naming the cap and eleven, and no row lands

Covered: `libs/message-bus-api/observations/feature/src/lib/observations-intake.controller.spec.ts`, `libs/message-bus-api/observations/util/src/lib/observation-cargo.util.spec.ts`.

### SC-MB-342 — the nightly cleaning removes rows older than a year and writes a line per tree

Given rows of two trees older than a year and rows of today
When the cleaning of the keeping term runs
Then the old rows are gone, the rows of today stay, and the journal holds one line per tree with
the count of the removed

Covered: `libs/message-bus-api/observations/feature/src/lib/observation-retention.service.spec.ts`, `libs/message-bus-api/observations/data-access/src/lib/observation.queries.spec.ts`, `libs/message-bus-api/observations/util/src/lib/observation-retention.util.spec.ts`.

### SC-MB-343 — the usage of a tree over a period counts loads, sessions and refusals per skill

Given the rows of a tree: the rule `testing` loaded three times by two sessions and refused by the
gate once, the pattern `git-workflow-commit` loaded once, and a load of another tree
When the usage is read for the tree over the period of the rows
Then two rows come back: `testing` — rule, three loads, two sessions, one refusal — first, and
`git-workflow-commit` — pattern, one load, one session, no refusal — second; the other tree's load is
absent

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`, `libs/message-bus-api/observations/util/src/lib/usage-period.util.spec.ts`.
Покрытие: частичное — the text of the grouped query is probed on a one-off database by hand. The end-to-end spec of the section reads it over seeded rows.

### SC-MB-344 — a period longer than four hundred days is refused

Given a period of four hundred and one days
When the usage is read
Then the reading refuses with `400` naming the limit

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`, `libs/message-bus-api/observations/util/src/lib/usage-period.util.spec.ts`.

### SC-MB-345 — the sessions of a skill come by day, newest first

Given the rule `testing` loaded by session `1` twice on the twelfth and by session `2` once on the
thirteenth
When the sessions of `testing` are read over the period
Then two rows come back: the thirteenth, `2`, one — first; the twelfth, `1`, two — second

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`.
Покрытие: частичное — the text of the grouped query is probed on a one-off database by hand. The end-to-end spec of the section reads it over seeded rows.

### SC-MB-346 — the reading is closed by the right of the usage

Given an account with the right of the digests and without `usage:read`
When it reads the usage
Then the reading refuses with `403`

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`.

### SC-MB-347 — an empty period answers with an empty page

Given a tree with no rows over the period
When the usage is read
Then an empty page with a zero total comes back with `200`

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`.

### SC-MB-348 — the section shows a row per skill for the chosen tree and period

Given a person with `usage:read` and the rows of the stand
When they open the section «Использование» and choose the tree
Then the table shows a row per skill with the kind by a word of the domain, the loads, the sessions
and the refusals, the most loaded first

Covered: `apps/message-bus-admin-e2e/src/usage-section.spec.ts`.

### SC-MB-349 — a change of the period re-reads the table, and the former rows stay dimmed meanwhile

Given the table of a tree is shown
When the person narrows the period to one day
Then the table shows the rows of that day only, and while the reading went the former rows stood
dimmed under the sign of reading

Covered: `apps/message-bus-admin-e2e/src/usage-section.spec.ts`.

### SC-MB-350 — a row opens the panel of the sessions of its skill

Given the table of a tree is shown
When the person opens the row of `testing`
Then the panel «Сессии» opens with `testing` in its heading and a row per day and session with how
many times

Covered: `apps/message-bus-admin-e2e/src/usage-section.spec.ts`.

### SC-MB-351 — a person without the right sees no section

Given a person with the right of the digests and without `usage:read`
When they open the admin application
Then the row of the sections holds no «Использование», and the address of the section answers with
the refusal of the shell

Coverage: partial — the right closes the section and the route by calls in `libs/message-bus-admin/auth/shell/src/lib/section-access.spec.ts` and `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.spec.ts`; the stand has one account, with every right.

### SC-MB-352 — an empty period draws the empty state of the base

Given the table of a tree is shown
When the person chooses a period with no rows
Then the table shows the empty state of the base and no message of the bus

Covered: `apps/message-bus-admin-e2e/src/usage-section.spec.ts`.

### SC-MB-353 — a period the request did not name is the last thirty days of the receiver

Given a request with a tree and no `from` and `to`
When the usage is read
Then the receiver counts the last thirty days by its own clock, today inclusive. The answer names
both days. One day of the two is refused with `400`

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`,
`libs/message-bus-api/observations/util/src/lib/usage-period.util.spec.ts`.

### SC-MB-354 — the usage answers a page in the order asked

Given the rows of a tree over a period
When the usage is read with `page`, `size`, `sort` and `dir`
Then the page comes back with the total of skills, in the order of the named field, equal ones by
name. A field outside `loads`, `skill`, `sessions`, `denials` is refused with `400`

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`.

### SC-MB-355 — the digest carries every day of the period, zeros where no row lies

Given a period of four days with rows on the second only
When the digest is read
Then four day rows come back in the order of the days, the second with its numbers and the rest
with zeros

Covered: `libs/message-bus-api/observations/util/src/lib/usage-digest.util.spec.ts`.

### SC-MB-356 — the digest of a tree over a period: the days, the kinds, the two tops

Given the rows of a tree over a period
When the digest is read
Then the answer names the period, the days with zeros filled, the loads by kind, five skills by
loads descending and five by refusals descending — each list without those with none; the reading
is closed by `usage:read`

Covered: `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts`.
Покрытие: частичное — the text of the grouped queries is probed by the end-to-end spec of the section over seeded rows.

### SC-MB-357 — the section shows the digest of the period above the table

Given a person with `usage:read` and the rows of the stand
When they open the section and choose the tree and the period of the rows
Then above the table stand a bar per day of the period, the list of the top skills with the most
loaded first, the list of the kinds and the list of the refusals

Covered: `apps/message-bus-admin-e2e/src/usage-section.spec.ts`, `libs/message-bus-admin/usage/util/src/lib/usage-digest.logic.spec.ts`.

### SC-MB-358 — the quick period puts the pair of days into the address

Given the table of a tree is shown
When the person presses «7 дней»
Then the address holds the last seven days ending today, the day pickers show them, and the table
and the digest re-read

Covered: `apps/message-bus-admin-e2e/src/usage-section.spec.ts`, `libs/message-bus-admin/usage/util/src/lib/usage-digest.logic.spec.ts`.
