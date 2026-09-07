# Scenarios — what the intake writes about itself

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason, and one closed from the side of the intake
but not from the side of the screen carries the mark "Coverage: partial".

Scenarios whose "Then" names a person and what they get on the screen are closed by an end-to-end
spec. Next to them go measurements in the browser and a live pass on the node; they do not count as a
replacement of the end-to-end spec.

### SC-MB-97 — a refusal of the storage leaves the class and the text of the error in the journal

Given the storage answers with an error at a write of the cargo
When the intake refuses the request
Then the row of the journal carries the class of the error and its text, not the code of the answer
alone

### SC-MB-98 — the code of the storage and the answer of the driver stand as fields of their own

Given the storage refused with a code of its client and with details from the driver
When the intake writes the row about the refusal
Then the code of the client, its details and the answer of the driver stand as separate fields

### SC-MB-99 — a nested reason is unfolded, not lost

Given the error carries another error as its reason
When the intake takes it apart for the journal
Then the reason stands in the row by fields of its own, up to the limit of the depth

### SC-MB-100 — the stack is written cut

Given the breakage carries a stack of half a hundred lines
When the intake writes the row about the refusal
Then the first stretch of the stack stands in the row, not the whole of it

### SC-MB-101 — a refusal by the input is written without a stack

Given the cargo did not pass the check of the form
When the intake refuses the request
Then the row of the journal carries no stack: the reason is named by a check, not by a breakage

### SC-MB-102 — the row of the journal is machine-readable, and what is variable lies as fields

Given the intake works with the setting of production
When it writes any row
Then the row is machine-readable: the name is constant, and the kind of the cargo, the tree and the
number of the request stand as fields

### SC-MB-103 — a password and a token do not get into the fields

Given there are the key of a password and the key of a token in the fields of the row
When the row goes into the output
Then the values of both are replaced, and the names of the keys stayed

### SC-MB-104 — the text of the error is not eaten by the cleaning

Given the taken-apart reason carries the field of the text of the error
When the row goes into the output
Then the text of the error stayed in it whole

### SC-MB-105 — outside production the row is printed readable

Given the intake is raised outside production
When it writes a row
Then it is printed in a readable shape with the same fields

### SC-MB-106 — the already written calls of the journal write the same way

Given the client of the storage calls the journal by its own row, as before
When the intake is raised
Then the row comes out in the same shape as the rows of the taking apart of the refusals
