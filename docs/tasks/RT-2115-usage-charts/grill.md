# Grill

Epic RT-2097, task 5 — added after the four planned ones: the owner looked at the section and
named what the sample has and the section lacks.

## The owner request

> открывай аналитику в образце в браузере и описывай что ты видишь там

> там есть графики а у тебя графиков нет! если … не можешь скопировать решение из примера который я тебе предоставил …

## What the tree already has

- **The section** — `libs/message-bus-admin/usage/`: the table of skills on the common list base, the period filter of two day pickers, the panel of sessions. Charts were written out of scope by the night session as "the word of the owner" — that was a misreading: the owner's word was about a digest over several trees, not about charts.
- **The sample** — the analytics screen of the neighbouring tree of the same make: a toolbar with a period toggle group and a live badge; a grid of cards `repeat(auto-fit, minmax(280px, 1fr))`; a wide card with a bar chart by buckets — CSS bars scaled to the maximum of the window, a title on each bar, 160px high; a funnel card; four "top-N" cards on `rt-bar-list`. The chart bars are built by a pure function; the top rows by another, share counted from the leader.
- **The kit pieces** — `rt-bar-list` and `rt-toggle-button-group` lie in `projects/ui-kit-v2/src/lib/components/`; both applications draw from this very kit.
- **The reading** — `GET /api/usage` answers a page; the page changes with the sort and the page number, so a digest of the period does not belong in it.
- **The slots of the shared list page** — `adminListAboveTable` for what concerns the whole list.

## What the rules already say

- `reuse-first` — the ready-made is taken first: the kit's bar list and toggle group, not own markup.
- `lists` — the place above the table is the slot of the shared page for what is said about the whole list.
- `styling-bem` — the layout of a screen lives in the shared layer `apps/message-bus-admin/src/styles/`, not in the component's styles.
- `testing` — a decision is a pure function checked by a call; what a person sees is closed by an end-to-end test; the current moment is a parameter.
- `spec-driven` — the agreement of a subdomain in force is edited in place; new scenarios take the next free numbers.

## Questions and answers

None asked: the owner named the sample and the gap, and the sample is readable in code.

## Decisions

- **The digest of the period is an operation of its own, `GET /api/usage/digest`.** The page changes with the sort and the page number, the digest does not; a digest inside the page would be read anew on every sort. Rejected: fields on the page.
- **The digest carries four lists: the days, the kinds, the top by loads, the top by refusals.** The days are every day of the period, zeros filled by the receiver: the chart draws a bar per day. The two tops are rows of the table, five each, counted by the same grouped query with a page of five.
- **The chart is CSS bars, as in the sample.** No charting library: the sample draws with bars scaled to the maximum, and the kit has no chart component.
- **The quick period is a toggle group of 7 / 30 / 90 days next to the day pickers.** The days are counted from the screen's today by a pure function with the moment as a parameter; the pair lands in the address as any pick of the period.
- **The layout of the digest goes into the shared styles layer as the block `admin-digest`.** As the rule demands for a screen outside the kit.

## What is left unclear

- Whether the digest should compare with the equal period before, as the sample does with its "previous" totals. Out of scope by the spec; not started here.
