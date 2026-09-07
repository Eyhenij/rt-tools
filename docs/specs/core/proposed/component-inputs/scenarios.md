# Scenarios — the inputs of a component created in code

The numbers continue the numbering of the domain of the core and do not change after the merge.

### SC-CR-08 — a set with a foreign name does not build

Given a name the component does not have stands in the set
When the code is built
Then the build refuses at that name

Covered: `projects/core/src/lib/types/component-inputs.spec.ts`.

### SC-CR-09 — a set with an ordinary field of the class does not build

Given the name of a field that is not declared an input stands in the set
When the code is built
Then the build refuses at that name

Covered: `projects/core/src/lib/types/component-inputs.spec.ts`.

### SC-CR-10 — the value is checked against what the input accepts

Given a transformation is declared at the input that accepts one thing and gives back another
When a value of the accepted type is put into the set
Then the code builds, and a value of the got type is refused by the build

Covered: `projects/core/src/lib/types/component-inputs.spec.ts`.

### SC-CR-11 — the inputs that were put reach the component

Given a component created in code and a set of two inputs
When the set is put by its own function
Then the component answers with the values that were put, and the inputs that were not named stay with
their defaults

Covered: `projects/core/src/lib/types/component-inputs.spec.ts`.
