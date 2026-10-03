# What it is carried out by — the pin and tooltip switches and the row button fallback of the side menu

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A menu without the pin button reads no stored pinned mode.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:pinShown` — scenario `SC-UKV-620`
- **A menu without submenu tooltips shows none on the submenu rows, and the accessible names stay.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:subMenuTooltipsShown` — scenario `SC-UKV-621`
- **A row button without a kit icon takes the menu's own template, which knows what it draws.** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.html:buttonOwnTpl`, `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.directives.ts:IRtSideMenuIconContext` — scenario `SC-UKV-622`
- **A row button with the own template is not warned about.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.logic.ts:unpairedSideMenuIcons` — scenario `SC-UKV-533`
- **An icon button without an icon name shows its projected content.** — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.html:icon-button-content` — scenario `SC-UKV-623`
- **Without the new inputs and template the menu and the icon button draw as before.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.html:pinShown` — scenario `SC-UKV-624`
