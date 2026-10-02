# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 45–47 for `rt-side-menu`: a `pinShown` input (`true` by default) whose `false`
takes the pin button off; a `subMenuTooltipsShown` input (`true` by default); an `iconButton` of a
row whose name has no pair in the kit set falls back to the menu's `rtSideMenuIcon` template, as the
row icon does.

## What the tree already has

- The pin button stands in the submenu panel head always. The pinned mode comes from the bound
  `subMenuMode`, else from the stored setting, else `hover`.
- Sub-item titles and folder titles carry a tooltip with the name; the favourite buttons carry
  tooltips off narrow screens.
- The row icon falls back to the menu's own template; the row button passes the raw name to
  `rt-icon-button`, and an unpaired name leaves it empty. The warning logic warns about such a
  button always. The template context is the row alone, and templates read `item.icon`.
- `rt-icon-button` draws only an icon by name.

## Decisions

- **Without the pin button the stored setting is not read.** A person who pinned the menu earlier
  could not unpin it any more; the bound `subMenuMode` still decides.
- **`subMenuTooltipsShown: false` takes off every tooltip of the submenu rows** — titles and the
  row buttons. The accessible names stay.
- **The row button falls back to the menu's template, and the template learns what it draws.** The
  context gets `icon` — the name of the place being drawn — and `slot` — `'icon'` or `'iconButton'`;
  `$implicit` stays the row. A template reading `item.icon` keeps drawing the row icon in the row's
  place.
- **`rt-icon-button` projects its content when it has no icon name.** The button keeps its size,
  shape, ripple and states; the menu puts its template inside.
- **A row button with an own template is not warned about.**

## Decisions along the way

- A row button with a name outside the kit and no own template no longer hands that name to the
  icon: the button was empty before as well, while the icon waited for a symbol the set does not
  hold, and the showcase waited with it until its timeout.
