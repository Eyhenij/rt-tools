# Scenarios — the switches, initial query and popup state of the dynamic selector

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-613 — a list without the bin draws no remove button

Given a selector, or a text input, with the bin switched off
When its list is drawn
Then the rows stand without the remove button

### SC-UKV-614 — a list without the panel keeps the add button

Given a selector, or a text input, with the reset and clear panel switched off
When its list is drawn
Then the add button stands under the list, and reset and clear do not

### SC-UKV-615 — with the panel switch on the bar follows the invitation

Given a selector with the panel switch on, as by default, and then with an invitation
When it is drawn
Then reset and clear stand under the list, and with the invitation the bar gives its place to it

### SC-UKV-616 — row edits keep reset and clear active

Given a selector, or a text input, whose keys equal the initial ones, with edits in its rows
When reset and then clear are pressed
Then both are active, reset keeps the value and reports, and clear reports

### SC-UKV-617 — the popup opens on the initial query

Given a selector with an initial query
When its popup opens
Then the search field holds the query, the offer is filtered by it, and no search is reported

### SC-UKV-618 — the selector tells whether its popup is open

Given a selector
When its popup opens and closes
Then its state signal follows, and each change is reported once

### SC-UKV-619 — without the new inputs the selector stays as before

Given a selector and a text input without the new inputs
When they are drawn
Then they look as before

Not covered: this is a promise about frames. The former snapshots of the selector and text input
stories match without a re-take.
