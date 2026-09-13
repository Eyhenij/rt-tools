# Scenarios — a boolean input of the kit and the bare attribute

### SC-UKV-133 — the bare attribute sets a boolean input to truth

Given a kit component with a boolean input
When the input is written as a bare attribute, without a value
Then the input holds truth, and the component draws the look that value gives it

Covered: not yet — the work that brings this agreement writes the test.

### SC-UKV-134 — a required boolean input takes the bare attribute the same way

Given a kit component whose boolean input is required
When the input is written as a bare attribute
Then the input holds truth, and being required changes nothing about the form

Covered: not yet — the work that brings this agreement writes the test.

### SC-UKV-135 — the string "false" in the attribute is falsehood

Given a kit component with a boolean input
When the attribute carries the string `false`
Then the input holds falsehood, and the component draws the look that value gives it

Covered: not yet — the work that brings this agreement writes the test.

### SC-UKV-136 — a boolean input declared without coercion fells the check

Given a kit component declares a boolean input without a transform
And the input stands in no list of what is named apart
When the check of the kit's declarations is called
Then it refuses and names the component and the input

Covered: not yet — the work that brings this agreement writes the check and the test.
