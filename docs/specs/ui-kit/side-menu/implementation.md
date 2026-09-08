# What it is carried out by — the second level of the side menu

The rule of the subdomain is on the left, the place where it is carried out is on the right. The paths are
given from the root of the tree.

- **The mode of the submenu arrives by an input, and the default is today's behaviour.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:subMenuMode`
- **A press of the switch does not change the mode but asks for it.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:onSubMenuModeToggle`
- **A pinned submenu shows the active item.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pinnedSubMenu`
- **The pinning does not change what is visible.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pinnedSubMenu`
- **A press of an item of the strip moves the pinned submenu onto its section.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pickPinnedSubMenu`
- **An item with an address of its own and without sections lifts the pinned submenu.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pickPinnedSubMenu`
- **A pinned panel that has nothing to show takes no place.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.scss:.rtui-sub-side-menu--opened`, `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.html:rtui-side-menu-resizer`
- **A pinned submenu closes neither at the leaving of the pointer nor at a transition by its own item.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:toggleSubMenu`
- **There is no backing under a pinned submenu.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:isPinned`
- **The field searches over the open submenu, not over all the sections.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:visibleSubMenuItems`
- **The filter goes by a substring of the label without a count of the case, and an empty query shows everything.** — `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.ts:filterSubMenuItems`
- **The query lives while the submenu is open.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:closeSubMenu`
- **The labels of the field, of the switch and of the empty filter are sewn in in English.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:searchLabel`
- **On a narrow screen there is no pinning, and there is a search.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:isPinned`
- **The handle of the pull is caught wider than it is visible.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.scss:resizer` — the zone of the catching, the visible strip and the overhang are declared by properties of the menu's own; the pseudo-element inside the zone is painted

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a table
here: the bond is checked both ways by the checking of the specs.
