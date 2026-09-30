# Scenarios — the request error of a side panel

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-462 — a panel with an error shows the box

Given a side panel whose application handed it an error
When the panel is drawn
Then the box with "Request Error" and the copy button stands between the header and the content

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.spec.ts`.

### SC-UKV-463 — a panel without an error shows no box

Given a side panel whose error is `null` or `undefined`
When the panel is drawn
Then no box is drawn

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.spec.ts`.

### SC-UKV-464 — the copy holds the moment and the error as JSON

Given an error and a moment
When the copy is built
Then it reads `Error time: <date>_<time>;Error info: <JSON of the error>`

Covered: `projects/ui-kit-v2/src/lib/components/aside/error-box/rt-aside-error-box.logic.spec.ts`.

### SC-UKV-465 — an error that is not JSON is copied as text

Given an error with a loop inside it
When the copy is built
Then it holds the error's string form and nothing throws

Covered: `projects/ui-kit-v2/src/lib/components/aside/error-box/rt-aside-error-box.logic.spec.ts`.

### SC-UKV-466 — the press copies and confirms for one second

Given the box with an error
When the copy button is pressed
Then the clipboard gets the copy, the button reads "Copied", and after one second it reads "Copy error info" again

Covered: `projects/ui-kit-v2/src/lib/components/aside/error-box/rt-aside-error-box.component.spec.ts`.
