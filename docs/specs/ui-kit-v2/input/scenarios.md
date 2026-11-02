# Scenarios — the field of input

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were not
changed at the merge: the titles of the tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-55 — the type of address goes away onto the native field

Given the type of address is named to the field
When the field is drawn
Then the native field is declared to the browser by the same type

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-56 — the former types work as before

Given text, password, mail and time are named to the field in turn
When the field is drawn
Then the native field is declared by the same type that was named

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-1116 — a value longer than the field ends with an ellipsis

Given a field narrower than its hint
When the field is drawn
Then the hint ends with an ellipsis at the right edge of the field

Не покрыто: the spec environment computes no layout, and truncation is a matter of the field's
styles. The promise is held by the frame of the story Molecules/ServiceBlock/Panel `Phone`, where
the hints of the three key fields are longer than the fields.
