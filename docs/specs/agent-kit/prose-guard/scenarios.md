# Scenarios — the guard of the wording

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-327 — an officialese word is caught together with a replacement

Given a word from the list of signs stands in the text
When the check of the wording goes
Then it names the word and what to replace it with

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-330 — a word from the left column of the glossary is caught

Given a word not written in this tree stands in the text
When the check of the wording goes
Then it names it and the word from the right column

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-332 — a sentence that is too long is caught

Given there are more words in the sentence than the limit holds
When the check of the wording goes
Then it names the length and the limit

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-334 — a code block is not judged

Given an officialese word stands inside a code block
When the check of the wording goes
Then it stays silent: commands and output lie in the blocks

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-336 — officialese in the new text is refused

Given the edit puts an officialese word into a document
When the guard judges the edit
Then it refuses it and names the replacement

Covered: `projects/agent-kit/tests/prose-style-guard.test.sh`.

### SC-AK-339 — a code file is not judged by the guard of the wording

Given a code file is edited
When the guard judges the edit
Then it stays silent: its subject is prose

Covered: `projects/agent-kit/tests/prose-style-guard.test.sh`.

### SC-AK-340 — an account of the past and the task folder are not judged

Given a record of the archive or the progress of the work is edited
When the guard judges the edit
Then it stays silent: the archive is not edited at all, and the task folder lives until the merge

Covered: `projects/agent-kit/tests/prose-style-guard.test.sh`.

### SC-AK-328 — an officialese preposition is caught

Given an officialese preposition stands in the text
When the check of the wording goes
Then it names it and the plain preposition instead of it

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-329 — an officialese pronoun is caught

Given an officialese pronoun stands in the text
When the check of the wording goes
Then it names it and what to replace it with

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-331 — a word form of a forbidden word is caught too

Given a word from the left column of the glossary stands in an oblique case
When the check of the wording goes
Then it finds it: the boundaries of a word are counted by letters, not by the class `\w`

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-333 — a clean text passes

Given there is not a single sign from the list in the text
When the check of the wording goes
Then it stays silent

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-335 — a word inside another word is not caught

Given a forbidden word stands as a part of another word
When the check of the wording goes
Then it stays silent: otherwise it would catch half the tree

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-393 — the heading of a mandatory spec section is not judged

Given the line is a heading whose name is named as an exception by name
When the check of the wording goes
Then it stays silent: this is the name of a section the set of sections demands verbatim

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-394 — the same word inside a sentence is caught as before

Given a word from the exception stands not as a heading but inside a phrase
When the check of the wording goes
Then it refuses: the exception is lifted from the name of the section, not from the word

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-337 — a word from the left column of the glossary in an edit is refused

Given the edit puts into a document a word not written in the tree
When the guard judges the edit
Then it refuses it

Covered: `projects/agent-kit/tests/prose-style-guard.test.sh`.

### SC-AK-338 — a clean edit passes

Given there are no signs in the new text
When the guard judges the edit
Then it stays silent

Covered: `projects/agent-kit/tests/prose-style-guard.test.sh`.

### SC-AK-341 — the progress of the work is not judged by the guard of the wording

Given the progress of the work in the task folder is edited
When the guard judges the edit
Then it stays silent

Covered: `projects/agent-kit/tests/prose-style-guard.test.sh`.

### SC-AK-859 — a word that is also a noun

Given a plural form stands in the text — now as a noun, now as a pronoun before its own word
When the check reads the text
Then the noun passes, and the pronoun before its own word is named together with a replacement

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-865 — a quotation of a law is not judged by the check of the wording

Given a quotation block introduced by a line with the address of a law stands in the text
When the check of the wording reads the file
Then it skips the lines of the quotation: the words it refuses stand in the laws themselves by the
dozen, and editing a quotation changes someone else's text — edit it and you lie, do not edit it and
you do not push

Given a quotation block stands without the address of a law before it
When the check of the wording reads the file
Then it judges it on a par with the rest of the text: otherwise a quotation would become the place
where one's own writing is hidden from the check

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-903 — English officialese is caught on a par with Russian

Given an English turn of phrase from the list of signs stands in the text
When the check of the wording goes
Then it names it and what to replace it with; the Russian set stays at that, a clean English text
passes, and a Latin word inside another word is not counted as a finding

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.

### SC-AK-868 — the words of the tree on top of the package ones

Given the tree created words of its own for the left column of the glossary by the setting of the
checks
When the check of the wording reads the text
Then it catches them on a par with the package ones, and the package ones stay at that; an unfit
sample does not drop the check, and the rest of the words are judged as before

Covered: `projects/agent-kit/tests/check-prose-style.test.sh`.
