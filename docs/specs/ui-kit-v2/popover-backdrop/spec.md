# The backdrop of the popover

**Status:** in force · **Revision:** 29 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the popover of the second kit, the page header of the second kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-2987.

## Why

The section menu of the page header on a phone opened over a page that stayed bright: the page
next to the panel read as part of the menu. An application may not dim the page in its own styles,
since the look of an overlay belongs to the kit, so the kit gives the backdrop.

## Terminology

- **A backdrop** — a full-screen layer under an open panel that dims the page and catches a press.

### What it is called in the interface

No new words on the screen.

## Rules

- **A popover without a backdrop class leaves the page next to the panel open.**
- **A backdrop class puts a backdrop under the panel, and a press on it closes the panel.**
- **The mobile menu of the page header stands on a dimmed backdrop.**
- **The profile menu stands on that backdrop only on a narrow screen.** A wide menu opens on hover, and a
  backdrop would flash on every pass of the pointer.

## What is out of scope

- The other panels of the kit — selects, menus, tooltips — stay without a backdrop.
- The height and the scroll of the mobile menu do not change.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen              | Loading   | Empty     | Refusal   |
| ------------------- | --------- | --------- | --------- |
| Popover panel       | no change | no change | no change |
| Mobile menu, header | no change | no change | no change |

## Cross-cutting requirements

### Locales

No new texts.

### SEO

Not applicable.

### Mobile layout

The mobile menu of the header dims the page under it with the overlay colour token of the kit.

### Several objects

Not applicable.

## Decisions

- **The backdrop is opt-in by a class, and the empty default keeps the old behaviour.** A backdrop
  under every panel would cover the page under each dropdown list.

## Open questions

None.

## History of changes

| Date       | What changed                                                                |
| ---------- | --------------------------------------------------------------------------- |
| 2026-10-29 | The subdomain is written with scenarios 1070…1072                           |
| 2026-10-30 | The profile menu gets the backdrop on a narrow screen: 1080, 1081 (RT-2997) |
