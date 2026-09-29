# The side menu

**Status:** proposed · **Revision:** 29 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the storage of `@rt-tools/core` — the mode and the width of the submenu are kept in
it
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-1883. It merges into the
spec of the second kit by the last commit of the PR, with the scenario numbers it has now.

## Why

An application moving to the second kit keeps the navigation between its sections in the side menu
of the first kit. The second kit has no such menu, and the move stands without it. `rt-menu` of the
second kit is a drop-down menu of actions, not navigation, and the owner forbade replacing it: the
side menu stands next to it as a component of its own.

## Terminology

| Term             | What it is                                                          |
| ---------------- | ------------------------------------------------------------------- |
| the rail         | a narrow column of top-level items with icons                       |
| the submenu      | the panel next to the rail: the items of a section and their search |
| the folder       | an item of the submenu with items of its own inside                 |
| the submenu mode | hover or pinned: what keeps the submenu open                        |
| the menu id      | `menuId` — the name the settings of this menu are kept under        |

### What it is called in the interface

| In the agreement | On the screen                               |
| ---------------- | ------------------------------------------- |
| the search       | a field with the hint «Поиск»               |
| pinned           | the button «Закрепить меню»                 |
| the width handle | a strip along the right edge of the submenu |

## Rules

- **Which items are active comes from outside.** The menu learns it from `activeMenuIds`; a press
  on an item follows its link, and the highlight moves with the new set after the navigation.
  Holding the activity itself, the menu would argue with the address.
- **The submenu is held open by hover or by pinning.** In hover mode it closes when the pointer
  leaves the panel. A pinned submenu stays open and shows the section the person picked, and while
  nothing is picked — the section of the active address. Otherwise a neighbouring section is out of
  reach.
- **The mode and the width of the submenu are kept under the menu id and survive a reload.** A write
  of one menu touches neither the neighbouring menus nor unknown fields: the application may have
  put them there.
- **A storage refusal does not stop the menu.** In a private window the storage is closed, and the
  choice simply does not survive a reload. An unknown mode and a non-numeric width read as no choice.
- **The search goes down into folders and keeps only what matched.** A folder stays as the path to
  its matched children, and its contents are filtered by the same rule. A folder matched only by
  its name stands as one row without children. The caller's set is not edited.
- **The folders of the result stand open, and an erased query brings back the former opening.**
- **Every occurrence of the query is marked in a label, not the whole label.** The comparison
  ignores case, and the pieces are cut from the original.
- **The keyboard walks the visible rows.** The up and down arrows move the highlight, the rows of a
  closed folder are skipped, and at the edges the highlight stops. Without a highlight down takes
  the first row and up the last. Right and left open and close a folder, Enter presses the row of an
  item or opens a folder, Escape erases the query. Other keys reach the field as usual.
- **The width of the submenu is dragged by a handle between 120 and 480 pixels.** The main button
  of any pointer drags it: a mouse, a finger, a pen. On the handle the arrows step by 16 pixels,
  `Home` and `End` lead to the limits. Without a width of its own the design sets it.
- **An empty `menuId` reads as an unset one — the id `main`.**

## What is out of scope

- The favourites block of the submenu — a separate task of epic RT-2353 after this one.
- `rt-menu` of the second kit is neither edited nor replaced.
- The first kit is not edited: it opens as the sample.

## Contract

Not applicable: the surface is the inputs and outputs of a kit component, the subdomain serves no
procedures.

### Refusal codes

Not applicable.

## Data

The settings of every menu lie in the browser storage under one kit key, each menu under its id:
the submenu mode and the width. Unknown fields stay as they were.

## Screens and states

| State            | What is visible                                                     |
| ---------------- | ------------------------------------------------------------------- |
| the rail at rest | the icons of the top-level items, the active one highlighted        |
| hover submenu    | the panel next to the rail over the page while the pointer is on it |
| pinned submenu   | the panel stands next to the rail and moves the page aside          |
| search           | only the matched rows, the matched pieces of the labels marked      |
| keyboard walk    | one row highlighted in the submenu                                  |
| empty set        | an empty rail                                                       |

## Cross-cutting requirements

### Locales

The labels of the menu itself — the search hint, the pin button, the handle — go into the kit's
dictionary in all its languages. The item labels arrive from the caller in its language.

### SEO

Not applicable: the menu is navigation inside an application behind a sign-in.

### Mobile layout

On a narrow screen the menu opens over the page and closes by its own button; the application
learns of it by an output.

### Several objects

Several menus on one page keep their settings apart by their ids.

## Decisions

- **The family is named `rt-side-menu`.** The name of the first kit without its prefix; rejected:
  extending `rt-menu` — that is another family, and the owner forbade replacing it.
- **Favourites go by a separate task.** The family is the largest of the line, and the favourites
  roll back apart from the menu.
- **The separate storage keys of the first kit for the mode and the width are not ported.** The
  second kit keeps its storage keys in one registry, and the mode and the width live in the record
  of the menu under its id.

## Open questions

None.

## History of changes

- 29 September 2026 — the agreement was written by the grilling of the owner's request.
