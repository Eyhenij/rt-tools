# Grill

Former address: docs/tasks/RT-2786-toolbar-field-width/grill.md

A field in the left bar of the toolbar now takes `--rt-toolbar-field-width`, 400px by default, and
never grows wider than the bar. The toolbar description and the kit spec history say so. Checks: the
toolbar styles and tests clean, 184 affected tasks green, 806 of 806 showcase frames match.

## The owner request

> что с инпутом поиска на списках? почему он такой маленький?

An application puts a search `rt-input` into the left slot of `rt-toolbar` on its list screens. The
field took the width of its placeholder, 214px, on a 2500px wide toolbar. Asked where to fix the
width — in the kit or by an own rule of the application — the owner answered:

> В ките (Recommended)

## What the tree already has

- `rt-toolbar` sizes its left bar by its content (`flex: 0 0 auto`). A field there has no width of
  its own: `rt-input` has no width input, so it shrinks to its placeholder.
- The center bar already stretches a field: `rt-input` and `rt-select` there take `width: 100%`, and
  the consumer sets its own maximum. No story shows a field in either bar.
- The kit size scale has `--rt-size-100`, 400px.

## What the rules already say

- The kit styling rule: a size is taken from the scale.

## Questions and answers

**Где чинить ширину поиска?**
В ките (Recommended)

## Decisions

- **A field in the left bar takes `--rt-toolbar-field-width`, by default `--rt-size-100`, and never
  wider than the bar** — a search is put on the left in the lists, and a field sized by its
  placeholder reads as broken. Rejected: making the left bar stretch — the field inside would still
  keep its placeholder width.
- **The property is a block property of the toolbar** — the consumer resets it the same way it
  resets the paddings, without an own rule on the field.
- **The center bar keeps its behaviour** — it already stretches a field.
- **Behaviour changes, the toolbar description gets the article** — closed by assumption.
- **Done when** — a search field in the left bar is 400px wide on a wide toolbar and fits the bar
  on a narrow one; the toolbar snapshots stay the same; the styles linter and the tests are green.
