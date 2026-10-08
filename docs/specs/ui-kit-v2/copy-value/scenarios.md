# Scenarios — the value with a copy button

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-742 — the value stands on a plate, the label only when given

Given a value without a label
When a label is given
Then it stands left of the value; without it there is no element

Covered by the component spec of the part and the frame of the label.

### SC-UKV-743 — a press copies exactly the value

Given a value
When the copy button is pressed
Then the value goes to the clipboard and is reported out

Covered by the component spec of the part.

### SC-UKV-744 — the button shows «Copied» for two seconds

Given a value just copied
When two seconds pass
Then the check and «Copied» turn back into the copy icon and «Copy»

Covered by the component spec of the part.

### SC-UKV-745 — the consumer's label of the button

Given a value with `copyLabel` «Copy reference»
When it is drawn
Then the tooltip and the name of the button are «Copy reference»

Covered by the component spec of the part.

### SC-UKV-746 — a long value is cut and the button stays

Given a long value in a narrow column
When it is drawn
Then the value ends with an ellipsis and the copy button is visible

Covered by the frame of the width.
