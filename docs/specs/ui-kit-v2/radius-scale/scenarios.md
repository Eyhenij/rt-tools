# Scenarios — one rounding input for the second kit

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain of the second kit.

## The input and the attribute

### SC-UKV-383 — a named step lands on the host as an attribute

Given a component with the rounding input
When a step is named
Then the host carries the attribute with that step

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius.directive.spec.ts`.

### SC-UKV-384 — an empty input leaves no attribute

Given a component with the rounding input
When no step is named
Then the host carries no attribute, and the component keeps its own default

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius.directive.spec.ts`.

### SC-UKV-385 — a change of the step replaces the attribute

Given a component with a named step
When another step is named
Then the attribute carries only the new step

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius.directive.spec.ts`.

## The rule of a step

### SC-UKV-386 — the rule of a step reaches only its own host

Given the style rules a component gets for its steps
When they are compiled
Then every rule names the host with the attribute and the surface as its direct child, so a nested
component of the same kind is not reached

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius-mixin.spec.ts`.

### SC-UKV-387 — the rule of a step reassigns the own property only

Given the style rules a component gets for its steps
When they are compiled
Then every rule declares the component's own property with the token of its step and nothing else

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius-mixin.spec.ts`.

## Every component

### SC-UKV-388 — every component with a surface takes the input

Given the list of the kit's components with a surface
When each is drawn with a named step
Then each host carries the attribute with that step

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius-contract.spec.ts`.

### SC-UKV-389 — every component style answers every step

Given the style file of every component with a surface
When it is read
Then it carries the rule of the steps for its own property

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius-contract.spec.ts`.

### SC-UKV-390 — no rounding of a component stands off the scale

Given the style files of the kit's components
When the values of their rounding properties are read
Then none is a literal other than zero

Covered: `projects/ui-kit-v2/src/lib/components/radius/rt-radius-contract.spec.ts`.

## The folded inputs

### SC-UKV-391 — the tag is fully rounded until a step is named

Given a tag without the rounding input
When it is drawn
Then it carries no step attribute, and a named step lands on its host

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-392 — the button takes its default step from the kit setting

Given the kit setting names a step for the button
When a button without the rounding input is drawn
Then its host carries the step of the setting, and a step named on the button wins

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`.

### SC-UKV-393 — the skeleton keeps its circle apart from the step

Given a skeleton with the circle shape and a named step
When it is drawn
Then it stays a circle, and the step is used by the rectangle only

Covered: `projects/ui-kit-v2/src/lib/components/skeleton/rt-skeleton.component.spec.ts`.

### SC-UKV-489 — the table rounds the card of its narrow view and not the wide view

Given a table with a named step
When it is drawn on a narrow screen and on a wide one
Then the cards of the narrow view take the corners of the step, and the wide view keeps no corners

Covered: `projects/ui-kit-v2/src/lib/components/table/rt-table.component.spec.ts`.

### SC-UKV-735 — a filled field with a step rounds all four corners

Given a field with the filled look
When the caller names a radius step for it
Then all four corners take the step and no line is drawn under it, and without a step the field
keeps its small top rounding, its straight bottom and the line

Not covered: a test has no layout. Measured on the showcase in the story **Controls** of the radius
foundation: without a step the corners are 4px on top and 0 below with a grey line, with the step
`full` they are 9999px on all four with no line, and every other step rounds all four corners.

### SC-UKV-736 — the pill look of a field

Given a field, a number field or the popup search of a selector
When the caller names the pill look
Then the field carries the pill look and not the filled one, and without it the field keeps its look

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.
Покрытие: частичное — the tests read the look class; the full rounding and the missing underline are measured on the showcase in the story **Appearance** of the field.
