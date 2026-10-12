# Scenarios — the colour palette

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec.

### SC-UKV-807 — the value is a lower-case six-digit hex

Given a palette in a form
When the form writes `#ABC`, `00FF00`, `#123456` and `red`
Then the field holds `#aabbcc`, `#00ff00`, `#123456` and no colour

### SC-UKV-808 — the swatches draw the given colours and the value outside them

Given a palette without colours, one with three colours, and one whose value is outside its colours
When it is drawn
Then the first shows the eighteen kit colours, the second its three in order, the third its colours
and one more swatch of the value after them

### SC-UKV-809 — a press on a swatch chooses its colour

Given a palette in a form with no colour
When a swatch is pressed
Then the form holds that colour, the field is touched, and the swatch is ringed and says it is checked

### SC-UKV-810 — the arrows, Home and End move the choice

Given a palette with a chosen swatch in focus
When the right and the down arrows, the left and the up arrows, Home and End are pressed
Then the choice moves to the next, the previous, the first and the last swatch, wrapping at the
ends, and the focus moves with it; only the chosen swatch is in the Tab order

### SC-UKV-811 — read only draws one swatch

Given a palette in read only with a colour and one without
When it is drawn
Then each draws one swatch of its colour — the empty one with a border — and nothing to press

### SC-UKV-812 — a disabled palette takes nothing

Given a disabled palette
When a swatch is pressed and an arrow is pressed on it
Then the value stays and the swatches and the button are muted

### SC-UKV-813 — only Apply writes the picked colour

Given a palette with a chosen colour and the custom colour allowed
When the picker opens, a colour is picked and Cancel is pressed; it opens again, a colour is picked
and Apply is pressed
Then the picker starts from the current colour, Apply is unavailable until a change, Cancel leaves
the value, and Apply writes the picked colour and closes the picker

### SC-UKV-814 — the area, the strip and the hex field pick the colour

Given an open picker
When the area is moved by the arrows, the strip by the arrows, and a full hex is typed
Then the arrows change saturation and brightness on the area and the hue on the strip, the typed hex
becomes the picked colour, and an unfinished hex changes nothing

### SC-UKV-847 — the channel fields pick the colour by red, green and blue

Given an open picker of a palette with the channels input, and one without it
When a channel field gets a whole number from 0 to 255, and then a number out of range
Then the picker without the input has no channel fields; with it the fields show the channels of
the picked colour, a number in range changes its channel and the hex, one out of range changes
nothing, and Apply writes the colour

### SC-UKV-815 — the look stands on the palette properties

Given a palette without its properties, one with them set, and one under the material preset
When it is drawn
Then the first draws the kit look, the second takes the swatch size, the gap, the ring and the
radius from its properties, and the third draws borderless swatches with a hollow ring on the chosen
one, the custom swatch last in the grid, its grey button 16 points below the grid, an empty
read-only value as a white circle, and a picker of 256 by 320 points

Не покрыто: это обещание о кадре. Его держат кадры историй `Look` и `Presets`.
