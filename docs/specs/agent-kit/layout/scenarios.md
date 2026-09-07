# Scenarios — laying resources out into the tree

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and the
numbers were not recounted on the move into the subdomain: the number ties a scenario to a test title.

### SC-AK-01 — the kind left the rule without a tool, and the layout refused

Given the tree picked a value of the hosting axis for which the checks have no kind When `sync` runs
Then the layout refuses and names the rule and the tool missing under it by name

### SC-AK-02 — a guard of the package is checked by its own scenario suite

Given one line is broken in an executable resource of the package When the run of the package checks is
run Then the run falls and names the broken resource

### SC-AK-03 — a layout from a stale build is named aloud

Given the resource in the source was edited later than the launch line was built When `sync` runs Then
the package says it reads the wrong thing, instead of "everything is already laid out"

### SC-AK-06 — a foreign file moves under the package's management by a command

Given the tree holds a file under a name the package puts its resource by, and it has no header When
the owner hands the file to the package by the named way Then the file moves under the package's
management, and its former content is not lost silently

### SC-AK-07 — an override of the check settings does not carry away the neighbouring keys

Given the tree named in an override one key of a nested object of the check settings When the settings
are assembled Then the other keys of the same object keep their values

### SC-AK-08 — a divergence of the body at a matching header is visible to `doctor`

Given the version in the header of a laid-out file matches the package one, and the body diverged When
`doctor` runs Then the divergence is named

### SC-AK-09 — the backend root is read from the setting, not hardwired

Given the tree keeps the backend not by the path the package counts as the default When the layers
check is run Then the check walks by the path from the setting of the tree

Coverage: partial — the scenario suite checks that the roots are read from the setting, not from the
code; that the check on a tree with another layout finds the same divergences nothing checks.

### SC-AK-10 — the companions are created as drafts, not from a blank page

Given a clean tree after `sync` with all the rules When the owner sets about filling the companions
Then every companion already lies as a skeleton with sections instead of being absent

### SC-AK-11 — a clean installation demands no finishing by hand

Given an empty tree and a hosting kind other than the kind of this tree When `init` and `sync` run Then
`doctor` passes without refusals, and not one step is made by hand

Not covered: the summary sign is run by hand — an installation from scratch into a one-off tree. Not
one run of the package creates a clean tree whole, and creating it in the specs would mean checking
one's own fixture.

### SC-AK-85 — a picked resource demands an unpicked one, and the audit says so

Given the tree picked a resource whose requirement is not in its set When the audit of the laid-out
against the package runs Then it names the resource, its requirement and that this is a warning, not a
refusal

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-86 — a warning about a broken link does not change the outcome of the audit

Given the laid-out comes together with the package, but one requirement is not picked When the audit of
the laid-out against the package runs Then it leaves with success: the tree has the right to close the
requirement by a means of its own

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-87 — the state report names the unpicked by name

Given part of the package resources is picked in the tree When the state of the layout is taken apart
Then the unpicked are named by names, not folded into one number

Not covered: the output of the state report is not checked by a run — it was checked by running it on
this tree.

### SC-AK-119 — refusing a law removes the rules and the patterns at it

Given the tree rejected a law by one refusal line, and its rules and patterns are not named in the
refusal When the layout runs Then neither a rule with this law in its preamble nor a pattern at such a
rule lands in the tree

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-120 — an unpicked law lays out no children

Given the pick of the laws is named by name, and one of the laws of the set is not in it When the
layout runs Then the rules and the patterns of this law do not land, the same way as if it stood in the
refusal

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-121 — refusing a pattern touches neither the rule nor the law

Given the tree rejected one pattern at a taken rule When the layout runs Then the rule and its law land,
and the other patterns at this rule stay in place

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-122 — a refusal line removed by the cascade is declared a warning

Given the refusal holds both a law and a rule at it When the layout runs Then the line about the rule is
named surplus together with the law it stopped removing because of

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-123 — a warning about a surplus line does not refuse the layout

Given the refusal holds both a law and a rule at it When the layout runs Then it puts what is picked and
leaves with zero: a surplus line is a warning, not a refusal

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-124 — a refusal line without a resource in the catalogue is named by the same warning

