# The work result on the screen «Качество»

**Status:** in force · **Revision:** 17 November 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `message-bus/usage` (the section and the day line), `message-bus/admin-shell` (the menu), `agent-kit/work-result`
**Laws:** `lists`, `navigation`, `access`, `entity-models`, `delivery`, `mockups`
**Procedures:** none — the operations are declared by the controllers of the intake

The receiver half of the work result: the intake and storage of the epic windows and the numbers of
the result on the screen «Качество». It stands next to `usage`, which holds the section itself and
the day line: merged into it, the spec would cross the length limit. What the numbers mean and how a
tree counts them is the package subdomain `docs/specs/agent-kit/work-result/`.

## Why

The owner asked to see the result of the work in the receiver, beside the incident analyses,
without running a command on a machine. The receiver stores day lines and shows three result
metrics; the numbers of the result and the epic windows have no place there yet.

## Terminology

- **A result number** — a value of a day line the package subdomain names in its key table.
- **An epic window** — the record of one window of one epic as the package subdomain defines it: the
  tree, the copy sign, the epic number, the opening and the closing moment, calls, refusals,
  re-asks, merged, released, the minutes of the epic from taking and the stamp of its building.
- **A moment** — a time in UTC written `YYYY-MM-DDTHH:MM:SSZ`.

### What it is called in the interface

| In the spec                  | On the screen                                            |
| ---------------------------- | -------------------------------------------------------- |
| the section                  | «Качество», right after «Разборы происшествий» in the row |
| the epic of a window         | «эпик 3227»                                              |
| a released epic              | «выпущен»                                                |
| an epic merged, not released | «не выпущен»                                             |
| an open window               | «открыто»                                                |
| the milestone of a day       | «Веха G» with «достигнута», «не достигнута» or «вызовов нет» |
| the pairs of refusals        | the block «Подряд»                                       |
| the epic windows             | the block «Окна эпиков»                                  |

## Rules

**The intake.**

- **A day line with the new keys is taken in, and a line without them is taken in too.** A line of
  an older edition of the package carries none of the new keys and is not refused for it.
- **The closed key list of the receiver is the list of the package, and the receiver goes out first.**
  A line with a key the receiver does not know is refused whole, so a tree on the new edition sending
  to an old receiver loses its days.
- **A pair key is judged by its two halves.** `refusalPairs:<first>:<second>` is taken in when each
  half passes the resource name form; any other key keeps one name after the base.
- **An epic window is taken in by an operation of its own, by the tree token.** It crosses days, and
  a day line replaced by its day would split it.
- **An epic window replaces the stored one of its tree, copy, epic and opening moment.** A tree
  sends a window again while its epic is not released; an older stamp is refused with
  `metrics-stale` and changes nothing, as for a day line.
- **The moments of a window are judged as the day of a line is.** The opening is a moment; the
  closing is a moment after the opening or absent for an open window; neither is later than the
  stamp. A moment outside that form refuses the record with `epic-window-field-refused`, and the code
  names the field.
- **The numbers of a window are whole numbers.** The epic is a whole number above zero; calls,
  refusals, re-asks and minutes are whole numbers from zero; merged and released are zero or one;
  refusals are not more than calls. A field outside its form refuses the record with
  `epic-window-field-refused` and its name.
- **A window carries the moments of the merge and of the release of its epic, and the screen judges
  «выпущен» by the end of the shown period.** A window of 13 November shows «не выпущен» after a
  later edition too, as the report of that day does. A moment of a merge or a release is judged as
  the other moments of the window.
- **An epic window is kept a year from its opening, as a day line, and the night cleaning removes
  older ones.**

**The section.**

- **The menu item «Качество» stands right after «Разборы происшествий».** The owner asked for the
  result beside the analyses; it stood three items further. The move edits three lines in the merged
  specs: the row «the section of the result» of `docs/specs/message-bus/usage/spec.md` («after
  «Использование»» becomes «right after «Разборы происшествий»»), the sentence "The section
  «Качество» stands in the admin application after «Использование»" of
  `docs/specs/agent-kit/metrics/spec.md`, and the row «the sections» of the locale table of
  `docs/specs/message-bus/spec.md`, whose second item becomes «Качество».
- **The code of the screen waits for a mockup the owner approved.** The new tiles, the milestone by
  day, the block «Подряд» and the block «Окна эпиков» are drawn and approved before the code of the
  screen; the intake goes on without it.
