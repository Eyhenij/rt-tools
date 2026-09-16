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

### SC-UKV-164 — the kit's own look of the trigger goes away with a declared trigger

Given a choice from a list with a trigger template declared
When it is drawn
Then the button carries the mark of the consumer's trigger, by which its field look is taken off

Covered by the component spec of the select family.

### SC-UKV-175 — the button of a declared trigger is measured by the consumer's markup

Given a choice from a list with a trigger template narrower than the host
When it is drawn
Then the button is as wide as the consumer's markup, not as wide as the host

Not covered: it cannot be closed by a test with an identifier — the width comes from a style rule,
and the markup is the same whether the rule applied or not. Closed by the showing of the trigger
and its reference frame.

### SC-UKV-176 — the field's ring does not light up on a declared trigger

Given a choice from a list with a trigger template declared
When the button takes focus and the panel opens
Then neither the border of the field nor its ring is drawn around the button

Not covered: it cannot be closed by a test with an identifier — a style that applied is told from
one that was only written by the drawn frame, and the markup is the same either way. Closed by the
showing of the trigger and its reference frame.

### SC-UKV-177 — the move by keys is visible on a declared trigger

Given a choice from a list with a trigger template declared
When the button is reached by the keyboard
Then an outline is drawn around the button, and it fits the consumer's markup

Not covered: the same reason as the scenario above — the sign of the state is the drawn frame.
Closed by the showing of the trigger and its reference frame.

### SC-UKV-178 — the panel is not measured by the trigger

Given a choice from a list whose trigger is narrower than the options
When the list is opened
Then the panel's box is given the trigger's width as its lower bound and no fixed width

### SC-UKV-179 — the panel gets no scroll of its own unless a limit is set

Given a choice from a list with no height limit set
When the list is opened
Then the panel carries no height limit, and a limit set by the consumer lands on the panel itself
