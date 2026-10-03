# Scenarios — the options of a toast and the modes of the toaster

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-625 — the toaster stands on its own layer property

Given a toaster without a layer set by the application
When it is drawn
Then its layer is the kit scale's sticky step, the same 1100 as before

Not covered: a test has no layout, and this is a style rule. The former frames of the toast stories
match without a re-take.

### SC-UKV-626 — a toast lives its own duration

Given a toaster with a duration of its own
When one toast arrives with a shorter duration and another without one
Then the first leaves after its own duration and the second after the toaster's

### SC-UKV-627 — a toast without a duration stays

Given a toast sent with no duration
When any time passes
Then the toast stays until its close button is pressed

### SC-UKV-628 — the progress strip pauses with the timer

Given a toast sent with a progress strip
When the person points at the stack
Then the strip is drawn over the toast's duration, and it stops together with the timer

### SC-UKV-629 — a toast without a timer draws no strip

Given a toast sent with a progress strip and no duration
When it is drawn
Then it has no strip

### SC-UKV-630 — the toast takes its colours from handles

Given colour handles set by the application on the page root
When a toast and a filled toast are drawn
Then each takes the application's colours, and the filled one takes the handles of its severity

Not covered: a test has no layout, and this is a style rule. The snapshot of the toast story
**Handles** shows it.

### SC-UKV-585 — the replace mode lets the previous toasts leave

Given a toaster in the replace mode with a toast on screen
When a new toast arrives
Then the previous toast leaves and the new one stays; in the stack mode both stay

### SC-UKV-586 — a toast shows its own icon or none

Given a toast sent with its own icon, and another sent with the icon turned off
When they are drawn
Then the first shows its own icon instead of the severity's, and the second shows none

### SC-UKV-587 — the severity icons come from an injectable map

Given an application that provides its own map of severity icons
When a toast arrives
Then it shows the icon from that map

### SC-UKV-588 — without the new options the toaster stays as before

Given a toaster and toasts without the new options, handles and mode
When they are drawn and live
Then they look and behave as before

Not covered: this is a promise about frames and the former specs. The former snapshots of the toast
stories match without a re-take, and the former toast specs pass unchanged.
