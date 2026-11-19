# The empty content of a side panel

**Status:** proposed · **Revision:** 19 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the side panel of the second kit and its empty state `rt-empty-state`
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code.

## Why

A side panel whose content has nothing to show draws a blank white field under its header: the
person cannot tell an empty panel from one that broke. Every application had to draw its own
placeholder, and most drew none.

## Terminology

| Term            | What it is                                                                  |
| --------------- | --------------------------------------------------------------------------- |
| emptiness       | the application's sign that the panel content has nothing to show           |
| the placeholder | what the panel body shows under emptiness: an icon and a label by default    |
| the own placeholder | the application's template drawn instead of the default placeholder      |

### What it is called in the interface

The default label is the kit dictionary key `uiNoData` («No data yet»); an application in another
language gives its own, the showcase reads «Пока нет данных».

## Rules

- **Under emptiness the panel body shows the placeholder instead of the projected content.** Without
  emptiness the content is drawn as before.
- **The header, the request error box and the footer stay in their places under emptiness.** The
  placeholder takes only the body and stands in its middle.
- **The default placeholder is the kit's `rt-empty-state` with the `inbox` icon and the `uiNoData`
  label.** The panel writes no markup of its own for it.
- **The icon, the title and the description of the default placeholder are replaced by the panel's
  inputs.** An empty title input keeps the dictionary label; `null` icon removes the icon.
- **An own placeholder given by a template replaces the default placeholder whole.**

## What is out of scope

- The release of the package: the application's session makes it.
- The panels of the applications: each switches emptiness on by itself after the release.
- An action button in the default placeholder: an application that needs one gives its own
  placeholder.

## Contract

Not applicable: the surface is four inputs of `rt-aside` and one template directive.

| input              | type                   | default    |
| ------------------ | ---------------------- | ---------- |
| `empty`            | `boolean`              | `false`    |
| `emptyIcon`        | `IRtIcon.Name \| null` | `'inbox'`  |
| `emptyTitle`       | `string \| null`       | `null` — the label `uiNoData` |
| `emptyDescription` | `string \| null`       | `null`     |

The own placeholder: `<ng-template rtAsideEmpty>…</ng-template>` inside `rt-aside`.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State                 | What is visible                                                     |
| --------------------- | ------------------------------------------------------------------- |
| not empty             | the panel as before                                                 |
| empty, default        | header, the inbox icon and «No data yet» in the middle of the body, footer |
| empty, inputs         | the same with the application's icon, title and description         |
| empty, own template   | header, the application's template in the body, footer              |

## Cross-cutting requirements

### Locales

No new key: the label is the existing `uiNoData`.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The panel is full width on a narrow screen; the placeholder stays in the middle of the body.

### Several objects

Every open panel shows its own placeholder.

## Decisions

- **The label is the existing `uiNoData`, not a new key.** An application that already gave it
  gets its own text without an edit.
- **Emptiness is an input given by the application, not guessed from the projected content.** A
  panel whose content is an empty list still projects the list's markup.

## Open questions

None.

## History of changes

- 19 November 2026 — the agreement was written from the owner's request.
