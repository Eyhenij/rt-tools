# Scenarios — step arrows in the number field

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1133 — the up arrow adds a step

Given a field with the value 10 and no step set
When a person presses the up arrow
Then the field shows 11 and the form gets 11

### SC-UKV-1134 — the down arrow subtracts a step

Given a field with the value 10 and the step 0,5
When a person presses the down arrow
Then the field shows 9,5

### SC-UKV-1135 — the Up and Down keys step the value

Given a focused field with the value 10
When a person presses Up and then Down twice
Then the field shows 9

### SC-UKV-1136 — a step from an empty field starts from zero

Given an empty field with `min` 5
When a person presses the up arrow
Then the field shows 5

### SC-UKV-1137 — a step past a bound lands on the bound

Given a field with the value 19, the step 5 and `max` 20
When a person presses the up arrow
Then the field shows 20

### SC-UKV-1138 — the arrow towards a reached edge is disabled

Given a field with the value 20 and `max` 20
When the field is drawn
Then the up arrow is disabled, the down arrow is enabled, and the Up key leaves 20

### SC-UKV-1139 — the result is rounded to the digits of the step

Given a field with the value 0,1 and the step 0,2
When a person presses the up arrow
Then the form gets 0,3

### SC-UKV-1140 — the `stepper` input hides the arrows

Given a field with `stepper` off
When the field is drawn
Then it has no arrows, and the Up key still adds a step

### SC-UKV-1141 — a disabled field disables the arrows

Given a disabled field with the value 10
When the field is drawn
Then both arrows are disabled

### SC-UKV-1142 — a read-only field shows no arrows

Given a read-only field with the value 10
When the field is drawn
Then it has no arrows

### SC-UKV-1143 — the arrows take no Tab stop

Given a field with arrows
When the field is drawn
Then both arrows carry `tabindex="-1"` and the kit labels as their names
