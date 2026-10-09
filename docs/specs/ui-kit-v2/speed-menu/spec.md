# The quick menu

**Status:** in force · **Revision:** 9 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon button, the floating panel and the tooltip of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about `rt-speed-menu`, written by task RT-2554 of the epic RT-2542,
which moves the applications' shared parts into the kit.

## Why

An application that installs the second kit keeps a few related actions behind one round button: a
zoom menu in the side menu footer opens zoom in, zoom out and reset. It draws them with Material
buttons in a column that stands in the page flow, so any parent with a clipping overflow cuts it, and
a person on the keyboard cannot reach the actions at all. The kit has no such part.

## Terminology

- **The trigger** — the round button that opens and closes the menu.
- **An action** — one round button of the menu, with an icon, a name and a value.
- **The direction** — the side of the trigger the actions open on.

### What it is called in the interface

| In the domain | On the screen                                                        |
| ------------- | -------------------------------------------------------------------- |
| Closed        | the trigger with its icon                                            |
| Open          | the trigger with a cross, the action buttons in a row or a column    |
| An action     | a round icon button; its name in a tooltip and for the screen reader |

## Rules

- **A press on the trigger opens the actions and a second press closes them; the open trigger shows
  a cross and says it is expanded.**
- **The actions stand on the side the direction names, in the given order, and move to the opposite
  side when there is no room.** Up and down give a column, the start and the end give a row; the
  order reads top to bottom and start to end, as the application wrote it.
- **Every action carries its name as the accessible name and the tooltip; an unavailable action is
  not pressed.** The trigger is named by the application, and without a name by the kit label
  «Actions».
- **A chosen action goes out by its value, and the menu stays open unless the input closes it.**
  The closing return puts the focus back on the trigger.
- **Escape closes the menu and returns the focus to the trigger; a press outside closes it and
  leaves the focus where the press put it.**
- **A keyboard press on the trigger opens the menu into its first available action, and the arrows,
  Home and End move between the available actions.** Tab closes the menu and puts the focus back on
  the trigger: the panel lies at the end of the page, and the next element after it is not the one
  after the trigger.
- **An unavailable menu and a menu without actions do not open, and turning unavailable closes an
  open menu.**
- **The floating panel and the icon button without the new inputs behave and look as before.**

## What is out of scope

- A place in a corner of the window: the application places the menu, and the trigger stands where it
  is put.
- Labels next to the actions: the name shows in a tooltip, as the application has it.
- An animation of the closing: the actions leave at once.

## Contract

None: the part is a control and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the actions come from the application.

## Screens and states

| state              | what is drawn                                            |
| ------------------ | -------------------------------------------------------- |
| closed             | the trigger with its icon                                |
| open               | the trigger with a cross; the actions come in one by one |
| unavailable action | the action button muted, a press does nothing            |
| unavailable menu   | the trigger muted, a press does nothing                  |

## Cross-cutting requirements

### Locales

The default name of the trigger is the kit label «Actions», English in the package and translated by
the consumer's translator. The action names come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The buttons follow the pointer sign like every kit icon button; the panel moves to the opposite side
at the edge of the screen.

### Several objects

Every menu holds its own open state; opening one closes another only by the press outside.

## Decisions

- **The panel is the kit floating panel, not a column in the flow.** The application's column was cut
  by the side menu footer; the floating panel lies at the end of the page and carries the theme and
  the preset of the place.
- **The menu stays open after a choice by default.** The application's zoom menu is pressed several
  times in a row; closing on a choice is one input away.
- **The actions come in one by one, the nearest first, and a person who asked for less motion sees
  them at once.**
- **Actions are named, not bare icons.** The application passed icon names only, and a screen reader
  read nothing; the name now goes to the tooltip and the accessible name both.

## Open questions

None.

## History of changes

- 9 October 2026 — written by the task RT-2554 of the epic RT-2542.
