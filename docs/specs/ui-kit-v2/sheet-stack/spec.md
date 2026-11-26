# The sheet opened from a sheet

**Status:** in force · **Revision:** 20 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the bottom sheet of the second kit, the panel of choice in the bottom sheet
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-3399 by the owner's word: «ботомшиты не
накладываются а подменяют, при закрытии верхнего показывается предыдущий».

## Why

On a phone a sheet holds fields that open a sheet of their own: the filters sheet of the page holds
selects. Two sheets laid one over the other show two handles, two dims and the edge of the lower one
above the upper, and a finger lands on the wrong one.

## Terminology

- **The stack of sheets** — the order in which the kit's sheets of a page were opened.
- **A covered sheet** — an open sheet with a sheet opened over it.

### What it is called in the interface

The person sees one sheet at a time: the list of a select takes the place of the filters in the
same sheet with a back chevron on the left, and the filters come back when the list closes.

## Rules

- **A sheet opened from a sheet opens in the same sheet.** Its content and title take the place of
  the first ones at the same place, without sliding and without a dim of its own, and
  «×» on the left of the header becomes a back chevron. A window that changes its size or turns
  changes the height of the first screen, and the second one follows it. The first sheet hides without sliding and
  takes no taps. It keeps what was typed in its form and the focus of the field that opened the
  second screen: the keys of that field lead the list, and the focus goes back to it on close. The
  owner's word: «нужно открывать в том же меняя содержимое а вместо кнопки крестик (слева в шапке)
  кнопка назад шеврон».
- **The second screen is never lower than the first one and grows by its content up to the limit of
  a full-height sheet.** The limit leaves the strip of 12 points on top. Going back shows the first
  screen at its own height.
- **The switch between the screens and the change of height are animated, not a jump.** The height
  of the panel passes from one screen to the other, and the content comes in with a short slide and
  fade: from the right going forward, from the left going back. The duration is the one of the
  sheet's slide. With reduced motion asked by the system, the screens switch without motion. The
  owner's word: «рсти и переключение и рост с анимацией а не скачком».
- **Closing the top sheet shows the previous one again.** The chevron, a choice in the list and a
  close by the drag or the key give the same return; none of them closes the first sheet.

## What is out of scope

- Sheets on a wide screen: the kit opens none there.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen                      | Loading   | Empty     | Refusal   |
| --------------------------- | --------- | --------- | --------- |
| A sheet opened from a sheet | no change | no change | no change |

## Cross-cutting requirements

### Locales

Not applicable: no labels of its own.

### SEO

Not applicable.

### Mobile layout

The whole subdomain is about the phone. The approved frames are `8497:17962` and `8499:16968` on
the sheet Page Header.

### Several objects

Not applicable.

## Decisions

- **The order is one for the page, kept by a kit service the sheets register in.** A sheet does not
  know which sheet opened it: the select's sheet lives in an overlay, outside the filters sheet.

## Open questions

None.

## History of changes

| Date       | What changed                                                |
| ---------- | ----------------------------------------------------------- |
| 2026-11-20 | Written by task RT-3399 after the owner approved the frames |
| 2026-11-25 | The upper sheet is the second screen of the same sheet with |
|            | a back chevron, by the owner's word (RT-3532)               |
