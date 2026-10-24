# Scenarios — the tab strip scrolled to the selected tab

The numbers continue the numbering of the second kit.

### SC-UKV-916 — a strip opened on the last tab is scrolled to it

Given a narrow strip whose tabs do not fit, and `activeId` on the last tab
When the tabs render for the first time
Then the strip is scrolled to its end, the last tab is seen whole, and the left arrow is shown

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.spec.ts`.

### SC-UKV-917 — an outside change of activeId scrolls the strip

Given a narrow strip scrolled to its end
When `activeId` changes to the first tab
Then the strip is scrolled back to its start, and the right arrow is shown

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.spec.ts`.

### SC-UKV-918 — a click scrolls the strip once

Given a narrow strip
When a tab past the right edge is clicked
Then the strip is scrolled to it once, and the render after the click does not scroll again

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.spec.ts`.
