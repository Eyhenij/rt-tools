# Scenarios — the breadcrumbs

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec.

### SC-UKV-819 — the chain draws its ancestors as links and the current crumb as text

Given a chain of two ancestors with links and a current crumb
When the breadcrumbs are drawn
Then the ancestors are links to their addresses, the current crumb is text with `aria-current`,
a slash stands between neighbours, and the host is a navigation landmark named «Breadcrumb»

Covered: `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.spec.ts`.

### SC-UKV-820 — the back button leads to the last ancestor and names it

Given a chain with ancestors and the back button asked for
When the breadcrumbs are drawn
Then an arrow before the chain leads to the last ancestor and is named «Back to» its label; without
the request or without ancestors there is no arrow

Covered: `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.spec.ts`.

### SC-UKV-821 — in the heading look the current crumb is the page heading

Given the heading look and content projected into the breadcrumbs
When the breadcrumbs are drawn
Then the ancestors stand on the first row, and the current crumb is a heading on the next row with
the projected content after it

Covered: `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.spec.ts`.

### SC-UKV-822 — a narrow screen folds the middle of a long chain into a menu

Given a chain of four ancestors on a narrow screen
When the breadcrumbs are drawn
Then the first and the last ancestor stay links, the two between them are listed in order in the
menu behind «…», and a wide screen draws all four as links

Covered: `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.spec.ts`.

### SC-UKV-823 — the separator is an input

Given the separator «›»
When the breadcrumbs are drawn
Then «›» stands between the crumbs instead of the slash

Covered: `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.spec.ts`.

### SC-UKV-824 — a long chain stays inside its row and shows its end

Given a chain wider than its column
When the breadcrumbs are drawn
Then the page does not scroll sideways, the row stands at its end with the current crumb in sight,
and a current crumb wider than the row is cut and shows its full label on hover

Покрытие: частичное — the spec checks that the current crumb carries the cut-text tooltip; the
row's end and the page width are seen on the frame of the width story and were measured on :6007.

### SC-UKV-830 — a long current crumb gives way to the section next to it

Given one section and a record name longer than the row
When the breadcrumbs are drawn
Then the section stays in sight as a link, the record name is cut with an ellipsis, and the row does
not scroll; a chain whose ancestors do not fit even next to the threshold still scrolls to its end

Coverage: partial — the spec checks the fit decision by a call; the drawn row is seen on the frame
of the chain story.
