# Scenarios — the texts of the rules layer

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain,
and the numbers were not recounted at the move into the subdomain: the number ties the scenario to
the test title.

### SC-AK-04 — the text of a rule names no foreign tree

Given a laid-out rule and the pattern at it
When their texts are checked for addressness
Then there is not a single path to a domain, port or selector of a specific tree in them

### SC-AK-33 — the glossary arrives in the tree by the layout

Given the tree took everything the package carries
When `sync` goes
Then a glossary with the header of the package lies in the documents directory

### SC-AK-34 — the subject sections of the glossary are appended by an override

Given the tree put an override of the glossary with a section of its own
When `sync` goes
Then the laid-out glossary carries both the shared sections of the package and the section of the
tree

### SC-AK-43 — an edit of a rule demands the rule about how the texts are built

Given a file of a rule or a pattern in the rules directory is edited
When the gate judges the edit
Then it demands the rule about how the texts are built, not the one about wording

### SC-AK-44 — the other files of the agent still demand no rule

Given a role, a command or a pipeline of the agent is edited
When the gate judges the edit
Then it stays silent

### SC-AK-67 — the count of the steps of the work is through across all the patterns

Given the steps of the work are described by the patterns of the start, the continuation and the
closing of the work
When the numbers of the steps are read one after another across all three
Then every number is met once, and the full list of them stands in the rule of the conduct of work

### SC-AK-68 — the rule about the styling of documents has a place to write a skill without a law into

Given the tree keeps its own skills about documents
When it appends them by an override
Then the rule has the section "A skill without a law", and the override lands in it without replacing
the section of the pitfalls

### SC-AK-94 — a resource speaks of a neighbouring resource conditionally and by name

Given a package resource mentions a neighbouring resource that may not be in the tree
When the text of the resource is checked for statements about the tree
Then the mention is conditional and named by name, not given as an accomplished fact

Covered: `projects/agent-kit/tests/texts.test.sh`.

### SC-AK-906 — the section of the articles of a law is accepted under either of the two names

Given a law with the section "Articles" and a law with the section "Статьи" lie in the tree
When the check of the specs goes
Then neither of them is named a law without a section of articles, and a law without both names is
named with a hint of both

