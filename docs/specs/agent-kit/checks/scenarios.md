# Scenarios — the checks of the tree

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and
the numbers were not recounted on the move into the subdomain: the number ties a scenario to a test
title.

### SC-AK-103 — a file longer than the limit is refused

Given the tree holds a file of a judged kind longer than the limit, and it is not in the list
When the length check runs
Then it refuses and names the path, the length and the limit

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-104 — what accumulated is named and refuses nothing

Given a file longer than the limit stands in the list of the accepted
When the length check runs
Then it leaves with success and names how many files are accepted

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-105 — debt differs from the accepted

Given the list holds both the accepted and debt
When the length check runs
Then the debt is named apart from the accepted, not by a common number

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-106 — a line of the list that has no file refuses

Given the list holds a path that is not in the tree
When the length check runs
Then it refuses and names the stale line

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-107 — data and the archive are not judged

Given the tree holds a locale dictionary, a build setting and an archive record longer than the limit
When the length check runs
Then not one of them is refused: they are read by search, not in a row

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-108 — the length is counted as by the linter

Given a file ends with a line break
When its length is counted
Then it equals the number of breaks plus one — the same number the linter sees

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-244 — a bundle from a subproject package counts on a par with the libs

Given the package is declared a dependency of a subproject and does not lie in the root of the tree
When the repeats check runs
Then its listings are read, and one's own listing under the same bundle is named a repeat

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-245 — a tree without the external package gets the audit of its own repeats

Given the package named in the setting is not in the tree at all
When the repeats check runs
Then it reaches the audit of its own and gives back a zero code, not a refusal to read the directory

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-268 — a rule that arrived by a connected package does not count as a divergence

Given the class of an element stands in a template of the tree, while its rule is declared in a
style file of a package the application connected at home by an `@use` line
When the markup classes check runs
Then the class counts as declared and does not fall into the divergences: the rule works, lies in a
dependency and yields to no fix in the tree

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-269 — a connection inside a package file is not taken apart

Given a connected package file itself connects a second file of the same package, and the
declaration lies in the second
When the markup classes check runs
Then the declaration is not read: what counts as declared is what the application named itself, and
the walk stays one link long

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-270 — a package that is not found does not take the check down

Given a style file holds a connection of a package that is not in the tree
When the markup classes check runs
Then it goes on over its own sources and does not end with a refusal to read

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-271 — debt that grew is named as grown

Given a class without a rule stands in the known list, and in the tree it appeared in one more
template
When the markup classes check runs
Then it names the debt as grown and lists the files added, and gives not a single instruction to
remove the former line and create a new one

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-272 — a list that shrank is named as shrunk

Given a class without a rule stands in the known list with two files, and in the tree it is left in
one
When the markup classes check runs
Then it names the debt as shrunk and says what is time to take out of the line: the list shrinks,
and this is a fix, not a new divergence

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-273 — a line about a backed class is still removed

Given a class from the known list is backed by a rule in the styles of the tree
When the markup classes check runs
Then it refuses and says to remove the line: the debt is fixed, and its place is in the history, not
in the list

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-274 — a rule assembled by nesting is read as a declaration

Given the class of an element is declared by concatenation — a nested `&-<tail>` inside `&__<head>`
When the markup classes check runs
Then the full name is assembled from the nesting and the class counts as declared: the rule works,
and it is never a divergence

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-275 — the nesting is assembled to any depth

Given a class is declared by a third joint — `&__<head> { &-<middle> { &-<tail> } }`
When the markup classes check runs
Then the assembled name counts as the full one with all the joints, not only the first two

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-276 — concatenation invents no names outside its own block

Given `&-<tail>` stands in a style file outside any declaration of an element
When the markup classes check runs
Then nothing becomes declared: a name without a head is not assembled, and a class without a rule is
still named a divergence

Covered: `projects/agent-kit/tests/checks-styles.test.sh`.

### SC-AK-400 — a sound record of the accepted list is parsed

Given the record carries a reason and the number of the task that added it
When the list is read by the shared parser
Then the record is parsed, and the accepted and the debt are counted together as one list of keys

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-401 — a record without a reason refuses the parse

Given the record has an empty reason
When the list is read by the shared parser
Then the parse is refused and named the record itself

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-402 — a record without a task number refuses the parse

Given the record has no task number, or it is not of the shape the tasks of the tree have
When the list is read by the shared parser
Then the parse is refused: there would be nobody to ask about the record

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-403 — a side written as a list of lines refuses the parse

Given a side of the list is written as a list of lines, not as an object with reasons
When the list is read by the shared parser
Then the parse is refused and named the file: a record has room for neither a reason nor a task
number

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-404 — there is no list at all, and the parse refuses no work

Given there is no list file in the tree
When the list is read by the shared parser
Then the parse gives back an empty one: a check met for the first time shows what it found as new

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-658 — a heavy text is named by weight

Given a file of the rules layer is shorter than the line limit but heavier than the weight limit
When the length check runs
Then the file is named by weight: lines do not measure weight

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-659 — a light text of the same length stays silent

