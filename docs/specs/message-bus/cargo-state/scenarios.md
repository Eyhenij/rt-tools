# Scenarios — the edit of a state by a tree

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason, and one closed from the side of the decision
but not from the side of the request carries the mark "Coverage: partial".

The numbering is shared across the domain, and at the move into the subdomain the numbers were not
recounted: the number ties the scenario to the test title.

### SC-MB-172 — a tree moves its record into the next state

Given an incident analysis in the state "new" lies at the tree
When the tree sent an edit by its token and named the state "in progress"
Then the state of the analysis is in progress, and the answer speaks of one moved record

### SC-MB-173 — a bundle edits records of both kinds by one request

Given an incident analysis and a proposal lie at the tree, both in the state "new"
When the tree sent a bundle of two rows — a row per kind of record
Then both records stand in progress, and the answer speaks of two moved ones

### SC-MB-174 — the return from "in progress" into "new" passes

Given the incident analysis stands in progress
When the tree sent an edit with the state "new"
Then the state of the analysis is new

Coverage: partial — the decision about the transition is checked by a call in the spec of the common
lib; by the way of a request the return itself does not pass.

### SC-MB-175 — a jump over a step refuses the row, not the bundle

Given there are two rows in the bundle: a fit one and one moving a record from "new" straight into
"released"
When the tree sent that bundle
Then the fit record is moved, and the second row stands in the answer as refused with the reason about
the transition

### SC-MB-176 — an edit into the same state does not count as a transition

Given the incident analysis stands in progress
When the tree sent an edit with the state "in progress"
Then the answer speaks of one record that already stood in this state, and of not a single refused one

### SC-MB-177 — a record of another tree answers the same way as one that was not found

Given the incident analysis belongs to the neighbouring tree
When the tree sent an edit with the key of that analysis
Then the row is refused with the reason about a record that was not found, and the state of the
neighbour did not change

### SC-MB-178 — an edit without a token of a tree refuses

Given the request of the edit came without the header with the token of a tree
When the intake takes it apart
Then the operation refuses as unauthenticated, and the request does not touch the storage

Coverage: partial — the declaration of the operation is checked: it is closed by a token of a tree. The
refusal itself without a token is passed by the spec of the guard of the entry.

### SC-MB-179 — an unknown state refuses the request by the form

Given a state that is not in the set stands in a row of the bundle
When the tree sent that bundle
Then the request is refused whole by a refusal by the form, and it names the row in which the value is
not from the set

### SC-MB-180 — a refused row gets into the journal of the intake

Given there is a row in the bundle the intake did not carry out
When the edit answers the tree
Then a row with the kind of the record, the sign of the tree and the reason lies in the journal,
without the token and the text of the record

### SC-MB-181 — the text of the fix goes as a field of the same row of the edit

Given an incident analysis in the state "in progress" lies at the tree
When the tree sent one row of the edit with the state "fixed and not released" and with a text of the
fix
Then the record stands in "fixed and not released" and carries that text, and the answer speaks of one
moved record

### SC-MB-182 — a transition into "fixed" without a text refuses the row

Given an incident analysis in the state "in progress" lies at the tree
When the tree sent a row with the state "fixed and not released" and without a text of the fix
Then the row stands in the answer as refused with the reason about the missing text

### SC-MB-183 — a text not with its own transition refuses the row whole

Given an incident analysis in the state "new" lies at the tree
When the tree sent a row with the state "in progress" and with a text of the fix
Then the row stands in the answer as refused, and the record stayed in "new"

### SC-MB-184 — a text of spaces alone does not count as a text

Given a proposal in the state "in progress" lies at the tree
When the tree sent a row with the state "fixed and not released" and with a text of spaces alone
Then the row is refused by the same reason as a row without a text at all

### SC-MB-185 — the text lands at both kinds of records by one bundle

Given an incident analysis and a proposal lie at the tree, both in the state "in progress"
When the tree sent a bundle of two rows — a row per kind, both with a text of the fix
Then both records stand in "fixed and not released" and carry their texts

### SC-MB-186 — a refused row writes neither the state nor the text

Given an incident analysis in the state "new" lies at the tree
When the tree sent a row with a text of the fix and with a transition over a step — straight into
"released"
Then the record stayed in "new" and carries no text of the fix

### SC-MB-187 — a second arrival of the text overwrites the former one

Given an incident analysis in "fixed and not released" with a text of the fix lies at the tree
When the tree sent the same record with the same state and with another text
Then the record carries the new text, and none of the former one is left in it

