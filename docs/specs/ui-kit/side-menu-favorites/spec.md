# Favourites of the side menu

**Status:** in force · **Revision:** 2026-09-22 · **Scenario prefix:** `SC-UK`
**Depends on:** the second level of the side menu — the favourites block stands in its submenu
**Laws:** `frontend-application`, `reuse-first`, `navigation`
**Procedures:** none

A subdomain of the first kit about favourites of the side menu. It is a subdomain of its own: the
spec of the second level is already two hundred lines long.

## Why

A person who works in three or four sections out of dozens opens a strip item, finds the section in
its submenu, and does so again at every change of work. The search spares the reading, not the
walk: the section still lies in another strip item.

Favourites gather the chosen sections at the top of the submenu of a strip item that has them
switched on, in the order the person set.
The choice outlives a reload and belongs to the person, not to the screen. The application reads
and writes the same list through one service of the kit: it can show it elsewhere, clear it on
sign-out or fill it with defaults.

## Terminology

| Term                 | What it is                                                                     |
| -------------------- | ------------------------------------------------------------------------------ |
| A favourite          | The id of a submenu item with an address of its own, chosen by the person      |
| The favourites list  | The ordered ids of the favourites; the order is the person's                   |
| The favourites block | The group at the top of the open submenu showing the favourites of its section |
| The star             | The button on a list row that adds the item to the list or removes it          |
| The remove button    | The button on a row of the block that removes the item from the list           |
| The handle           | The grip of a row of the block by which the row is dragged to a new place      |
| A favourites section | A strip item whose `favorites` flag is on; off by default                      |
| The settings service | The kit service holding the settings of every menu in the browser storage      |

### What it is called in the interface

| In the agreement     | On the screen                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| The favourites block | the heading "Favourites" of 14 px with a filled star of 16 px in the theme colour, rows under it     |
| The star, off        | a hollow star, `star_border`; the tooltip "Add to favourites"                                        |
| The star, on         | a filled star in the theme colour; the tooltip "Remove from favourites"                              |
| The remove button    | a trash can, `delete`; the tooltip "Remove from favourites"                                          |
| The handle           | the button `arrows_outward` turned by 90° after the remove button, the tooltip "Hold button to drag" |

## Rules

- **Favourites are switched on by providing the service, and without it the menu is as before.** A
  consumer who did not provide it sees neither stars nor the block: the kit ships to applications
  that never asked for favourites.
- **Favourites are switched on per strip item by its `favorites` flag, and it is off by default.**
  The submenu of an item without the flag shows neither stars nor the block, whatever the list
  holds. Turning the flag off hides the section's favourites and removes none: they come back with
  the flag. The owner asked for this: not every section of a menu is worth choosing from.
- **The block of a section shows only the favourites of that section.** The list is one for the
  whole menu, kept under the menu's id. The block of a section takes from it the ids found in
  its own submenu, folders included, in the order of the list.
- **The section is the one whose submenu the panel shows, and an empty panel has none.** The
  pinned submenu shows the picked section or, without a pick, the active one; the hover submenu
  shows the hovered one. A strip item with an empty submenu shows no one's favourites.
- **The section is recognised by its items' ids as well, not only by the array.** An application
  may pass the menu again in new objects — at a language or a rights change — and the stars and the
  block stay with the new labels.
- **The settings are held by the service, and the application reads and writes them through the
  same service.** The service gives the list, the mode and the width of a menu by its id as signals,
  the whole settings of a menu, the ids of the stored menus, and the methods has, add, remove,
  toggle, move, set, clear, setSubMenuMode and setSubMenuWidth, each taking the menu id. A second
  holder of the same record diverges from the first at the first edit.
- **Each menu keeps its settings under its own id, and the application names the id.** The menu
  takes it by the input `menuId`, `default` when none or an empty one is given — an application passes the id of
  the person, and the settings of several people on one machine never mix. The settings hold the
  favourites, the submenu mode and its width; a field the kit does not know stays as it lay.
- **The service is provided once, in the application's environment injector, and the menu reads it
  optionally.** Two providers over one key are two holders of one record; a service provided below
  the menu is not seen by it.
- **The settings are kept in the browser storage under a key the consumer may name.** The storage is
  taken through the storage tokens of `@rt-tools/core` only; without them, and outside the browser,
  the settings live in memory, and nothing fails. Under the key lies one object: the settings of
  every menu under its id. Two applications on one origin keep their settings by two keys.
