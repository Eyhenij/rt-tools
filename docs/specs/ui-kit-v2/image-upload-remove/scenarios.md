# Scenarios — the remove button and the place of the buttons of the image uploader

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones across all branches and do not change after the merge into the spec: the titles
of the tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-1256 — without the input there is no remove button

Given an uploader with a picture and the remove input left alone
When it is drawn
Then no remove button stands in the preview

### SC-UKV-1257 — with the input on, the picture gets a remove button with the kit's label

Given an uploader with a picture and the remove input on
When it is drawn
Then a remove button stands in the preview, with the cross icon and the kit's remove label as its
accessible name

### SC-UKV-1258 — a press on the remove button tells the application and keeps the picture

Given an uploader with a picture and the remove input on
When the remove button is pressed
Then the removed event comes once, the picture stays drawn and no file choice opens

### SC-UKV-1259 — an unavailable uploader shows no remove button

Given an unavailable uploader with a picture and the remove input on
When it is drawn
Then no remove button stands in the preview

### SC-UKV-1260 — the remove button is hidden until the pointer or the focus, and shown on touch

Given the styles of the uploader
When they are read
Then the remove button is transparent by default, opaque under the preview's hover and focus inside
it, and opaque where the device has no hover

Coverage: partial — the spec reads the styles source, because the spec transform strips the
component styles; the drawn states are confirmed by the showcase frames of the new stories.

### SC-UKV-1261 — the buttons stand at the named corner, the top right one by default

Given an uploader with a picture and both buttons on
When the corner input is left alone, and then set to each of the other three corners
Then the row of buttons carries the modifier of the top right corner first, and of the named corner
after

### SC-UKV-1262 — the look input puts the buttons inside the picture

Given an uploader with a picture and both buttons on
When the look input is left alone, and then set to inside
Then the row of buttons has no inside modifier first, and carries it after

### SC-UKV-1263 — the remove button stands at the corner itself, the download button next to it

Given the styles of the uploader and an uploader with both buttons on
When they are read and drawn
Then the row of buttons is reversed at the right corners and straight at the left ones, with the
remove button first in the template

Coverage: partial — the order in the template is checked by the spec, the drawn order by the
showcase frames of the corner stories.

### SC-UKV-1264 — the remove button shares the size, the shape and the backing of the download button

Given an uploader with both buttons on and the round download shape
When it is drawn
Then the remove button carries the same round modifier and the same radius step as the download
button

### SC-UKV-1265 — the visibility input marks the row of buttons, and leaves it unmarked by default

Given an uploader with a picture and both buttons on
When the visibility input is left alone, then set to hover, then to always
Then the row of buttons carries neither modifier first, the hover one next and the always one last

### SC-UKV-1266 — the always look shows the cross at rest, the hover look hides the download button

Given the styles of the uploader
When they are read
Then the always modifier gives the remove button full opacity, the hover modifier gives the
download button none outside a touch screen, and the pointer or the focus inside the preview
brings the download button back

Coverage: partial — the spec reads the styles source, because the spec transform strips the
styles; the drawn opacity is measured in the showcase story of the visibility.
