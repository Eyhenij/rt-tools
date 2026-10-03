# Scenarios — the properties of the small parts

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-565 — a host rule reaches the size properties

Given a toggle switch or a toggle button group of any size
When it is drawn
Then its size modifier stands on its host, where its size properties are declared

Covered: `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.spec.ts`,
`projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.spec.ts`.
That an application rule on the tag wins over the kit's step is a property of the cascade. The
stories **HostRule** of the tag and the toggle switch show it in a frame.

### SC-UKV-566 — the label names the switch

Given a toggle switch with a label
When it is drawn
Then the label stands after the button, is bound to it and names it for a screen reader

Covered: `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.spec.ts`.

### SC-UKV-567 — a press on the label toggles

Given a toggle switch with a label
When the label is pressed
Then the switch toggles; a disabled one does not

Covered: `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.spec.ts`.

### SC-UKV-568 — without a label the markup stays

Given a toggle switch without a label
When it is drawn
Then there is no label, no id of its own and no binding on the button

Covered: `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.spec.ts`.

### SC-UKV-569 — a loading button hides its label and keeps its width

Given a button with the hidden loading label
When it is loading
Then its icon and label stay in the button, invisible, and the loader stands over them

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`. That the width
does not change is a style rule. The snapshot of the story **LoadingLabel** shows both modes side by
side.

### SC-UKV-570 — a tooltip stands on the left or on the right

Given a tooltip with the left or the right placement
When it opens
Then it stands beside its anchor, centred on its height, with a gap

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.logic.spec.ts`.

### SC-UKV-571 — a side tooltip that does not fit moves

Given a side tooltip
When its side does not fit
Then it moves to the opposite side, then above, then below

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.logic.spec.ts`.

### SC-UKV-572 — the tag takes its colours and paddings from handles

Given a tag with handles set by the application
When it is drawn
Then its background, text, outline, paddings and letter spacing are the application's

Not covered: a test has no layout, and this is a style rule. The snapshot of the tag story **Handles** shows it.

### SC-UKV-573 — the toolbar takes its layout from properties

Given a toolbar with layout properties set by the application
When it is drawn
Then its height, inline padding, bottom border, gap and centre alignment are the application's

Not covered: a test has no layout, and this is a style rule. The snapshot of the toolbar story **Layout** shows it.

### SC-UKV-574 — the disabled opacity is a property

Given a disabled toggle switch
When the application sets the disabled opacity
Then the switch and its label take that opacity; without it the opacity is 0.5

Not covered: the toggle switch spec checks only the disabled modifier on the host, where the opacity
is read. The value itself is a style rule, shown by the story **Label**.