- **A write reads the storage first and changes one field of one menu.** Another tab or other code
  may have written after the service read the key, and a write from a copy in memory would erase it;
  the other menus and the other fields of the same menu leave as they lay, broken ones included.
- **A change made by another tab reaches the signals by the storage event.** The second tab shows
  the list, the mode and the width the first one chose.
- **The kit deletes no settings by itself.** Neither a change of the menu id nor the menu leaving the
  page removes anything; the settings of a menu go only by the application's call.
- **A broken record in the storage reads as no settings, and a failed write keeps them in memory.** A
  record that is not an object reads as no settings; a menu whose value is not an object is skipped,
  and its neighbours are read. A mode other than hover or pinned and a width that is not a number
  read as no value, and the neighbouring fields stay; the width is brought within the submenu's
  limits. A list that is not an array, an id neither a string nor a number, a duplicate — dropped;
  `1` and `"1"` are two different ids. Neither a read nor a write throws: a full or closed storage
  must not take the menu down.
- **Only ids are kept; the row is built from the menu's own items.** The label follows the language
  of the items, and the address follows the declaration: a kept label would lie after a rename. The
  row is the first item with an address and that id found depth-first over the submenu of the
  open section; ids unique across the submenus are the consumer's duty.
- **An id the menu does not have is not shown, and it stays in the list.** Items come and go with
  rights and with the address; an id removed at the first absence would be lost when the right
  returns. The service removes an id only when asked.
- **A star stands on every item with an address of its own in a favourites section, folders
  excluded.** A folder is
  an item without an address: it leads nowhere, and a favourite that opens nothing is a broken
  favourite. An item without a name has no title row, and the star has no place there either. The row returning to the main list on a narrow screen carries no star. The star stands
  before the consumer's additional button: that button is always visible and stays last, at the
  right edge, while the favourites buttons appear before it and do not move it.
- **The chevron of a folder in a favourites section stands in the column of the stars.** A column
  whose icons stand off by a few points reads as untidy, not as two kinds of buttons.
- **A row of the block carries a remove button, not a star.** Everything in the block is a
  favourite already, and a star there tells nothing apart. A favourite is removed in place, without
  looking for its row in the list.
- **An item in the list carries a filled star, the rest a hollow one.** The fill is given twice:
  by the glyph, `star` against `star_border`, for a static icon set, and by the fill axis for a
  variable one, where `star` without the axis is drawn hollow. The theme colour of the filled star
  is the third sign.
- **The colour of the filled star is the theme's, and the application sets any other.** The kit
  takes the primary colour of the application's Material theme: `--mat-sys-primary` of a theme built
  by `mat.theme()`, else the fill of the theme's button, which carries the same colour in a theme
  from `define-theme`, and without a Material theme the kit's own accent. The star of the heading
  takes the same colour. The application names its own by the property
  `--rt-side-menu-favorite-color` on any ancestor of the menu, and the colour of the heading's label
  by `--rt-side-menu-favorites-title-color`.
- **Every colour, size and spacing of favourites is a property the application overrides.** The kit
  declares none of them and reads each with its default as the fallback: a property declared on the
  block would beat the value the application set on an ancestor. The row being dragged lives in an
  overlay under the page body, so a property meant for it too is set on the page root. Where the
  button size changes, the chevron of a folder and the consumer's button follow it and stay in the
  column of the stars.

    | Property                                     | Default                                        |
    | -------------------------------------------- | ---------------------------------------------- |
    | `--rt-side-menu-favorite-color`              | the primary colour of the Material theme       |
    | `--rt-side-menu-favorite-action-color`       | `--rt-text-base-secondary`                     |
    | `--rt-side-menu-favorite-remove-hover-color` | `--rt-icon-accent-danger`                      |
    | `--rt-side-menu-favorite-action-size`        | 32 px, twice `--rt-spacing-16`                 |
    | `--rt-side-menu-favorite-action-icon-size`   | `--rt-font-size-lg`                            |
    | `--rt-side-menu-favorites-title-color`       | `--rt-text-base-secondary`                     |
    | `--rt-side-menu-favorites-title-font-size`   | `--rt-font-size-sm`                            |
    | `--rt-side-menu-favorites-title-icon-size`   | `--rt-icon-size-sm`                            |
    | `--rt-side-menu-favorites-divider-color`     | `--rt-border-neutral-subtle`                   |
    | `--rt-side-menu-favorites-divider-gap`       | `--rt-spacing-8`                               |
    | `--rt-side-menu-favorites-drag-background`   | `--rt-bg-base-base`                            |
    | `--rt-side-menu-favorites-drag-shadow`       | the dragged-row shadow of the dynamic selector |

