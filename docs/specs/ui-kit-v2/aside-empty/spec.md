# The empty content of a side panel

**Status:** in force · **Revision:** 19 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the side panel of the second kit and its empty state `rt-empty-state`
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-3428. It was merged with
the scenario numbers it had as an agreement.

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

The default label is the new kit dictionary key `uiEmptyTitle` («No data»); an application in
another language gives its own, the showcase reads «Нет данных».

## Rules

- **Under emptiness the panel body shows the placeholder instead of the projected content.** Without
  emptiness the content is drawn as before.
- **The header, the request error box and the footer stay in their places under emptiness.** The
  placeholder takes only the body and stands in its middle.
- **The default placeholder is the kit's `rt-empty-state` with the `inbox` icon and the `uiEmptyTitle`
  label.** The panel writes no markup of its own for it.
- **The icon, the title and the description of the default placeholder are replaced by the panel's
  inputs.** An empty title input keeps the dictionary label; `null` icon removes the icon.
- **An own placeholder given by a template replaces the default placeholder whole.**
- **Under emptiness of a tab its body shows the same default placeholder, and the tab strip stays.**
  A panel with tabs is empty per tab: the panel's own emptiness would take the strip away.
- **The icon, the title and the description of a tab's placeholder are replaced by the tab's
  inputs.**

## What is out of scope

- The release of the package: the application's session makes it.
- The panels of the applications: each switches emptiness on by itself after the release.
- An action button in the default placeholder: an application that needs one gives its own
  placeholder.

## Contract

Not applicable: the surface is four inputs of `rt-aside`, the same four of `rtTab` and one
template directive; they are listed under «Screens and states». The subdomain serves no
procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State                 | What is visible                                                     |
| --------------------- | ------------------------------------------------------------------- |
| not empty             | the panel as before                                                 |
| empty, default        | header, the inbox icon and «No data» in the middle of the body, footer |
| empty, inputs         | the same with the application's icon, title and description         |
| empty, own template   | header, the application's template in the body, footer              |
| empty tab             | the tab strip, the placeholder in the middle of the tab body        |

### The inputs

| input              | type                   | default                           |
| ------------------ | ---------------------- | --------------------------------- |
| `empty`            | `boolean`              | `false`                           |
| `emptyIcon`        | `IRtIcon.Name \| null` | `'inbox'`                         |
| `emptyTitle`       | `string \| null`       | `null` — the label `uiEmptyTitle` |
| `emptyDescription` | `string \| null`       | `null`                            |

The tab `rtTab` of `rt-tabs` takes the same four inputs. The own placeholder of a panel is
`<ng-template rtAsideEmpty>…</ng-template>` inside `rt-aside`.

## Cross-cutting requirements

### Locales

One new key of the kit dictionary, `uiEmptyTitle`. The showcase carries the Russian label «Нет данных».

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The panel is full width on a narrow screen; the placeholder stays in the middle of the body.

### Several objects

Every open panel shows its own placeholder.

## Decisions

- **The label is a key of its own, `uiEmptyTitle`, not the existing `uiNoData`.** The owner asked
  for «Нет данных», and `uiNoData` reads «Пока нет данных» under the empty bar list.
- **Emptiness is an input given by the application, not guessed from the projected content.** A
  panel whose content is an empty list still projects the list's markup.

## Open questions

None.

- **A panel with tabs gets its placeholder from the tab, `rtTab`, not from the panel.** The owner
  chose «Вход empty у вкладки» from three options: a tab input, a ready placeholder the screen puts
  into a tab, leaving tabs alone.

## History of changes

- 19 November 2026 — the agreement was written from the owner's request.
- 19 November 2026 — the tab got the same placeholder: the owner chose the tab input.
- 19 November 2026 — the agreement was merged into the spec of the second kit with the code.
