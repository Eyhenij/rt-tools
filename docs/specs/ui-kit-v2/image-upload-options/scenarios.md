# Scenarios — the download button, the choose button and the preview of the image uploader

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-631 — the download button takes its size from the uploader's property

Given an uploader with a picture
When its styles are read
Then the download button takes its size from the uploader's download size property, and without it
keeps the icon button's own step

Покрытие: частичное — the spec reads the styles source, because the spec transform strips the
component styles; the drawn size is confirmed by the showcase frame of the new story.

### SC-UKV-632 — the download icon takes its size from the uploader's input

Given an uploader with a picture and the download icon size set, and then without it
When it is drawn
Then the download icon takes the set size, and without it the size of the button's step

### SC-UKV-633 — the blur under the download button comes from the property

Given an uploader with a picture
When its styles are read
Then both blur declarations under the download button take the uploader's blur property, whose
default is the former 8 px

Покрытие: частичное — the spec reads the styles source; the drawn blur is confirmed by the showcase
frame of the new story.

### SC-UKV-634 — the choose button takes its look and icon from the inputs

Given an empty uploader with the choose look and icon set, and then with the icon emptied
When it is drawn
Then the choose button has the set look and icon, and with the icon emptied stands without one

### SC-UKV-635 — the preview stands on the top of its line

Given an uploader with a picture
When its styles are read
Then the preview is aligned to the top of its line, so no gap stays under the picture

Покрытие: частичное — the spec reads the styles source; the missing gap is confirmed by the
re-taken showcase frames of the uploader.

### SC-UKV-636 — without the new values the uploader draws as before

Given an uploader without any of the new inputs
When it is drawn empty and with a picture
Then the choose button is outlined with the upload icon, and the download icon follows the button
size
