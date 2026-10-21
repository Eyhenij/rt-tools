# The keys of an option list

**Status:** in force · **Revision:** 2026-10-21 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/select` (the trigger and the panel of the families)
**Laws:** `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about the keyboard of a field that offers a list of options: how a
key opens the list, moves the highlight, chooses and closes. The select, the multiselect and the
autocomplete share it; the dynamic selector popup takes its moving, and the tree has its own walk
with the same Home and End.

## Why

The three fields wrote their keyboard each on its own. The copies of the select and the
multiselect differed by a few lines, and the autocomplete wrote the same a third time. An
accessibility fix made in one field reached no other, and a person met three slightly different
lists in one form.

## Terminology

- **The highlight** — the option the keys stand on. The focus stays on the field; a screen reader
  learns the highlight by `aria-activedescendant`. The dynamic selector popup has no highlight:
  its keys move the focus itself.
- **An open list** — the panel of options under the field.

### What it is called in the interface

The keys have no text of their own.

## Rules

- **A closed select or multiselect opens by an arrow, Enter or Space.** The autocomplete opens by
  typing.

- **The arrows move the highlight and wrap around at the ends, passing over disabled options.**

- **Enter chooses the highlighted option, and in the select and the multiselect Space does too.**
  In the autocomplete Space types a space.

- **Escape closes the list.**

- **The highlighted option is named by `aria-activedescendant` and is kept in view inside the
  panel.** No option is named while the list is closed or nothing is highlighted.

- **A closed list drops the highlight.**

- **Home and End move the highlight to the first and the last enabled option in the select and
  the multiselect.** In the autocomplete they stay with the caret of the text.

- **In the dynamic selector popup the arrows move the focus between the rows and wrap around at
  the ends, and Home and End move it to the first and the last row.** ArrowDown in the search
  field moves the focus to the first row; Home and End in the search field stay with the caret.

- **Enter on a focused row of the dynamic selector popup ticks it as a click does.** Space ticks
  it natively.

- **In the tree and the tree selector Home and End move the highlight to the first and the last
  row while a row is highlighted.** Before the first arrow they stay with the caret of the search
  field.

## What is out of scope

- The search by the first letter: no field has it.
- The wrap of the arrows in the tree: the highlight stops at the ends.
- The side arrows of a tree: the tree walk answers them.
- Where the highlight lands when the list opens: each field decides it.

## Contract

None: the controller is a pure part of the kit and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own. The highlight lives while the list is open.

## Screens and states

| state                 | what is drawn                                     |
| --------------------- | ------------------------------------------------- |
| a closed list         | the field; no option is named                     |
| an open list, no keys | the panel; the highlight as the field puts it     |
| the arrows pressed    | the highlight on the next enabled option, in view |

## Cross-cutting requirements

### Locales

The keys are the same in every language.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

Not applicable: a phone has no such keys.

### Several objects

Not applicable.

## Decisions

- **One controller for the three fields, and each field keeps what differs.** The keys that choose
  and the side arrows differ by field; the moving, the naming and the scroll are the same.
- **The dynamic selector popup moves the real focus, not a highlight.** Its rows are checkboxes
  and radio buttons with roles of their own, and a listbox named by `aria-activedescendant` cannot
  hold them.
- **Home and End stay with the caret where the focus is in a text field.** The person edits the
  query there; the tree takes them only once a row is highlighted.

## Open questions

None.

## History of changes

- 2026-10-21 — written and carried out by the task RT-2870 of the epic RT-2861.
- 2026-10-21 — Home and End, the keys of the dynamic selector popup and of the tree: the task
  RT-2871 of the epic RT-2861.
