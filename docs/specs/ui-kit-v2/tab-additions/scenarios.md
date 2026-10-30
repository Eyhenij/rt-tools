# Scenarios — what the tabs give an application moving from Material

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through
and were not recounted at the merge: the titles of the tests refer to them.

### SC-UKV-922 — a closable tab asks the host to close it

Given tabs where some tabs are closable
When the person presses the cross of a tab, or presses Delete on a closable tab in focus
Then the host is asked to close that tab, the press does not choose it, and a disabled tab has no cross and is not closed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-923 — a tab shows its tooltip

Given a tab with a tooltip
When the pointer rests on it
Then the tooltip is shown; a tab with no visible label is named by its tooltip, and an invalid tab explains its error instead

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-924 — a disabled tab explains why it is disabled

Given a disabled tab with a tooltip
When the pointer rests on it, or the person presses it
Then the tooltip is shown, and the press does not choose the tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-925 — a tab draws a Material glyph

Given a tab with a Material glyph name
When the tab strip is drawn
Then the glyph stands in the tab title where the kit icon would

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-926 — the tab strip works without the panel

Given tabs in the header-only mode
When the strip is drawn and the person chooses a tab
Then no tab panel is drawn and no tab points to one, and the choice is still reported

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-1019 — the cross of a tab is reached from the keyboard

Given tabs where some tabs are closable
When the person moves with Tab from the tab in focus, and presses the cross
Then the cross is a button of its own next to the tab, named by its tooltip; only the cross of the
tab in focus is in the tab order; the tab closes, and the focus goes to the tab that became active

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`,
`projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-close.spec.ts`.

### SC-UKV-983 — manual activation moves focus, Enter and Space open the tab

Given tabs with `activation="manual"`
When the person presses an arrow, Home or End on a tab
Then focus and the single tab stop move to the next enabled tab, the open tab and its panel stay,
and nothing is emitted; Enter or Space on the focused tab opens it. Without the input an arrow
opens the tab at once, as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-984 — a press on a scroll arrow pages the tab list

Given a tab list wider than its place
When the person presses a scroll arrow and lets go before 300 ms
Then the list moves by 80 px by default, or by its visible width with `scrollStep="page"`, not past
its edge; held longer, it scrolls on until let
go and adds no page step on release; a pointer that leaves the arrow first moves nothing

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-985 — scroll arrows can stand in their own places

Given tabs with `scrollArrows="inline"`
When the list overflows
Then both arrows stand at the edges beside the list, and the one with nothing to scroll to is
pale and takes no press; without overflow neither is drawn. Without the input the arrows lie over
the tabs, as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-986 — the selected tab bar survives a zero border width

Given the tab border width property set to `0`
When a tab is selected
Then its bar stays at the bottom of the tab: the offset is a translate by the width, not a `calc`
that turns unitless and invalid at `0`

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-987 — the panel of the previous tab leaves, the new one slides in

Given tabs with a panel duration above zero
When the selection moves to another tab, by a click or by `activeId`
Then the open panel itself, not a copy, leaves towards the side opposite to the move, and the new
panel slides in from the other side; the leaving one is hidden from reading and from focus, carries
its own anchor, and is removed when its own motion ends

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-988 — motion is off at a zero duration and for reduced motion

Given the panel duration `0`, or a person who asked for reduced motion
When the selection moves
Then the panel changes in place, and the styles drop the bar transition and the panel animation

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-989 — the duration input sets both motions

Given `animationDuration` as a number, a string of digits or a CSS time
When the tabs render
Then the bar and panel duration properties on the host carry it, digits read as milliseconds;
without the input the properties stay with the tokens, and the list scroll duration stays with its
token either way

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-990 — the selected tab bar is one element of the list

Given tabs after their first render
When the selected tab is measured
Then one bar element of the list draws the selection, the tab's own bar goes transparent, and the
bar turns the error colour under an invalid selected tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-991 — the body of a visited tab lives on with `preserveContent`

Given tabs with `preserveContent`
When the person types on a tab, leaves it and comes back
Then the same body shows what was typed; while inactive it is hidden, out of reading and out of the
tab order, a tab never opened is not created, and without the input the body is destroyed as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-preserve.spec.ts`.

### SC-UKV-992 — with preserved bodies the live panel leaves

Given tabs with `preserveContent` and a panel duration above zero
When the selection moves
Then the live body of the previous tab leaves, the new one slides in, and after the motion the
previous body stays hidden rather than removed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-preserve.spec.ts`.

### SC-UKV-993 — an arrow scrolls the tab list smoothly by the chosen step

Given a tab list wider than its place and a scroll duration above zero
When the person presses a scroll arrow
Then the list's own scroll moves along the scroll curve for its duration and stops exactly at the
target, 80 px, a page or a third of the visible width by `scrollStep`; a second press counts from the
target of the running scroll, and a hold tick stops it and moves at once

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll.spec.ts`.

### SC-UKV-994 — a half-hidden selected tab scrolls in, and motion can be off

Given a selected tab cut by the edge of the list
When it is chosen
Then the list scrolls it into view by the same motion; a fully visible tab does not move the list,
and a zero duration or reduced motion scrolls at once

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll.spec.ts`.

### SC-UKV-995 — the close cross has its own tooltip, and the tab's own is silent over it

Given a closable tab with its own `tooltip` and a `closeTooltip`
When the pointer moves from the tab onto its close cross
Then the tab's tooltip closes and only the cross's tooltip shows, on the side `closeTooltipPlacement`
names; without `closeTooltip` no tooltip shows over the cross, and once the pointer leaves the cross,
or the cross is removed from under it, the tab shows its own tooltip again

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-close.spec.ts`.

### SC-UKV-996 — the look of the close cross comes from its properties

Given a closable tab
When the application sets the `--rt-tab-item-close-*` properties on `.rt-tab-item`
Then the cross takes its rest and hover background, its rest and hover icon colour, its icon size and
its inline margins from them; left unset, the cross looks as before

Не покрыто: jsdom не считает стили компонента; вид крестика измерен в витрине до и после правки.

### SC-UKV-999 — the open panel can leave the Tab order

Given tabs whose open panel holds a field
When the application sets `contentTabIndex` to `null` and the person presses Tab on the active tab
Then the focus goes straight to the field, and the panel carries no `tabindex`; without the input the
panel keeps `tabindex="0"` and takes the focus first, as before

Покрытие: частичное — тест проверяет атрибут панели; переход фокуса по Tab проверен в витрине.

### SC-UKV-1082 — a tab fills its icon when it asks for it

Given tabs where one tab has `iconFill` and an icon by `glyph`, and another has `iconFill` and an icon by `icon`
When the tab strip is drawn
Then the icon of each such tab gets `fill`: the glyph is drawn filled, the kit name is filled under the material preset; the tabs without `iconFill` keep the outlined icon

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-icon-badge.spec.ts`.

### SC-UKV-1085 — a tab puts its badge over the icon when it asks for it

Given tabs with an icon and a badge: one with `badgePosition` `'overlay'`, one without it, one with `'overlay'` and no icon, one with no title
When the tab strip is drawn
Then the badge of the first stands over the icon corner, and the tab is as wide as without a badge. The second keeps the badge after the title, and so does the tab without an icon. The tab without a title draws no empty title

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-icon-badge.spec.ts`.
Покрытие: частичное — ширину вкладки jsdom не меряет; её меряет витрина против макета.
