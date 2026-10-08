# Scenarios — the prompt suggestion

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-747 — the card holds the question and the arrow on the right

Given a suggestion card
When it is drawn
Then it is a button with the question and an arrow after it at the right edge

Covered by the component spec of the card and the frame of the list.

### SC-UKV-748 — a press reports the question

Given a suggestion card
When it is pressed
Then the text of the question is reported out

Covered by the component spec of the card.

### SC-UKV-749 — a disabled card is not pressed

Given a disabled suggestion card
When it is pressed
Then nothing is reported

Covered by the component spec of the card and the frame of the states.
