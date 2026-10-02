# Scenarios — the message field of the kit

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-480 — the capsule holds a round attach button and a round send button

Given a composer with `attachments`
When it is drawn
Then the paperclip is a ghost icon button with a muted icon and the arrow is a primary one, both
fully rounded; without `attachments` there is no paperclip

Covered by the component spec of the composer and the showcase frames of the composer.

### SC-UKV-481 — the capsule takes the 20px step when it is taller than a row

Given an empty composer
When a file is picked, or the formatting mode is on
Then the capsule is marked tall; an empty composer on one row is not

Covered by the component spec of the composer and the frame of the multiline state.

### SC-UKV-482 — the text grows up to `maxRows` and then scrolls

Given a composer with `maxRows` 6
When twenty rows are typed
Then the field grows to six rows, the rest scrolls, and the buttons stay at the bottom

Covered by the component spec of the composer and the frames of the long and overflow states.

### SC-UKV-483 — the send button is off without content and spins while sending

Given a composer
When it is empty, then holds text, then gets `sending`
Then the button is off, then on, then off with the spinner

Covered by the component spec of the composer.

### SC-UKV-484 — focus draws the border and the ring of the kit's fields

Given a composer at rest
When the text takes focus
Then the capsule has the surface, the focus border and the ring of the kit's fields

Not covered: a test has no layout at all — the border and the ring are a rule under `:focus-within`,
and a spec sees the markup rather than the applied rule. It is closed by the frames of the focus
and typing states of the showcase.

### SC-UKV-485 — a disabled composer takes nothing

Given a composer with `disabled`
When the person types and presses Enter
Then the field takes no text, both buttons are off and nothing is sent

Covered by the component spec of the composer.

### SC-UKV-486 — Enter sends, Shift + Enter breaks the line, and the hint says so

Given a composer with `hint`
When the person presses Enter, then Shift + Enter
Then the first sends the message, the second keeps a new line; the hint line is under the capsule,
and without `hint` it is not

Covered by the component spec of the composer.

### SC-UKV-487 — files stand inside the capsule and leave with the message

Given a composer with `attachments` and two picked files
When one is removed and the message is sent
Then the cards stand inside the capsule above the row, the removed one is gone, and the other leaves
with the message

Covered by the component spec of the composer.

### SC-UKV-488 — the formatting mode puts the rich editor in the same capsule

Given a composer with `formatting`
When it is drawn
Then the rich editor stands inside the capsule in place of the text, and the send button is there

Covered by the component spec of the composer.

### SC-UKV-491 — a stoppable answer puts Stop in place of the arrow and keeps the field open

Given a composer with `stoppable` and `sending`, and a typed draft
When the person types more, presses Enter, then clicks Stop
Then the field takes the text, Enter sends nothing and keeps the draft, the click reports `stopped`;
without `stoppable` the same `sending` blocks the field and spins the arrow

Covered by the component spec of the composer and the frame of the stoppable state.

### SC-UKV-492 — the draft is given from outside and read back

Given a composer whose draft is set from outside
When the person edits it, then sends it
Then the field shows the given text, every edit reaches the consumer, and after sending the draft is
empty on both sides

Covered by the component spec of the composer.

### SC-UKV-493 — the consumer puts the focus into the field

Given a composer whose field has no focus
When the consumer asks for the focus
Then the text field holds it; in the formatting mode the rich editor does

Covered by the component spec of the composer.