Given two files of one length in lines, one twice as heavy as the other
When the length check runs
Then only the heavy one is named

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-660 — a companion is taken out of the weight count

Given a rule companion is heavier than the weight limit
When the length check runs
Then it is not named: a link table grows with the number of statements, not with wordiness

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-661 — without a weight number the check stays silent

Given the tree named no weight limit
When the length check runs
Then lines alone are judged, and the second figure is not printed in the digest

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-861 — the debt of a file heavy in characters refuses nothing

Given a text heavier than the weight limit but shorter than the line limit is written in the known
list as debt
When the length check runs
Then it passes and does not name the record as stale

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-520 — a text of the rules layer is judged by its own limit

Given a text lies under the root of the rules layer and is longer than the text limit but shorter
than the code limit
When the length check is run
Then it names the file and says it judged it by the text limit

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-521 — a tree without named text roots is judged by one limit

Given the text roots are not named in the setting
When the length check is run
Then all the files are judged by the code limit, and the digest names one number

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-549 — a check that could not do its work refuses instead of skipping

Given the check is part of the gate set, and its harness is broken — a needed package is missing or
the setting of the tree holds an empty name of the subject
When the gate calls it
Then it refuses with a non-zero code and says that the check itself broke, not the subject; while
the cases "there is no subject", "the address is not set" and "the service does not answer" give
back the skip code — neither zero nor a refusal

Not covered: a test with an identifier cannot close this — it is checked by a run of the check
itself. Checked on the spot on the schema-against-migrations audit: six outcomes — the migrations
came together, three skips by the skip code and two broken cases refusing with code one, each with a
line of its own. Before the edit all six returned zero, and the check stood in the gate set without
ever checking a thing.

### SC-AK-680 — the release journal is split by the move that grows it

Given the release journal outgrew the length limit of a document
When a new edition is released
Then the old releases leave into a separate file by the same commit that raised the edition:
measured at the push, the journal stopped the push of the whole tree — and not for whoever grew it

Not covered: a test with an identifier cannot close this — the subject of the command is the journal
file itself, and it has no double. Checked by a run on the spot: a journal of 655 lines was split
into 224 fresh and 435 taken out, ten fresh releases stayed, thirteen old ones left into a file
named by a version range; on a journal of 220 lines the command touched nothing and said so.

### SC-AK-678 — a check declares a skip by the exit code, not by a line of output

Given the check has nothing to look at: there is no subject, the address is not set, the address is
the production one or the service does not answer
When the gate calls it
Then it leaves with the skip code, not with zero: the line of output is read by a person, the code
by the caller, and zero on a skip is indistinguishable in the digest of the set from a check that
passed

### SC-AK-679 — a skip is named aloud but refuses no push

Given the push gate set passed, and one of the checks left with the skip code
When the guard decides the fate of the push
Then the push goes — a check with nothing to look at is no breakage — and the name of the skipped
check is printed: silence about it is the very indistinguishability the code was created for

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-569 — a heavy step of the set is called by its own subject

Given the branch touched the paths of one subject — the showcase of a kit, the receiver or none of
them
When the push gate set is assembled
Then only the heavy steps of the touched subjects are called; a path that fell into no subject, and
the common base of the tree, raise the whole set, and an empty comparison base raises the whole set
too

Covered: `projects/agent-kit/tests/tree-push-checks.test.sh`.

### SC-AK-673 — a cheap check of the tree is called at any composition of an edit

Given the branch touched only the texts or only the dependency snapshot
When the push gate set is assembled
Then the checks of the styling layer are called in both cases: they are not split by subject,
because together they take three seconds

Covered: `projects/agent-kit/tests/tree-push-checks.test.sh`.

### SC-AK-594 — a named side of the known list is parsed

Given a known list with a side that was named to the parser by a list
When the parser reads the list
Then the records of this side arrive parsed, with a reason and a task number at each

### SC-AK-595 — the refusal about a side that is not an object shows the shape of a record

Given a side of the known list written as a list instead of an object
When the parser reads the list
Then the refusal names not only the side but the shape of a record: the key, the reason and the task
number

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-596 — an exact copy of a correspondence table is named

Given two libs, each with a correspondence table holding the same pairs
When the repeats check runs
Then the pair of tables is named as one correspondence table

### SC-AK-597 — a copy that diverged by one pair is named too

Given the same two tables, but one pair out of six differs in them
When the repeats check runs
Then the pair of tables is named, and the line says on how many pairs out of how many they diverged

### SC-AK-598 — two different tables do not count as a repeat

Given two tables in which not one pair matches
When the repeats check runs
Then there is no line about a correspondence table

Covered: `projects/agent-kit/tests/checks-dupes.test.sh`.

### SC-AK-681 — a free scenario number is looked for across all branches

Given neighbouring work keeps its scenario numbers in an unmerged branch
When the executor takes a number for a new scenario
Then a number standing in any branch — one's own or a remote one — counts as taken: whoever looked
at main alone handed out six numbers twice, and it was the work whose agreement is not merged that
had to move

