# Scenarios — the tab strip scrolled to the selected tab

The numbers continue the numbering of the second kit.

### SC-UKV-1027 — a strip opened on the last tab is scrolled to it

Given a narrow strip whose tabs do not fit, and `activeId` on the last tab
When the tabs render for the first time
Then the strip is scrolled to its end at once, the last tab is seen whole, and the left arrow is shown

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-active.spec.ts`.

### SC-UKV-1028 — an outside change of activeId scrolls the strip

Given a narrow strip scrolled to its end
When `activeId` changes to the first tab, then to a middle one
Then the strip is scrolled to each, a middle tab stays clear of both arrows, and the arrows follow

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-active.spec.ts`.

### SC-UKV-1029 — a click scrolls the strip once

Given a narrow strip
When a tab past the right edge is clicked
Then the strip is scrolled to it once, and the render after the click does not scroll again

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-active.spec.ts`.