- **The hollow star and the remove button show on hover and on focus inside their row; the
  filled star always shows.** Stars on every row of a long list read as noise; the chosen ones must be visible at a
  glance. Where the pointer cannot hover — a narrow screen, a touch screen by `(hover: none)` — the
  hollow star and the remove button show always. The focus shows them only from the keyboard: a
  button pressed by the mouse keeps the focus, and a star removed by a click would stay visible
  after the pointer left.
- **The star carries a tooltip and an accessible name: "Add to favourites" or "Remove from
  favourites".** The label says what the press will do, not what the state is, and the button
  carries no `aria-pressed`: a pressed button named "Remove" would read twice. On a narrow screen
  the tooltips of the star and the remove button are off, the same as the handle's.
- **A press of the star switches the favourite and does nothing else.** It neither opens the item
  nor closes the submenu nor moves the keyboard highlight: the person was choosing, not going.
- **A keyboard focus on a star or a remove button holds a submenu opened by hover until it closes;
  a mouse press does not.** The person walks it by keys, and the pointer leaving the panel must not
  close it — the same as the search field. A focus from a mouse press would hold it after every
  press, and the submenu would stop closing when the pointer leaves.
- **After a remove, the focus stands on the remove button of the neighbouring row.** Otherwise it
  falls to the page, and a keyboard user loses their place.
- **The block stands at the top of the submenu of a favourites section, under the search field and
  above the list.**
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
  of the row stays a link: a row dragged by its whole body cannot be pressed without a jitter. The
  handle is a button with the icon `arrows_outward` turned by a quarter, unless the settings name
  another, and the tooltip "Hold button to drag". It stands inside the item after the remove button and before the consumer's button,
  in the column of the list's stars, and shows under the hover and the focus of its row, the same as
  the remove button. The label of a block row starts where the label of a list row does.
- **A drop moves the dragged id next to its visible neighbour, and hidden ids keep their places.**
  The block shows only the ids found in the open section — ids of other sections and ids the menu
  lacks are hidden alike — so a place in the block is not a place in the list.
- **While a row is dragged, the submenu stays open in either mode, and the drop releases it.** A
  drag leaving the panel would close a hover submenu in the middle of the drop. A row dropped
  outside the panel closes a hover submenu, as the pointer leaving it would have; a dragged row that
  disappears — the pointer took the submenu to another section — releases the hold too.
- **The arrows on a handle move its row to the neighbouring place, and the focus goes with it.**
  The drag knows no keys; without the arrows the handle would be a control a keyboard user reaches
  and cannot use.
- **A dropped row outside the block changes nothing.** The list is not removed by a drag; removal is
  the remove button or the star.
- **The block does not keep open a pinned panel that has nothing else to show.** The rule of the
  second level stands: an address without sections lifts the pinned submenu, favourites or not.
- **The labels are sewn in in English and are replaced by the provider settings.** The first kit
  has no dictionary; an application in another language names its own four labels once.
- **The icons of the remove button and the handle are replaced by the provider settings, one
  without the other.** An icon is a glyph of Material Symbols and a turn in degrees. The trash can
  and the arrows turned by 90° stand by default. A set icon replaces its default whole: without a
  turn it is not turned. A blank glyph counts as absent, the same as a blank label. The service
  gives the resolved icons out, so the application draws the same buttons without a second copy.
  The turn is a number bound to the icon, and the styles hold no turn of their own.
- **The remove icon turns the danger colour under the pointer and the keyboard focus.** The press
  removes the item, and the colour says so before it. The application sets another colour by
  `--rt-side-menu-favorite-remove-hover-color`, its ordinary one included, and then the icon does
  not turn red at all. The star keeps its colours under the pointer.
- **On a narrow screen the block stands the same, under the search of the submenu.** The same rows,
  the same buttons, the same handle: the split between the two layouts would be a second favourites.

## What is out of scope

- **The favourites of the second kit.** `rt-page-header` is not touched: the owner named the first
  kit.
- **The keyboard walk over the block.** The arrows walk the section list as before; the rows of
  the block, their remove buttons and handles are reached by Tab. A reorder from the keyboard is
  given only by the arrows on a handle.
- **Favourites of the strip items and of folders.** Only items with an address of their own.
- **A block showing the favourites of other sections.** Each section shows its own — see the
  decision and `Q-3`.
