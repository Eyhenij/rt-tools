# Scenarios — cargo outward

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain,
and the numbers were not recounted at the move into the subdomain: the number ties the scenario to
the test title.

### SC-AK-77 — a proposal is unloaded as a file with the address

Given the closed-work review brought proposals with addresses
When the file of proposals is unloaded
Then every block carries in its heading its address and the resource it belongs to

Covered: `projects/agent-kit/src/lib/proposals.spec.ts`.

### SC-AK-78 — only the address "package" goes outward

Given the file of proposals holds blocks of all three addresses
When the sending goes
Then only the blocks addressed "package" go away, and the rest stay lying in the tree

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-79 — the sending refuses on a tree address in the text

Given a path of the tree stands in the text of a proposal
When the sending goes
Then it refuses, names the file and the line and sends nothing

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-80 — what was sent does not go a second time

Given a proposal is already sent and marked
When the sending is launched again
Then it does not go a second time, and the rest of the cargo goes as usual

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-81 — the intake address is taken from the setting of the tree

Given the package is installed in a tree
When the sending goes
Then the cargo goes to the address from the setting of the tree, and that address is not in the
package texts

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-82 — the summing-up tells the repeated from the one-off

Given records about edits arrived from two trees, and some of them are about one and the same
resource
When the summing-up goes
Then the repeated is named an edit of the package, and the one-off an override of the tree

Not covered: the summing-up is a person's work by a command, not a run.

### SC-AK-140 — the mark about the sending stands in its own block at any number of them

Given a file of proposals with five blocks, each addressed to the package
When all five are sent and marked
Then every mark stands under its own heading, and none gets into the body of the ready text

Covered: `projects/agent-kit/src/lib/proposals.spec.ts`.

### SC-AK-162 — a run without proposals sends the cargo

Given there is not a single proposal addressed "package"
When the sending goes
Then the cargo goes away as a record into the intake, and the sending exits with zero

### SC-AK-163 — a tree address in the digest refuses the whole sending

Given the address of this tree is found in the digest, and the texts of the proposals are clean
When the sending goes
Then nothing goes away, and the place in the cargo and what was counted as an address are named

### SC-AK-164 — a second run of the month appends to the former record of the receiver

Given the receiver already has a cargo record of this tree for the current month
When a second sending goes
Then the former record is updated, a second one is not created, and the sending names the month and
the tree

### SC-AK-165 — there is no intake address in the manifest: the sending refuses

Given the intake address is not declared in the setting of the tree
When the sending goes
Then it refuses with a non-zero code and names where the address is declared

### SC-AK-166 — a sending with a revoked token is refused

Given the tree token is revoked at the receiver
When the sending goes
Then the intake answers with a refusal, and the sending names the address, the kind of the cargo and
that nothing went away

### SC-AK-167 — writing of observations switched off starts no sending

Given the writing of observations is switched off by a setting of the tree
When the sending goes
Then nothing goes outward, including the snapshot of the overrides, and it is named by which key it
is switched off

### SC-AK-185 — a familiar argument is not counted as unfamiliar

Given the call carries an argument declared by the command
When the arguments of the call are parsed
Then the list of the unfamiliar is empty

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-186 — an unfamiliar argument is named

Given the call carries an argument the command did not declare
When the arguments of the call are parsed
Then it stands in the list of the unfamiliar

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-187 — a value at an argument is not counted as an argument

Given the call carries an argument with a value standing as a separate word
When the arguments of the call are parsed
Then the list of the unfamiliar is empty: the value was read together with its argument

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-188 — a value begun with a hyphen is not taken for an argument

Given the value at an argument begins with a hyphen
When the arguments of the call are parsed
Then the list of the unfamiliar is empty

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-189 — a value through an equals sign is read by the same argument

Given the value is attached to the argument through an equals sign
When the arguments of the call are parsed
Then the list of the unfamiliar is empty

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-190 — an argument with a parameter standing last does not drop the call

Given an argument with a value stands last, and there is no value after it
When the arguments of the call are parsed
Then the list of the unfamiliar is empty

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-191 — a path without a hyphen is not counted as an argument

Given the call carries a positional value
When the arguments of the call are parsed
Then the list of the unfamiliar is empty

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-192 — the unfamiliar is named whole, not by the first match

Given the call carries two unfamiliar arguments and one familiar
When the arguments of the call are parsed
Then both unfamiliar ones stand in the list

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-193 — with an empty set everything begun with a hyphen is unfamiliar

Given the command declared not a single argument
When the arguments of the call are parsed
Then every argument of the call stands in the list of the unfamiliar

