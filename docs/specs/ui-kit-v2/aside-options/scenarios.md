# Scenarios — the options, focus, pending state and properties of the side panel

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-603 — a disposed panel or dialog finishes its result with nothing

Given an open panel, or an open dialog, and a subscriber to its result
When its overlay is removed without closing
Then the subscriber gets nothing as the result, and the result finishes

Coverage: partial — the test removes a double of the overlay, not the overlay of a real navigation:
the navigation itself is the CDK overlay's own.

### SC-UKV-604 — a closed panel or dialog reports its result once

Given an open panel, or an open dialog, and a subscriber to its result
When it is closed with a result, and its overlay is removed after that
Then the subscriber gets that result once

### SC-UKV-605 — the owner's injector feeds the panel and its destruction closes it

Given a panel opened with the injector of an owner holding a provider of its own
When the content asks for that provider, and then the owner is destroyed
Then the content gets the owner's value, and the panel closes with nothing as the result

### SC-UKV-606 — a refused closing gesture arrives as a close request

Given an open panel under a ban on closing, or with the gestures switched off
When a person clicks the backdrop and presses Escape
Then each gesture arrives as a close request, and a gesture that closed the panel does not

### SC-UKV-607 — the focus trap takes focus and returns it

Given a panel whose focus trap is switched on, with a marked first element
When the trap comes up, and then the trap is switched off or the panel leaves
Then focus stands on the marked element, and then returns to where it stood

Coverage: partial — the test checks the trap's boundaries, the first focus and the return, not a Tab
press: the test has no keyboard walk. The walk itself is the CDK focus trap's.

### SC-UKV-608 — without the trap the panel moves no focus

Given a focused button and a panel without the focus trap
When the panel is drawn
Then focus stays on the button

### SC-UKV-609 — a pending panel is covered by a spinner layer

Given a panel in the pending state, or without it
When it is drawn
Then a layer with a spinner covers it and it is marked busy, and without the state neither is there

### SC-UKV-610 — the header row stands under the title

Given a header with an element in its row, or without one
When it is drawn
Then the element stands under the title row, and the empty row holds nothing

### SC-UKV-611 — the panel takes its padding and footer layout from properties

Given look properties set by the application on the page root
When a panel is drawn
Then its header, content and footer padding, footer margin, alignment and gap, title line height and
error margin take the application's values

Not covered: a test has no layout, and this is a style rule. The snapshot of the side panel story
**Properties** shows it.

### SC-UKV-612 — without the new options the panel stays as before

Given a panel without the new options, inputs, slot and properties
When it is drawn
Then it looks as before

Not covered: this is a promise about frames. The former snapshots of the side panel stories match
without a re-take.

### SC-UKV-716 — the header takes its properties from an ancestor

Given header properties and back button sizes set by the application on a node above the panel
When a panel is drawn
Then the title, the subtitle, the gaps, the row height and the back button take those values, and
without them the header looks as before

Not covered: a test has no layout, and this is a style rule. Checked by a measurement in the
showcase; the snapshots of the side panel stories match without a re-take.

### SC-UKV-717 — the slot of the title column stands under the subtitle

Given a header with an element in the slot of its title column, or without one
When it is drawn
Then the element stands inside the title column, and without it the column holds nothing more

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-open.spec.ts`.

### SC-UKV-718 — a panel removed before its first frame plays no entrance

Given a panel closed in the same task it was opened in
When the next frame comes
Then the service touches neither the removed pane nor its backdrop

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-open.spec.ts`.

### SC-UKV-719 — the caller decides whether a navigation removes the panel

Given a panel opened with the navigation option off, or without the option
When the overlay is created
Then it is told to stay through a navigation, and by default to leave

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-open.spec.ts`.
