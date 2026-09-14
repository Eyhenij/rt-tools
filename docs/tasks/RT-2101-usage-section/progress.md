# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — the section of the admin application
- **Done:** stage 1 — `from`/`to` in the shared list query, `readPage` and `changePeriod`; `GET /api/usage` answers a page with the period counted; `USAGE_SORTABLE` in the common lib; the agreement texts brought up to it.
- **Next step:** the period filter in the core ui, the libs of the section, the menu item, the routes, the labels.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no — autonomous session.
- **PR:** not open; nothing leaves during the night.

## Decisions along the way

- **Two scenarios of the receiver added — `SC-MB-353`, `SC-MB-354`.** The default period and the page are promises of the reading, and the section scenarios `SC-MB-348`, `SC-MB-349` name a person; a unit test under their number would promise the end-to-end path it does not walk.
- **The usage page asked extends the page asked whole, tree slug included.** The storage key stands next to it; dropping the slug field would need a second type for one list.
- **The total of the page is a window count in the same query.** A second query for the count would answer about another list.

## Sessions

### 2026-09-14

- The folder written; the branch taken from `RT-2100-usage-read`.
- Stage 1 done: the tests of the core util, the core data-access, the core feature, the observations feature and util, the common lib are green; `check:specs`, `check-doc-paths`, `check-glossary` name no divergence.
