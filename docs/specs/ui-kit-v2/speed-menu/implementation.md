# What it is carried out by — the quick menu

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **A press on the trigger opens the actions and a second press closes them; the open trigger shows a cross and says it is expanded.** — `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.ts:onTrigger`, `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.ts:expanded`; scenario `SC-UKV-798`
- **The actions stand on the side the direction names, in the given order, and move to the opposite side when there is no room.** — `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.logic.ts:speedMenuPositions`, `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:positions`; scenario `SC-UKV-799`
- **Every action carries its name as the accessible name and the tooltip; an unavailable action is not pressed.** — `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.logic.ts:speedMenuTooltipSide`, `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.ts:triggerLabel`; scenario `SC-UKV-800`
- **A chosen action goes out by its value, and the menu stays open unless the input closes it.** — `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.ts:onAction`; scenario `SC-UKV-801`
- **Escape closes the menu and returns the focus to the trigger; a press outside closes it and leaves the focus where the press put it.** — `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.ts:onPanelKeydown`; scenario `SC-UKV-802`
- **A keyboard press on the trigger opens the menu into its first available action, and the arrows, Home and End move between the available actions.** — `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.logic.ts:speedMenuNextIndex`, `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.ts:onTrigger`; scenario `SC-UKV-803`
- **An unavailable menu and a menu without actions do not open, and turning unavailable closes an open menu.** — `projects/ui-kit-v2/src/lib/components/speed-menu/rt-speed-menu.component.ts:disabled`; scenario `SC-UKV-804`
- **The floating panel and the icon button without the new inputs behave and look as before.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:positions`, `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.ts:expanded`; scenario `SC-UKV-805`
