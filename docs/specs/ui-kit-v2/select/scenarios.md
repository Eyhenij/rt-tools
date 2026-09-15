# Scenarios — the consumer's own trigger of a choice from a list

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-157 — a family without a declared trigger draws its own

Given a choice from a list inside which no trigger template is declared
When it is drawn
Then the kit's own field-shaped trigger is in the markup, with the chosen label in it

Covered by the component spec of the select family.

### SC-UKV-158 — a declared trigger is drawn instead of the kit's own

Given a choice from a list with a trigger template declared
When it is drawn
Then the consumer's markup is inside the kit's button, and the kit's own trigger is not in it

Covered by the component spec of the select family.

### SC-UKV-159 — the behaviour stays on the kit's button

Given a choice from a list with a trigger template declared
When the consumer's markup is pressed
Then the panel of the list opens, and the button carries the marks of accessibility as before

Covered by the component spec of the select family.

### SC-UKV-160 — the context tells the markup that the list is open

Given a choice from a list with a trigger template that draws the open state
When the panel opens and closes again
Then the value of the open state in the context of the template changes with it

Covered by the component spec of the select family.

### SC-UKV-161 — the context tells the markup what is chosen

Given a choice from a list with a trigger template that draws the chosen value
When a value is chosen in the panel
Then the chosen value in the context of the template becomes that value

Covered by the component spec of the select family.

### SC-UKV-162 — the context tells the markup that the choice is switched off

Given a choice from a list switched off, with a trigger template declared
When it is drawn
Then the switched-off value in the context is true, and the kit's button is switched off

Covered by the component spec of the select family.

### SC-UKV-163 — the same input serves the choice of several values

Given a choice of several values with a trigger template declared
When it is drawn and a value is chosen
Then the consumer's markup stands inside the button, and the context carries every chosen value

Covered by the component spec of the multiselect family.
