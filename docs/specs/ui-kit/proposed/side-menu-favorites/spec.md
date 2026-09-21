# Favourites of the side menu

**Status:** proposed · **Revision:** 2026-09-21 · **Scenario prefix:** `SC-UK`
**Depends on:** the second level of the side menu — the favourites block stands in its submenu
**Laws:** `frontend-application`, `reuse-first`, `navigation`
**Procedures:** none

The product agreement written before the code. It merges into `docs/specs/ui-kit/` as the
subdomain `side-menu-favorites` by the last commit of the PR, with the scenario numbers unchanged.
A subdomain of its own, not a section of the second level: that spec is already two hundred lines
long.

## Why

A person who works in three or four sections out of dozens opens a strip item, finds the section in
its submenu, and does so again at every change of work. The search spares the reading, not the
walk: the section still lies in another strip item.

Favourites gather the chosen sections at the top of every submenu, in the order the person set.
The choice outlives a reload and belongs to the person, not to the screen. The application reads
and writes the same list through one service of the kit: it can show it elsewhere, clear it on
sign-out or fill it with defaults.

## Terminology

| Term                   | What it is                                                                        |
| ---------------------- | --------------------------------------------------------------------------------- |
| A favourite            | The id of a submenu item with an address of its own, chosen by the person         |
| The favourites list    | The ordered ids of the favourites; the order is the person's                      |
| The favourites block   | The group at the top of the open submenu showing the favourites that the menu has |
| The star               | The button on a row that adds the item to the list or removes it                  |
| The handle             | The grip of a row of the block by which the row is dragged to a new place         |
| The favourites service | The kit service holding the list and keeping it in the browser storage            |

### What it is called in the interface

| In the agreement     | On the screen                                                            |
| -------------------- | ------------------------------------------------------------------------ |
| The favourites block | the heading "Favourites" with a filled star, rows under it               |
| The star, off        | an outlined star; the tooltip "Add to favourites"                        |
| The star, on         | a filled star in the accent colour; the tooltip "Remove from favourites" |
| The handle           | a six-dot grip at the left of a row of the block                         |

## Rules

- **Favourites are switched on by providing the service, and without it the menu is as before.** A
  consumer who did not provide it sees neither stars nor the block: the kit ships to applications
  that never asked for favourites.
- **The list is held by the service, and the application reads and writes it through the same
  service.** The service gives the list as a signal and the methods has, add, remove, toggle, move,
  set and clear. A second holder of the same list diverges from the first at the first edit.
- **The service is provided once, in the application's environment injector, and the menu reads it
  optionally.** Two providers over one key are two holders of one list; a service provided below
  the menu is not seen by it.
- **The list is kept in the browser storage under a key the consumer may name.** The storage is
  taken through the storage tokens of `@rt-tools/core` only; without them, and outside the browser,
  the list lives in memory, and nothing fails. Two applications on one origin keep two lists by two
  keys.
- **A broken record in the storage reads as an empty list, and a failed write keeps the list in
  memory.** Not an array, an id neither a string nor a number, a duplicate — dropped; `1` and `"1"`
  are two different ids. Neither a read nor a write throws: a full or closed storage must not take
  the menu down.
- **Only ids are kept; the row is built from the menu's own items.** The label follows the language
  of the items, and the address follows the declaration: a kept label would lie after a rename. The
  row is the first item with an address and that id found depth-first over the submenus of the
  strip items; ids unique across the submenus are the consumer's duty.
- **An id the menu does not have is not shown, and it stays in the list.** Items come and go with
  rights and with the address; an id removed at the first absence would be lost when the right
  returns. The service removes an id only when asked.
- **A star stands on every submenu item with an address of its own, folders excluded.** A folder is
  an item without an address: it leads nowhere, and a favourite that opens nothing is a broken
  favourite. The row returning to the main list on a narrow screen carries no star. The star stands
  at the right edge of the row, after the consumer's additional button.
- **A row of the block carries its own filled star.** A favourite is removed in place, without
  looking for its row in the list.
- **An item in the list carries a filled star, the rest an outlined one.** The fill is the first
  sign, the accent colour the second: on a static icon set there is no fill axis, and the colour
  alone still tells the two apart.
- **The outlined star shows on hover and on keyboard focus of its row; the filled star always
  shows.** Stars on every row of a long list read as noise; the chosen ones must be visible at a
  glance. Where the pointer cannot hover — a narrow screen, a touch screen by `(hover: none)` — the
  outlined star shows always.
- **The star carries a tooltip and an accessible name: "Add to favourites" or "Remove from
  favourites".** The press state is given by `aria-pressed`. The label says what the press will do,
  not what the state is.
- **A press of the star switches the favourite and does nothing else.** It neither opens the item
  nor closes the submenu nor moves the keyboard highlight: the person was choosing, not going. A
  submenu opened by hover stays held while the focus is on a star, the same as while it is on the
  search field.
- **The block stands at the top of every open submenu, under the search field and above the list.**
  Favourites are one list for the whole menu: the block shows all of them whatever strip item was
  opened — a person reaches a favourite from wherever they are.
- **The block shows the favourites in the order of the list.** The order is the person's, not the
  menu's.
- **The block with nothing to show takes no place.** No heading over an empty group: the stars on
  the rows already say how to fill it.