- **The tiles of the section and how each sums the day lines of the period.**

  | Tile                       | What it shows                                                               |
  | -------------------------- | --------------------------------------------------------------------------- |
  | «Принято с первого раза»   | as now; with no accepted task in the lines it reads «0 из 0»               |
  | «Правки владельца»         | as now                                                                      |
  | «Повторы ошибок»           | as now                                                                      |
  | «Задачи слиты»             | the sum of `tasksMerged`, and «от взятия» — `takenMinutes` over `tasksTimed` in hours |
  | «Отказов на сто вызовов»   | the three refusal classes summed against the sum of `calls`, two decimals   |
  | «Простой»                  | the sum of `idleMinutes` in hours with one decimal                          |
  | «Переспросили»             | the sum of `reasks`                                                         |
  | «Прерывания хода»          | the sum of `interrupts`, beside the sum of `ownerWords` as «из N слов владельца» |
  | «Цель не достигнута»       | the sum of `goalNotMet`                                                     |
  | «Тупики»                   | the sum of `deadEnds`                                                       |

- **«0 из 0» changes the line "A tile with nothing to count says there is no data" of the usage
  spec for «Принято с первого раза» only.** The other tiles keep it.
- **A value missing from a line is not a zero.** A new tile sums only the lines that carry its key
  and names how many lines of the period lacked it; a period where no line carries it shows «нет
  данных» on that tile.
- **The milestone G is shown per day of the period.** A day reads «достигнута» with fewer than five
  refusals per hundred calls and no dead end over the lines of that day, «вызовов нет» with no call.
- **The block «Подряд» lists the pairs of the period, the most frequent first, by both names.**
- **The table of drivers keeps its loss columns on `guardRefusals` and gains the column «Отказов на
  сто вызовов».** The column is `recordRefusals` of the check against the calls of the period: the
  observations of a guard miss refusals, and a loss counted on the record would move the order.
- **The epic windows of the period stand in a block of their own, the latest first.** A row names the
  epic, the two moments, «отказов N из M», re-asks, «выпущен» or «не выпущен» and the hours from
  taking: «эпик 3227 не выпущен · отказов 35 из 187 · переспросили 3».
- **A window belongs to the period when its stretch overlaps the period; an open window runs up to
  now.**
- **A tree narrows the new numbers and the windows as it narrows the result metrics; a version
  narrows the numbers and leaves the windows whole.** A window carries no version.
- **The section stays under the right `quality:read`.** Nothing of the result is shown under
  another right.

## What is out of scope

- How the tree counts the numbers and which windows it sends — the package subdomain `agent-kit/work-result`.
- A chart over days: the section shows tiles and lists, as now.
- The name of the epic beyond its number: no title leaves a tree.
- The split of verdicts by task: the task key stays in the tree.

## Contract

| Operation                     | What it does                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| POST /api/intake/epic-windows | takes an epic window in by the tree token: a window of a tree, copy, epic and opening replaces the stored one |

`GET /api/usage/quality` gains the result numbers, the milestone of every day, the pairs and the
epic windows of the period in the same answer. `POST /api/intake/metrics` keeps its body; its key
list grows with the package.

### Refusal codes

Not applicable: the intake answers with an HTTP code and a word of the shared list.

| What happened                                          | Code  | What it says                              |
| ------------------------------------------------------ | ----- | ----------------------------------------- |
| an epic window with a field or a moment outside its form | `400` | `epic-window-field-refused` and the field |
| an epic window with an older stamp                     | `409` | `metrics-stale`                           |

## Data

**An epic window** — one row per tree, copy, epic and opening moment, in a table of its own: the
closing moment or none, calls, refusals, re-asks, merged, released, the minutes from taking and the
stamp. The quadruple is unique, and the storage holds that. The opening moment is indexed for the
night cleaning.

The day line table keeps its form: the new numbers are new keys of its map.

## Screens and states

| Screen                  | States                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| The section «Качество»  | as now, plus: the new tiles · a tile no line of the period carries: «нет данных» · «0 из 0» on the first-pass tile · the milestone by day |
| The block «Подряд»      | pairs of the period · no pair: the block is not drawn                                                            |
| The block «Окна эпиков» | rows of the period · no window in the period: the block is not drawn · an open window: «открыто»                 |

## Cross-cutting requirements

### Locales

Russian and English, as the rest of the admin application: every new label goes into both label
sets.

### SEO

Not applicable: the section is behind sign-in.

### Mobile layout

The blocks of pairs and windows fold into cards on a narrow screen, as the table of drivers does.

### Several objects

Two machines of one tree send their windows of one epic apart, by the copy sign; the section shows
both rows.

## Decisions

- **The epic window is a record of its own, not a key of the day line.** A window crosses days, and
  the day line is replaced by its day.
- **The screen shows «35 из 187», not «35 из 189» of the request.** The owner's answer in the grill
  «Ваше сообщение, 35 из 187 (Recommended)»: the window ends at the owner message that opened the
  analysis.
- **The receiver half reaches production only by the rollout the owner starts.** It is the last step
  of the work and the owner is its actor; the receiver goes out before the edition of the package.

## Open questions

None: the two questions of the first draft are closed — the mockup is a rule above, the window end
is the owner's answer.

## History of changes

- 17 November 2026 — proposed for task RT-3270; revised by the grill decisions after the roles.
- 17 November 2026 — in force: a subdomain of its own next to `usage`, task RT-3270.
