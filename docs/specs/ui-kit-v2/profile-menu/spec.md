# The profile menu

**Status:** in force · **Revision:** 15 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the page header, the menu item, the select and the theme service of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about `rt-profile-menu`, written by task RT-2842, which moves the profile
menu from the showcase into the package.

## Why

The page header of the kit opens the content the application puts into its user menu in a floating
panel, and that panel draws neither a background, nor a border, nor a shadow. An application that
puts bare menu items there gets them right over the page. The designed profile menu — the person,
their organization and the actions — lives only in the showcase, which the package does not carry.

## Terminology

- **The profile menu** — the content of the header's user popup: who signed in, where, and what
  they can do with their account.
- **The organization change** — the action that takes the person to choosing another organization.

### What it is called in the interface

| In the domain           | On the screen                                             |
| ----------------------- | --------------------------------------------------------- |
| The person              | a round mark with the first letter, the name under it     |
| The organization        | its name and the caption «organization» in the same line  |
| The organization change | the item «Change organization»                            |
| The theme switch        | the item «Switch theme» with the icon in an accent circle |

## Rules

- **The menu draws its own panel: background, border, rounded corners and a shadow.** It stands in
  the header's popup as is; the application adds no styles.
- **The round mark carries the first letter of the name in upper case, and the name stands under
  it.** An empty name leaves the mark and the name empty.
- **The organization line shows only with a non-empty organization name.**
- **The organization change is hidden, unavailable with an explanation, or available, as the
  application sets it; hidden by default.** The unavailable item is muted, sends nothing and
  explains why in a tooltip.
- **The password change shows only when the application turns it on.**
- **The language select shows only with a non-empty list of languages,** with the current one
  chosen, and a choice goes out by its code.
- **The theme switch changes the theme through the kit theme service, and its icon shows the theme
  it switches to.**
- **The sign-out goes out by a press and can be made unavailable by the application.**
- **Every caption is a kit label with an English default and the consumer's translation.**

## What is out of scope

- A picture instead of the letter: the application has no profile picture yet.
- Opening the popup: the page header does it.
- Where the actions lead: the application decides.

## Contract

None: the part is a control and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the name, the organization and the languages come from the application.

## Screens and states

| state                           | what is drawn                                        |
| ------------------------------- | ---------------------------------------------------- |
| full                            | mark, name, organization, three items, select, theme |
| without organization            | no organization line                                 |
| organization change unavailable | the item muted with a tooltip                        |
| sign-out unavailable            | the item muted, a press does nothing                 |

## Cross-cutting requirements

### Locales

The captions are kit labels, English in the package and translated by the consumer's translator.
The names come from the application.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The panel keeps its minimum width and follows the header's popup; nothing of its own.

### Several objects

Not applicable: one header has one profile menu.

## Decisions

- **The theme service, not an input, gives the theme.** It is one per page, as the theme toggle of
  the kit has it.
- **The organization change is one input of three values.** Two flags would allow a fourth
  combination, hidden and available, that means nothing.
- **The captions in the showcase stay the same as before the move.** The frame of the showcase
  popup is the check that the move changed nothing.

## Open questions

None.

## History of changes

- 15 October 2026 — written by the task RT-2842 and merged into the kit spec by the same task.
