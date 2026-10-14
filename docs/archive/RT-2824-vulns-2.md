# Grill

## The owner request

> заведи эпик на оставшиеся уязвимости

Then: «делай всё сам, не останавливайся». This is the second of three tasks of the epic RT-2822.

## What the tree already had

- Prisma 7.10.0 is the last release of line 7; the next one is only the 8.0.0 prerelease. It holds `mysql2` at exactly 3.15.3 and `@prisma/config` holds `deepmerge-ts` at exactly 7.1.5.
- The audit asked for `mysql2` 3.23.1 (two records) and `deepmerge-ts` 8.0.0 (one record, a major release that ships only as ES modules).

## Decisions

- **The fix is two overrides, Prisma is not touched.** No newer release of line 7 exists, and Prisma 8 is outside the epic.
- **The result:** `mysql2` resolved to 3.24.5 and `deepmerge-ts` to 8.0.2, the client generates at install, and the audit went from 7 records to 4. The four left are `braces`, `sprintf-js` and `quill` (no fixed version) and `webpack-dev-middleware` (the last task).
