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

The person sees one sheet at a time: the list of a select takes the place of the filters, and the
filters come back when the list closes.

## Rules

- **A sheet opened while another is open replaces it.** Only the last one opened is seen; the
  covered one goes down as if closed and takes no taps. It keeps the focus of the field that opened
  the top one: the keys of that field lead the top list, and the focus goes back to it on close.
- **Closing the top sheet shows the previous one again.** A choice in the list and a close by the
  dim, the drag or the key give the same return.

## What is out of scope

- Sheets on a wide screen: the kit opens none there.
- A back button in the upper sheet: the frames draw none.

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
