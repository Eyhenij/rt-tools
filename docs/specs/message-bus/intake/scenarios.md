# Scenarios — the intake of the cargo

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason, and one closed from the side of the intake
but not from the side of the screen carries the mark "Coverage: partial".

Scenarios whose "Then" names a person and what they get on the screen are closed by an end-to-end
spec. Next to them go measurements in the browser and a live pass on the node; they do not count as a
replacement of the end-to-end spec.

### SC-MB-1 — the first digest of a month creates the record

Given the tree has no record for the current month
When a digest arrives by a valid token
Then the record of the month is created, the answer carries the month and the tree, and the code of the
answer speaks of a creating

### SC-MB-2 — the second run replaces the digest, it does not add it to the former one

Given the record of the month of this tree carries the counters of the first run
When a second digest with smaller numbers arrives
Then the numbers of the second digest stand in the record, no second record is created, and the code
speaks of an update

### SC-MB-3 — the month is taken by the clock of the intake

Given the tree stands in a zone where the month has already changed, and at the intake it has not yet
When a digest arrives
Then it lands in the record of the month that goes at the intake

### SC-MB-4 — a sending without a token of a tree is refused

Given the request of the intake carries no token of a tree
When it comes to any operation of the intake
Then the intake refuses and says that the operation demands a token of a tree

### SC-MB-5 — a revoked token stops being accepted

Given the token of the tree is revoked
When cargo arrives by it
Then the intake refuses, and it is not said in the refusal which token exactly is not accepted

### SC-MB-6 — the cargo by a revoked token stays readable

Given the token of the tree is revoked, and the records that arrived by it lie there
When the list of the trees is read
Then the tree is named together with the date of the last run, and its records are not deleted

### SC-MB-7 — an unknown kind of cargo is refused

Given the cargo named itself by a kind the intake does not take in
When it arrives
Then the intake refuses and lists the kinds it takes in

### SC-MB-8 — cargo without a mandatory field is refused with the name of the field

Given there is no field in the cargo that is mandatory for its kind
When it arrives
Then the intake refuses and names which field is missing and at which kind

### SC-MB-9 — a sign of a tree that did not match the token refuses the intake

Given the sign of a foreign tree stands in the cargo, and the token belongs to its own
When the cargo arrives
Then the intake refuses, and the record of the foreign tree is not appended to

### SC-MB-10 — cargo heavier than the limit is not taken in

Given the cargo weighs more than the limit declared by the setting
When it arrives
Then the intake refuses and names the limit; the weight of what arrived — when the request declared it
itself

### SC-MB-11 — cargo of an unknown version of the schema is taken in and marked by it

Given the cargo named itself by a version of the schema of the record the intake does not know
When it arrives
Then it is taken in, and the version is kept at the record as it arrived

### SC-MB-12 — the fields of the digest are kept as they arrived

Given a field the intake does not know stands in the digest
When the digest arrives
Then the cargo is taken in whole, and the unknown field lies in the record of the month

### SC-MB-13 — an unfit record refuses its operation whole

Given one out of a list of five proposals did not pass the check of the form
When the list arrives by one operation
Then not a single proposal is taken in, and the record of the month stays as it was

### SC-MB-14 — an incident analysis arrives as text whole

Given an incident analysis names the files of the tree where the miss happened
When it arrives
Then it is taken in whole, and the check for the address of the tree does not refuse it

### SC-MB-15 — an analysis that arrived a second time updates the former one

Given an analysis with this name from this tree already lies there
When it arrives with a corrected text
Then the former record is updated, no second one is created, and the date of the update moves

### SC-MB-16 — a proposal that already arrived is not created a second time

Given the tree sent the file of the proposals whole, and a part of them already lies there
When the proposals arrive
Then only those whose text was not in it are added to the record of the month

### SC-MB-17 — the probe of liveness answers without a token

Given the request has no token of a tree
When it comes to the probe of liveness
Then the intake answers that the service is raised

### SC-MB-18 — the probe of liveness names neither the edition nor the composition

Given the probe of liveness answers
When its answer is read whole
Then there is neither the number of the edition nor the names of the parts of the service in it

### SC-MB-19 — the creating of a tree prints the token once

Given there is no tree with such a name yet
When it is created by the command of the application
Then the token is printed once, and only its hash lies in the storage

### SC-MB-20 — an unavailable storage answers with a refusal, not with silence

Given the storage of the intake is unavailable
When cargo arrives
Then the intake refuses and says that the run should be repeated

### SC-MB-21 — the proposals and the analyses pile up, they are not replaced

Given the proposals of the first run lie in the record of the month
When the second run brings a digest and a new proposal
Then the former proposals are in place, and the new one is added to them

### SC-MB-22 — the proposals that arrived before the digest create the record of the month

Given the tree has no record for the current month
When the proposals arrive by the first operation of the run
Then the record of the month is created by them, and there is no refusal about a digest that was not
found

### SC-MB-23 — simultaneous runs do not fell each other

Given two runs of one tree arrive at once and there is no record of the month yet
When both create it
Then the record is one, both answers are successful, and the digest of whoever came second stands in it

### SC-MB-24 — the record of a month remembers the time of the last run

Given the record of the month was created by yesterday's run
When today's arrives
Then the time of the last run in the record is today's

### SC-MB-25 — a new token replaces the former one

Given the tree has a valid token
When the command issues a new one
Then the new one is accepted, the former one is marked as revoked, and the new token is printed once

### SC-MB-26 — the sign of a tree is named at the creating

Given a tree is created by the command
When the sign of the tree is not named to the command
Then the tree is not created, and the command says that the sign is mandatory