Covered: `projects/agent-kit/tests/checks-specs.test.sh`, `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-211 — a resource without a mandatory section turns red

Given a law without the section of articles lies in the suite
When the check of the texts of the package goes
Then it names the resource, its kind and the missing heading and gives back a non-zero code

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-212 — a rule without a pattern turns red in the package itself

Given a rule not a single pattern refers to lies in the suite
When the check of the texts of the package goes
Then it names this rule: the link from above downwards is checked the same as from below upwards

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-213 — an unchosen edition is judged on a par with the chosen one

Given a resource has several editions, and the tree laid out one of them
When the check of the texts of the package goes
Then a divergence in the unlaid-out edition is found the same as in the laid-out one

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-214 — the name of a neighbour named in prose answers to nothing in the catalogue

Given the text of a rule names by name a resource that is not in the suite
When the check of the texts of the package goes
Then it names the resource, the named name and the line it stands in

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-215 — a tree address inside a code block turns red

Given a path of a specific tree stands in a code block of a resource
When the checks of the texts of the package go
Then the address is found: the fence of a code block lifts no bans

Covered: `projects/agent-kit/tests/texts.test.sh`.

### SC-AK-216 — an article of a law without a rule is not counted by a machine

Given an article of a law has not a single rule that carries it out
When the check of the texts of the package goes
Then it stays silent about this: a gap of this kind is looked for by reading, not by counting the
bindings

Not covered: the silence of the check cannot be told by a run from there having been nothing to
check — it is confirmed by reading its body.

### SC-AK-217 — a countable divergence gives back a non-zero code

Given there is at least one divergence of a countable kind in the suite
When the check of the texts of the package goes
Then it gives back a non-zero code, and the push gate refuses the edit

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-218 — a suite without divergences passes silently

Given there is not a single divergence of a countable kind in the suite
When the check of the texts of the package goes
Then it gives back a zero code and names not a single resource — only the count of what was checked

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-219 — the check of the texts stands in the suite run before a push

Given any resource of the package is edited
When the executor pushes the branch
Then the check of the texts of the package goes without a separate command: it is named in the suite
of the gate

Covered: `projects/agent-kit/src/lib/assets.spec.ts`.

### SC-AK-220 — the review reads the family whole

Given the name of a law is named to the command
When the review goes
Then the role reads this law, all the rules under it and all the patterns at those rules

Not covered: the command is carried out by an agent, and it is not checked by a run — the check goes
by a call in a live tree.

### SC-AK-221 — a command without the name of a family demands it

Given the command is called without an argument
When it starts the work
Then it demands to name the family and prints the list of the names of the laws, and the review does
not go

Not covered: the command is carried out by an agent, and it is not checked by a run — the check goes
by a call in a live tree.

### SC-AK-222 — a finding names two places verbatim

Given the role found that two texts say different things about one matter
When it gives back the finding
Then both quotations, the names of both resources and what these places diverge by stand in it

Not covered: it is judged by reading the answer of the role — by a run it is not checked.

### SC-AK-223 — a finding of meaning refuses nothing

Given the review gave back a non-empty list of findings
When the work goes on
Then neither the build nor the push gate turns red from this: a finding is an argument for a person

Not covered: it is judged by reading the answer of the role — by a run it is not checked.

### SC-AK-224 — the role of the review edits no files

Given the role found a divergence in the text of a rule
When it finishes the work
Then not a single file is changed: the edit is made by a person

Not covered: the roles are declared reading tools alone, but this declaration is judged by no suite —
the kind `agents` is checked only for its place in the layout. It is confirmed by reading the header
of the role.

### SC-AK-225 — the graph goes away into the tree together with the rule

Given a rule with a graph of the flow is laid out into the tree
When the laid-out copy is checked
Then the graph stands in it whole: it does not lie next to it as a separate file

Covered: `projects/agent-kit/src/lib/plan.spec.ts` — the layout compares the body of the file with
the body of the resource and puts it anew at a divergence; a separate file next to it it does not put
at all.

### SC-AK-226 — the set of sections is taken from the declared one, not from the sample of the kind

Given the sample of a kind declares a section that is in not one resource of this kind
When the check of the texts of the package goes
Then it judges by the declared set and never turns red on this section, while it names the sample
itself a divergence: resources are created by it, and a diverged one gives back a new resource
incomplete at once

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-227 — a kind without a declared set of sections stays silent

Given a guard, a check or a sample is edited — a kind that has no set of sections
When the check of the texts of the package goes
Then it stays silent about this kind and does not put it into the list of exceptions

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-228 — a nameless sample does not count as a tree address

Given `libs/<domain>` or `<Feature>Component` stands in a code block of a resource
When the checks of the texts of the package go
Then there is no divergence: the list of the addresses is closed, and a nameless sample does not
enter it

Covered: `projects/agent-kit/tests/texts.test.sh`.

### SC-AK-229 — zero debt is named by a number, not by silence

Given there is not a single rule without a pattern in the suite
When the check of the texts of the package goes
Then it names the number of the rules checked instead of simply staying silent

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-230 — every rule has a graph

Given a rule without a graph of the flow lies in the suite
When the check of the texts of the package goes
Then it names this rule: a graph is created for all the rules, not for the branching ones

Covered: `projects/agent-kit/tests/rules-review.test.sh` — the section of the graph stands in the set
of sections of the kind "a rule", and its absence the suite names by a line per file.

### SC-AK-690 — a forbidden word met in the tree turns red

Given the glossary declared a word forbidden, and this word stands in a text of the tree
When the check of the glossary goes
Then it names the place and the word and answers with a non-zero code; an accepted word stays silent

Given the forbidden word of the section is English and stands in an English text
When the check of the glossary goes
Then it finds it by the same boundaries: the boundary of a word is any letter, and a word inside
another word stays silent

Covered: `projects/agent-kit/tests/checks-glossary.test.sh`.

### SC-AK-691 — a word with a refinement is not judged by a search and is named aloud

Given a forbidden word carries a refinement in brackets: one meaning of two is forbidden
When the check of the glossary goes
Then it does not count as a divergence, and in the output it is listed as what is left to the reader

Covered: `projects/agent-kit/tests/checks-glossary.test.sh`.

### SC-AK-692 — the glossary and an account of the past are taken out of the check

Given a forbidden word stands in the glossary itself, in a record of an account of the past and in
the task folder
When the check of the glossary goes
Then there are no divergences: the glossary names the word for a reason, and the other two by their
nature list what was. There is no section of forbidden words at all — the check declares a skip, not
a match

Covered: `projects/agent-kit/tests/checks-glossary.test.sh`.

### SC-AK-904 — the section of the forbidden words is read under both names

Given the glossary of the tree holds the section under the Russian name, and a forbidden word stands
in a text of the tree
When the check of the glossary goes
Then it finds the section, names the place and the word and answers with a non-zero code — the same
as at the English name of the section

Covered: `projects/agent-kit/tests/checks-glossary.test.sh`.

### SC-AK-819 — the preamble of the glossary leads into the source of the edit

Given the glossary of the tree carries the layout header
When the startup hook puts it into the context
Then the preamble names the override and does not call to edit the glossary in place

Given the glossary has no header
When the startup hook puts it into the context
Then the preamble calls to edit the glossary in place and names no override

Covered: `projects/agent-kit/tests/checks-glossary.test.sh`.

### SC-AK-837 — the language of the texts for a person is named by the rule and is not judged by a machine

Given a task in the queue, the description of a request and an answer to the owner in the chat are
written
When the executor takes the rule of the wording
Then the section "Texts for a person" names the language of all three, the pattern `doc-style-human`
gives the samples "like this" and "not like this", and there is no check for them: the task lives at
the hosting, the answer in the chat does not land in the tree, the description of the request is read
by a person

Not covered: there is nothing to judge these texts by — not one of them is a file of the tree.
Checked in place: the layout put the rule and the pattern, the check came out even, the check of the
wording over both files is clean.
