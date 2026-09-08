# Scenarios — the bar of the scroll

### SC-UKV-91 — the place under the bar is taken both at rest and at a hovering

Given a zone of the scroll with content longer than itself
When the pointer is hovered over the zone
Then the width of its client area does not change by a single pixel

Not covered: it cannot be closed by a test — the bar of the scroll is drawn by the browser, and in the
environment of the specs nothing draws it: neither a width nor a colour of the slider exists there.
Checked on the spot — by a measurement with the driver on the assembled showcase, the numbers are named
in the description of the past of the work.

### SC-UKV-92 — at rest the slider is invisible, at a hovering it is visible

Given a zone of the scroll at rest
When the pointer is hovered over the zone
Then the colour of the slider changes from transparent to the colour of a border

Not covered: it cannot be closed by a test — the bar of the scroll is drawn by the browser, and in the
environment of the specs nothing draws it: neither a width nor a colour of the slider exists there.
Checked on the spot — by a measurement with the driver on the assembled showcase, the numbers are named
in the description of the past of the work.

### SC-UKV-93 — a focus inside the zone shows the bar on a par with a hovering

Given there is an element inside the zone that takes the focus
When the focus lands inside the zone
Then the slider is visible the same as at a hovering

Not covered: it cannot be closed by a test — the bar of the scroll is drawn by the browser, and in the
environment of the specs nothing draws it: neither a width nor a colour of the slider exists there.
Checked on the spot — by a measurement with the driver on the assembled showcase, the numbers are named
in the description of the past of the work.

### SC-UKV-94 — where there is no hovering, the slider is visible always

Given the pointer is coarse — a touch screen
When the zone of the scroll is at rest
Then the slider is visible

Not covered: it cannot be closed by a test — the bar of the scroll is drawn by the browser, and in the
environment of the specs nothing draws it: neither a width nor a colour of the slider exists there.
Checked on the spot — by a measurement with the driver on the assembled showcase, the numbers are named
in the description of the past of the work.