Given the refusal holds a resource that is not in the set of the package at all When the layout runs
Then the line is named together with the fact that nothing in the catalogue answers to it, and the
layout goes on

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-125 — the state report names what is removed together with the parent

Given a law is rejected, and its rules with the patterns are removed by the cascade When the state
report runs Then every removed resource is named together with the rejected parent, not by a common
number

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-126 — the removed laws are not in the set of the package

Given the set of the package resources is read from the disk When the law on money, the law on the
owning entity and their rules with patterns are looked for in it Then not one of them is found

Covered: `projects/agent-kit/src/lib/retired.spec.ts`.

### SC-AK-127 — a rule without a law in the package itself is refused

Given a rule whose law is removed from the package is left in the set When the connectivity audit of
the resources runs Then it names the rule and the reference that has nothing to find, and gives back a
non-zero code

Covered: `projects/agent-kit/src/lib/integrity.spec.ts`.

### SC-AK-128 — refusing a subject law is one line

Given the setting of the tree rejects a subject law by one line and by not a single line at its rules
and patterns When the layout and its check run Then the check is green, and the rules and the patterns
of this law are not in the tree

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-129 — an empty pick takes the whole set

Given the setting of the tree is created without an answer to the question about the laws, and the pick
is empty When the layout runs Then the whole set lands: an empty pick is the default case, not a
refusal of all the laws

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-130 — a parent is rejected only when not one of its kinds is picked

Given the rule lies in the set in several kinds, and the tree picked one of them When the layout runs
Then the patterns at this rule land: the unpicked kinds do not count as the parent being rejected

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-131 — a refusal line on a resource of a foreign kind does not count as surplus

Given the refusal holds a resource of the kind the tree did not pick When the layout runs Then the line
is not named surplus: by it the tree puts out the refusal about a resource without a fitting kind

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-132 — a law of the application layer is found by the short name from the header

Given a rule declares its law by a short name, and the law itself lies in the application layer When
the tree rejects this law by a line with the directory of the layer Then the rule is removed by the
cascade: the link is looked for by the last link of the name inside the kind

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-133 — a removed grandchild is named by both parents

Given a law is rejected, a rule is removed with it, and a pattern at that rule is removed with the rule
When the state report runs Then the pattern is named both by the rule it was removed because of and by
the rejected law at the base of the chain

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-134 — a pick that takes nothing after the cascade is named aloud

Given the pick names a rule by name, and the law at it does not stand in the pick When the layout runs
Then it says that what the pick named will not arrive, and by which parent

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`, `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-135 — the parent is not in the catalogue — the cascade stays silent

Given the rule has an empty law field or a reference to a law that is not in the set When the layout
runs in a tree Then the rule lands: there is nothing to remove by, and the miss is judged by the
connectivity audit of the package

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-136 — a link broken by the cascade is not named by a second warning

Given a law is rejected, and the rule removed by the cascade is required by another taken resource When
the layout runs Then the resource is named once — by the cascade, not also by a line about an unpicked
requirement

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-137 — what left the set is named by the list of the removed

Given the tree holds a laid-out resource that is no longer in the set of the package When the layout
runs Then it names it by the list of removed names and says that the tree removes it itself

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-138 — what the cascade removed on the disk is named apart from the abandoned

Given the tree stood on the former edition, and it holds the rules of a law now rejected When the
layout runs Then these files are named as removed by the cascade, not as abandoned, and the layout goes
on

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-139 — no references by name to the removed laws are left in the set

Given the set of the package resources is read from the disk When the names of the removed laws and of
their rules are looked for in the patterns, the roles and the templates Then not one occurrence is
found

Covered: `projects/agent-kit/src/lib/retired.spec.ts`.

### SC-AK-141 — resources of one kind with the same name are refused by the connectivity audit

Given two laws with the same last link of the name in different layers are created in the set When the
connectivity audit of the resources runs Then it names both and gives back a non-zero code: the link at
them is ambiguous

Covered: `projects/agent-kit/src/lib/integrity.spec.ts`.

### SC-AK-156 — an article without an address gets into the count

Given a rule has an article that is not in the companion of the tree When the added debt is counted
Then the article is named, and the number of the debt equals one

Covered: `projects/agent-kit/src/lib/companion.spec.ts`.

