# Scenarios — the focus, parts and properties of the dialog

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-594 — the focus trap holds Tab inside and leaves with the dialog

Given a dialog opened with a focus trap
When it is open, and then closed
Then the trap stands around the dialog while it is open and is gone after closing

Coverage: partial — the test checks that the trap's boundaries stand around the dialog and leave
with it, not a Tab press: the test has no keyboard walk. The walk itself is the CDK focus trap's.

### SC-UKV-595 — focus returns after closing

Given a dialog opened with focus restoring from a focused button
When the dialog closes
Then focus is back on that button

### SC-UKV-596 — automatic focus moves to the frame or the first control

Given a dialog opened with automatic focus on the frame, or on the first control
When it opens
Then focus stands on the frame, or on the first control Tab reaches

### SC-UKV-597 — without the focus options the dialog moves no focus

Given a focused button and a dialog opened without focus options
When the dialog opens
Then focus stays on the button

### SC-UKV-598 — a lead element stands before the title

Given a header with an element marked as its lead
When it is drawn
Then the element stands before the title, and a header without one keeps the place empty

### SC-UKV-599 — the footer aligns its content

Given a footer with an alignment, or without one
When it is drawn
Then it carries the modifier of that alignment, and of the end without one

### SC-UKV-600 — the content part holds the body

Given a dialog with a content part
When it is drawn
Then the body stands inside the part, which pads and scrolls it

Coverage: partial — the test checks that the body lands in the part, not its padding and scrolling:
a test has no layout. The snapshot of the dialog story **Content** shows them.

### SC-UKV-601 — the dialog takes its look from properties

Given look properties set by the application on the page root
When a dialog is drawn
Then its background, border, header, title, content and footer take the application's values

Not covered: a test has no layout, and this is a style rule. The snapshot of the dialog story
**Properties** shows it.

### SC-UKV-602 — without the new options the dialog stays as before

Given a dialog without the new options, parts and properties
When it is drawn
Then it looks as before

Not covered: this is a promise about frames. The former snapshots of the dialog stories match without
a re-take.
