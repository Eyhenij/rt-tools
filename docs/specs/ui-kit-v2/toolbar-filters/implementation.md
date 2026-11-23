# What it is carried out by — the filters of a toolbar behind a button

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too.

- **On a narrow screen the toolbar shows the filters slot as one filter button.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:collapsed`; scenario `SC-UKV-1086`
- **On a wide screen the filters slot stands in the left part of the toolbar, after its content.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:filtersInBar`; scenario `SC-UKV-1087`
- **A filter on is shown by the indicator, and no border of the toolbar cuts it.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:filtersActive`; scenario `SC-UKV-1088`
- **The filter button opens the filters panel.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:openFilters`; scenario `SC-UKV-1089`
- **«Применить» reports `filtersApply` and closes the panel; «Сбросить» reports `filtersReset` and leaves it open; the back arrow closes it and reports nothing.** — `projects/ui-kit-v2/src/lib/components/toolbar/filters-panel/rt-toolbar-filters-panel.component.ts:onApply` — and `onReset` next to it; the panel of the kit closes on `dismiss` in `projects/ui-kit-v2/src/lib/components/toolbar/filters-aside/rt-toolbar-filters-aside.component.ts:close`; scenario `SC-UKV-1090`
- **The title of an aside header without an overline stands on one line with the back arrow.** — `projects/ui-kit-v2/src/lib/components/aside/header/rt-aside-header.component.scss:__heading`; scenario `SC-UKV-1091`
- **The footer of an aside keeps the label of its dismiss button on a phone when told so.** — `projects/ui-kit-v2/src/lib/components/aside/footer/rt-aside-footer.component.ts:phoneCloseLabel`; scenario `SC-UKV-1092`
- **The filters panel lives no longer than its toolbar and its narrow screen.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:#closeFilters` — and the injector of the toolbar passed to the aside service as the owner; scenarios `SC-UKV-1093`, `SC-UKV-1096`
- **The filters panel holds the keyboard focus while it is open.** — `projects/ui-kit-v2/src/lib/components/toolbar/filters-panel/rt-toolbar-filters-panel.component.html:trapFocus` — the input of `rt-aside`, and `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:#focusBar` on a wide screen; scenarios `SC-UKV-1094`, `SC-UKV-1097`
- **The filters panel is announced as a modal dialog.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts:modal` — set by `rt-toolbar-filters-panel.component.html`; scenario `SC-UKV-1098`
- **A filter on is named to a screen reader in words.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:filtersAriaLabel`; scenario `SC-UKV-1095`
- **The filters stand in the row from 1080 points and behind the button from 1079 down.** — `projects/ui-kit-v2/src/lib/platform/breakpoints.service.ts:belowNarrow` — read by `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:#narrow`; scenario `SC-UKV-1710`
- **With `filtersPanel` set to `app` the filter button opens no panel of its own and reports `filtersOpen`.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:openFilters`; scenarios `SC-UKV-1711`, `SC-UKV-1715`
- **The application panel draws the filters of the toolbar.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar-filters.hub.ts:register` — the toolbar hands its filters over, `projects/ui-kit-v2/src/lib/components/toolbar/filters-panel/rt-toolbar-filters-panel.component.ts:#source` takes them; scenario `SC-UKV-1712`
- **The application panel asks to be closed by `dismiss`.** — `projects/ui-kit-v2/src/lib/components/toolbar/filters-panel/rt-toolbar-filters-panel.component.ts:dismiss`; scenarios `SC-UKV-1713`, `SC-UKV-1714`
