# Scenarios — the inline edit

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec.

### SC-UKV-786 — a press on the value opens the field with the value selected

Given an inline edit with a value, and one with an empty value and a placeholder
When the first is pressed
Then the field opens with the value, takes the focus and selects the text; the second shows the
placeholder at rest

### SC-UKV-787 — Enter and the check button save the trimmed draft

Given an open field
When the draft is changed and Enter is pressed, or the check button is pressed
Then the trimmed draft goes out once and the field closes; a draft equal to the value closes the
field and sends nothing

### SC-UKV-788 — Escape and the cross button cancel

Given an open field with a changed draft
When Escape is pressed, or the cross button is pressed
Then the field closes, the cancel goes out, and the value at rest is the same as before

### SC-UKV-789 — an empty draft is not saved unless allowed

Given an open field with an empty draft
When Enter is pressed
Then nothing goes out and the check button is unavailable; with empty values allowed the empty
draft is saved

### SC-UKV-790 — while saving the field waits for the application

Given an inline edit that keeps the field open on saving
When the draft is saved and the saving input turns on
Then the field stays open, the check button spins, the field and the cross are unavailable, and the
field closes when the application closes it. The focus the unavailable field dropped comes back to
the field when the application refuses and to the value when it closes the field; a focus that
moved to another element of the page stays there

### SC-UKV-791 — leaving the field follows its input

Given an open field with the keep, the save and the cancel way of leaving
When the focus leaves the component, and when it moves to the component's own buttons
Then the first keeps the field open, the second saves, the third cancels; a move to the own buttons
changes nothing

### SC-UKV-792 — an unavailable inline edit does not open

Given an unavailable inline edit
When it is pressed
Then the field does not open

### SC-UKV-831 — the field chip is the field itself

Given an inline edit in the field chip look
When it is drawn, focused, given a new value, and made unavailable
Then the value stands in a field with the icon before it and no buttons, focus selects the text, a
new value of the application takes the field, and an unavailable chip is locked

### SC-UKV-832 — the field chip saves on Enter and on leaving

Given a field chip with a typed draft
When Enter is pressed, or the focus leaves it
Then the trimmed draft goes out once and the focus leaves the chip; a draft equal to the value sends
nothing

### SC-UKV-833 — Escape puts the value back in the field chip

Given a field chip with a typed draft
When Escape is pressed
Then the value is back in the field, the cancel goes out, nothing is saved, and the key does not
reach the window around

### SC-UKV-834 — an empty draft in the field chip reverts silently

Given a field chip with an empty draft
When Enter is pressed
Then nothing goes out and the value is back in the field; with empty values allowed the empty draft
is saved
