# Grill

## The owner request

> заведи задачу исправляй тест и открывай пр

Said after the question «так падает какой-то тест?» about PR #3115: the pipeline of that PR went
red three times in a row, twice on the end-to-end suite of the admin panel.

## What is already in the tree

- `apps/message-bus-admin-e2e/src/markup-text.spec.ts` — the suite of the markup display; one of
  its tests falls in a run, each time another: SC-MB-209, SC-MB-217 (run 42031108766), SC-MB-221
  (run 41980840054 of another branch). The other 146 tests pass.
- `apps/message-bus-admin-e2e/src/support/admin.ts:openSection` — the helper every test of the
  suite starts with: the section address, the sign-in on the realm form, the wait for the table.
  All three falls stand on its last line: the table is not visible within 10 seconds.
- The tests of this file take about a second each; the fallen one takes 10.7 seconds — exactly the
  wait for the table.

## Questions and answers

Closed by assumption, the owner gave the order in one line:

- **Does the task change the behaviour** — not of the product: the suite is the subject. If the
  cause lies in the admin panel itself, that is named as a decision along the way.
- **One task or several** — one: the same fall in one file.
- **What is not part of the task** — the visual difference of the first kit seen in the first
  attempt of run 42031108766: another step, another cause.
- **What shows the task is closed** — the markup suite repeated many times on the stand passes
  without a fall.

## Decisions

- **The cause is looked for by a reproduction on the stand, not guessed from the log.** The log
  of the pipeline holds no frame and no trace: they stay on the runner.
