# Scenarios — the browser guards

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and
the numbers were not recounted on the move into the subdomain: the number ties a scenario to a test
title.

### SC-AK-717 — the browser profile is taken from the environment variable

Given an environment variable names the profile When the helper is asked about the pinned profile
Then it prints what the variable named: it overrides the file of the tree

### SC-AK-718 — the profile is taken from the file of the tree when there is no variable

Given there is no variable, and the file next to the layout config names the profile When the helper
is asked about the pinned profile Then it prints the content of the file without the surrounding
spaces

### SC-AK-719 — an unconfigured tree hears that it is unconfigured

Given the profile is named neither by a variable nor by a file When the helper is asked about the
pinned profile Then it says into the error stream what is missing and still leaves with zero: the
guards let through by it, and silence would read as permission to drive the browser by any profile

### SC-AK-720 — the word about being unconfigured is said once per session

Given the helper has already spoken about being unconfigured in this session When it is asked a
second time with the same session sign Then it stays silent: a line on every call drowns in the
output and stops being read

Covered: `projects/agent-kit/tests/browser-device-id.test.sh`.

### SC-AK-826 — the word "browser" in the name of a rule or of a hook does not make a choice question

Given a question about the layout of the rules layer, whose answer options carry the name of the
browser-check rule and the name of one of the browser guards
When the guard of the choice question judges the call
Then it lets it through: the refusal could be bypassed only by rewriting the question without that
word, that is by distorting it

Given a question about the supported browsers or about browser storage
When the guard judges the call
Then it lets it through: these are questions about the subject of the work, not about which profile
to drive by

### SC-AK-827 — a question about choosing a profile is refused

Given the question asks which browser to use — in the owner's language, in English, by the device
sign or by a plain "select the browser profile"
When the guard judges the call
Then it refuses it: the profile is pinned, and it can be the only answer

### SC-AK-828 — the refusal names the pinned device sign

Given a question about choosing a browser is refused
When the text of the refusal is read
Then the device sign itself stands in it: a refusal without an action is bypassed, not carried out

### SC-AK-829 — without a pinned profile the guard stays silent

Given the profile is named neither by a variable nor by a file of the tree
When the guard judges a question about choosing a browser
Then it lets it through: asking becomes lawful — there is no pinned answer

Covered: `projects/agent-kit/tests/browser-guard-asking.test.sh`.

### SC-AK-760 — a browser raised by a library from inside a script is refused

Given a command runs by an interpreter a file that holds the entry point of a browser library
When the guard of bypass paths judges the command
Then it refuses and names the file: in the command line such a launch is not visible at all — there
stand only the interpreter name and a path. Attaching to an already raised browser is refused the
same way, a package manager wrapper hides no launch, while a script without driving and a
non-existent file pass

Covered: `projects/agent-kit/tests/browser-guard-drivers.test.sh`.

### SC-AK-761 — code passed as an argument instead of a file is judged by the same sample

Given the browser is raised by code passed to the interpreter as an argument
When the guard of bypass paths judges the command
Then it refuses; a search for that same word across the tree passes — the sample is judged only
together with the interpreter name and its code flag

Covered: `projects/agent-kit/tests/browser-guard-drivers.test.sh`.

### SC-AK-762 — without a named profile the guard lets through a launch from code too

Given the profile of the tree is named neither by a variable nor by a file
When the guard of bypass paths judges the launch of a script that raises the browser
Then it lets it through: it has nothing to offer instead, and a blind refusal would lead the work
into a dead end

Covered: `projects/agent-kit/tests/browser-guard-drivers.test.sh`.

### SC-AK-838 — a foreign profile is refused before the call, and this pass leaves no mark

Given the tree named the pinned browser profile
When the guard judges the choice before the call
Then a foreign profile is refused, the pinned one is let through, and the freshness mark is set in
neither case: before the call all that is known is that the profile was requested

Covered: `projects/agent-kit/tests/browser-guard-device-id.test.sh`.

### SC-AK-839 — the freshness mark is set by the outcome of the call

Given the choice of the pinned profile is already made
When the guard judges the answer of the call
Then a connection that took place marks the session, while a refused choice, a refusal in words and
an empty answer leave no mark: otherwise the freshness guard would let the tab list, the navigation
and the screenshot through into whichever browser the extension counts as active

Covered: `projects/agent-kit/tests/browser-guard-device-id.test.sh`.

### SC-AK-862 — a refusal about an unchosen browser arrives as a field of the answer

Given there was no accepted browser choice in the session
When the freshness guard judges a call of the extension
Then it refuses it by a field of the answer and leaves with zero, the error stream stays empty, and
the reason names the pinned device sign and two lawful moves: what is said into the error stream the
executor does not see and reads the calls failing one after another as a breakage of the extension

### SC-AK-863 — a stale choice is refused by the same channel

Given the mark of the last choice is older than the freshness limit
When the guard judges a call of the extension
Then it refuses by the same field, names the age of the choice and removes the mark; a fresh mark
lets the call through and is updated, and without a pinned profile the guard stays silent

Covered: `projects/agent-kit/tests/browser-guard-require-select.test.sh`.
