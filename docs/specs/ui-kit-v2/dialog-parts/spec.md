# The focus, parts and properties of the dialog

**Status:** in force · **Revision:** 2 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the dialog of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2479 of the epic RT-2472.

## Why

An application moving from the first kit keeps the keyboard inside an open dialog, returns it where
it was after closing, puts an icon before the title, aligns the footer buttons its own way and
gives the body its padding and scrolling. The second kit's dialog does none of this, and its look is
written in place.

## Terminology

| Term             | What it is                                                       |
| ---------------- | ---------------------------------------------------------------- |
| a focus trap     | Tab and Shift+Tab move only among the dialog's controls          |
| the lead slot    | the place before the header title for an icon or another element |
| the content part | the dialog body that pads and scrolls itself                     |

### What it is called in the interface

A person sees a window over the page with a title, a body and buttons; the options and properties
are invisible to them.

## Rules

- **A dialog opened with a focus trap keeps Tab inside it.**
- **A dialog opened with focus restoring returns focus to the element that held it, after closing.**
- **A dialog opened with automatic focus moves focus to its frame or to its first control.**
- **Without the focus options the dialog moves no focus.**
- **The header shows a lead element before its title, and an empty slot takes no room.**
- **The footer aligns its content to the start, the centre, the end or both edges, and the end by default.**
- **The content part pads and scrolls the body, and its padding and height cap come from properties.**
- **The dialog's background, border, header, title and footer read their look from properties.**
- **Without the new options, parts and properties the dialog draws as before.**

## What is out of scope

- Focus handling of the side panel.
- The inline dialog form.

## Contract

Not applicable: the surface is a service config, inputs and properties of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing.

## Screens and states

| State          | What is visible                                        |
| -------------- | ------------------------------------------------------ |
| a lead element | an icon or another element before the title            |
| a long body    | the content part scrolls between the header and footer |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The dialog keeps its cap of 90 per cent of the window; the content part scrolls inside it.

### Several objects

Every open dialog holds its own focus trap and restores its own focus; the properties apply to all
dialogs under the node that sets them.

## Decisions

- **The focus options are off by default.** That is the dialog's behaviour today.
- **The focus trap is the CDK one, and it leaves with the dialog.** A trap left behind would hold
  Tab on a node that is gone.
- **The properties are read with a fallback in place.** The dialog lives in an overlay, outside any
  block of the application.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2479.
