# What it is carried out by — the vertical menu and the tabs «More» mode

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

## The tabs «More» mode

- **Tabs that do not fit leave the row for a menu at its end, and the strip does not scroll.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more.ts:rtTabsFitRow`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more-row.ts:RtTabsMoreRow`; scenario `SC-UKV-1183`
- **The «More» trigger shows only when at least one tab does not fit.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more-row.ts:moreTabs`; scenario `SC-UKV-1184`
- **Tabs leave the row from its end, and the order of the rest does not change.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more.ts:rtTabsFitRow`; scenario `SC-UKV-1183`
- **The selected tab always stands whole in the row.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more.ts:rtTabsFitRow`; scenario `SC-UKV-1185`
- **A pinned tab stands first and never leaves the row.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more.ts:rtTabsFitRow`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.model.ts:MoreSlot`; scenario `SC-UKV-1186`
- **The menu row shows what the tab shows: icon, badge, error mark, disabled state and cross.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more.component.html:row`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more-menu.scss:__close`; scenario `SC-UKV-1189`
- **An error inside the menu puts a dot on the «More» trigger.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more.component.ts:hasError`; scenario `SC-UKV-1188`
- **Closing a row tab brings the first menu tab into the row.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more.ts:rtTabsFitRow`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:onCloseClick`; scenario `SC-UKV-1183`
- **The menu opens under the trigger with its right edge on the trigger's right edge.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more.component.html:rtPopoverAlign`; scenario `SC-UKV-1206`
- **A menu of more than eight rows scrolls inside, and its height stays 282.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more-menu.scss:rt-tabs-more-menu-max-height`; scenario `SC-UKV-1183`
- **The trigger is never drawn as selected.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more-row.ts:rowTabs`; scenario `SC-UKV-1185`
- **The open trigger carries its open look.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more.component.html:morePopover`; scenario `SC-UKV-1206`
- **The scroll mode stays the default, and a strip that names no mode behaves as before.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:overflow`; scenario `SC-UKV-1187`
- **A right click on a tab opens the menu the application declares for it.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu.component.ts:RtTabsContextMenuComponent`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:contextMenu`; scenario `SC-UKV-1199`
- **A strip may show the close cross on the selected tab only.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:closeOn`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.html:closeShown`; scenario `SC-UKV-1201`
- **A pinned tab without an icon of its own draws a pin, and it may still carry a close cross.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:shownIcon`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:showClose`; scenario `SC-UKV-1205`
- **The row holds at most ten tabs, pinned ones included, even when there is room.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more.ts:freeLimit`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.more-row.ts:RT_TABS_MORE_LIMIT`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:moreLimit`; scenario `SC-UKV-1208`
- **A menu row shows its close cross only under the pointer or keyboard focus.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more-menu.scss:__close`; scenario `SC-UKV-1209`
- **The scroll arrows are compact buttons that lie over the tab edge or beside the tabs.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-arrows.scss:__arrow`, `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:scrollArrows`; scenario `SC-UKV-1210`

## The rail and the section panel

- **The vertical layout is chosen by one input, and the horizontal layout stays the default.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:layout`; scenario `SC-UKV-1190`
- **The rail takes the sections as the horizontal header takes them.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.ts:sections`; scenario `SC-UKV-1191`
- **The rail is 50 wide, its items are 50 by 50, and the logo slot of 24 stands 20 from the top.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.scss:__item`, `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.scss:__logo`; scenario `SC-UKV-1191`
- **Sections that do not fit the rail's height scroll inside the rail, and the foot stays in place.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.scss:__sections`; scenario `SC-UKV-1191`
- **A section caption shows as a tooltip to the right of its item.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.html:rtTooltipPlacement`; scenario `SC-UKV-1191`
- **A section with a panel opens the section panel over the page and over the tabs.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.ts:openPanel`; scenario `SC-UKV-1192`
- **The section panel is 220 wide and takes the window's whole height.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.scss:__panel`; scenario `SC-UKV-1192`
- **The profile menu opens above the avatar, 8 from the rail.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-user.component.ts:RAIL_POSITIONS`; scenario `SC-UKV-1193`
- **A switched-on foot button carries the look of the selected item and says it is pressed.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.model.ts:active`, `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-actions.component.scss:__item`; scenario `SC-UKV-1207`

## The tab view

- **With a tab strip the rail loses its foot, and the action cluster stands at the right of the tab row.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:railFoot`, `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-actions.component.ts:RtPageActionsComponent`; scenario `SC-UKV-1193`
- **The tab strip is 33 high and stands above the page, to the right of the rail.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:headerOnly`; scenario `SC-UKV-1193`
- **A single open page shows its tab without a cross.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:showClose`; scenario `SC-UKV-1201`

## The assistant

- **The compact page header follows the width of the page, not of the window.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.ts:#width`; scenario `SC-UKV-1194`

## The compact page header

- **One row makes the bar 56 high, and two rows make it 104.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.logic.ts:pageBarFit`, `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.scss:__row`; scenario `SC-UKV-1194`
- **A title and buttons that leave no room for the filters stand on the first row, and search and filters on the second.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.logic.ts:pageBarFit`; scenario `SC-UKV-1194`
- **There is no third row: filters that do not fit go under the button «More filters» with their count.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.ts:moreFilters`; scenario `SC-UKV-1195`
- **The bar is a separate part, and a page without it keeps its own heading.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.ts:RtPageBarComponent`; scenario `SC-UKV-1194`

## The phone

- **On a phone the header is one row 50 high.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.ts:isNarrow`, `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.scss:__burger`; scenario `SC-UKV-1196`
- **The page title takes the width left over and truncates, and the buttons never leave the screen.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.scss:__title`; scenario `SC-UKV-1196`
- **The burger opens the sections as a menu of the vertical layout, a column 240 wide with rows 48 high and no logo.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-phone-menu.component.ts:RtPagePhoneMenuComponent`, `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.scss:__phone-column`; scenarios `SC-UKV-1202`, `SC-UKV-1203`, `SC-UKV-1204`
- **The phone menu takes the theme colours of the wide layout.** — `projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-phone-menu.component.scss:__row`; scenario `SC-UKV-1202`
- **The filters button opens the bottom sheet with search and all filters.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.ts:sheetOpen`; scenarios `SC-UKV-1197`, `SC-UKV-1200`
- **The actions button opens the kit menu with the page's actions.** — `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.ts:actions`; scenario `SC-UKV-1197`
- **The tab strip stands under the header in the «More» mode.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:moreMode`; scenario `SC-UKV-1183`
