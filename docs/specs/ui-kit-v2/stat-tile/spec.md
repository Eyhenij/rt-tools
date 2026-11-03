# Delta unit and «growth is worse» on the stat tile

**Status:** in force · **Revision:** 3 November 2026 · **Scenario prefix:** `SC-UKV`
**Dependencies:** kit labels — points are written by a kit label with a value parameter
**Законы:** `verifiability`, `frontend-application`
**Procedures:** none

A subdomain of the second kit about the delta rows of `rt-stat-tile`, written by task RT-2927.

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

- **Points are written by a kit label with a value parameter.** The sign and the decimal comma are
  put as for percent: «+10 п.п.», «-7 п.п.», «0 п.п.», «+2,5 п.п.».

- **A row with an unknown base is not drawn in any unit.** The tile hides it today in percent, and
  points keep that: a dash next to the value reads as a breakage.

- **«Growth is worse» is a tile sign, and it paints both rows.** Growth is then red, a fall green,
  zero stays without colour.

- **The arrow shows the sign of the number whatever the «growth is worse» sign.** Growing
  cancellations get an up arrow in red, falling lost revenue a down arrow in green.

- **A tile without the «growth is worse» sign paints its rows as now.** Growth green, a fall red.

## What is out of scope

- The application's third unit — an amount written as a ready string. The task names percent and
  points; the PR names the difference.
- The card around the tile, the metric icon and the background: the application draws them.
- The icon before a zero delta and the year chip that disappears on an empty base: the kit draws
  them so today, and this edit does not touch them.

## Contract

The delta row model gets an optional unit field with the values «percent» and «points». The tile
gets a «growth is worse» input — a boolean, off by default. The other inputs do not change.

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
- the same states in the dark theme.

## Cross-cutting requirements

### Locales

The points label takes the value as a parameter and is translated like every kit label.

### SEO

Not applicable: a library component.

### Mobile layout

Unchanged: a delta row with the points label fits the same width as one with percent.

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
