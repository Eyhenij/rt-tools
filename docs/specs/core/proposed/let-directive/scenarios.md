# Scenarios — a local value of a template

The numbers begin the numbering of the domain of the core and do not change after the merge.

### SC-CR-01 — an empty value does not hide the content

Given emptiness is given to the input of the directive
When the content is drawn
Then it is in place, and the name is equal to the emptiness

Covered: `projects/core/src/lib/directives/let.directive.spec.ts`.

### SC-CR-02 — a change of the value does not recreate the content

Given the content is drawn and a text is typed inside it
When another value is given to the input
Then the typed text is in place, and the name is equal to the new value

Covered: `projects/core/src/lib/directives/let.directive.spec.ts`.

### SC-CR-03 — the value is read by two names

Given the content declares a name by the default and the name of the directive
When the value arrives at the input
Then both names answer with one value

Covered: `projects/core/src/lib/directives/let.directive.spec.ts`.

### SC-CR-04 — a change of the value shows the new value in the content

Given the content is declared with a redrawing on demand
When the value changed
Then the markup shows the new value by both names

Covered: `projects/core/src/lib/directives/let.directive.spec.ts`.