### SC-AK-157 — an article with an address does not go into the count

Given an article of the rule stands as a line of the companion of the tree When the added debt is
counted Then the article does not get into the count

Covered: `projects/agent-kit/src/lib/companion.spec.ts`.

### SC-AK-158 — a missing companion is named apart

Given there is no companion next to the rule at all When the added debt is counted Then all the
articles of the rule are named as debt, and the state is a missing companion

Covered: `projects/agent-kit/src/lib/companion.spec.ts`.

### SC-AK-168 — a resource with an unanswered requirement is not put

Given a resource demands the property `db`, and the set of the tree's properties does not name it When
the layout runs Then neither the resource nor the draft of its companion gets into the tree

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-169 — an answered requirement holds up no resource

Given a resource demands the property `db`, and the tree named `db` as its own When the layout runs
Then the resource lands under a name without the requirement in the name

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-170 — the silence of the tree about itself answers no requirement

Given the set of the tree's properties is empty When the layout runs Then not one resource marked by a
requirement is put

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-171 — a resource without a requirement is put into any tree

Given a resource carries no requirement, and the set of the tree's properties is empty When the layout
runs Then the resource lands

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-172 — a pick by name is stronger than an unanswered requirement

Given a resource demands a property the tree does not have and is named by the tree by name When the
layout runs Then the resource lands, and the unanswered requirement is named by a line of the list

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-173 — a requirement of an unknown property is a refusal of the layout

Given a resource demands a property the package did not declare When the layout runs Then it refuses
and names both the resource and the unfamiliar property

Not covered: the refusal and the list are checked by a run of the layout on a live tree, there is no
spec for them yet.

### SC-AK-174 — an unfamiliar property in the setting of the tree is a refusal of the layout

Given the set of the tree's properties names a property the package did not declare When the layout
runs Then it refuses and names that property

Covered: `projects/agent-kit/src/lib/traits.spec.ts`.

### SC-AK-175 — a kind and a requirement in one name are read each by its own list

Given the name of a resource carries both a kind of an axis and a demanded property When the name is
parsed Then the kind is recognised by the list of the axes, the requirement by the list of the
properties, and both are taken off the name

Covered: `projects/agent-kit/src/lib/traits.spec.ts`.

### SC-AK-176 — what is not put by a requirement is separated in the list from what the tree removed

Given one resource is removed by a refusal line, the other is not put by an unanswered requirement When
the list of the resources is printed Then the first carries "skipped", the second a word of its own with
the name of the demanded property

Not covered: the refusal and the list are checked by a run of the layout on a live tree, there is no
spec for them yet.

### SC-AK-177 — a refusal about an empty companion names the demanded property

Given the companion of a resource is empty, and the resource demands a property the tree does not have
When the audit of the laid-out runs Then the refusal names the demanded property and the removal of the
resource by a refusal line, not the filling of the draft

Covered: `projects/agent-kit/src/lib/companion.spec.ts`.

### SC-AK-202 — a sample lands by its own path inside the documents directory

Given the tree named no directory of its own for the kind of the samples When it is counted where the
sample of the task folder lands Then the path goes from the default of the kind and repeats the layout
inside it

Covered: `projects/agent-kit/src/lib/assets.spec.ts`.

### SC-AK-203 — the tree names a directory of its own for the samples

Given the tree named a directory of its own for the kind of the samples in the layout When it is counted
where the sample lands Then it lands there, not into the default of the package

Covered: `projects/agent-kit/src/lib/assets.spec.ts`.

### SC-AK-264 — the prefix of the selectors is judged only where the tree named it

Given the tree named no prefix When the layout audit is run Then it stays silent about the prefix: the
word belongs to the tree, and hardwired into the check it would turn red on every lib of the very first
tree whose prefix is its own

Covered: `projects/agent-kit/tests/checks-lib-layers.test.sh`.

### SC-AK-265 — a named prefix is demanded of every frontend lib

Given the tree named a prefix, and a lib is declared with another When the layout audit is run Then it
turns red and names both sides — what stands at the lib and what the tree named

Covered: `projects/agent-kit/tests/checks-lib-layers.test.sh`.

### SC-AK-266 — the barrel is recognised by the names the tree named

