# Delta unit and «growth is worse» on the stat tile

**Status:** in force · **Revision:** 19 November 2026 · **Scenario prefix:** `SC-UKV`
**Dependencies:** kit labels — points are written by a kit label with a value parameter; the kit
label locale — both delta rows are written by it
**Законы:** `verifiability`, `frontend-application`
**Procedures:** none

A subdomain of the second kit about the delta rows of `rt-stat-tile`, written by task RT-2927. Task
RT-3338 added the compact value size, the delta written by the kit locale and the visible base
caption for the KPI block of the assistant chat.

## Why

The stat tile writes a delta only in percent and paints it by the sign of the number: growth green,
a fall red. The application's reports show shares too — occupancy, the cancellation share — and a
delta of two shares reads in percentage points: occupancy from 68 % to 78 % grew by 10 points, not
by 15 %. The reports also show metrics whose growth is bad for the owner: cancellations, lost
revenue. The tile paints such growth green, and the owner sees good news where there is none.

The application that asked works around this with its own copy of the tile. With both signs in the
kit, the copy is no longer needed.

## Terminology

| Term                 | What it is                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| **Delta row**        | a delta to one base: the primary one next to the value or the year chip     |
| **Delta unit**       | percent or percentage points; set on each delta row                         |
| **Percentage point** | the difference of two shares written in percent                             |
| **Growth is worse**  | a tile sign: the metric's growth is bad for the owner, the row colours swap |

### What it is called in the interface

Points are written by a kit label: «+10 п.п.» in Russian, «+10 pp» in English. Percent is written
as now: «+12 %».

## Rules

- **The unit is set on the delta row, and percent is the default.** A row without a unit is drawn
  exactly as before the edit: today's consumer notices nothing.

- **The two rows of one tile may carry different units.** The primary delta and the year delta
  each take their own unit.

- **Points are written by a kit label with a value parameter.** The number goes into the label
  written by the kit locale, by the same rule as a percent delta: in `ru` «+10 п.п.», «-7 п.п.»,
  «0 п.п.», «+2,5 п.п.».

- **A row with an unknown base is not drawn in any unit.** The tile hides it today in percent, and
  points keep that: a dash next to the value reads as a breakage.

- **«Growth is worse» is a tile sign, and it paints both rows.** Growth is then red, a fall green,
  zero stays without colour.

- **The arrow shows the sign of the number whatever the «growth is worse» sign.** Growing
  cancellations get an up arrow in red, falling lost revenue a down arrow in green.

- **A tile without the «growth is worse» sign paints its rows as now.** Growth green, a fall red.

- **The tile has a value size option: the default keeps the value at 32/32, the compact size writes it at 24/24, the delta at 14 on a line 16 high and the lower lines on lines 16 high.** The KPI card of the assistant chat uses the compact size.

- **The compact size sets the gaps of the tile to 6, `calc(var(--rt-space-1) + var(--rt-space-0-5))`, and puts the delta line on a line of its own under the value.** The gaps are those between the lines of the tile and between the value and the delta line; so the mockup draws it.

- **In the compact size the secondary line and the base caption wrap between words; the default size keeps each on a single line with an ellipsis.**

- **The tile writes both delta rows, the primary delta and the year chip, by `Intl.NumberFormat` for the kit label locale, with a plus on growth and no sign at zero.** A percent delta is written as the locale writes a percent. Under the default kit locale `en` it reads «+12.5%». In `ru` it reads «+12,5 %», «-4 %», «0 %», with U+00A0 before the percent sign. A delta in points passes the same written number to the points label.

- **A tile delta keeps at most one fraction digit and none when it is integral: 3.75 is «+3,8 %», -4 is «-4 %».**

- **A locale `Intl.NumberFormat` refuses writes the tile delta as `en`.**

- **The direction, the arrow and the colour of a delta follow the written number: a delta written as zero, such as 0.04 or -0.04 written «0 %», has no sign, is flat and muted.**

- **The tile can show the label of the primary delta as visible text after the delta; the option is off by default, and with it on the delta carries no `title` of the same text.**

- **«Growth is worse» of the tile, its colours and its arrow do not change; the KPI card maps `growthIsGood: false` to it.**

## What is out of scope

- The application's third unit — an amount written as a ready string. The task names percent and
  points; the PR names the difference.
- The card around the tile, the metric icon and the background: the application draws them.
- The icon before a zero delta and the year chip that disappears on an empty base: the kit draws
  them so today, and this edit does not touch them.

## Contract

The delta row model gets an optional unit field with the values «percent» and «points». The tile
gets a «growth is worse» input — a boolean, off by default. The value size input takes `default`
or `compact`, `default` when absent; the visible base caption input is a boolean, off by default.
The other inputs do not change.

### Refusal codes

Not applicable: the component requests nothing and refuses nothing.

## Data

Not applicable: the tile draws what it is given and stores nothing.

## Screens and states

The mockup is the Stat Tile page of the second kit file: the frame «Пункты и рост хуже — как в
отчётах аналитики» and the component variants with the Growth property, better and worse. The tile
states:

- percent and points — growing, falling, at zero;
- «growth is worse» — growth red with an up arrow, a fall green with a down arrow;
- an unknown base — the row is not drawn;
- the compact size — the value at 24, the delta line under it, the lower lines wrapped;
- the visible base caption — «+12,5 % vs LY» with no `title`;
- the same states in the dark theme.

## Cross-cutting requirements

### Locales

The points label takes the value as a parameter and is translated like every kit label. Both delta
rows are written by `Intl.NumberFormat` for the kit label locale and follow its change; the tile
writes the value as given.

### SEO

Not applicable: a library component.

### Mobile layout

A delta row with the points label fits the same width as one with percent. In a narrow card the
compact size wraps the secondary line and the base caption between words instead of cutting them.

### Several objects

Not applicable.

## Decisions

- **The unit is a field of the delta row, not a tile input.** The application the owner pointed at
  does exactly that; a tile input would not let the two rows differ.
- **«Growth is worse» is a tile input.** The owner's answer: it is a property of the metric, not of
  a row. The application sets it per row, and the PR names that difference.
- **The kit version goes to the registry right after the merge.** The owner's answer.

## Open questions

None.

## History of changes

- 3 November 2026 — the agreement is written before the code.
- 3 November 2026 — an unknown base hides the row, as the tile does today, instead of a dash.
- 3 November 2026 — the agreement is rolled out and merges into the description of the second kit.
  Task RT-2927.
- 19 November 2026 — the compact value size, the delta by the kit locale for both rows and the
  visible base caption, from the agreement of the KPI block of the assistant chat. The points rule
  and SC-UKV-1125 now name the kit locale. Task RT-3338.
