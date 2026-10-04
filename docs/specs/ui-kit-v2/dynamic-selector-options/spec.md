# The switches, initial query and popup state of the dynamic selector

**Status:** in force · **Revision:** 4 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the dynamic selector and the dynamic text input of the second kit
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2481 of the epic RT-2472.

## Why

An application moving from the first kit shows lists whose rows cannot be removed, lists without
reset and clear, rows with their own controls whose edits reset and clear must drop, a popup opened
on a known query, and its own layout that reacts while the popup is open. The second kit's selector
draws the bin and the panel always, looks at the keys alone, starts the popup empty and says nothing
about it.

## Terminology

| Term                      | What it is                                                   |
| ------------------------- | ------------------------------------------------------------ |
| the bin                   | the remove button of a row                                   |
| the reset and clear panel | the two buttons next to the add button under the list        |
| an edit in a row          | a change the consumer's row template keeps outside the value |
| the initial query         | the search text the popup shows when it opens                |

### What it is called in the interface

A person sees a list of chosen records with buttons to add, reset and clear and a popup with a
search; the switches, the query input and the state signal are invisible to them.

## Rules

- **A list without the bin draws its rows without the remove button.**
- **A list without the reset and clear panel keeps its add button.**
- **With the panel switch on, as by default, the bar gives its place to the invitation, as before.**
- **Edits in a row keep reset and clear active, and both then report to the consumer.**
- **The popup opens on the initial query and does not report it as a search.**
- **The selector tells whether its popup is open and reports every change of that.**
- **Without the new inputs the selector and the text input behave and draw as before.**

## What is out of scope

- The initial query and the popup state of the text input: it has no popup.

## Contract

Not applicable: the surface is inputs, outputs and a signal of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing.

## Screens and states

| State             | What is visible                                      |
| ----------------- | ---------------------------------------------------- |
| without the bin   | rows with their title and controls, no remove button |
| without the panel | the add button under the list, no reset or clear     |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

Not applicable: the switches only take buttons away.

### Several objects

Every selector holds its own switches, query and popup state.

## Decisions

- **The panel switch takes off reset and clear, not the add button.** A list that cannot be reset
  can still grow.
- **Reset and clear with only row edits keep the value and still report.** The consumer drops its
  row edits by the report; the value has nothing to change.
- **The initial query is not a search event.** The consumer set it and already knows it.
- **The panel switch has two values, and the bar never stands under the invitation.** The owner
  said so on 4 October 2026: the request asked for a third value that keeps the bar there, and it
  is not needed.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2481.
- 4 October 2026 — the owner's word on the bar under the invitation is written into the decisions
  by task RT-2520.
