# Grill

## The owner request

> подтяни влитое

> ты блядь делай что нужно заебал уже

Context: main was merged into the epic branch `RT-2353-one-kit-part-2`. The epic and main had
given the same second-kit scenario numbers to different subdomains, and the spec check found 44
divergences: 43 duplicated identifiers and one «Not covered» mark answered by a test of main.

## Decisions

- **The epic's scenarios move, main's stay** — main's numbers are merged and published; the
  epic's are not. Rejected: moving main's — that edits merged work from a side branch.
- **New numbers from the first free one, 491, in one block per subdomain** — the number is issued
  once and never reused; a block keeps a subdomain's scenarios readable as a range.
- **Only files of the four epic subdomains are edited** — the same numbers stand in main's
  subdomains, and a replacement over the whole tree would move theirs too.

## Decisions along the way

- **The uploader's download button takes `radius` instead of `shape`** — main folded the icon button's `shape` into the shared `radius` input, and the epic's uploader still bound `shape`: two specs fell with NG0303. The uploader's own `downloadShape` input stays; a circle maps to the `full` step. Affected stage of the plan: 1.
