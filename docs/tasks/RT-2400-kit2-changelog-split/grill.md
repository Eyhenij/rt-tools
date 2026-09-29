# Grill

## The owner request

> я вмержил изменения в ui-kit v2, опубликуй новую версию

The release 0.13.0 grew the second kit's changelog to 538 lines against the limit of 500, and the
push gate of every branch turned red. Asked where to fix it, the owner answered:

> Отдельная задача в main (Recommended)

## What the tree already has

- `tools/changelog-split.mjs` moves the old releases of a changelog into a file named by the
  version range and keeps half the limit in the live file.
- The release of another package calls it right after the changelog is written; the release of
  the second kit does not.
- Samples of the moved-out part: `projects/agent-kit/CHANGELOG-0.9.0-0.17.0.md`,
  `projects/ui-kit/CHANGELOG-0.1-0.3.md`.

## What the rules already say

- The file length limit is 500 lines for code and text alike; a grown file is split, not added to
  the allowlist.

## Questions and answers

**Where to fix the changelog that blocks every push?**
Отдельная задача в main (Recommended) — split the changelog by the same command as the other
package, and add the split to the second kit's release so the next release does not repeat it.

## Decisions

- **The split goes by the existing command, not by hand** — the same cut as the other package.
  Rejected: an allowlist line — the check names it as forbidden.

## What is left unclear

- none
