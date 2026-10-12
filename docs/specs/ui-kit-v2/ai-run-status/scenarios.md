# Scenarios — the run status of the assistant

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-735 — the mark shows the state of the run

Given a status line
When its state is working, done, stopped or failed
Then a spinner, a check, a cross or an exclamation stands left of the label

Covered by the component spec of the line and the frame of the states.

### SC-UKV-736 — a working label carries the running highlight

Given a status line in the working state
When it is drawn
Then the label is marked with the running highlight

Covered by the component spec of the line.

### SC-UKV-737 — stopped and failed labels are marked by their state

Given a status line
When the run is stopped or failed
Then the label is marked muted or red

Covered by the component spec of the line and the frame of the states.

### SC-UKV-738 — the meta is drawn only when given

Given a status line without a meta
When a meta is given
Then it stands right of the label; without it there is no element

Covered by the component spec of the line.

### SC-UKV-739 — the line with steps opens the list

Given a status line with steps, closed
When the line is pressed
Then the list of steps opens under it, `aria-expanded` turns true, the label of the toggle becomes
«Hide steps», and the new state is reported out

Covered by the component spec of the line and the frame of the steps.

### SC-UKV-740 — the line without steps is a status, not a button

Given a status line without steps
When it is drawn
Then there is no button and no chevron, and the row is `role="status"`

Covered by the component spec of the line.

### SC-UKV-741 — the consumer opens and closes the list

Given a status line with steps
When the consumer sets `expanded` to true and then to false
Then the list is drawn and then removed

Covered by the component spec of the line.