- **Synchronising the list between tabs and devices.** A tab reads the storage when the service is
  created.
- **The admin application.** Its menu is `rt-page-header` of the second kit, flat, with no submenu.

## Contract

Not applicable: the subdomain serves no procedures. Its public surface is the provider function,
the service and the menu, and they are named in the section "Data".

### Refusal codes

Not applicable: the service refuses nothing — a broken record reads as an empty list.

## Data

One record of the browser storage: the key named by the provider, `rtui-side-menu` by default. The
value is a JSON object with the settings of every menu under its id; the settings hold `favorites`,
an array of ids, each a string or a number, in the order of the list, `subMenuMode`, `hover` or
`pinned`, and `subMenuWidth`, a number of pixels. A change reads the record, edits one field of one
menu and writes the object back.

```json
{
    "user-a": { "favorites": [2, 7, 9], "subMenuMode": "pinned", "subMenuWidth": 320 },
    "user-b": { "favorites": ["reports"] }
}
```

The public surface:

| Name                                              | What it is                                                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `provideRtuiSideMenuSettings(config?)`            | the providers of the service; `config.storageKey`, `config.labels` with `title`, `add`, `remove`, `drag`, `config.icons` with `remove`, `drag` |
| `--rt-side-menu-favorites-title-color`            | the colour of the heading's label, set by the application on an ancestor of the menu                                                           |
| `ISideMenu.Item.favorites`                        | the flag of a strip item switching its favourites on; off by default                                                                           |
| `--rt-side-menu-favorite-color`                   | the colour of the filled star and of the heading's star, set by the application on an ancestor of the menu                                     |
| `menuId` of `rtui-side-menu`                      | the id the menu keeps its settings under; `default` when none or an empty one is given                                                         |
| `RtuiSideMenuSettingsService.ids(menuId)`         | the whole list of a menu as a read-only signal, ids hidden from every block included                                                           |
| `menuIds`                                         | the ids of the menus whose settings are stored, as a signal                                                                                    |
| `has`, `add`, `remove`, `toggle` `(menuId, id)`   | a check and three edits of one id; adding an id already in the list does nothing                                                               |
| `move(menuId, from, to)`                          | moves an entry between two places of the list                                                                                                  |
| `moveVisible(menuId, visibleIds, from, to)`       | moves between places of the shown ids only: the shown ones swap among themselves, the hidden ones stay where they stood                        |
| `set(menuId, ids)`, `clear(menuId)`               | replaces the list whole, empties it                                                                                                            |
| `subMenuMode(menuId)`, `subMenuWidth(menuId)`     | the stored mode, `hover` when none, and the stored width, empty when none, as signals                                                          |
| `setSubMenuMode`, `setSubMenuWidth` `(menuId, …)` | write the mode, write the width brought within the submenu's limits                                                                            |
| `settings(menuId)`, `deleteSettings(menuId)`      | the whole settings of a menu as a signal; deletes them, called only by the application                                                         |
| `SIDE_MENU_SETTINGS_KEY`, `DEFAULT_MENU_ID`       | the storage key and the menu id by default                                                                                                     |

## Screens and states

| State                                     | What the submenu shows                                |
| ----------------------------------------- | ----------------------------------------------------- |
| no service                                | the submenu as before: no stars, no block             |
| service, a section without the flag       | the submenu as before: no stars, no block             |
| service, a flagged section, empty list    | hollow stars on hover, no block                       |
| service, favourites of the open section   | the block with their rows over the list               |
| service, none of them in the open section | no block                                              |
| a query in the search                     | the block is hidden, the stars stay on the found rows |

## Cross-cutting requirements

### Locales

The four labels — the heading, "Add to favourites", "Remove from favourites", "Hold button to
drag" — are sewn in in English and replaced by `config.labels`. There are no dictionary keys: the first kit has no
dictionary.

### SEO

Not applicable: the kit has no pages of its own.

### Mobile layout

The block stands in the narrow layout of the submenu under the search field, with the same rows,
buttons and handles; the hollow star and the remove button show always, since there is no hover.

### Several objects

One settings object per application key, and in it one list per menu id.

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
- **The block of a section shows only that section's favourites, and the list stays one** — the
  executor's reading of the owner's remark «фейворит включается для каждого отдельного раздела»,
  which speaks of the switch, not of what the block shows. Rejected: one shared block in every
  flagged section. The owner is asked by `Q-3`.

## Open questions