### SC-MB-27 — the creating of a tree with a taken name is refused

Given a tree with this name is already created
When the command creates it anew
Then the tree is not created, the former token is whole, and the command names the reason

### SC-MB-28 — a token of a tree does not open the issuing of tokens

Given the request has a valid token of a tree
When it comes to an operation the intake does not have — the issuing or the revocation of a token
Then no such operation is found: the tokens are created only by the commands

### SC-MB-29 — the probe of liveness stays silent at an unavailable storage

Given the storage of the intake is unavailable
When the probe of liveness comes
Then it answers with a refusal, not with "raised"

### SC-MB-30 — a refusal is written into the journal without the token and the text of the cargo

Given the cargo is refused by the check of the form
When the record about the refusal gets into the journal
Then the kind of the cargo and the sign of the tree are in it and there is neither the token nor the
text of the cargo

### SC-MB-31 — an empty digest creates the record of a month

Given over the stretch the tree has not a single observation, and there are overrides
When the digest arrives with zero counters
Then the record of the month is created, and the snapshot of the overrides stands in it

### SC-MB-32 — the version of the schema of the cargo is mandatory

Given the version of the schema of the cargo is not named in the request of the intake
When it arrives
Then the intake refuses and says that the version is mandatory

### SC-MB-81 — the answer of the intake names what was taken in and what already lay there

Given there are three proposals in the cargo, of which two already arrived
When the cargo arrives
Then the answer says that one landed and that two already lay there

### SC-MB-82 — a proposal longer than the limit of a row of an index is taken in

Given the text of the proposal goes in kilobytes
When it arrives
Then it lands as a record, and the storage does not refuse by the size of the constraint

### SC-MB-83 — the same text from two trees lies as two records

Given two trees sent a proposal with one and the same text
When the second of them arrives
Then it lands as a record of its own: the sign is unique within the tree, not within the storage

### SC-MB-84 — the sender prints what was taken in and what already lay there

Given the intake answered that one proposal landed and two already lay there
When the command of the sending prints what the run ended with
Then both numbers stand in the line about the proposals, not one word "taken in"

### SC-MB-85 — the same proposal in a new month does not become a second record

Given the proposal of this tree already arrived in the past month
When it arrives again, and the record of the month is now another one
Then no second record is created, and the answer names it as one that already lay there

### SC-MB-169 — an arrival that changed the text of an analysis brings it back into "new"

Given the analysis stands in progress
When the tree sent the same one with another text
Then the state of the analysis is new, and the text is the one that was sent

### SC-MB-170 — an arrival without an edit of the text does not touch the state

Given the analysis stands in progress
When the tree sent the same one with the same text
Then the state of the analysis is still in progress

### SC-MB-323 — a repeated arrival does not bring a record closed by the publisher back into "new"

Given the analysis is closed by the publisher and stands in "fixed"
When the tree sent the same one with another text
Then the text is the one that was sent, and the state is still "fixed"

### SC-MB-324 — a pair "sign set, state new" is put back into the closed state by the migration

Given a record carries the sign of the publisher's closing and stands in "new"
When the migration runs
Then the record with a release version stands in "released", the one without it in "fixed"

Не покрыто: a migration has no test harness in this tree; it was run over four trial rows in a
rolled-back transaction on the local database, and the rows answered as promised.

## A tree creates itself by an invitation

### SC-MB-117 — a request with a valid invitation creates the tree and gives back the token

Given the owner issued an invitation on the name "Дерево", and it is still valid
When the tree sends a request with that invitation and with its sign
Then a tree with the name from the invitation and the sign from the request is created, and the token
goes away as the answer

### SC-MB-118 — the invitation goes out by the very first successful request

Given the invitation is already used up by a successful request
When the same request comes a second time
Then a refusal, and no second tree is created

### SC-MB-119 — an expired invitation is not accepted

Given the term of validity of the invitation has run out, and it was not used
When the tree sends a request with it
Then a refusal by the same answer as at an invitation that was not found

### SC-MB-120 — a revoked invitation is not accepted

Given the owner revoked the invitation before it was used
When the tree sends a request with it
Then a refusal, and the record of the revocation stays visible in the admin application

### SC-MB-121 — the four unfit states answer the same way

Given there is no invitation at all, it is used up, it is expired and it is revoked
When a request comes by each of them
Then the answers coincide down to the last field: by the difference there is no seeing which codes are
created

### SC-MB-122 — a sign that is already created is not recreated by a request

Given a tree with such a sign is already created
When a request with a valid invitation and with the same sign comes
Then a refusal, the former token stays valid, no new one is issued

### SC-MB-123 — the name is taken from the invitation, not from the request

Given the invitation was issued on the name "Дерево", and the request names another name
When the request passes
Then the created tree is called by the name from the invitation

### SC-MB-124 — more requests from one key of a client than the limit

Given more requests came from one key of a client than is allowed over the window
When the next one comes
Then a refusal by the frequency, and not a single record is created by it

### SC-MB-125 — neither the code nor the token gets into the observations

Given the request passed and the token is issued
When the record of the observation about it is read
Then the event and the sign of the tree are in it, but neither the code of the invitation nor the token

### SC-MB-126 — the package refuses an address of the intake without TLS

Given the address of the intake is declared without TLS and does not point at the local machine
When the creating is called
Then the package refuses before going to the network and names the reason

### SC-MB-127 — the package does not overwrite a token that lies there silently

Given a token already lies at the tree in the file named by the setting
When the creating is called a second time
Then the package refuses and names what to overwrite it by on purpose

## The entry and an account