### SC-MB-188 — the text has no length limit of its own

Given an incident analysis in the state "in progress" lies at the tree
When the tree sent a row with a text of the fix longer than any property of a record, and the request
fits into the limit of the weight
Then the text landed whole and is cut by nothing

### SC-MB-192 — a refusal by a missing text gets into the journal of the intake

Given the tree sent a row with a transition into "fixed and not released" and without a text of the fix
When the intake refused that row
Then a row of the refusal with the kind of the record, the sign of the tree and the reason about the
missing text stands in the journal

### SC-MB-191 — the command of the launch line carries the text as an argument

Given the tree calls the mark about the fix by the command of the launch line
When the argument of the text of the fix is added to the call
Then a row of the edit with that text stands in the body of the request, and without the argument the
body is the former one

The promise lives in the package of the rules: the command is led by the spec
`docs/specs/agent-kit/observations/`, and the number stands here — the body of the request is put
together by this operation.

### SC-MB-193 — the version of the release goes as a field of the same row of the edit

Given an incident analysis in the state "fixed and not released" lies at the tree
When the tree sent one row of the edit with the state "released" and with a version of the release
Then the record stands in "released" and carries that version, and the answer speaks of one moved
record

### SC-MB-194 — a transition into the release without a version refuses the row

Given an incident analysis in the state "fixed and not released" lies at the tree
When the tree sent a row with the state "released" and without a version of the release
Then the row stands in the answer as refused with the reason about the missing version

### SC-MB-195 — a version not with its own transition refuses the row whole

Given an incident analysis in the state "in progress" lies at the tree
When the tree sent a row with the state "fixed and not released" and with a version of the release
Then the row stands in the answer as refused, and the record stayed in "in progress"

### SC-MB-196 — a version of spaces alone does not count as a version

Given a proposal in the state "fixed and not released" lies at the tree
When the tree sent a row with the state "released" and with a version of spaces alone
Then the row is refused by the same reason as a row without a version at all

### SC-MB-197 — the version lands at both kinds of records by one bundle

Given an incident analysis and a proposal lie at the tree, both in the state "fixed and not released"
When the tree sent a bundle of two rows — a row per kind, both with a version of the release
Then both records stand in "released" and carry that version

### SC-MB-198 — a refused row writes neither the state nor the version

Given an incident analysis in the state "new" lies at the tree
When the tree sent a row with the state "released" and with a version of the release
Then the row is refused by the order of the transitions, and the record stands in "new" and carries no
version

### SC-MB-199 — a second arrival of the version overwrites the former one

Given an incident analysis in the state "released" with the version of the past release lies at the
tree
When the tree sent a row with the same state and with another version
Then the record carries the new version, and none of the former one is left at it

### SC-MB-200 — a row with a version at the same state does not count as moved

Given a proposal in the state "released" with a version lies at the tree
When the tree sent a row with the same state and with another version
Then the answer counts it among the ones that already stood in this state, not among the moved ones

### SC-MB-201 — a version longer than the limit refuses the request whole

Given an incident analysis in the state "fixed and not released" lies at the tree
When the tree sent a row with the state "released" and with a version longer than the limit
Then the intake answered with a refusal about the form of the request and touched not a single record
of the bundle

### SC-MB-202 — the intake does not judge the form of the version

Given an incident analysis in the state "fixed and not released" lies at the tree
When the tree sent a version of the release that does not look like a number — a word without figures
Then the record stands in "released" and carries that string as it is

### SC-MB-203 — a row with a text of the fix and a version at once is refused

Given an incident analysis in the state "fixed and not released" lies at the tree
When the tree sent a row with the state "released", with a version of the release and with a text of
the fix
Then the row stands in the answer as refused, and the record stayed in "fixed and not released"

### SC-MB-204 — a refusal by a missing version is visible as a row of the journal

Given the intake refused a row of the edit by a missing version of the release
When the journal of the intake is read
Then a row about the refusal with the sign of the tree, the kind of the record and the reason stands in
it, and there is neither the version nor the token in it

### SC-MB-207 — the command of the launch line carries the version as an argument

Given the executor calls the mark with the state "released" and with the argument of the version of the
release
When the command gathers the bundle of the edit
Then the version stands as a field of the same row as the kind of the record, the key and the state

The scenario of the command of the launch line stands here, not in the spec of the package: that spec
has another prefix, and a recounting of the number would tear the link with the test title. The
promise of the command itself is led by the spec `docs/specs/agent-kit/observations/`.