- `Q-1` — whether an application needs the list emptied at sign-out by the kit itself. The work goes
  with the assumption: no, the application calls `clear()`.
- `Q-2` — a page rendered on the server has neither the block nor the filled stars, and they appear
  after the start in the browser.
  The work goes with the assumption: the first kit is drawn in the browser by its consumers, and
  the jump is accepted.
- `Q-3` — whether the block of a flagged section shows only its own favourites or those of every
  flagged section. The work goes with the assumption: only its own.

## History of changes

- 2026-09-21 — started under RT-2291. The agreement was written before the code and revised by its
  critique; the scenario numbers stayed the same.
- 2026-09-21 — the owner's look at the showcase. Favourites are switched on per strip item and are
  off by default; the block of a section shows only its own favourites. A row of the block carries
  a remove button instead of a star. The star is hollow or filled, in the theme colour or the
  application's. The handle is the one of the dynamic selector. Scenarios SC-UK-93…SC-UK-95 added,
  SC-UK-79 changed its meaning.
- 2026-09-21 — the review by three independent roles. The section is taken from the submenu the
  panel shows and recognised by ids too; an empty panel shows no one's favourites. The hold comes
  from a keyboard focus only and is released by the drop. The star lost `aria-pressed` and got the
  fill axis. The focus survives a remove; the arrows on a handle reorder. Scenarios SC-UK-96…SC-UK-102
  added.
- 2026-09-21 — the owner: the star was blue, the kit's own accent, not the theme's. The colour now
  follows the primary colour of the application's Material theme; the heading is 14 px with a star of
  16 px in the same colour; the heading's label takes a colour of the application by a property.
- 2026-09-21 — the owner: the handle moved to the right edge, after the remove button, into the
  column of the list's stars.
- 2026-09-21 — the owner: the handle moved inside the item, took the up-and-down arrow and shows
  under the hover like the remove button; the chevron of a folder stands in the column of the stars.
  The showcase got the consumer's "+" buttons and a section root. Scenario SC-UK-103 added.
- 2026-09-21 — the owner: the consumer's "+" is always visible, so it stands last; the star, the
  remove button and the handle appear under the hover before it. In a favourites section the "+"
  stands in the column of the stars. Scenario SC-UK-104 added.
- 2026-09-21 — the owner: every new colour, size and spacing of favourites became a property the
  application overrides, and so did the radius of the pinned submenu.
- 2026-09-21 — the owner: the service and its provider are named after the side menu —
  `RtuiSideMenuFavoritesService`, `provideRtuiSideMenuFavorites()`; the handle took `arrows_outward`
  turned by 90°.
- 2026-09-21 — the owner: one storage key holds one object, the settings of each menu under its id;
  the application names the id by the menu input `menuId` and reads any menu's list by it.
  Scenarios SC-UK-105…SC-UK-107 added, SC-UK-70 and SC-UK-71 changed their record.
- 2026-09-21 — the owner: a star removed by a click stayed visible after the pointer left. The
  focus shows the row's buttons only from the keyboard.
- 2026-09-21 — the owner: the settings of a menu hold its favourites, the submenu mode and its
  width; the service became `RtuiSideMenuSettingsService`, `provideRtuiSideMenuSettings()`. A write
  reads the storage first and edits one field of one menu, a change from another tab arrives by the
  storage event, and the kit deletes nothing itself. Scenarios SC-UK-108…SC-UK-116 added.
- 2026-09-21 — the review of the branch: an empty menu id, a bare attribute included, reads and
  writes as `default` in the menu and in the service. Scenario SC-UK-117 added.
- 2026-09-21 — the owner: the service moves among the shown ids by `moveVisible`, the way the
  block does, and the block's drop reads the storage before it writes. Scenario SC-UK-118 added.
- 2026-09-21 — the review of the change: a row dropped outside the panel closes a hover submenu, and
  a dragged row that disappears releases the hold. Scenarios SC-UK-119 and SC-UK-120 added.
- 2026-09-21 — the review of the change: a row dropped outside the panel closes a hover submenu, and
  a dragged row that disappears releases the hold. Scenarios SC-UK-119 and SC-UK-120 added.
- 2026-09-22 — the owner: the application sets the icons of the remove button and the handle by
  `config.icons`, a glyph and a turn each; the default remove icon is the trash can. Scenarios
  SC-UK-121…SC-UK-123 added, SC-UK-95 names the icon by the settings. The remove icon turns red
  under the pointer, the colour is a property of the application. Scenario SC-UK-124 added.
