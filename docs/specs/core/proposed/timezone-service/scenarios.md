# Scenarios — the time zone of the reader

The numbers continue the numbering of the domain of the core and do not change after the merge.

### SC-CR-05 — in the browser the zone of the reader is given

Given the application goes in the browser, and a zone of their own is set in the system of the reader
When the caller asks for the zone
Then the service answers with the zone of the reader

Covered: `projects/core/src/lib/services/timezone.service.spec.ts`.

### SC-CR-06 — outside the browser the agreed zone is given

Given the page is given out by the server
When the caller asks for the zone
Then the service answers `UTC`, and does not ask the environment at all

Covered: `projects/core/src/lib/services/timezone.service.spec.ts`.

### SC-CR-07 — a zone that changed is visible at the next address

Given the zone of the reader changed after the first address
When the caller asks for the zone again
Then the service answers with the new zone

Covered: `projects/core/src/lib/services/timezone.service.spec.ts`.