Not covered: a test with an identifier cannot close this — the subject of the command is the
branches of the tree themselves, and they have no double. Checked by a run on the spot: by the
prefix `AK` the command sees a number taken only by an unmerged branch and offers the next one after
it; from the main branch a number one lower would be visible.

### SC-AK-702 — a file removed from the working tree does not take the run down

Given a file of a judged kind is removed from the working tree, and the removal is not in the
history yet
When the length check runs
Then it leaves with success and prints no read trace: the version control system remembers such a
file, and there is nothing to read it with

Covered: `projects/agent-kit/tests/checks-file-size.test.sh`.

### SC-AK-732 — no run is demanded of a branch the pipeline does not listen to

Given the pipeline names the paths it does not listen to, and the whole contribution of an open
request lies under them
When the work queue audit asks about the run at the tip
Then it stays silent: such a branch never has an event, and the advice to bring it back is not
executable. A file outside the list brings the demand back, and a composition that cannot be read is
judged as before

### SC-AK-733 — open tasks with matching titles are listed by a digest

Given the work queue holds two open tasks about one and the same thing, named by different words
When the work queue audit reads it
Then it names them by one digest line and counts it as no divergence: matching words are a reason to
look, not a sign of a duplicate, and a refusal would refuse the work at every series of similar
tasks

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-751 — the link of a task with an epic is read both ways

Given the label of an epic card is named by the setting of the tree, and the epic card names the
path to its plan
When the work queue audit reads the open tasks
Then it names as a divergence both one-sided links — a task the epic plan names while the body of
the epic does not, and a task the epic named in its body while the epic plan does not know it; a card
without a path to a plan and a path without a file on the disk are each named by a line of their own.
The label is not named — the link is not judged at all: there is nothing to tell an epic card from an
ordinary task by

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-919 — the plan of an epic is the document that carries the makeup

Given the card of an epic names its decision before its plan, and the decision has no table of tasks
When the work queue audit reads the makeup of the epic
Then it reads the plan and judges the link as before: none of the named documents on disk, and none
of those on disk carrying the makeup, are named by lines of their own

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-752 — a branch of an open request lagging behind main is named by the audit

Given the branch of an open request has fallen several commits behind the main branch
When the work queue audit reads the open requests
Then it names the number of the lag and says the run went from a base that is no longer in the main
branch; on a branch without a lag and where there is nothing to compare with, it stays silent

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-774 — a call refused by the unavailability of the hosting is repeated

Given the hosting answers with an unavailability code — a five hundredth, a gateway one or its
timeout When the call goes from the work queue module Then it is repeated up to three times with a
growing pause and passes as soon as the hosting answered; a refusal by right and by a non-existent
record is not repeated at all, and unavailability longer than three attempts refuses — but exactly
after three

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-822 — a skip of the schema audit that became a refusal

Given the database is unavailable, and the branch did not touch the storage
When the schema-against-migrations audit is run
Then it skips: a shut-down database is a state of the machine, not a reason to refuse a documentation
push

Given the database is unavailable, and the branch edited the schema or the migrations directory
When the same audit is run
Then it refuses and names what to raise the database with and why the order of the migrations is
visible only on an empty storage

Given the edit of the migrations lies in the working tree, not in a commit
When the same audit is run
Then it refuses the same way: the uncommitted leaves by the same push right after

Covered: `projects/agent-kit/tests/checks-schema-drift.test.sh`.

### SC-AK-845 — a request on top of a neighbouring one gets no run, and the audit names the reason

Given a request is opened into the branch of a neighbouring request, not into main
When the work queue audit checks its tip
Then it names the base, reports that there will be no run and that this is fixed by moving the base
after the lower request is merged; there is no advice to reopen the request. A request into the main
branch is checked by the former line about a lost event

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-869 — a record of seven days and an hour the cleanup removes, and the check stays silent

Given the keeping time is seven days, the record was committed seven days and an hour ago
When the cleanup and the time check run
Then the cleanup names the record for removal, and the check stays silent about it and answers green

Covered: `projects/agent-kit/tests/archive-age.test.sh`.

### SC-AK-870 — a record of eight days and an hour the check names

Given the keeping time is seven days, the record was committed eight days and an hour ago
When the time check runs
Then it names the record, the time and the margin, and still does not name the seven-day one

Covered: `projects/agent-kit/tests/archive-age.test.sh`.

### SC-AK-871 — a fresh record is touched by neither side

Given the record was committed an hour ago
When the cleanup and the time check run
Then neither of them names it

Covered: `projects/agent-kit/tests/archive-age.test.sh`.

### SC-AK-873 — the answer of the work queue helper says whose eyes the state was taken by

Given a tree with the token of the machine record and a tree without it
When the helper reads a task and a request
Then a task with the token arrives with `viewer: machine`, without the token with `client`; a request
in both trees is `client`, because it is read without the token

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.
