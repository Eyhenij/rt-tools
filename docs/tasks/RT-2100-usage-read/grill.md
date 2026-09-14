# Grill

Epic RT-2097, task 3 of 4. The owner's request and answers stand in the record of RT-2098 in the
archive and in the epic plan; here — what this task adds.

## The owner request

> рализуй модуль аналитики полностью без остновок и вопросок, все примеры я тебе дал, работай автономно врежиме ночной работы

## What the tree already has

- **The agreement of the receiving side** — `docs/specs/message-bus/proposed/rule-usage-stats/`: the reading rules, `GET /api/usage` and `GET /api/usage/:skill/sessions`, the right `usage:read`, scenarios `SC-MB-343`…`SC-MB-347` for this task.
- **The rows** — the table `observation` with the indexes by "tree — day", written by RT-2099.
- **The sample of a read operation** — `libs/message-bus-api/observations/feature/src/lib/summaries-read.controller.ts`: `@RequiresRight`, the query checked by a pure function, the refusal with the parameter named; its spec with a hand-written storage double and the access marks read from the decorators.
- **The closed set of rights** — `libs/message-bus-common/src/lib/rights.ts`; the owner role gets a new right by a migration, as `prisma/migrations/20260910100000_grant_rights_to_existing_accounts` did; the stand seed names the rights by hand in `apps/message-bus-admin-e2e/stand/seed-account.mjs`.
- **A raw query of the storage** — `$queryRaw` is used by the liveness probe only; the tree has no sample of a grouped raw query.

## What the rules already say

- `access-rights` spec — the rights are given by the same change that closed the operations: the migration grants the new right to the owner role.
- `testing` — a decision is moved into a pure function and checked by a call; a procedure is checked with a storage double; a test that does not follow the user's path is partial coverage.
- `typescript-conventions` — a storage aggregate is not annotated with its own type.

## Questions and answers

None asked: the session is autonomous, and the owner's answers on the design lie in the agreement.

## Decisions

- **The usage is counted by a raw grouped query of the storage.** The storage client's grouping cannot count distinct sessions; the agreement says the storage counts, not the rows in memory. Nobody to ask: autonomous session. Cost of a mistake: one query rewritten on the client's grouping.
- **The SQL itself is confirmed by the stand, not by the double.** The controller spec checks the decision — the period, the right, the tree, the empty answer, the bindings handed to the query; the numbers of the query are read by the end-to-end spec of the section in RT-2101 over seeded rows. Cost of a mistake: a wrong count seen one task later.
- **The kind of a skill with refusals and no load is "rule".** A refusal of the rules gate is always about a rule; the row carries no kind, and an empty cell would read as unknown. Cost of a mistake: one word in the mapping.
- **The tree is named by its sign, as the list of the digests names it.** `?tree=<slug>`; an unknown sign answers `404`. Cost of a mistake: one parameter.

## What is left unclear

- Whether the sessions of a skill should be paged. A skill over a year has hundreds of sessions at most; the list goes whole, and paging is one parameter when asked.
