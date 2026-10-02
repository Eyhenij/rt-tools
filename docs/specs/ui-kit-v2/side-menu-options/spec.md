# The pin and tooltip switches and the row button fallback of the side menu

**Status:** in force · **Revision:** 2 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the side menu and the icon button of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2482 of the epic RT-2472.

## Why

An application moving from the first kit keeps its submenu always floating, shows no tooltips in it
and draws row buttons from its own icon set. The second kit's side menu always offers to pin the
submenu, always shows tooltips, and leaves a row button empty when its name is not in the kit set.

## Terminology

| Term             | What it is                                                           |
| ---------------- | -------------------------------------------------------------------- |
| the pin button   | the button in the submenu head that pins the submenu open            |
| a row button     | the consumer's action button at the end of a submenu row             |
| the own template | the menu's `rtSideMenuIcon` template for names the kit does not draw |

### What it is called in the interface

A person sees a menu with a submenu panel, its rows and their buttons; the switches and the template
are invisible to them.

## Rules

- **A menu without the pin button reads no stored pinned mode.**
- **A menu without submenu tooltips shows none on the submenu rows, and the accessible names stay.**
- **A row button without a kit icon takes the menu's own template, which knows what it draws.**
- **A row button with the own template is not warned about.**
- **An icon button without an icon name shows its projected content.**
- **Without the new inputs and template the menu and the icon button draw as before.**

## What is out of scope

- Drawing an unpaired name by the Material font.

## Contract

Not applicable: the surface is inputs, a template context and a content slot of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing.

## Screens and states

| State                    | What is visible                                |
| ------------------------ | ---------------------------------------------- |
| without the pin          | the submenu head with the search only          |
| a row button by template | the consumer's picture inside the round button |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

Not applicable: on a narrow screen the submenu does not pin, and its tooltips are already off.

### Several objects

Every menu holds its own switches and its own template.

## Decisions

- **Without the pin button the stored setting is not read.** A person could not unpin a menu they
  pinned earlier; the bound mode still decides.
- **The template context names its place.** `icon` is the name being drawn and `slot` is the place;
  the row stays `$implicit`, so a template reading the row icon keeps working in the row's place.
- **The icon button takes the picture as content.** It keeps its size, shape and states, so the row
  button stays a kit button.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2482.
