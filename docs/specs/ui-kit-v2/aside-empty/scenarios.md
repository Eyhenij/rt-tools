# Scenarios — the empty content of a side panel

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1382 — an empty panel shows the default placeholder

Given a side panel with emptiness and no inputs of the placeholder
When the panel is drawn
Then its body shows the inbox icon and the `uiEmptyTitle` label instead of the content

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-empty.spec.ts`.

### SC-UKV-1383 — a panel without emptiness draws its content

Given a side panel without emptiness
When the panel is drawn
Then the content is drawn and no placeholder is

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-empty.spec.ts`.

### SC-UKV-1384 — the header and the footer stay under emptiness

Given an empty side panel with a header and a footer
When the panel is drawn
Then the header and the footer are drawn and the placeholder stands in the body between them

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-empty.spec.ts`.

### SC-UKV-1385 — the inputs replace the icon, the title and the description

Given an empty side panel with its own icon, title and description
When the panel is drawn
Then the placeholder shows them instead of the defaults

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-empty.spec.ts`.

### SC-UKV-1386 — an own template replaces the placeholder whole

Given an empty side panel with an `rtAsideEmpty` template
When the panel is drawn
Then the body shows the template and no default placeholder

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-empty.spec.ts`.

### SC-UKV-1387 — an empty tab shows the placeholder, the tab strip stays

Given tabs whose selected tab has emptiness
When the tabs are drawn
Then the tab strip is drawn and the tab body shows the inbox icon and the `uiEmptyTitle` label instead of its template

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-empty.spec.ts`.

### SC-UKV-1388 — the tab inputs replace the icon, the title and the description

Given an empty tab with its own icon, title and description
When the tab is drawn
Then the placeholder shows them instead of the defaults, and a null icon removes the icon

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-empty.spec.ts`.

### SC-UKV-1389 — a tab's own template replaces its placeholder

Given an empty tab with its own placeholder template
When the tab is drawn
Then the tab body shows the template and no default placeholder

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-empty.spec.ts`.