Covered: `projects/agent-kit/src/lib/argv.spec.ts`.

### SC-AK-204 — a word mid-work lands as a block in the file of the day

Given a person said mid-work that a rule gets in the way
When the feedback command is called
Then a block with the address, the resource, the occasion and the ready text of the edit appears in
the file of proposals of today

Not covered: the command is a text for the agent, and it is checked by a run on a live tree.

### SC-AK-205 — the file of the day is created from a sample when there is none yet

Given there is no file for today in the proposals directory
When the feedback command is called
Then the file is created from a sample, and the answer says so

Not covered: it is checked by a run of the command on a day when there is no file yet.

### SC-AK-206 — a second word of the same day lands as a second block

Given a block already lies in the file of the day
When a person says one more word
Then a second block lands next to it, and the first is not rewritten

Not covered: the joining of blocks in the file is held by the spec of the parse, and the run of the
command itself is by hand.

### SC-AK-207 — an unclear address is asked, not assigned

Given from the person's word it is not visible whether the package, the companion or an override of
the tree is being edited
When the feedback command is called
Then the address is asked by one question, and until the answer nothing is written into the file

Not covered: a question to a person is not checked by a run at all.

### SC-AK-208 — the command does not go into the network

Given the block is put
When the command has finished
Then not a single request went outward, and the answer names what the block is sent by

Not covered: the absence of a request outward is visible only by a run of the command.

### SC-AK-209 — a block that was put goes away by the ordinary sending

Given a block with the address of the package lies in the file of the day
When the sending of the cargo is called
Then the block goes away on a par with the blocks of the closed-work review and is marked as sent

Not covered: it is checked by a run of the sending on a live tree.

### SC-AK-210 — a tree address in the text of a block refuses the sending

Given a path of this tree is named in the text of the block
When the sending of the cargo is called
Then it refuses with the line number instead of carrying the text outward

Not covered: the check for a tree address is held by scenario SC-AK-79 and its spec; this scenario
demands no test of its own.

### SC-AK-283 — an issued token lands on disk, and the command does not go into the network

Given a person holds a token issued in the intake admin panel, and the tree has no token file
When they call the creating with the argument of the issued token
Then the token lies in the file named by the setting key, with the rights "read and written by the
file owner alone", and there was not a single call to the intake

Coverage: partial — the unit calls the decision directly, while a person calls the command by the
launch line. A run of the assembled command is not created in this suite.

Covered: `projects/agent-kit/src/lib/enroll.spec.ts`.

### SC-AK-284 — an invitation code and an issued token do not go together

Given the person named both arguments at once
When the creating is called
Then a refusal with a non-zero code names both arguments and asks to keep one, and no token file
appears

Covered: `projects/agent-kit/src/lib/enroll.spec.ts`.

### SC-AK-285 — creating without a single argument names both ways

Given no arguments are named
When the creating is called
Then a refusal with a non-zero code names both ways — the invitation code and the issued token

Covered: `projects/agent-kit/src/lib/enroll.spec.ts`.

### SC-AK-286 — a token that lies there is defended at both ways the same

Given the token file already lies there
When the creating by an issued token is called without the argument of a deliberate overwrite
Then a refusal with a non-zero code, the former token in the file untouched, and with the argument
of a deliberate overwrite the same call puts a new one

Covered: `projects/agent-kit/src/lib/enroll.spec.ts`.

### SC-AK-287 — a way without a network demands no intake address

Given the key of the intake address in the setting is empty
When the creating by an issued token is called
Then the token lands on disk, and there is no refusal about the intake address

Covered: `projects/agent-kit/src/lib/enroll.spec.ts`.

### SC-AK-543 — the sending names the list of the cargo before its results

Given the cargo is gathered and goes away for real
When the command sends it
Then the first line names the intake address and the tree, under it the list of what will go, and
only then the results; a refusal of the intake does not eat the list

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-544 — a dry run is declared by the first line, not by the ending of a verb

Given a dry run of the sending or the marking is called
When the command prints the output
Then the first line says that nothing went outward, and names the call that really does it; it does
not coincide with the first line of a real run

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`,
`projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-545 — a block without a named nearest statement does not go away

Given a proposal block named no nearest statement of the resource — there is no field at all, or the
quotation is not found in the resource
When the cargo is gathered for the sending
Then the block does not go outward, and the refusal names the file, the line of the block and the
reason

Covered: `projects/agent-kit/src/lib/proposals-gate.spec.ts`.

### SC-AK-546 — a block with a real quotation goes, and the neighbouring one is not held by the refusal

Given a block with a found quotation and a block without one lie in the file
When the cargo is gathered for the sending
Then the first goes away, the second does not: one unread resource does not hold up someone else's
work

