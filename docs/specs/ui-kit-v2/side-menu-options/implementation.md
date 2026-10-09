# What it is carried out by — the pin and tooltip switches and the row button fallback of the side menu

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A menu without the pin button reads no stored pinned mode.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:pinShown` — scenario `SC-UKV-620`
- **A menu without submenu tooltips shows none on the submenu rows, and the accessible names stay.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-look.base.ts:subMenuTooltipsShown` — scenario `SC-UKV-621`
- **A row button without a kit icon takes the menu's own template, which knows what it draws.** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.html:buttonOwnTpl`, `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.directives.ts:IRtSideMenuIconContext` — scenario `SC-UKV-622`
- **A row button with the own template is not warned about.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.logic.ts:unpairedSideMenuIcons` — scenario `SC-UKV-533`
- **An icon button without an icon name shows its projected content.** — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.html:icon-button-content` — scenario `SC-UKV-623`
- **Without the new inputs and template the menu and the icon button draw as before.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.html:pinShown` — scenario `SC-UKV-624`
- **A rail without titles names its items by a tooltip on the right and by the accessible name.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-look.base.ts:railTitlesShown`, `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.html:railTip` — scenario `SC-UKV-817`
- **The rail item tooltip obeys the submenu tooltip switch.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.html:railTip` — scenario `SC-UKV-817`
- **Rail icons are filled only by the input.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-look.base.ts:railIconFill` — scenario `SC-UKV-818`
- **The submenu search takes its size and look from the menu inputs on both screens.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-look.base.ts:searchSize`, `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-look.base.ts:searchAppearance` — scenario `SC-UKV-783`
- **Every submenu row and folder carries its item number as a mark.** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.html:data-item-id` — scenario `SC-UKV-784`
- **The colours, sizes and paddings of the rail, the panel and the rows are menu properties, and without them the menu draws as before.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.scss:rt-side-menu-rail-bg`, `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.scss:rt-side-menu-sub-item-min-height` — scenario `SC-UKV-785`
- **The folder icon has a Material pair.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon-material-map.ts:folder` — scenario `SC-UKV-793`
- **Submenu row and folder icons are filled only by the input.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-look.base.ts:subItemIconFill` — scenario `SC-UKV-794`
- **A submenu row hands its press to the consumer before the navigation, and a prevented press does not navigate.** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.ts:onClickSubMenu` — scenario `SC-UKV-795`
- **A submenu opened by hover closes after the delay input, and the pointer coming back keeps it open.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:subMenuCloseDelay` — scenario `SC-UKV-796`
- **The submenu panel shows the scroll hint only by the input.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-look.base.ts:panelScrollHintShown` — scenario `SC-UKV-797`
- **The row buttons take their rounding, size, icon size and resting colour from row properties, and the row icon fill input fills the consumer's button too.** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.scss:rt-side-menu-sub-item-button-radius`, `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.html:iconFill` — scenario `SC-UKV-806`
