# Scenarios — the tooltip that stays on a click

The numbers continue the numbering of the second kit.

### SC-UKV-850 — with the input false a click keeps an open tooltip

Given a host with `rtTooltipHideOnClick` false and its tooltip open
When the host is clicked
Then the tooltip stays open

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-851 — by default a click hides the tooltip

Given a host without the input and its tooltip open
When the host is clicked
Then the tooltip hides

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-852 — a tap shows no tooltip with the input false

Given a host with `rtTooltipHideOnClick` false
When the pointer comes in and a click follows at once, and the delay passes
Then no tooltip appears

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-853 — a new text shows in an open tooltip

Given a host whose tooltip is open
When its text changes
Then the open panel shows the new text without a new hover

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-854 — an emptied text hides an open tooltip

Given a host whose tooltip is open
When its text becomes empty
Then the tooltip hides

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-855 — the icon button passes the input through

Given an icon button with `tooltipHideOnClick` false and its tooltip open
When the button is clicked and its tooltip text changes
Then the tooltip stays and shows the new text

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-1051 — a tap on a host with `rtTooltipShowOnTap` opens the tooltip at once

Given a host with `rtTooltipShowOnTap` and a non-empty text
When it is tapped
Then the tooltip is open without the delay

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.tap.spec.ts`.

### SC-UKV-1052 — a second tap closes it

Given a tooltip opened by a tap
When the host is tapped again
Then the tooltip closes and does not come back by itself

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.tap.spec.ts`.

### SC-UKV-1053 — a tap outside the host closes it

Given a tooltip opened by a tap
When a person taps outside the host
Then the tooltip closes

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.tap.spec.ts`.

### SC-UKV-1054 — without the input a tap still shows nothing

Given a host without `rtTooltipShowOnTap`
When it is tapped
Then no tooltip appears

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.tap.spec.ts`.

### SC-UKV-1055 — a tap on the usage ring opens its hint

Given a usage ring with a hint
When it is tapped
Then the hint is open at once

Covered: `projects/ui-kit-v2/src/lib/components/usage-ring/rt-usage-ring.component.spec.ts`.