Covered: `projects/agent-kit/src/lib/proposals-gate.spec.ts`.

### SC-AK-547 — a refused block stays on disk with the reason

Given a block is refused at the sending
When the sending has ended
Then the block lies in place with the mark "refused" and the reason, and the text of the edit in it
is untouched

Covered: `projects/agent-kit/src/lib/proposals-gate.spec.ts`.

### SC-AK-548 — a dry run names the refused and puts no marks

Given a dry run of the sending is called
When a block that would be refused lies in the file
Then the run names it together with the departing one and marks nothing on disk

Covered: `projects/agent-kit/src/lib/proposals-gate.spec.ts`.

### SC-AK-713 — zero accepted does not cancel the mark about the sending

Given the intake answered "accepted 0, already lay 3" — the whole cargo arrived by the former
sendings
When the sender takes the answer apart
Then the files of proposals get the mark about the sending on a par with the accepted: the mark says
that the record is in the intake, not that this call put it there

### SC-AK-715 — several remote repositories without `origin` are named in the refusal by name

Given the tree has several remote repositories, and `origin` is not among them
When the sending of the cargo goes
Then it refuses, names them and calls to choose: a guessed one would merge two trees into one in the
digest of the intake. A tree without a remote repository at all refuses with the former words

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-855 — a refusal about the intake address names whom to ask for it

Given the key of the intake address in the setting of the tree is empty
When the tree is created by an invitation code or sends the cargo
Then the refusal names not only the setting key but also whoever the value is taken from: the
invitation code and the address go as a pair and are issued by one person

Covered: `projects/agent-kit/src/lib/enroll.spec.ts`, `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-877 — a dry run of the sending names what it did not check

Given the cargo is gathered, and the intake has not yet answered about the fitness of the token
When the run of the sending goes dry
Then it says that the token was not checked here and that only a real sending answers about it:
silence about this read as a promise that the sending would pass

Covered: `projects/agent-kit/src/lib/shipment.spec.ts`.

### SC-AK-878 — an absolute path to the token is taken as it is

Given the setting key names the token file whole, from the root of the file system
When the tree is created in the intake and when the sending reads the token
Then the path is taken as named, not glued with the root of the tree: glued, it puts the secret
inside the repository, from where it goes away into history by the very first adding command

Covered: `projects/agent-kit/src/lib/enroll.spec.ts`.

### SC-AK-1090 — the blocks judged already sent are named by both runs

Given a block of proposals carries a mark written by hand
When the sending runs, dry or real
Then the output names the count of the skipped and the block itself, and says the mark was written
by hand: the field used to be read by its presence, so such a block never went and the dry run did
not show it

Given not a single block was skipped
When the sending runs
Then the count of the skipped is printed all the same: silence about it reads as "there was nothing
to skip"

Given the mark carries the value the sending itself writes
When the sending runs
Then the block is named among the skipped and is not called written by hand

Covered: `projects/agent-kit/src/lib/shipment-skipped.spec.ts`.

### SC-AK-1094 — the observation cargo carries every line of the window grouped by day

Given day files for three days with lines of all four event kinds
When the send gathers the cargo
Then the cargo carries three days, every line of each day, and the total equals the sum of the
files

Covered: `projects/agent-kit/src/lib/observations-cargo.spec.ts`.

### SC-AK-1095 — a load names the kind of its skill

Given a load of a rule laid out by the package, a load of a pattern of the package, a load of
another skill of the package and a load of a skill of the tree's own
When the send gathers the cargo
Then the four lines carry `skill` `rule`, `pattern`, `skill` and `own`, and a refusal line carries
no `skill`

Covered: `projects/agent-kit/src/lib/observations-cargo.spec.ts`.

### SC-AK-1096 — a broken line is skipped and the cargo goes

Given a day file with a line broken mid-way
When the send gathers the cargo
Then the cargo carries the other lines of the day, and the broken one is absent

Covered: `projects/agent-kit/src/lib/observations-cargo.spec.ts`.

### SC-AK-1097 — the dry run names the cargo with lines and days

Given three days of lines
When `agent-kit propose --dry-run` runs
Then the print holds the line `observations — строк N за 3 дн.` with N the total, and nothing
leaves

Covered: `projects/agent-kit/src/lib/observations-cargo.spec.ts`.

### SC-AK-1098 — a tree address in a line refuses the send

Given a line whose resource holds a segment of the tree address
When the send checks the cargo for leaks
Then the send refuses and names the line, as it does for the digest

Covered: `projects/agent-kit/src/lib/observations-cargo.spec.ts`.
