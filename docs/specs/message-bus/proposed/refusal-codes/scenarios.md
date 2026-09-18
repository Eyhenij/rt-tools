# Scenarios — the intake refuses by a code

The number stands at the beginning of the title of the test, then a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is one for the domain.

### SC-MB-408 — a rejected request is answered by a code out of the set

Given a person asks the intake to create a role whose name is already taken
When the intake refuses the request
Then the body of the answer carries a code of the set and the name of the role as a substitution,
and the code of HTTP stays the one this refusal has today

Not covered: the set of the codes is created by the second stage of the task.

### SC-MB-409 — the text of a refusal follows the chosen language

Given the intake answered a refusal by a code that has a text in both sets
When a person switches the language while the refusal is on the screen
Then the text of the refusal changes with the labels of the screen, and the page is not reloaded

Not covered: the screens start to read the code at the fourth stage of the task.

### SC-MB-410 — an unknown code is visible by a sign, not by emptiness

Given the intake answered a code the sets have no text for
When the screen shows the refusal
Then in place of the text stands the sign of an unfound key: an empty string would read as "there
is no refusal here" and would live until a person complains

Not covered: the screens start to read the code at the fourth stage of the task.

### SC-MB-411 — the word of the intake is not shown even when it came

Given the body of the answer carries both the code and the sentence of the intake
When the screen shows the refusal
Then a person sees the text of the dictionary, and the sentence of the intake reaches no screen

Not covered: the screens start to read the code at the fourth stage of the task.

### SC-MB-412 — every code of the set has a text in both sets of the labels

Given the set of the codes of the shared lib
When every code of it is asked of the Russian set and of the English one
Then a text is found for each: a set walked by eye diverges at the first code added

Not covered: the check by a call is written by the fourth stage of the task.

### SC-MB-413 — the substitutions of a refusal stand in the text by name

Given a code whose text holds a place for the name of a role
When the intake answers this code with the name of the role beside it
Then the name stands in the text in place of its own, and not one of the places is left empty

Not covered: the set of the codes is created by the second stage of the task.
