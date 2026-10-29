# A filled tab icon and the clearing cross by Tab from the kit settings

**Status:** proposed · **Revision:** 2026-10-29 · **Scenario prefix:** `SC-UKV`
**Depends on:** the tabs of the kit, the icon of the kit, the shared base of the fields, the kit settings
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

The product agreement written before the code. It merges by the last commit of the PR: the tab rule
into the subdomain `tab-additions`, the field rules into `field-label-icon-actions`.

## Why

An application moving from the first kit filled the icons of some tabs to mark them. The second kit
draws a tab icon outlined only, and the application forces the fill by a deep style in each
component.

The clearing cross of a field went by Tab in the first kit. In the second it goes by Tab only with
`clearTabbable` on each field, and four controls ignore even that. An application that wants the
cross reachable from the keyboard sets the attribute on every field by hand and still has crosses a
person without a mouse cannot reach.

## Terminology

| Term                   | What it is                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **The tab icon**       | the icon in the tab title, given by `icon` or `glyph` of `rtTab`                        |
| **The clearing cross** | the button inside a field that empties its value                                        |
| **The fields node**    | the setting `formControl` of the kit settings, read by every control of the shared base |

### What it is called in the interface

| In the domain      | On the screen                           |
| ------------------ | --------------------------------------- |
| The clearing cross | the small cross at the right of a field |
| The tab icon       | the icon before the title of a tab      |

## Rules

- **A tab fills its icon when it asks for it.** `rtTab` takes `iconFill`, `false` by default, and
  passes it to the icon as `fill`, for an icon by `icon` and by `glyph` alike. A tab without it is
  drawn as before.
- **A tab puts its badge over the icon when it asks for it.** `rtTab` takes `badgePosition`,
  `'inline'` by default, which keeps the badge after the title as before. With `'overlay'` the
  badge is a circle of 16 pixels over the top right corner of the icon and moves nothing in the tab.
  A tab without an icon keeps the badge inline.
- **The kit settings name whether the clearing cross goes by Tab.** The fields node takes
  `clearTabbable`. `clearTabbable` on the element wins over it, and without either the cross stays
  out of the Tab order, as before.
- **Every control of the shared base with a clearing cross obeys `clearTabbable`.** Besides the
  field of text, so do the autocomplete, the number field, the date picker and the date range. None
  of them keeps its cross out of the Tab order by a fixed index.

## What is out of scope

- The list clear of the dynamic selector: it is a button of its own and already goes by Tab.
- The first kit.
- The edits of the application that asked.

## Contract

Not applicable: the surface is the inputs `iconFill` and `badgePosition` of `rtTab` and the setting
`components.formControl.clearTabbable` of `provideRtKit`; the subdomain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                                                           | What is visible                                                                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| a tab with `iconFill`                                           | its icon is filled, the other tabs are outlined                                  |
| a tab with an icon, a badge and `badgePosition` `'overlay'`     | a circle with the count over the icon corner, the tab as wide as without a badge |
| a field with a value, the setting on                            | Tab from the field reaches its cross                                             |
| a field with a value, the setting on, `clearTabbable` off on it | Tab goes past the cross                                                          |
| a field without a value                                         | no cross, Tab goes to the next field                                             |

## Cross-cutting requirements

### Locales

Nothing new: the cross keeps the kit's translated name.

### SEO

Not applicable.

### Mobile layout

Nothing of its own: the cross and the icon keep their sizes.

### Several objects

Not applicable.

## Decisions

- **`iconFill` rather than `glyphFill`.** The application asked for `glyphFill`; the input stands
  next to `icon`, `glyph` and `iconColor` and works for both sources of the icon.
- **A node of its own rather than a field of the common settings.** The common settings hold what
  acts on the whole page, such as the theme; the cross belongs to one family of controls.

## Open questions

None.

## History of changes

- 2026-10-29 — the application's request: a filled tab icon and the clearing cross by Tab from the
  kit settings.
- 2026-10-29 — the application's third request, a badge over the tab icon; the owner put it into
  the same task.
