# Grill

Work begun from a refusal of the gate before sending, not from intake cargo: no records to name.

## The owner request

> открывай все

Opening the PRs of epic RT-2542 stopped at the gate before sending: the admin end-to-end suite
failed 17 of 146. Asked how to fix it — the kit, accepting the 400px filters, or waiting — the
owner answered:

> Чинить кит (Recommended)

## What the tree already has

- RT-2786 (in main) gave `rt-input` and `rt-select` in the left bar of `rt-toolbar` the width
  `--rt-toolbar-field-width`, 400px, with `max-width: 100%`.
- The admin puts three `rt-select` filters into the left bar: each became 400px, and on a 412px
  screen a filter ends at 416px — SC-MB-235 and SC-MB-253 fail, and 15 screen frames diverge.
- RT-2786 aimed at the list search, an `rt-input` that shrank to its placeholder.

## What the rules already say

- The kit styling rule: a size is taken from the scale; a consumer resets a block property.

## Decisions

- **Only `rt-input` takes the field width; `rt-select` sizes by its content again.** — The
  request behind RT-2786 was the search field; the filters fitted before it. Rejected: accepting
  400px filters — the owner chose to fix the kit.

## What is left unclear

- Nothing blocks the work.