- **While the search query is not empty, the block is hidden.** The search belongs to the section;
  a found row and a favourite row of the same item side by side would read as two different things.
- **A row of the block opens its item the same way as the row in the list does.** The same address,
  the same output to the consumer, the same closing of an unpinned submenu.
- **A row of the block is marked active by the same rule as the row in the list.** The person must
  see where they stand from the block as well.
- **A row of the block carries no page id of its item and no keyboard ring.** The bringing of the
  active item into view and the keyboard highlight aim at the list row; a second node with the same
  id would take them over.
- **A row of the block is dragged by its handle, and the new order is kept at the drop.** The rest
  of the row stays a link: a row dragged by its whole body cannot be pressed without a jitter.
- **A drop moves the dragged id next to its visible neighbour, and hidden ids keep their places.**
  The block shows only the ids the menu has, so a place in the block is not a place in the list.
- **While a row is dragged, the submenu stays open in either mode.** A drag leaving the panel would
  close a hover submenu in the middle of the drop.
- **A dropped row outside the block changes nothing.** The list is not removed by a drag; removal is
  the star.
- **The block does not keep open a pinned panel that has nothing else to show.** The rule of the
  second level stands: an address without sections lifts the pinned submenu, favourites or not.
- **The labels are sewn in in English and are replaced by the provider settings.** The first kit
  has no dictionary; an application in another language names its own three labels once.
- **On a narrow screen the block stands the same, under the search of the submenu.** The same rows,
  the same stars, the same handle: the split between the two layouts would be a second favourites.

## What is out of scope

- **The favourites of the second kit.** `rt-page-header` is not touched: the owner named the first
  kit.
- **The keyboard walk over the block.** The arrows walk the section list as before; the rows of
  the block, their stars and handles are reached by Tab. A reorder from the keyboard is not given.
- **Favourites of the strip items and of folders.** Only items with an address of their own.
- **Synchronising the list between tabs and devices.** A tab reads the storage when the service is
  created.
- **The admin application.** Its menu is `rt-page-header` of the second kit, flat, with no submenu.

## Contract

Not applicable: the subdomain serves no procedures. Its public surface is the provider function,
the service and the menu, and they are named in the section "Data".

### Refusal codes

Not applicable: the service refuses nothing — a broken record reads as an empty list.

## Data

One record of the browser storage: the key named by the provider, `rtui-side-menu-favorites` by
default; the value is a JSON array of ids, each a string or a number, in the order of the list.
Written at every change of the list.

The public surface:

| Name                                             | What it is                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `provideRtuiFavorites(config?)`                  | the providers of the service; `config.storageKey`, `config.labels` with `title`, `add`, `remove` |
| `RtuiFavoritesService.ids`                       | the list as a read-only signal                                                                   |
| `has(id)`, `add(id)`, `remove(id)`, `toggle(id)` | a check and three edits of one id; adding an id already in the list does nothing                 |
| `move(from, to)`                                 | moves an entry between two places of the list                                                    |
| `set(ids)`, `clear()`                            | replaces the list whole, empties it                                                              |

## Screens and states

| State                                      | What the submenu shows                                |
| ------------------------------------------ | ----------------------------------------------------- |
| no service                                 | the submenu as before: no stars, no block             |
| service, empty list                        | outlined stars on hover, no block                     |
| service, favourites the menu has           | the block with their rows over the list               |
| service, favourites the menu does not have | no rows for them; the block is absent if none is left |
| a query in the search                      | the block is hidden, the stars stay on the found rows |

## Cross-cutting requirements

### Locales

The three labels — the heading, "Add to favourites", "Remove from favourites" — are sewn in in
English and replaced by `config.labels`. There are no dictionary keys: the first kit has no
dictionary.

### SEO

Not applicable: the kit has no pages of its own.

### Mobile layout

The block stands in the narrow layout of the submenu under the search field, with the same rows,
stars and handles; the outlined star shows always, since there is no hover.

### Several objects

Not applicable: one list per application key.

## Decisions

- **A service of the kit, not an input and an output of the menu** — the owner asked for a service
  kept in localStorage and reachable from the application. The neighbouring subdomain keeps the
  mode and the width with the consumer; that rule stays for them, and the second level's spec is
  edited to name favourites as the exception. Rejected: `favoriteIds` in and out — every
  application would write the same storage service anew.
- **Not a projection directive** — every application would repeat the markup, the drag and the
  narrow layout. Rejected by the executor, the owner left the technique to them.
- **Ids, not items, are kept** — a kept label goes stale at a rename or a language switch.
- **The storage through the `LOCAL_STORAGE` token of `@rt-tools/core`, and memory without it** —
  rule `platform-access`. Rejected: the theme service's fallback to the document's own storage —
  that is the direct reach the rule forbids.
- **The exception to "the kit does not go into the browser storage" is the owner's** — the request
  names the service kept in localStorage. The second level's spec names favourites as the exception
  by the same PR.
- **The drag through the CDK, as in the selected list of the dynamic selector of the same kit** —
  law `reuse-first`.

## Open questions

- `Q-1` — whether an application needs the list emptied at sign-out by the kit itself. The work goes
  with the assumption: no, the application calls `clear()`.
- `Q-2` — a page rendered on the server has no block, and it appears after the start in the browser.
  The work goes with the assumption: the first kit is drawn in the browser by its consumers, and
  the jump is accepted.