Given the tree named as a barrel both `index.ts` and the public entry of a published package When the
layout audit is run Then a file of its own assembled into that entry does not count as a re-export: the
barrel is created for that, and its name is its own in every tree

Covered: `projects/agent-kit/tests/checks-lib-layers.test.sh`.

### SC-AK-267 — the tags of the libs without dependencies are named by the tree, not by the check

Given the tree keeps no such libs and named no tags When the layout audit is run Then it demands no
description of the boundaries for a lib that is not in the tree

Covered: `projects/agent-kit/tests/checks-lib-layers.test.sh`.

### SC-AK-409 — a refusal of any guard of the package calls the shared tail

Given the package holds a guard refusing a call or a turn When the resources of the package go through
a sweeping review Then every such guard has a call of the shared tail: written one at a time in every
text, the tail is skipped where the refusal was created later, and the skip reads as "there are no moves
from here"

Covered: `projects/agent-kit/tests/syntax.test.sh`.

### SC-AK-515 — refusing a rule removes its cold part

Given the set holds a rule and a cold part at it When the tree refuses the rule Then the cascade removes
the cold part too: laid out without its rule, it would read as an instruction to what is not in the tree

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-516 — the cold part of a foreign rule stays at that

Given the set holds the cold parts of two rules When the tree refuses one of the rules Then only its
cold part is removed

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-517 — the cold part lands as a third file in the directory of its rule

Given the package carries the cold part of a rule When the layout runs Then it lands in the directory of
the rule next to the rule itself and to its companion

Covered: `projects/agent-kit/src/lib/assets.spec.ts`.

### SC-AK-518 — the cold part does not argue with the rule itself over the file name

Given the rule and its cold part carry one resource name When the target path is counted for both Then
the paths diverge: one directory name, different file names

Covered: `projects/agent-kit/src/lib/assets.spec.ts`.

### SC-AK-519 — "Pitfalls" is asked of the cold part, not of the rule

Given the rule gave the section "Pitfalls" away to its cold part When the suite counts the completeness
of the sections Then a rule without this section passes, and a cold part without it turns red

Covered: `projects/agent-kit/tests/rules-review.test.sh`.

### SC-AK-714 — a requirement line inside an example is no requirement

Given a resource shows a sample of a requirement line inside a fenced example When the layout reads what
it declared about itself Then it has no requirements: otherwise a pattern showing a sample would demand
a resource with a name in angle brackets. A real line standing above the example is read as before

Covered: `projects/agent-kit/src/lib/catalog.spec.ts`.

### SC-AK-798 — the layout refuses when the installed edition is not the one the tree declared

Given the tree declared the edition of the package by an exact number, and another one is installed When
the layout or its audit is called Then the command refuses and names both editions — the one declared by
the tree and the installed one — because it would be laid out by the installed one, whole and with the
same successful exit

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-799 — the refusal does not come where there is nothing to compare

Given the tree declared the edition by a range, declared no package at all or the package named no name
of its own When the layout is called Then it goes as before: a range covers several editions and both are
declared rightly, and without a name the package would not find itself in the dependencies of the tree

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-886 — a hook lands executable even with a lost bit at the source

Given a file of the hooks directory in the package lies without the right to be executed
When the layout runs
Then the laid-out copy gets the right to be executed: otherwise the guard does not start at all and
looks installed — the file is in place, the layout reported, and the guards by construction stay silent

Given a check in the package lies without the right to be executed
When the layout runs
Then the laid-out copy does not get it: part of the checks are called by the executor, and they need no
bit

Given a check in the package lies with the right to be executed
When the layout runs
Then the laid-out copy keeps it

Covered: `projects/agent-kit/src/lib/sync.spec.ts`.

### SC-AK-887 — a removed right to run the layout brings back

Given a laid-out hook is whole in body, and the execution bit is removed from it When the layout is
called Then the right comes back, and the body is not rewritten: what has to be fixed is the run, not the
text

Covered: `projects/agent-kit/src/lib/plan.spec.ts`, `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-888 — the audit does not stay silent about a removed right

Given a laid-out hook lies without the right to run When the layout audit is run Then it names this file
as a divergence and answers with a non-zero code: a hook registered by a command without the bit does not
start at all and looks installed

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.
