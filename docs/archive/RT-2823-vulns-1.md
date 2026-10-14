# Grill

## The owner request

> заведи эпик на оставшиеся уязвимости

Then: «делай всё сам, не останавилвайся». This is the first of three tasks of the epic RT-2822.

## What the tree already had

- The `overrides` block of the workspace settings already pinned axios, shell-quote, brace-expansion and others; the audit still reported 52 records on 20 packages.
- Fixed versions exist for axios 1.20.0, brace-expansion 1.1.21 and 2.1.7, compression 1.8.2, fast-uri 3.1.8, handlebars 4.7.10, joi 17.13.8, shell-quote 1.11.0, undici 7.29.1, http-cache-semantics 4.3.0 and probe-image-size 7.4.0.
- `braces` (latest 3.0.3) and `sprintf-js` (latest 1.1.3) have no fixed version: the advisories ask for a number the registry does not hold.

## Decisions

- **The task takes only packages that have a fixed version.** The owner chose it for the epic: «Не трогать, записать в план».
- **The check is the audit before and after, plus the checks before a push.** The owner chose: «pnpm audit до и после плюс проверки перед отправкой (Recommended)».
- **The fixes are overrides, not edits of the direct dependencies.** All ten packages are transitive, and the tree already keeps such substitutions in one list.
- **The result:** the audit went from 52 records to 7, and none of the ten packages of the task is left. The seven left are `braces`, `sprintf-js` and `quill` (no fixed version), `mysql2` and `deepmerge-ts` (the next task of the epic), `webpack-dev-middleware` (the last one).
